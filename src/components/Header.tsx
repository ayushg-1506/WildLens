"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/identify", emoji: "📸", label: "Identify" },
  { href: "/explore", emoji: "🧭", label: "Explore Quests" },
  { href: "/journal", emoji: "📓", label: "Field Journal" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="glass sticky top-0 z-50 border-b border-stone-200/80">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 no-underline group">
          <span className="text-2xl transition-transform group-hover:rotate-6">🌿</span>
          <div className="flex flex-col">
            <span
              className="text-lg font-bold tracking-tight leading-none"
              style={{ color: "var(--color-forest-800)", fontFamily: "var(--font-serif)" }}
            >
              WildLens
            </span>
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">
              Field Naturalist Guide
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium no-underline transition-all ${
                  isActive
                    ? "bg-forest-100 text-forest-900 font-semibold shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
