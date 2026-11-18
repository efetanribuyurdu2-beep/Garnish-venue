import type { Metadata } from "next";
import { Fonts } from "@/components/Fonts";
import "./print.css";

export const metadata: Metadata = { robots: { index: false } };

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Fonts />
      {children}
    </>
  );
}
