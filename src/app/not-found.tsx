import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="lp lp-404">
      <LogoMark size={64} />
      <h1>Bu masa boş.</h1>
      <p>Aradığınız menü bulunamadı. QR kodu yeniden okutmayı deneyin.</p>
      <Link className="btn" href="/">Garnish Venue</Link>
    </main>
  );
}
