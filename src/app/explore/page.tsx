"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface HuntItem {
  name: string;
  description: string;
  difficulty: "easy" | "medium" | "challenging" | string;
  category?: string;
  emoji: string;
  found: boolean;
}

interface Quest {
  title: string;
  description: string;
  items: HuntItem[];
  tips: string;
}

const ENVIRONMENTS = [
  { value: "park", label: "Public park or garden", emoji: "🌳" },
  { value: "forest", label: "Forest, woods, or trail", emoji: "🌲" },
  { value: "backyard", label: "Backyard or patio", emoji: "🏡" },
  { value: "urban", label: "City & neighborhood streets", emoji: "🏙️" },
  { value: "wetland", label: "Wetland, lake, or riverside", emoji: "🦆" },
  { value: "beach", label: "Beach, dunes, or coast", emoji: "🏖️" },
  { value: "mountain", label: "Mountain ridge or foothills", emoji: "⛰️" },
];

const INTERESTS = [
  { value: "birds", label: "Birds & raptors", emoji: "🦅" },
  { value: "plants", label: "Wildflowers & flora", emoji: "🌺" },
  { value: "trees", label: "Trees, leaves & bark", emoji: "🌿" },
  { value: "insects", label: "Insects & pollinators", emoji: "🦋" },
  { value: "fungi", label: "Mushrooms & lichens", emoji: "🍄" },
  { value: "wildlife", label: "Mammals & critters", emoji: "🦊" },
  { value: "geology", label: "Rocks & minerals", emoji: "🪨" },
  { value: "everything", label: "Biodiversity mix", emoji: "✨" },
];

export default function ExplorePage() {
  const [environment, setEnvironment] = useState("forest");
  const [interest, setInterest] = useState("everything");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [quest, setQuest] = useState<Quest | null>(null);
  const [error, setError] = useState("");
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const [loggedItems, setLoggedItems] = useState<Record<number, boolean>>({});

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.suburb ||
            data.address?.county ||
            "";
          const state = data.address?.state || "";
          const country = data.address?.country || "";
          setLocation([city, state, country].filter(Boolean).join(", "));
          setGeoStatus("done");
        } catch {
          setLocation(`${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°`);
          setGeoStatus("done");
        }
      },
      () => {
        setGeoStatus("error");
      }
    );
  }, []);

  const generateQuest = async () => {
    if (!environment) {
      setError("Please select an environment to explore.");
      return;
    }
    setLoading(true);
    setError("");
    setQuest(null);
    setLoggedItems({});

    try {
      const res = await fetch("/api/quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          environment,
          interest: interest || "everything",
          location: location || "General temperate nature preserve",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate quest");
      }

      const data = await res.json();
      setQuest(data.quest);
    } catch (err: any) {
      setError(err.message || "Failed to generate quest. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (index: number) => {
    if (!quest) return;
    const updated = { ...quest };
    updated.items = [...updated.items];
    updated.items[index] = { ...updated.items[index], found: !updated.items[index].found };
    setQuest(updated);
  };

  const logToJournal = (item: HuntItem, index: number) => {
    try {
      const existing = localStorage.getItem("wildlens-journal");
      const entries = existing ? JSON.parse(existing) : [];

      const newEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        title: item.name,
        notes: `Discovered during Outdoor Quest: "${quest?.title || "Field Expedition"}".\n\nField Notes: ${item.description}`,
        imageUrl: null,
        tags: [
          item.category?.toLowerCase() || "quest",
          environment.toLowerCase(),
          "quest-find",
        ],
        location: location || "Outdoor Quest Trail",
      };

      localStorage.setItem("wildlens-journal", JSON.stringify([newEntry, ...entries]));
      setLoggedItems((prev) => ({ ...prev, [index]: true }));
    } catch (e) {
      console.error("Failed to log to journal", e);
    }
  };

  const copyChecklist = () => {
    if (!quest) return;
    const lines = [
      `🌿 ${quest.title}`,
      `Description: ${quest.description}`,
      `Location: ${location || "Local Nature Area"}`,
      "",
      "Checklist:",
      ...quest.items.map(
        (it) => `[${it.found ? "X" : " "}] ${it.emoji} ${it.name} (${it.difficulty}) - ${it.description}`
      ),
      "",
      `Field Tip: ${quest.tips}`,
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const foundCount = quest?.items.filter((i) => i.found).length || 0;
  const totalCount = quest?.items.length || 0;
  const progressPct = totalCount > 0 ? (foundCount / totalCount) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3"
          style={{ backgroundColor: "var(--color-amber-100)", color: "var(--color-amber-800)" }}>
          🧭 Field Expeditions & Scavenger Hunts
        </div>
        <h1
          className="text-3xl sm:text-4xl font-bold mb-3"
          style={{ fontFamily: "var(--font-serif)", color: "var(--color-stone-800)" }}
        >
          Outdoor Quests
        </h1>
        <p style={{ color: "var(--color-stone-600)" }} className="leading-relaxed">
          Step outside with a curated expedition tailored to your specific surroundings, current season,
          and ecological focus. Track sightings, challenge your naturalist eye, and log discoveries to your field journal.
        </p>
      </div>

      {!quest ? (
        /* ===== Quest Setup Card ===== */
        <div className="card p-6 sm:p-8 animate-fade-in space-y-8">
          {/* Step 1: Location */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--color-stone-800)" }}>
              📍 1. Where are you exploring?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input-field flex-1"
                placeholder="e.g., Lake Tahoe, Tahoe National Forest, or your city"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <button
                type="button"
                onClick={detectLocation}
                className="btn-secondary !px-4 shrink-0"
                disabled={geoStatus === "loading"}
                title="Detect GPS location"
              >
                {geoStatus === "loading" ? (
                  <span className="spinner inline-block" />
                ) : geoStatus === "done" ? (
                  "✓ Found"
                ) : (
                  "📍 Use GPS"
                )}
              </button>
            </div>
            {geoStatus === "error" && (
              <p className="text-xs mt-1.5 text-amber-700">
                Geolocation unavailable. Feel free to type your city or park name above.
              </p>
            )}
          </div>

          {/* Step 2: Environment */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: "var(--color-stone-800)" }}>
              🌍 2. Select habitat or environment
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ENVIRONMENTS.map((env) => {
                const isSelected = environment === env.value;
                return (
                  <button
                    key={env.value}
                    type="button"
                    onClick={() => setEnvironment(env.value)}
                    className="p-3.5 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between"
                    style={{
                      backgroundColor: isSelected ? "var(--color-forest-50)" : "white",
                      borderColor: isSelected ? "var(--color-forest-500)" : "var(--color-stone-200)",
                      boxShadow: isSelected ? "0 0 0 1px var(--color-forest-500)" : "none",
                    }}
                  >
                    <span className="text-2xl mb-2">{env.emoji}</span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: isSelected ? "var(--color-forest-800)" : "var(--color-stone-700)" }}
                    >
                      {env.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Interest Focus */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: "var(--color-stone-800)" }}>
              🎯 3. What do you want to spot today?
            </label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((item) => {
                const isSelected = interest === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setInterest(item.value)}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border flex items-center gap-1.5"
                    style={{
                      backgroundColor: isSelected ? "var(--color-amber-50)" : "white",
                      borderColor: isSelected ? "var(--color-amber-500)" : "var(--color-stone-200)",
                      color: isSelected ? "var(--color-amber-800)" : "var(--color-stone-600)",
                      boxShadow: isSelected ? "0 0 0 1px var(--color-amber-500)" : "none",
                    }}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div
              className="p-4 rounded-xl text-sm"
              style={{
                backgroundColor: "#fef2f2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={generateQuest}
            className="btn-primary w-full justify-center !py-3.5 text-base"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" /> Assembling seasonal outdoor quest...
              </>
            ) : (
              <>🧭 Generate Seasonal Field Quest</>
            )}
          </button>
        </div>
      ) : (
        /* ===== Quest Results Display ===== */
        <div className="animate-fade-in-up space-y-6">
          {/* Quest Banner Card */}
          <div className="card p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-xl">
                <span className="tag tag-amber text-xs font-semibold mb-2">
                  Active Expedition
                </span>
                <h2
                  className="text-2xl sm:text-3xl font-bold tracking-tight mb-2"
                  style={{ fontFamily: "var(--font-serif)", color: "var(--color-stone-900)" }}
                >
                  {quest.title}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-stone-600)" }}>
                  {quest.description}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="tag tag-green text-sm font-semibold px-3 py-1">
                  {foundCount} of {totalCount} Found
                </div>
                <button
                  onClick={copyChecklist}
                  className="btn-secondary !py-1.5 !px-3 !text-xs inline-flex items-center gap-1"
                  title="Copy checklist text to take outdoors"
                >
                  {copied ? "✓ Copied to clipboard" : "📋 Copy Checklist"}
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div
                className="w-full h-2.5 rounded-full overflow-hidden"
                style={{ backgroundColor: "var(--color-stone-200)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${progressPct}%`,
                    backgroundColor:
                      progressPct === 100
                        ? "var(--color-forest-500)"
                        : "var(--color-forest-600)",
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-stone-500">
                <span>Field progress</span>
                <span className="font-medium">{Math.round(progressPct)}%</span>
              </div>
            </div>

            {progressPct === 100 && (
              <div
                className="p-4 rounded-xl text-center animate-scale-in border"
                style={{
                  backgroundColor: "var(--color-forest-50)",
                  borderColor: "var(--color-forest-300)",
                  color: "var(--color-forest-800)",
                }}
              >
                <div className="text-2xl mb-1">🏅</div>
                <div className="font-semibold text-base">Expedition Accomplished!</div>
                <div className="text-xs mt-1 text-forest-700">
                  You successfully observed every targeted specimen on this quest. Fantastic field naturalist work!
                </div>
              </div>
            )}
          </div>

          {/* Quest Items List */}
          <div className="space-y-3">
            {quest.items.map((item, i) => (
              <div
                key={i}
                className="card p-5 transition-all select-none border"
                style={{
                  borderColor: item.found ? "var(--color-forest-300)" : "var(--color-stone-200)",
                  backgroundColor: item.found ? "var(--color-forest-50)" : "white",
                  opacity: item.found ? 0.9 : 1,
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleItem(i)}
                    className="w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer"
                    style={{
                      borderColor: item.found ? "var(--color-forest-600)" : "var(--color-stone-300)",
                      backgroundColor: item.found ? "var(--color-forest-600)" : "white",
                      color: "white",
                    }}
                    title={item.found ? "Mark as unobserved" : "Mark as observed"}
                  >
                    {item.found && <span className="text-sm font-bold">✓</span>}
                  </button>

                  {/* Item Content */}
                  <div className="flex-1 min-w-0" onClick={() => toggleItem(i)}>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xl">{item.emoji}</span>
                      <span
                        className="font-semibold text-base"
                        style={{
                          color: "var(--color-stone-900)",
                          textDecoration: item.found ? "line-through" : "none",
                        }}
                      >
                        {item.name}
                      </span>
                      {item.category && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                          {item.category}
                        </span>
                      )}
                      <span
                        className="tag text-xs capitalize"
                        style={{
                          backgroundColor:
                            item.difficulty === "easy"
                              ? "var(--color-forest-100)"
                              : item.difficulty === "medium"
                              ? "var(--color-amber-100)"
                              : "var(--color-earth-100)",
                          color:
                            item.difficulty === "easy"
                              ? "var(--color-forest-800)"
                              : item.difficulty === "medium"
                              ? "var(--color-amber-800)"
                              : "var(--color-earth-800)",
                        }}
                      >
                        {item.difficulty}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--color-stone-600)" }}>
                      {item.description}
                    </p>
                  </div>

                  {/* Log in Journal Button */}
                  <div className="shrink-0 flex items-center">
                    {loggedItems[i] ? (
                      <span className="text-xs text-forest-700 font-medium px-2 py-1 bg-forest-100 rounded-lg">
                        ✓ In Journal
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          logToJournal(item, i);
                        }}
                        className="btn-secondary !py-1 !px-2.5 !text-[11px]"
                        title="Add this sighting to your nature journal"
                      >
                        + Log
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Naturalist Tips Card */}
          {quest.tips && (
            <div
              className="card p-5 border flex items-start gap-3"
              style={{ backgroundColor: "var(--color-amber-50)", borderColor: "var(--color-amber-200)" }}
            >
              <span className="text-xl shrink-0">💡</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--color-amber-800)" }}>
                  Naturalist Field Tip
                </p>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--color-amber-900)" }}>
                  {quest.tips}
                </p>
              </div>
            </div>
          )}

          {/* Reset / New Quest Button */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setQuest(null);
                setError("");
              }}
              className="btn-secondary w-full justify-center"
            >
              ← Choose another habitat or interest
            </button>
            <Link href="/journal" className="btn-primary shrink-0 no-underline">
              <span>📓</span> View Journal
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
