"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Content } from "./data";
import { hasDb } from "./supabase";

/*
 * Demo mode only: what the salon edits in the panel is kept in this
 * browser and layered over the site content, so the demo shows the full
 * "edit in the panel → see it on the site" loop without a database.
 * With Supabase connected this hook is a pass-through: the server already
 * renders the fresh content after the panel publishes.
 */

const KEY = "ubee.content.v1";
const EVENT = "ubee:content";

const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
};
const read = () => {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
};

type Overrides = Partial<Content>;

export function readDemoContent(): Overrides {
  try {
    return JSON.parse(read() || "{}") as Overrides;
  } catch {
    return {};
  }
}

export function saveDemoContent<K extends keyof Content>(key: K, value: Content[K]) {
  const next = { ...readDemoContent(), [key]: value };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    throw new Error("El navegador no tiene espacio para guardar esta imagen. Probá con una más liviana.");
  }
  window.dispatchEvent(new Event(EVENT));
}

export function resetDemoContent() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

/** Everything the panel can edit, including hidden items. */
export function useEditableContent<K extends keyof Content>(key: K, initial: Content[K]): Content[K] {
  const raw = useSyncExternalStore(subscribe, read, () => "");
  return useMemo(() => {
    if (hasDb || !raw) return initial;
    try {
      return (JSON.parse(raw) as Overrides)[key] ?? initial;
    } catch {
      return initial;
    }
  }, [raw, initial, key]);
}

/** What visitors see: only active / published items. */
export function useLiveContent<K extends keyof Content>(key: K, initial: Content[K]): Content[K] {
  const all = useEditableContent(key, initial);
  return useMemo(
    () =>
      (all as Array<{ active?: boolean; published?: boolean }>).filter(
        (x) => x.active !== false && x.published !== false,
      ) as Content[K],
    [all],
  );
}
