import type { Metadata } from "next";
import { Fonts } from "@/components/Fonts";
import { PanelShell } from "@/components/panel/PanelShell";
import "./panel.css";

export const metadata: Metadata = { title: "Bar Paneli · Garnish Venue", robots: { index: false } };

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Fonts />
      <PanelShell>{children}</PanelShell>
    </>
  );
}
