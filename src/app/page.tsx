"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const FEATURES = [
  {
    emoji: "📸",
    title: "Snap & Identify",
    desc: "Point your camera or upload a photo of any plant, bird, insect, or fungi. Instant taxonomic identification, distinguishing markers, and field safety.",
    href: "/identify",
    color: "var(--color-forest-700)",
    bg: "var(--color-forest-50)",
    tag: "Visual Engine",
  },
  {
    emoji: "🧭",
    title: "Outdoor Quests",
    desc: "Personalized seasonal scavenger hunts created for your specific habitat — whether a city park, mountain trail, or your own backyard.",
    href: "/explore",
    color: "var(--color-amber-800)",
    bg: "var(--color-amber-50)",
    tag: "Field Expeditions",
  },
  {
    emoji: "📓",
    title: "Nature Field Journal",
    desc: "Catalog your sightings, save field notes, track species taxonomy, and build a lasting herbarium of everything you've encountered outdoors.",
    href: "/journal",
    color: "var(--color-earth-800)",
    bg: "var(--color-earth-50)",
    tag: "Local Log",
  },
];

const SHOWCASE_ITEMS = [
  {
    title: "Monarch Butterfly",
    latin: "Danaus plexippus",
    category: "Pollinator",
    image: "/samples/monarch.jpg",
    note: "Observed during autumn migration across meadow milkweed blooms.",
    badge: "99% Confidence",
  },
  {
    title: "Fly Agaric",
    latin: "Amanita muscaria",
    category: "Fungus",
    image: "/samples/mushroom.jpg",
    note: "Classic scarlet cap with white veil remnants on damp moss.",
    badge: "Toxic · Do Not Ingest",
  },
  {
    title: "Barn Owl",
    latin: "Tyto alba",
    category: "Raptor",
    image: "/samples/owl.jpg",
    note: "Silent dusk hunter perched on fencepost above field grass.",
    badge: "Active at Twilight",
  },
];

const TESTIMONIALS = [
  {
    text: "I found three wildflower species along my morning commute that I never noticed before. WildLens identified all of them in seconds without overwhelming jargon.",
    author: "Elena Rostova",
    role: "Trail runner & amateur botanist",
  },
  {
    text: "The outdoor quest generator turned an ordinary walk with my kids into an exciting scavenger hunt. We found lichen, an acorn woodpecker, and bracket fungi.",
    author: "Marcus Chen",
    role: "Outdoor educator",
  },
  {
    text: "The audio field guide narration is genuinely wonderful. You can listen to species safety details while keeping your eyes on the trail.",
    author: "Dr. Sarah Lindqvist",
    role: "Ecology researcher",
  },
];

export default function HomePage() {
  const [activeShowcase, setActiveShowcase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveShowcase((prev) => (prev + 1) % SHOWCASE_ITEMS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = SHOWCASE_ITEMS[activeShowcase];

  return (
    <div>
      {/* ===== Hero Section ===== */}
      <section
        className="relative overflow-hidden border-b"
        style={{
          borderColor: "var(--color-stone-200)",
          background:
            "linear-gradient(160deg, #f2f7f2 0%, #faf8f5 45%, #fbf5eb 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: "var(--color-forest-100)", color: "var(--color-forest-800)" }}>
                <span>🌿</span> Nature Identification & Field Expeditions
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.12]"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "var(--color-stone-900)",
                }}
              >
                See the wild in{" "}
                <span className="italic" style={{ color: "var(--color-forest-700)" }}>
                  everything
                </span>{" "}
                around you.
              </h1>

              <p
                className="text-lg leading-relaxed max-w-xl"
                style={{ color: "var(--color-stone-600)" }}
              >
                Point your lens at any wildflower, raptor, mushroom, or insect. Get immediate
                taxonomic accuracy, safe foraging alerts, and narrated field guides. Then step into your local ecosystem with personalized scavenger quests.
              </p>

              <div className="flex flex-wrap gap-3.5 pt-2">
                <Link href="/identify" className="btn-primary no-underline !py-3.5 !px-6 text-base shadow-sm">
                  <span>📸</span> Identify a Specimen
                </Link>
                <Link href="/explore" className="btn-secondary no-underline !py-3.5 !px-6 text-base">
                  <span>🧭</span> Start Nature Quest
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 pt-4 text-xs font-medium" style={{ color: "var(--color-stone-500)" }}>
                <span className="flex items-center gap-1.5">
                  <span className="text-forest-600">✓</span> No account required
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-forest-600">✓</span> High-res taxonomic vision
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-forest-600">✓</span> Naturalist audio guides
                </span>
              </div>
            </div>

            {/* Right Live Specimen Card Showcase (5 cols) */}
            <div className="lg:col-span-5">
              <div className="relative">
                {/* Decorative background glow */}
                <div
                  className="absolute -inset-4 rounded-3xl opacity-40 blur-2xl pointer-events-none"
                  style={{ background: "radial-gradient(circle, var(--color-forest-300), transparent 70%)" }}
                />

                <div className="card overflow-hidden shadow-xl border border-stone-200 relative bg-white transition-all">
                  {/* Photo area */}
                  <div className="aspect-[4/3] relative overflow-hidden bg-stone-100">
                    <img
                      key={current.image}
                      src={current.image}
                      alt={current.title}
                      className="w-full h-full object-cover animate-fade-in"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="tag tag-green text-xs font-semibold backdrop-blur-sm bg-white/90 shadow-sm">
                        ✓ {current.badge}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="tag tag-earth text-xs font-semibold backdrop-blur-sm bg-white/90 shadow-sm">
                        {current.category}
                      </span>
                    </div>
                  </div>

                  {/* Card metadata */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <div>
                        <h3
                          className="text-xl font-bold tracking-tight"
                          style={{ fontFamily: "var(--font-serif)", color: "var(--color-stone-900)" }}
                        >
                          {current.title}
                        </h3>
                        <p className="text-xs italic text-forest-700">
                          {current.latin}
                        </p>
                      </div>
                      <Link
                        href="/identify"
                        className="text-xs font-semibold text-forest-700 hover:text-forest-900 underline"
                      >
                        Try this photo →
                      </Link>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {current.note}
                    </p>

                    {/* Specimen carousel tabs */}
                    <div className="flex gap-2 pt-2 border-t border-stone-100">
                      {SHOWCASE_ITEMS.map((item, idx) => (
                        <button
                          key={item.title}
                          onClick={() => setActiveShowcase(idx)}
                          className={`flex-1 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer border ${
                            activeShowcase === idx
                              ? "bg-forest-50 border-forest-400 text-forest-800 font-semibold"
                              : "bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100"
                          }`}
                        >
                          {item.title.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3 Core Capabilities ===== */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <span className="tag tag-green text-xs font-semibold mb-3">
            Designed for the Field
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-stone-800)" }}
          >
            Built to take you from screen to soil
          </h2>
          <p style={{ color: "var(--color-stone-600)" }} className="leading-relaxed">
            WildLens doesn&apos;t just name what you see — it explains ecological roles,
            warns of lookalikes, and challenges you to discover more around your neighborhood.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="card p-7 no-underline group hover:border-forest-400 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
                    style={{ backgroundColor: f.bg }}
                  >
                    {f.emoji}
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    {f.tag}
                  </span>
                </div>
                <h3
                  className="text-lg font-bold mb-2.5"
                  style={{ color: f.color }}
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-stone-600)" }}>
                  {f.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-stone-100 flex items-center text-xs font-semibold text-stone-700 group-hover:text-forest-700">
                <span>Explore feature</span>
                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section
        style={{ backgroundColor: "#f5f3ee" }}
        className="py-20 border-y border-stone-200"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-3"
              style={{ fontFamily: "var(--font-serif)", color: "var(--color-stone-800)" }}
            >
              How WildLens Works
            </h2>
            <p style={{ color: "var(--color-stone-600)" }} className="max-w-md mx-auto text-sm">
              Grounded in botanical keys and ecological taxonomy.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Snap or Upload Specimen",
                desc: "Capture a clear photo of flowers, leaf arrangement, feathers, or spore-bearing gills. No specialized gear needed.",
              },
              {
                step: "02",
                title: "Examine Taxonomy & Safety",
                desc: "Get common & Latin names, taxonomic family, habitat patterns, lookalike distinctions, and toxicity precautions.",
              },
              {
                step: "03",
                title: "Build Field Record",
                desc: "Log verified sightings directly to your offline field journal, or start an outdoor scavenger quest tailored to your region.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 p-5 rounded-2xl bg-white border border-stone-200">
                <div
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: "var(--color-forest-100)",
                    color: "var(--color-forest-800)",
                  }}
                >
                  {item.step}
                </div>
                <div>
                  <h3
                    className="font-bold mb-1.5 text-base"
                    style={{ color: "var(--color-stone-900)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--color-stone-600)" }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Community Field Notes ===== */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-stone-800)" }}
          >
            From the Field Community
          </h2>
          <p className="text-sm text-stone-500">
            Real feedback from hikers, students, and family explorers.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="card p-7 flex flex-col justify-between">
              <p
                className="text-sm leading-relaxed mb-6 italic"
                style={{ color: "var(--color-stone-700)" }}
              >
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="pt-4 border-t border-stone-100">
                <p className="text-sm font-bold" style={{ color: "var(--color-stone-900)" }}>
                  {t.author}
                </p>
                <p className="text-xs" style={{ color: "var(--color-stone-400)" }}>
                  {t.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Call To Action ===== */}
      <section
        className="py-20 border-t border-stone-200"
        style={{
          background:
            "linear-gradient(160deg, var(--color-forest-50) 0%, #faf6ee 100%)",
        }}
      >
        <div className="max-w-2xl mx-auto px-6 text-center space-y-5">
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-stone-900)" }}
          >
            Step outside and see what&apos;s living nearby.
          </h2>
          <p className="text-base leading-relaxed" style={{ color: "var(--color-stone-600)" }}>
            Free, private, and runs entirely in your browser. No sign-up, no trackers, just genuine nature exploration.
          </p>
          <div className="flex flex-wrap gap-3.5 justify-center pt-2">
            <Link href="/identify" className="btn-primary no-underline text-base !py-3.5 !px-6">
              Start Identifying Now →
            </Link>
            <Link href="/explore" className="btn-secondary no-underline text-base !py-3.5 !px-6">
              Generate a Quest
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
