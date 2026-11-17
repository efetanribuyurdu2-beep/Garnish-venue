import type { Metadata, Viewport } from "next";
import { themeCSS } from "@/lib/themeKit";
import "./garnish.css";
import "./globals.css";

const host = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

export const metadata: Metadata = {
  metadataBase: new URL(host ? `https://${host}` : "http://localhost:3200"),
  title: "Garnish Venue · Barınızın menüsü, kendi dünyasında",
  description: "Kokteyl barları için lüks, etkileşimli QR menü: alerjen ve kalori otomatik, fiyatlar tek tıkla, her bar kendi dünyasında.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#0b0b0b", width: "device-width", initialScale: 1 };

// every display font carries latin-ext (ğ ş ı İ)
const FONTS =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&family=Bodoni+Moda:ital,wght@0,400;0,500;0,600;1,400&family=Aref+Ruqaa:wght@400;700&family=Syncopate:wght@400;700&family=Exo+2:wght@300;400;600&family=Limelight&family=Poiret+One&family=Forum&family=Josefin+Sans:wght@300;400;600&family=Zen+Antique&family=Shippori+Mincho:wght@400;600&family=Zen+Kaku+Gothic+New:wght@300;400;500&family=Grenze+Gotisch:wght@400;500;600&family=Kavoon&family=Karla:wght@300;400;600&family=Ruslan+Display&family=Aboreto&family=Lora:ital,wght@0,400;0,500;1,400&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" data-world="maison" data-palette="noir">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS} />
        <style dangerouslySetInnerHTML={{ __html: themeCSS() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
