"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { LogoMark } from "@/components/Logo";
import { db, signOut } from "@/lib/panel/db";

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const UserCtx = createContext<{ id: string; email: string } | null>(null);
export const usePanelUser = () => useContext(UserCtx);

/** The bar panel's frame: keeps signed-out visitors on the sign-in page, shows who is signed in. */
export function PanelShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string } | null | undefined>(undefined);

  useEffect(() => {
    if (!configured) return setUser(null);
    db()
      .auth.getSession()
      .then(({ data }) => setUser(data.session ? { id: data.session.user.id, email: data.session.user.email ?? "" } : null));
    const { data } = db().auth.onAuthStateChange((_e, s) => setUser(s ? { id: s.user.id, email: s.user.email ?? "" } : null));
    return () => data.subscription.unsubscribe();
  }, []);

  const onSignIn = path.startsWith("/panel/giris");
  useEffect(() => {
    if (user === null && !onSignIn) router.replace("/panel/giris");
    if (user && onSignIn) router.replace("/panel");
  }, [user, onSignIn, router]);

  return (
    <div className="pn">
      <header className="pn-top">
        <Link href="/panel" className="pn-brand">
          <LogoMark size={30} />
          <span>
            GARNISH <em>Bar Paneli</em>
          </span>
        </Link>
        {user && (
          <div className="pn-who">
            <span className="pn-email">{user.email}</span>
            <button
              className="pn-link"
              onClick={async () => {
                await signOut();
                router.replace("/panel/giris");
              }}
            >
              Çıkış
            </button>
          </div>
        )}
      </header>
      <main className="pn-main">
        {!configured ? (
          <div className="pn-empty">
            <h1>Panel henüz bağlı değil</h1>
            <p>Supabase ayarları (NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY) eklenince panel açılır.</p>
          </div>
        ) : user === undefined || (user === null && !onSignIn) || (user && onSignIn) ? (
          <div className="pn-loading" aria-busy="true">
            <LogoMark size={44} />
          </div>
        ) : (
          <UserCtx.Provider value={user ?? null}>{children}</UserCtx.Provider>
        )}
      </main>
    </div>
  );
}
