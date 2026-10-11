import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "WildLens — Discover Nature Around You",
  description:
    "Identify plants, birds, and wildlife from photos. Get personalized outdoor adventures and learn about the nature in your backyard.",
  keywords: ["nature", "plant identification", "bird identification", "outdoor", "wildlife", "hiking"],
  openGraph: {
    title: "WildLens — Discover Nature Around You",
    description: "Identify plants, birds, and wildlife from photos. Get personalized outdoor adventures.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <footer
          className="border-t py-8 px-6 text-center text-sm"
          style={{
            borderColor: "var(--color-stone-200)",
            color: "var(--color-stone-400)",
          }}
        >
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span>🌿</span>
              <span>WildLens</span>
            </div>
            <p>Helping you see the wild in everything.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
