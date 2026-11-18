import Link from "next/link";
import { Fonts } from "@/components/Fonts";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="lp lp-404">
      {/* the site's own (Maison) faces only: this page sits in every route's tree, and React preloads what it links */}
      <Fonts worlds={["maison"]} />
      <LogoMark size={64} />
      <h1>Bu masa boş.</h1>
      <p>Aradığınız menü bulunamadı. QR kodu yeniden okutmayı deneyin.</p>
      <Link className="btn" href="/">Garnish Venue</Link>
    </main>
  );
}
