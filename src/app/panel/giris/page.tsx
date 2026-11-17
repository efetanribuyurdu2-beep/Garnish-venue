"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/panel/db";

const ERR: Record<string, string> = {
  "Invalid login credentials": "E-posta ya da şifre hatalı.",
  "Email not confirmed": "E-postanızı henüz onaylamadınız. Gelen kutunuzdaki bağlantıya dokunun.",
  "User already registered": "Bu e-postayla zaten bir hesap var. Giriş yapın.",
};

export default function SignInPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "err" | "ok"; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "in") await signIn(email.trim(), password);
      else {
        const r = await signUp(email.trim(), password);
        if (r.needsConfirmation) setMsg({ kind: "ok", text: "Hesabınız açıldı. E-postanıza gelen onay bağlantısına dokunun, sonra giriş yapın." });
      }
    } catch (err) {
      const m = (err as Error).message;
      setMsg({ kind: "err", text: ERR[m] ?? (m.includes("Password") ? "Şifre en az 8 karakter olmalı." : m) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pn-auth">
      <p className="pn-eyebrow">Garnish Venue</p>
      <h1>{mode === "in" ? "Barınıza hoş geldiniz." : "Barınız için hesap açın."}</h1>
      <p className="pn-sub">Menünüzü, fiyatlarınızı ve masalarınızı buradan yönetirsiniz.</p>
      <div className="pn-seg" role="tablist">
        <button role="tab" aria-selected={mode === "in"} className={mode === "in" ? "on" : ""} onClick={() => setMode("in")}>
          Giriş
        </button>
        <button role="tab" aria-selected={mode === "up"} className={mode === "up" ? "on" : ""} onClick={() => setMode("up")}>
          Hesap aç
        </button>
      </div>
      <form onSubmit={submit} className="pn-form">
        <label className="pn-field">
          <span>E-posta</span>
          <input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="pn-field">
          <span>Şifre</span>
          <input
            className="input"
            type="password"
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {msg && <p className={`pn-msg ${msg.kind}`}>{msg.text}</p>}
        <button className="btn pn-wide" disabled={busy}>
          {busy ? "Bekleyin…" : mode === "in" ? "Giriş yap" : "Hesap aç"}
        </button>
      </form>
    </div>
  );
}
