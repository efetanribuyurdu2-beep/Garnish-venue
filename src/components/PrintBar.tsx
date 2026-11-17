"use client";

import Link from "next/link";

/** The toolbar above a printable page (hidden on paper): print / save as PDF, and the page's options. */
export function PrintBar({ back, title, children }: { back?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="pr-bar">
      {back && (
        <Link href={back} className="pr-back">
          ← Panel
        </Link>
      )}
      <span className="pr-title">{title}</span>
      <div className="pr-opts">{children}</div>
      <button className="btn" onClick={() => window.print()}>
        Yazdır · PDF kaydet
      </button>
    </div>
  );
}
