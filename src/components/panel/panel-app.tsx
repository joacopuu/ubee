"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { ArrowUpRight, CalendarDays, Loader2, LogOut, Megaphone, Scissors, ShoppingBag } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { useHydrated } from "@/hooks/use-hydrated";
import { db, hasDb } from "@/lib/supabase";
import type { Content } from "@/lib/data";
import { AgendaBoard } from "./agenda";
import { ContentEditor } from "./content-editor";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "news", label: "Novedades", icon: Megaphone },
  { id: "products", label: "Tienda", icon: ShoppingBag },
  { id: "services", label: "Servicios y precios", icon: Scissors },
] as const;
type Tab = (typeof TABS)[number]["id"];

export function PanelApp({ content }: { content: Content }) {
  const hydrated = useHydrated();
  if (!hydrated) return <div className="min-h-dvh bg-ink" />;
  return hasDb ? <AuthGate content={content} /> : <Panel content={content} />;
}

/* ── Supabase Auth: only the salon's accounts get in ─────────── */

function AuthGate({ content }: { content: Content }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    const client = db()!;
    client.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = client.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (session === undefined)
    return (
      <div className="grid min-h-dvh place-items-center bg-ink text-stone">
        <Loader2 className="size-5 animate-spin" aria-label="Cargando" />
      </div>
    );
  if (!session) return <Login />;
  return <Panel content={content} email={session.user.email ?? undefined} />;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await db()!.auth.signInWithPassword({ email, password });
    if (err) setError("El mail o la contraseña no coinciden. Si no recordás la contraseña, pedí una nueva.");
    setBusy(false);
  };

  const reset = async () => {
    if (!email) return setError("Escribí tu mail y te mandamos un enlace para crear una contraseña nueva.");
    setBusy(true);
    await db()!.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/panel` });
    setBusy(false);
    setSent(true);
  };

  return (
    <div className="grid min-h-dvh place-items-center bg-ink px-5">
      <form onSubmit={submit} className="w-full max-w-sm" noValidate>
        <Logo tagline className="mx-auto mb-10 w-40 text-bone" />
        <h1 className="display mb-2 text-center text-[2.2rem] leading-none">Panel del salón</h1>
        <p className="mb-8 text-center text-sm text-stone">Ingresá con tu cuenta de UBEE.</p>
        <label htmlFor="login-email" className="mb-2 block text-sm text-bone/80">
          Mail
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 h-12 w-full rounded-xl border border-bone/15 bg-walnut px-4 outline-none focus:border-filament"
        />
        <label htmlFor="login-pass" className="mb-2 block text-sm text-bone/80">
          Contraseña
        </label>
        <input
          id="login-pass"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 w-full rounded-xl border border-bone/15 bg-walnut px-4 outline-none focus:border-filament"
        />
        {error ? (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {sent ? (
          <p role="status" className="mt-4 text-sm text-filament-soft">
            Te enviamos un mail con el enlace para crear una contraseña nueva.
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="press mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-bone text-sm text-ink hover:bg-filament-soft disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null} Ingresar
        </button>
        <button type="button" onClick={() => void reset()} className="mt-3 w-full py-3 text-sm text-stone hover:text-bone">
          Olvidé mi contraseña
        </button>
      </form>
    </div>
  );
}

/* ── Panel shell ────────────────────────────────────────────── */

function Panel({ content, email }: { content: Content; email?: string }) {
  const [tab, setTab] = useState<Tab>("agenda");

  return (
    <div className="min-h-dvh bg-ink">
      <header className="sticky top-0 z-30 border-b border-bone/[0.07] bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 md:px-8">
          <Link href="/" aria-label="Ir al sitio" className="text-bone">
            <Logo className="w-20" />
          </Link>
          <span className="hidden h-5 w-px bg-bone/15 sm:block" />
          <span className="label-wide hidden text-stone sm:block">Panel del salón</span>
          <div className="ml-auto flex items-center gap-1">
            {email ? <span className="mr-2 hidden text-xs text-stone lg:block">{email}</span> : null}
            <Link
              href="/"
              target="_blank"
              className="hidden h-11 items-center gap-2 rounded-full px-3 text-sm text-bone/70 hover:text-bone md:flex"
            >
              Ver sitio <ArrowUpRight className="size-4" aria-hidden />
            </Link>
            {email ? (
              <button
                type="button"
                onClick={() => void db()?.auth.signOut()}
                className="press flex h-11 items-center gap-2 rounded-full px-3 text-sm text-bone/70 hover:text-bone"
              >
                <LogOut className="size-4" aria-hidden /> <span className="hidden sm:inline">Salir</span>
              </button>
            ) : null}
          </div>
        </div>
        <nav aria-label="Secciones del panel" className="mx-auto max-w-[1600px] px-4 md:px-8">
          <ul className="no-scrollbar -mb-px flex gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-current={tab === t.id ? "page" : undefined}
                  className={cn(
                    "flex h-12 items-center gap-2 whitespace-nowrap border-b-2 px-4 text-sm transition-colors",
                    tab === t.id ? "border-filament text-bone" : "border-transparent text-stone hover:text-bone",
                  )}
                >
                  <t.icon className="size-4" strokeWidth={1.6} aria-hidden /> {t.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {tab === "agenda" ? <AgendaBoard services={content.services} /> : null}
      {tab === "news" ? <ContentEditor key="news" kind="news" initial={content.news} /> : null}
      {tab === "products" ? <ContentEditor key="products" kind="products" initial={content.products} /> : null}
      {tab === "services" ? <ContentEditor key="services" kind="services" initial={content.services} /> : null}
    </div>
  );
}
