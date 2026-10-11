"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

interface IdentifiedData {
  commonName: string;
  scientificName?: string;
  category?: string;
  family?: string;
  confidence?: string;
  habitat?: string;
  season?: string;
  safety?: string;
  summary?: string;
  identificationTips?: string[];
  funFact?: string;
}

interface IdentificationResult {
  raw: string;
  data?: IdentifiedData;
}

const SAMPLE_IMAGES = [
  {
    name: "Monarch Butterfly",
    type: "Insect",
    emoji: "🦋",
    src: "/samples/monarch.jpg",
  },
  {
    name: "Fly Agaric",
    type: "Fungus",
    emoji: "🍄",
    src: "/samples/mushroom.jpg",
  },
  {
    name: "Barn Owl",
    type: "Bird",
    emoji: "🦉",
    src: "/samples/owl.jpg",
  },
];

export default function IdentifyPage() {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [savedToJournal, setSavedToJournal] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError("Image must be under 12 MB.");
      return;
    }
    setError("");
    setResult(null);
    setSavedToJournal(false);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const loadSample = async (sampleSrc: string, sampleName: string) => {
    setError("");
    setResult(null);
    setSavedToJournal(false);
    setFileName(sampleName);

    try {
      const res = await fetch(sampleSrc);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(blob);
    } catch {
      setError("Could not load sample image.");
    }
  };

  const identify = async () => {
    if (!image) return;
    setLoading(true);
    setError("");
    setResult(null);
    setSavedToJournal(false);

    try {
      const res = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Identification failed");
      }

      const data = await res.json();
      setResult({ raw: data.result, data: data.data });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const speak = async () => {
    if (!result) return;

    if (speaking) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setSpeaking(false);
      setAudioLoading(false);
      return;
    }

    const narrationText = result.data
      ? `${result.data.commonName}, scientific name ${result.data.scientificName || ""}. ${result.data.summary || ""} Safety notes: ${result.data.safety || ""}. Fun fact: ${result.data.funFact || ""}`
      : result.raw.replace(/[#*_`]/g, "").slice(0, 1000);

    setAudioLoading(true);

    try {
      // Try ElevenLabs realistic voice first
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: narrationText }),
      });

      if (ttsRes.ok) {
        const blob = await ttsRes.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          setSpeaking(false);
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
          fallbackSpeech(narrationText);
        };
        await audio.play();
        setSpeaking(true);
        setAudioLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Server TTS unavailable, using browser speech synthesis", e);
    }

    fallbackSpeech(narrationText);
  };

  const fallbackSpeech = (text: string) => {
    setAudioLoading(false);
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*_`]/g, "").replace(/\n+/g, ". ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const saveToJournal = () => {
    if (!result || !result.data) return;

    try {
      const existing = localStorage.getItem("wildlens-journal");
      const entries = existing ? JSON.parse(existing) : [];

      const tags = [
        result.data.category?.toLowerCase(),
        result.data.family?.toLowerCase(),
      ].filter(Boolean) as string[];

      const newEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        title: result.data.commonName || "Unknown Species",
        notes: `${result.data.scientificName ? `Scientific: ${result.data.scientificName}\n\n` : ""}${result.data.summary || ""}\n\nHabitat: ${result.data.habitat || "Unspecified"}\nSafety: ${result.data.safety || "Observe carefully"}`,
        imageUrl: image,
        tags,
        location: "Field observation",
      };

      localStorage.setItem("wildlens-journal", JSON.stringify([newEntry, ...entries]));
      setSavedToJournal(true);
    } catch (e) {
      console.error("Failed to save to journal", e);
    }
  };

  const reset = () => {
    setImage(null);
    setFileName("");
    setResult(null);
    setError("");
    setSavedToJournal(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
    setAudioLoading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3"
          style={{ backgroundColor: "var(--color-forest-100)", color: "var(--color-forest-700)" }}>
          🌿 Botanical & Wildlife Visual Engine
        </div>
        <h1
          className="text-3xl sm:text-4xl font-bold mb-3"
          style={{ fontFamily: "var(--font-serif)", color: "var(--color-stone-800)" }}
        >
          Identify Wildlife & Plants
        </h1>
        <p style={{ color: "var(--color-stone-600)" }} className="max-w-2xl leading-relaxed">
          Upload or snap a photo of any organism — a wildflower, bird, insect, tree bark, or fungi.
          Receive taxonomic analysis, habitat patterns, and field safety precautions.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Upload / Image (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {!image ? (
            <div>
              <div
                className={`upload-zone flex flex-col items-center justify-center p-10 text-center transition-all ${
                  dragOver ? "drag-over" : ""
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
                  style={{ backgroundColor: "var(--color-forest-50)", color: "var(--color-forest-600)" }}>
                  📷
                </div>
                <p className="text-base font-medium mb-1" style={{ color: "var(--color-stone-800)" }}>
                  Drop photo or click to browse
                </p>
                <p className="text-xs mb-4" style={{ color: "var(--color-stone-400)" }}>
                  Supports JPEG, PNG, WebP up to 12 MB
                </p>
                <button
                  type="button"
                  className="btn-secondary !text-xs !py-2 !px-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileRef.current?.click();
                  }}
                >
                  Choose from device
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </div>

              {/* Sample Images Quick-Test */}
              <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--color-stone-200)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-stone-400)" }}>
                  Or try with verified field samples:
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {SAMPLE_IMAGES.map((sample) => (
                    <button
                      key={sample.name}
                      onClick={() => loadSample(sample.src, sample.name)}
                      className="group p-2 rounded-xl border text-left transition-all hover:border-forest-500 cursor-pointer bg-white"
                      style={{ borderColor: "var(--color-stone-200)" }}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden mb-1.5 relative bg-stone-100">
                        <img
                          src={sample.src}
                          alt={sample.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="text-xs font-medium truncate" style={{ color: "var(--color-stone-800)" }}>
                        {sample.name}
                      </div>
                      <div className="text-[10px]" style={{ color: "var(--color-stone-400)" }}>
                        {sample.type}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-scale-in">
              <div className="relative rounded-2xl overflow-hidden border shadow-sm" style={{ borderColor: "var(--color-stone-200)" }}>
                <img
                  src={image}
                  alt={fileName}
                  className="w-full h-auto max-h-[420px] object-cover"
                />
                <button
                  onClick={reset}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm bg-white/90 backdrop-blur-sm border border-stone-200 cursor-pointer hover:bg-white transition-colors shadow-sm"
                  title="Remove image"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center justify-between text-xs mt-2 px-1" style={{ color: "var(--color-stone-500)" }}>
                <span className="truncate max-w-[200px]">{fileName}</span>
                <button onClick={reset} className="underline hover:text-stone-800 cursor-pointer">
                  Replace photo
                </button>
              </div>

              {!result && !loading && (
                <button onClick={identify} className="btn-primary mt-4 w-full justify-center !py-3.5 text-base">
                  <span>🔬</span> Run Naturalist Identification
                </button>
              )}

              {loading && (
                <div className="mt-5 p-5 rounded-xl border text-center space-y-3"
                  style={{ backgroundColor: "var(--color-forest-50)", borderColor: "var(--color-forest-200)" }}>
                  <div className="spinner mx-auto" />
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--color-forest-800)" }}>
                      Analyzing morphological features...
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-forest-600)" }}>
                      Checking leaf shape, plumage markers, habitat and taxonomy
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div
              className="p-4 rounded-xl text-sm animate-fade-in"
              style={{
                backgroundColor: "#fef2f2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
              }}
            >
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Right Column: Result Presentation (7 cols) */}
        <div className="lg:col-span-7">
          {!result && !loading && (
            <div
              className="flex flex-col items-center justify-center h-full min-h-[380px] text-center p-8 rounded-2xl border border-dashed"
              style={{ backgroundColor: "var(--color-stone-100)", borderColor: "var(--color-stone-300)" }}
            >
              <div className="text-4xl mb-3 opacity-40">🌿</div>
              <p className="text-base font-medium mb-1" style={{ color: "var(--color-stone-600)" }}>
                Awaiting specimen photograph
              </p>
              <p className="text-xs max-w-sm" style={{ color: "var(--color-stone-400)" }}>
                Select an image on the left or click one of the quick test samples to inspect live identification.
              </p>
            </div>
          )}

          {loading && (
            <div
              className="flex flex-col items-center justify-center h-full min-h-[380px] text-center p-8 rounded-2xl border animate-pulse"
              style={{ backgroundColor: "var(--color-forest-50)", borderColor: "var(--color-forest-200)" }}
            >
              <div className="text-4xl mb-3 animate-float">🌱</div>
              <p className="text-base font-medium mb-1" style={{ color: "var(--color-forest-800)" }}>
                Consulting botanical & faunal taxonomy...
              </p>
              <p className="text-xs max-w-xs" style={{ color: "var(--color-forest-600)" }}>
                Identifying distinct species markers and verifying lookalike differences
              </p>
            </div>
          )}

          {result && (
            <div className="card p-6 sm:p-8 animate-fade-in-up space-y-6">
              {/* Header Action Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b" style={{ borderColor: "var(--color-stone-200)" }}>
                <div className="flex items-center gap-2">
                  <span className="tag tag-green text-xs font-semibold">
                    ✓ Verified Field Identification
                  </span>
                  {result.data?.confidence && (
                    <span className="tag tag-earth text-xs">
                      {result.data.confidence} Confidence
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={speak}
                    className="btn-secondary !py-1.5 !px-3 !text-xs inline-flex items-center gap-1.5"
                    disabled={audioLoading}
                    title={speaking ? "Stop narration" : "Listen to naturalist audio"}
                  >
                    {audioLoading ? (
                      <span className="spinner !w-3 !h-3" />
                    ) : speaking ? (
                      <>🔇 Pause</>
                    ) : (
                      <>🔊 Audio Guide</>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      const text = result.data
                        ? `${result.data.commonName} (${result.data.scientificName})\n${result.data.summary}`
                        : result.raw.replace(/[#*_`]/g, "");
                      navigator.clipboard.writeText(text);
                    }}
                    className="btn-secondary !py-1.5 !px-3 !text-xs"
                    title="Copy details"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              {/* Structured Species Header */}
              {result.data ? (
                <div>
                  <div className="mb-4">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <h2
                        className="text-2xl sm:text-3xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-serif)", color: "var(--color-stone-900)" }}
                      >
                        {result.data.commonName}
                      </h2>
                      {result.data.scientificName && (
                        <span className="text-base italic" style={{ color: "var(--color-forest-700)" }}>
                          {result.data.scientificName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Fact Chips Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Category</div>
                      <div className="text-sm font-semibold text-stone-800 mt-0.5">{result.data.category || "Flora/Fauna"}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Family</div>
                      <div className="text-sm font-semibold text-stone-800 mt-0.5">{result.data.family || "N/A"}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Season</div>
                      <div className="text-sm font-semibold text-stone-800 mt-0.5">{result.data.season || "Year-round"}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Habitat</div>
                      <div className="text-sm font-semibold text-stone-800 mt-0.5 truncate" title={result.data.habitat}>
                        {result.data.habitat || "Temperate"}
                      </div>
                    </div>
                  </div>

                  {/* Safety Alert Box */}
                  {result.data.safety && (
                    <div
                      className="p-4 rounded-xl text-sm flex items-start gap-3 mb-5 border"
                      style={{
                        backgroundColor: result.data.safety.toLowerCase().includes("poison") || result.data.safety.toLowerCase().includes("toxic")
                          ? "#fef2f2"
                          : "var(--color-amber-50)",
                        borderColor: result.data.safety.toLowerCase().includes("poison") || result.data.safety.toLowerCase().includes("toxic")
                          ? "#fecaca"
                          : "var(--color-amber-200)",
                        color: result.data.safety.toLowerCase().includes("poison") || result.data.safety.toLowerCase().includes("toxic")
                          ? "#991b1b"
                          : "var(--color-amber-800)",
                      }}
                    >
                      <span className="text-lg shrink-0">
                        {result.data.safety.toLowerCase().includes("poison") ? "⚠️" : "🛡️"}
                      </span>
                      <div>
                        <div className="font-semibold mb-0.5">Field Safety Guidance</div>
                        <div className="text-xs leading-relaxed opacity-90">{result.data.safety}</div>
                      </div>
                    </div>
                  )}

                  {/* About Summary */}
                  {result.data.summary && (
                    <div className="mb-5">
                      <h3 className="text-xs uppercase tracking-wider font-semibold text-stone-400 mb-2">
                        Natural History & Description
                      </h3>
                      <p className="text-sm leading-relaxed text-stone-700">
                        {result.data.summary}
                      </p>
                    </div>
                  )}

                  {/* Field Identification Tips */}
                  {result.data.identificationTips && result.data.identificationTips.length > 0 && (
                    <div className="mb-5">
                      <h3 className="text-xs uppercase tracking-wider font-semibold text-stone-400 mb-2">
                        Key Distinguishing Markers
                      </h3>
                      <ul className="space-y-1.5">
                        {result.data.identificationTips.map((tip, idx) => (
                          <li key={idx} className="text-sm text-stone-700 flex items-start gap-2">
                            <span className="text-forest-600 font-bold shrink-0">✓</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Fun Fact Card */}
                  {result.data.funFact && (
                    <div className="p-4 rounded-xl border border-stone-200 bg-forest-50/50 mb-6">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-forest-700 mb-1">
                        <span>💡</span> Ecological Fact
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed italic">
                        &ldquo;{result.data.funFact}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="result-content">
                  <div dangerouslySetInnerHTML={{ __html: result.raw.replace(/\n/g, "<br/>") }} />
                </div>
              )}

              {/* Bottom Action Bar */}
              <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: "var(--color-stone-200)" }}>
                {savedToJournal ? (
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-forest-700">
                    <span>✓</span> Logged to your Nature Journal!
                    <Link href="/journal" className="underline font-semibold ml-1">
                      View Journal →
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={saveToJournal}
                    className="btn-primary !py-2.5 !px-5 text-sm w-full sm:w-auto justify-center"
                  >
                    <span>📓</span> Save Sighting to Nature Journal
                  </button>
                )}

                <button onClick={reset} className="btn-secondary !py-2.5 !px-4 text-xs w-full sm:w-auto justify-center">
                  Identify another specimen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
