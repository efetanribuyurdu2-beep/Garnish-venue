import type { Metadata, Viewport } from "next";
import { themeCSS } from "@/lib/themeKit";
import "./garnish.css";
import "./backdrops.css";
import "./globals.css";

const host = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

export const metadata: Metadata = {
  metadataBase: new URL(host ? `https://${host}` : "http://localhost:3200"),
  title: "Garnish Venue · Barınızın menüsü, kendi dünyasında",
  description: "Kokteyl barları için lüks, etkileşimli QR menü: alerjen ve kalori otomatik, fiyatlar tek tıkla, her bar kendi dünyasında.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#0b0b0b", width: "device-width", initialScale: 1 };

// the theme stylesheet's address carries a hash of its content, so browsers keep it until it changes
const THEME = (() => {
  let h = 2166136261;
  for (const ch of themeCSS()) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return `/theme.css?v=${(h >>> 0).toString(36)}`;
})();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" data-world="maison" data-palette="noir">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={THEME} />
      </head>
      <body>{children}</body>
    </html>
  );
}
