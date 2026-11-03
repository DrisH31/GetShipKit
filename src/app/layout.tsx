import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { CONTENT } from "@/config/content";

// Faces are self-hosted by next/font: no request to Google at runtime.
// Display: Bricolage Grotesque, GetShipKit's own (DESIGN.md, Type). Text: Inter and
// code: Geist Mono, the design system's.
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const text = Inter({ subsets: ["latin"], axes: ["opsz"], variable: "--font-inter", display: "swap" });
const code = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap", preload: false });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: CONTENT.meta.title, template: `%s · ${CONTENT.meta.siteName}` },
  description: CONTENT.meta.description,
  manifest: "/site.webmanifest",
  icons: { icon: "/favicon.ico", apple: "/favicon.ico" },
  openGraph: { title: CONTENT.meta.title, description: CONTENT.meta.description, type: "website" },
};

// Applies the saved scheme (or the system's) before the first paint, so the
// page never flashes the wrong one. The theme toggle writes `theme` to storage.
const schemeScript = `(function(){try{var s=localStorage.getItem("theme");var d=s?s==="dark":matchMedia("(prefers-color-scheme: dark)").matches;var r=document.documentElement;r.classList.toggle("dark",d);r.classList.toggle("light",!d);r.style.colorScheme=d?"dark":"light"}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${text.variable} ${code.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: schemeScript }} />
        {/* Without JavaScript, nothing that animates in may stay hidden. */}
        <noscript>
          <style>{`[style*="opacity:0"],.opacity-0{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-dvh bg-bg font-sans text-ink antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
