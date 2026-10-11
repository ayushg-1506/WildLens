"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  notes: string;
  imageUrl: string | null;
  tags: string[];
  location: string;
}

const STARTER_ENTRIES: JournalEntry[] = [
  {
    id: "sample-1",
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    title: "Monarch Butterfly (Danaus plexippus)",
    notes:
      "Spotted resting on common milkweed blossoms in late afternoon light. Wings were in pristine condition, showing vivid orange with bold black vein margins. Likely part of the southward autumn migration pathway.",
    imageUrl: "/samples/monarch.jpg",
    tags: ["insect", "pollinator", "migration"],
    location: "Meadowlands Nature Trail",
  },
  {
    id: "sample-2",
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    title: "Fly Agaric (Amanita muscaria)",
    notes:
      "Found clustered near Scots pine and birch root systems. Vibrant scarlet cap with distinct pyramidal white warts. Classic mycorrhizal association with older conifer stands. Caution: Toxic mushroom, observed without disturbing.",
    imageUrl: "/samples/mushroom.jpg",
    tags: ["fungus", "forest", "toxic"],
    location: "Blackwood Conifer Reserve",
  },
  {
    id: "sample-3",
    date: new Date(Date.now() - 86400000 * 9).toISOString(),
    title: "Barn Owl (Tyto alba)",
    notes:
      "Perched silently atop an aged cedar fencepost at twilight over pasture grass. Distinct heart-shaped facial disk and pale tawny plumage. Watched for several minutes before it took off in buoyant, noiseless flight.",
    imageUrl: "/samples/owl.jpg",
    tags: ["bird", "raptor", "nocturnal"],
    location: "Oakridge Farmlands",
  },
];

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wildlens-journal");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEntries(parsed);
          return;
        }
      }
      // If empty on first visit, load starter entries so page looks rich
      setEntries(STARTER_ENTRIES);
      localStorage.setItem("wildlens-journal", JSON.stringify(STARTER_ENTRIES));
    } catch {}
  }, []);

  // Save changes to localStorage
  const persistEntries = (newEntries: JournalEntry[]) => {
    setEntries(newEntries);
    try {
      localStorage.setItem("wildlens-journal", JSON.stringify(newEntries));
    } catch {}
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    const entry: JournalEntry = {
      id: editingId || Date.now().toString(),
      date: editingId
        ? entries.find((e) => e.id === editingId)?.date || new Date().toISOString()
        : new Date().toISOString(),
      title: title.trim(),
      notes: notes.trim(),
      imageUrl: image,
      tags: tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      location: location.trim(),
    };

    if (editingId) {
      persistEntries(entries.map((e) => (e.id === editingId ? entry : e)));
    } else {
      persistEntries([entry, ...entries]);
    }

    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setNotes("");
    setTags("");
    setLocation("");
    setImage(null);
    setEditingId(null);
    setShowForm(false);
  };

  const editEntry = (entry: JournalEntry) => {
    setTitle(entry.title);
    setNotes(entry.notes);
    setTags(entry.tags.join(", "));
    setLocation(entry.location);
    setImage(entry.imageUrl);
    setEditingId(entry.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteEntry = (id: string) => {
    persistEntries(entries.filter((e) => e.id !== id));
  };

  const clearAllEntries = () => {
    if (confirm("Are you sure you want to clear all journal entries?")) {
      persistEntries([]);
    }
  };

  const loadStarters = () => {
    persistEntries(STARTER_ENTRIES);
  };

  const handleImage = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Tag extraction
  const allTags = Array.from(new Set(entries.flatMap((e) => e.tags))).sort();

  // Filtered entries
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      !searchQuery ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some((t) => t.includes(searchQuery.toLowerCase()));

    const matchesTag =
      selectedTag === "all" || entry.tags.includes(selectedTag.toLowerCase());

    return matchesSearch && matchesTag;
  });

  // Unique locations count
  const uniqueLocations = new Set(
    entries.map((e) => e.location).filter(Boolean)
  ).size;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3"
            style={{ backgroundColor: "var(--color-earth-100)", color: "var(--color-earth-800)" }}>
            📓 Naturalist Field Log & Herbarium
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold mb-2"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-stone-800)" }}
          >
            Nature Field Journal
          </h1>
          <p style={{ color: "var(--color-stone-600)" }} className="max-w-xl leading-relaxed">
            Your personal record of flora, fauna, and fungi encounters. Log sightings from the Identify
            tool or record manual notes from your trail walks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className="btn-primary shrink-0"
          >
            {showForm ? "✕ Close Form" : "+ New Sighting"}
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm text-center">
          <div className="text-2xl font-bold" style={{ color: "var(--color-forest-700)" }}>
            {entries.length}
          </div>
          <div className="text-xs uppercase tracking-wider text-stone-500 font-medium mt-0.5">
            Total Sightings
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm text-center">
          <div className="text-2xl font-bold" style={{ color: "var(--color-amber-700)" }}>
            {allTags.length}
          </div>
          <div className="text-xs uppercase tracking-wider text-stone-500 font-medium mt-0.5">
            Species Tags
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm text-center">
          <div className="text-2xl font-bold" style={{ color: "var(--color-earth-700)" }}>
            {uniqueLocations}
          </div>
          <div className="text-xs uppercase tracking-wider text-stone-500 font-medium mt-0.5">
            Habitats Logged
          </div>
        </div>
      </div>

      {/* Sighting Input Form */}
      {showForm && (
        <div className="card p-6 sm:p-8 mb-8 animate-scale-in border space-y-5">
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--color-stone-200)" }}>
            <h2 className="text-lg font-bold" style={{ color: "var(--color-stone-800)" }}>
              {editingId ? "Edit Field Entry" : "Record New Sighting"}
            </h2>
            <button onClick={resetForm} className="text-xs text-stone-400 hover:text-stone-700">
              Cancel
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-stone-700)" }}>
                Organism / Sighting Name *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Red-tailed Hawk, Douglas Fir, Goldenrod"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-stone-700)" }}>
                  📍 Habitat / Location
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Forest Edge, Forest Park, Oregon"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-stone-700)" }}>
                  🏷️ Tags (comma separated)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., bird, raptor, wetland"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-stone-700)" }}>
                Field Observations & Notes
              </label>
              <textarea
                className="input-field"
                placeholder="Describe lighting conditions, behavior, plumage, surrounding vegetation, or distinguishing marks..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Photo upload */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-stone-700)" }}>
                📷 Sighting Photo
              </label>
              {image ? (
                <div className="relative inline-block rounded-xl overflow-hidden border border-stone-200">
                  <img
                    src={image}
                    alt="Sighting preview"
                    className="w-36 h-36 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 text-xs flex items-center justify-center border border-stone-300 cursor-pointer shadow-sm"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="upload-zone flex items-center justify-center p-6 cursor-pointer border border-dashed rounded-xl bg-stone-50">
                  <span className="text-xs text-stone-500">
                    📷 Click to upload field photo (JPG, PNG)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImage(file);
                    }}
                  />
                </label>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmit}
                className="btn-primary flex-1 justify-center"
                disabled={!title.trim()}
              >
                {editingId ? "Save Modifications" : "Add to Field Journal"}
              </button>
              <button onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            className="input-field"
            placeholder="🔍 Search sightings by name, notes, habitat, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-stone-400 font-medium mr-1">Filter tag:</span>
            <button
              onClick={() => setSelectedTag("all")}
              className={`tag text-xs cursor-pointer transition-all ${
                selectedTag === "all" ? "tag-green font-bold" : "bg-stone-200 text-stone-600"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? "all" : tag)}
                className={`tag text-xs cursor-pointer transition-all ${
                  selectedTag === tag ? "tag-green font-bold" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <div
          className="text-center py-16 px-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50"
        >
          <div className="text-4xl mb-3 opacity-40">🌿</div>
          <p className="text-base font-semibold mb-1 text-stone-700">
            {entries.length === 0 ? "Your field journal is empty" : "No sightings matched your search"}
          </p>
          <p className="text-xs text-stone-500 mb-6 max-w-sm mx-auto">
            {entries.length === 0
              ? "Start logging plants, birds, and wildlife or load our sample naturalist entries."
              : "Try adjusting your search terms or clearing tag filters."}
          </p>

          {entries.length === 0 ? (
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => setShowForm(true)} className="btn-primary text-xs">
                + Create new sighting
              </button>
              <button onClick={loadStarters} className="btn-secondary text-xs">
                Load field sample entries
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedTag("all");
              }}
              className="btn-secondary text-xs"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="card p-5 sm:p-6 transition-all hover:border-forest-300">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                {entry.imageUrl && (
                  <div className="w-full sm:w-28 sm:h-28 h-48 rounded-xl overflow-hidden shrink-0 border border-stone-200 bg-stone-100">
                    <img
                      src={entry.imageUrl}
                      alt={entry.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div>
                      <h3
                        className="text-lg font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-serif)", color: "var(--color-stone-900)" }}
                      >
                        {entry.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                        <span>
                          📅{" "}
                          {new Date(entry.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {entry.location && <span>· 📍 {entry.location}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => editEntry(entry)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 text-xs transition-colors"
                        title="Edit entry"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 text-xs transition-colors"
                        title="Delete entry"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {entry.notes && (
                    <p className="text-sm text-stone-700 leading-relaxed mt-2 whitespace-pre-line">
                      {entry.notes}
                    </p>
                  )}

                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {entry.tags.map((tag) => (
                        <span key={tag} className="tag tag-green text-[11px]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer controls */}
      {entries.length > 0 && (
        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-3"
          style={{ borderColor: "var(--color-stone-200)" }}>
          <div>
            {entries.length} {entries.length === 1 ? "entry" : "entries"} recorded · Stored locally on this browser
          </div>
          <div className="flex items-center gap-3">
            <Link href="/identify" className="underline hover:text-stone-700">
              📸 Identify new specimen
            </Link>
            <span>·</span>
            <button onClick={clearAllEntries} className="hover:text-red-600 cursor-pointer">
              Clear all entries
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
