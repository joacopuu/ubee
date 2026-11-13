"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Check, Eye, EyeOff, Loader2, Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  CATEGORIES,
  NEWS_TYPES,
  PRODUCT_CATEGORIES,
  img,
  minutes,
  money,
  type Content,
  type NewsItem,
  type Product,
  type Service,
} from "@/lib/data";
import { formatDay, toISODate } from "@/lib/booking";
import { newsToRow, productToRow, rowToNews, rowToProduct, rowToService, serviceToRow } from "@/lib/mappers";
import { resetDemoContent, saveDemoContent, useEditableContent } from "@/lib/live-content";
import { db, hasDb } from "@/lib/supabase";
import { publishContent } from "@/app/actions";
import { ImageInput } from "./image-input";
import { cn } from "@/lib/utils";

export type Kind = keyof Content;
type Item = Service | Product | NewsItem;
type Draft = Record<string, unknown>;

type Field = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "select" | "checkbox" | "image";
  options?: { value: string; label: string }[];
  help?: string;
  required?: boolean;
  wide?: boolean;
};

type Config = {
  table: string;
  singular: string;
  fields: Field[];
  visibleKey: "active" | "published";
  canDelete: boolean;
  blank: () => Item;
  title: (x: Item) => string;
  meta: (x: Item) => string;
  thumb?: (x: Item) => string;
  toRow: (x: Item, i: number) => Record<string, unknown>;
  fromRow: (r: Record<string, unknown>) => Item;
  order: string;
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);

const CONFIG: Record<Kind, Config> = {
  news: {
    table: "news",
    singular: "novedad",
    visibleKey: "published",
    canDelete: true,
    order: "date",
    fields: [
      {
        key: "type",
        label: "Tipo",
        type: "select",
        options: NEWS_TYPES.filter((t) => t.id !== "todo").map((t) => ({ value: t.id, label: t.label.replace(/s$/, "") })),
      },
      { key: "date", label: "Fecha", type: "date" },
      { key: "title", label: "Título", type: "text", required: true, wide: true },
      { key: "text", label: "Texto", type: "textarea", required: true, wide: true, help: "Una o dos oraciones." },
      { key: "image", label: "Imagen", type: "image", wide: true },
      { key: "cta.label", label: "Texto del botón", type: "text", help: "Ej. Reservar, Consultar cupos" },
      {
        key: "cta.href",
        label: "Destino del botón",
        type: "text",
        help: "/reservar?servicio=sunkiss · club · wa:cordoba:mensaje · https://…",
      },
      { key: "members", label: "Exclusivo para el Club", type: "checkbox" },
      { key: "published", label: "Visible en la web", type: "checkbox" },
    ],
    blank: () =>
      ({
        id: "",
        type: "novedad",
        title: "",
        text: "",
        date: toISODate(new Date()),
        image: "",
        cta: { label: "Reservar", href: "/reservar" },
        members: false,
        published: true,
      }) satisfies NewsItem,
    title: (x) => (x as NewsItem).title || "Sin título",
    meta: (x) => {
      const n = x as NewsItem;
      return `${NEWS_TYPES.find((t) => t.id === n.type)?.label ?? n.type} · ${formatDay(n.date, { day: "numeric", month: "short" })}`;
    },
    thumb: (x) => (x as NewsItem).image,
    toRow: (x) => newsToRow(x as NewsItem),
    fromRow: rowToNews,
  },
  products: {
    table: "products",
    singular: "producto",
    visibleKey: "active",
    canDelete: true,
    order: "sort",
    fields: [
      { key: "name", label: "Nombre", type: "text", required: true, wide: true },
      {
        key: "category",
        label: "Categoría",
        type: "select",
        options: PRODUCT_CATEGORIES.filter((c) => c !== "Todo").map((c) => ({ value: c, label: c })),
      },
      { key: "size", label: "Presentación", type: "text", help: "Ej. 300 ml" },
      { key: "price", label: "Precio ($)", type: "number", required: true },
      { key: "note", label: "Descripción corta", type: "textarea", wide: true },
      { key: "image", label: "Foto", type: "image", wide: true },
      { key: "active", label: "Visible en la tienda", type: "checkbox" },
    ],
    blank: () =>
      ({
        id: "",
        name: "",
        line: "Hidratación",
        category: "Hidratación",
        size: "",
        price: 0,
        image: "",
        note: "",
        active: true,
      }) satisfies Product,
    title: (x) => (x as Product).name || "Sin nombre",
    meta: (x) => `${(x as Product).category} · ${money((x as Product).price)}`,
    thumb: (x) => (x as Product).image,
    toRow: (x, i) => productToRow({ ...(x as Product), line: (x as Product).category }, i),
    fromRow: rowToProduct,
  },
  services: {
    table: "services",
    singular: "servicio",
    visibleKey: "active",
    canDelete: false,
    order: "sort",
    fields: [
      { key: "name", label: "Nombre", type: "text", required: true, wide: true },
      { key: "category", label: "Categoría", type: "select", options: CATEGORIES.map((c) => ({ value: c.id, label: c.name })) },
      { key: "duration", label: "Duración (minutos)", type: "number", required: true, help: "Define qué horarios se ofrecen." },
      { key: "price", label: "Precio desde ($)", type: "number", required: true },
      { key: "description", label: "Descripción", type: "textarea", wide: true },
      { key: "signature", label: "Marcar como Firma UBEE", type: "checkbox" },
      { key: "active", label: "Disponible para reservar", type: "checkbox" },
    ],
    blank: () =>
      ({
        id: "",
        category: "color",
        name: "",
        description: "",
        duration: 60,
        price: 0,
        signature: false,
        active: true,
      }) satisfies Service,
    title: (x) => (x as Service).name || "Sin nombre",
    meta: (x) => `${minutes((x as Service).duration)} · desde ${money((x as Service).price)}`,
    toRow: (x, i) => serviceToRow(x as Service, i),
    fromRow: rowToService,
  },
};

const get = (o: Draft, path: string) => path.split(".").reduce<unknown>((a, k) => (a as Draft | undefined)?.[k], o);
const set = (o: Draft, path: string, v: unknown): Draft => {
  const [head, ...rest] = path.split(".");
  return { ...o, [head]: rest.length ? set((o[head] as Draft) ?? {}, rest.join("."), v) : v };
};

export function ContentEditor({ kind, initial }: { kind: Kind; initial: Item[] }) {
  const cfg = CONFIG[kind];
  const demoList = useEditableContent(kind, initial as never) as Item[];
  const [dbRows, setDbRows] = useState<{ kind: Kind; list: Item[] } | null>(null);
  const [reload, setReload] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Supabase: load every row, including hidden ones.
  useEffect(() => {
    const client = db();
    if (!client) return;
    let alive = true;
    client
      .from(cfg.table)
      .select("*")
      .order(cfg.order, { ascending: cfg.order !== "date" })
      .then(({ data, error: e }) => {
        if (!alive) return;
        if (e) setError(`No pudimos cargar el contenido: ${e.message}`);
        else setDbRows({ kind, list: data.map(cfg.fromRow) });
      });
    return () => {
      alive = false;
    };
  }, [cfg, kind, reload]);

  const list = useMemo(
    () => (hasDb ? (dbRows?.kind === kind ? dbRows.list : []) : demoList),
    [dbRows, demoList, kind],
  );

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const open = (item: Item | null) => {
    setError(null);
    if (!item) {
      setSelectedId("__new");
      setDraft(cfg.blank() as unknown as Draft);
    } else {
      setSelectedId(item.id);
      setDraft(structuredClone(item) as unknown as Draft);
    }
  };

  const missing = draft
    ? cfg.fields.filter((f) => f.required && (get(draft, f.key) === "" || get(draft, f.key) === undefined)).map((f) => f.label)
    : [];
  const badNumber = draft
    ? cfg.fields.some((f) => f.type === "number" && f.required && !(Number(get(draft, f.key)) > 0))
    : false;

  const save = async () => {
    if (!draft) return;
    if (missing.length || badNumber) {
      setError(
        missing.length ? `Completá: ${missing.join(", ")}.` : "Revisá los números: tienen que ser mayores a cero.",
      );
      return;
    }
    setSaving(true);
    setError(null);
    const isNew = !draft.id;
    const item = {
      ...draft,
      id: isNew ? `${slug(cfg.title(draft as unknown as Item)) || cfg.singular}-${Math.random().toString(36).slice(2, 6)}` : draft.id,
      price: draft.price !== undefined ? Math.round(Number(draft.price)) : undefined,
      duration: draft.duration !== undefined ? Math.round(Number(draft.duration)) : undefined,
    } as unknown as Item;
    if ("price" in draft === false) delete (item as Draft).price;
    if ("duration" in draft === false) delete (item as Draft).duration;

    try {
      const client = db();
      if (!client) {
        const next = isNew ? [item, ...list] : list.map((x) => (x.id === item.id ? item : x));
        saveDemoContent(kind, next as never);
      } else {
        const index = Math.max(0, list.findIndex((x) => x.id === item.id));
        const { error: e } = await client.from(cfg.table).upsert(cfg.toRow(item, isNew ? list.length : index));
        if (e) throw e;
        await publishContent();
        setReload((r) => r + 1);
      }
      setSelectedId(item.id);
      setDraft(structuredClone(item) as unknown as Draft);
      setToast(`Listo: ${cfg.singular} publicad${cfg.singular === "novedad" ? "a" : "o"} en la web.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!draft?.id || !cfg.canDelete) return;
    if (!window.confirm(`¿Eliminar "${cfg.title(draft as unknown as Item)}"? Esta acción no se puede deshacer.`)) return;
    setSaving(true);
    try {
      const client = db();
      if (!client) {
        saveDemoContent(kind, list.filter((x) => x.id !== draft.id) as never);
      } else {
        const { error: e } = await client.from(cfg.table).delete().eq("id", String(draft.id));
        if (e) throw e;
        await publishContent();
        setReload((r) => r + 1);
      }
      setSelectedId(null);
      setDraft(null);
      setToast("Eliminado.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-[1600px] gap-6 px-4 py-6 md:px-8 md:py-8 xl:grid-cols-[400px_minmax(0,1fr)]">
      {/* list */}
      <div className="min-w-0">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-stone">
            {list.length} {cfg.singular === "novedad" ? "novedades" : `${cfg.singular}s`}
          </p>
          <button
            type="button"
            onClick={() => open(null)}
            className="press inline-flex h-11 items-center gap-2 rounded-full bg-bone px-4 text-sm text-ink hover:bg-filament-soft"
          >
            <Plus className="size-4" aria-hidden /> Nuevo {cfg.singular === "novedad" ? "aviso" : cfg.singular}
          </button>
        </div>
        <ul className="grid gap-2" data-lenis-prevent>
          {list.map((x) => {
            const visible = (x as unknown as Draft)[cfg.visibleKey] !== false;
            return (
              <li key={x.id}>
                <button
                  type="button"
                  onClick={() => open(x)}
                  aria-current={selectedId === x.id}
                  className={cn(
                    "press flex w-full items-center gap-4 rounded-2xl border p-3 text-left",
                    selectedId === x.id ? "border-filament/70 bg-filament/[0.06]" : "border-bone/10 bg-walnut hover:border-bone/30",
                  )}
                >
                  {cfg.thumb ? (
                    <span className="size-14 shrink-0 overflow-hidden rounded-xl bg-umber">
                      {cfg.thumb(x) ? <img src={img(cfg.thumb(x)!, 200)} alt="" className="size-full object-cover" /> : null}
                    </span>
                  ) : null}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{cfg.title(x)}</span>
                    <span className="block truncate text-xs text-stone">{cfg.meta(x)}</span>
                  </span>
                  <span
                    className={cn(
                      "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[0.7rem]",
                      visible ? "bg-emerald-400/10 text-emerald-300" : "bg-bone/5 text-stone",
                    )}
                  >
                    {visible ? <Eye className="size-3" aria-hidden /> : <EyeOff className="size-3" aria-hidden />}
                    {visible ? "Visible" : "Oculto"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {!hasDb ? (
          <button
            type="button"
            onClick={() => {
              resetDemoContent();
              setSelectedId(null);
              setDraft(null);
            }}
            className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-stone hover:text-bone"
          >
            <RotateCcw className="size-3.5" aria-hidden /> Restaurar contenido de ejemplo
          </button>
        ) : null}
      </div>

      {/* form */}
      <div className="min-w-0">
        {draft ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
            className="rounded-3xl border border-bone/10 bg-walnut p-5 md:p-7"
            noValidate
          >
            <h2 className="display mb-6 text-[2rem] leading-none">
              {draft.id ? `Editar ${cfg.singular}` : `Nuev${cfg.singular === "novedad" ? "a" : "o"} ${cfg.singular}`}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {cfg.fields.map((f) => (
                <FieldInput
                  key={f.key}
                  field={f}
                  kind={kind}
                  value={get(draft, f.key)}
                  onChange={(v) => setDraft((d) => (d ? set(d, f.key, v) : d))}
                />
              ))}
            </div>

            {error ? (
              <p role="alert" className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
                {error}
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-bone/10 pt-6">
              {cfg.canDelete && draft.id ? (
                <button
                  type="button"
                  onClick={() => void remove()}
                  disabled={saving}
                  className="press inline-flex h-11 items-center gap-2 rounded-full border border-destructive/40 px-4 text-sm text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" aria-hidden /> Eliminar
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDraft(null);
                    setSelectedId(null);
                  }}
                  className="press h-11 rounded-full px-4 text-sm text-bone/70 hover:text-bone"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="press inline-flex h-11 min-w-44 items-center justify-center gap-2 rounded-full bg-filament px-5 text-sm text-ink hover:bg-filament-soft disabled:opacity-60"
                >
                  {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />}
                  {saving ? "Publicando…" : "Guardar y publicar"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-bone/15 p-8 text-center text-sm text-stone">
            Elegí un elemento de la lista para editarlo, o creá uno nuevo.
            <br />
            Los cambios se publican en la web apenas tocás &ldquo;Guardar y publicar&rdquo;.
          </div>
        )}
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.p
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
            className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-bone px-5 py-3 text-sm text-ink shadow-2xl"
          >
            {toast}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function FieldInput({
  field,
  kind,
  value,
  onChange,
}: {
  field: Field;
  kind: Kind;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const id = `f-${kind}-${field.key.replace(".", "-")}`;
  const base =
    "w-full rounded-xl border border-bone/15 bg-ink px-4 text-base text-bone outline-none transition-colors placeholder:text-stone-dark focus:border-filament";
  const wrap = cn(field.wide && "sm:col-span-2");

  if (field.type === "image")
    return (
      <div className={wrap}>
        <ImageInput value={String(value ?? "")} onChange={onChange} folder={kind} label={field.label} />
      </div>
    );

  if (field.type === "checkbox")
    return (
      <label className={cn("flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-bone/10 px-4", wrap)}>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="size-5 accent-[var(--filament)]"
        />
        <span className="text-sm">{field.label}</span>
      </label>
    );

  return (
    <div className={wrap}>
      <label htmlFor={id} className="mb-2 block text-sm text-bone/80">
        {field.label}
        {field.required ? " *" : ""}
      </label>
      {field.type === "textarea" ? (
        <textarea
          id={id}
          rows={3}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={cn(base, "py-3")}
        />
      ) : field.type === "select" ? (
        <select id={id} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={cn(base, "h-12")}>
          {field.options!.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={field.type}
          inputMode={field.type === "number" ? "numeric" : undefined}
          min={field.type === "number" ? 0 : undefined}
          value={String(value ?? "")}
          onChange={(e) => onChange(field.type === "number" ? e.target.value.replace(/[^\d]/g, "") : e.target.value)}
          className={cn(base, "h-12")}
        />
      )}
      {field.help ? <p className="mt-1.5 text-xs text-stone">{field.help}</p> : null}
    </div>
  );
}
