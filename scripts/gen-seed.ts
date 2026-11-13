/*
 * Genera supabase/seed.sql con el contenido actual de src/lib/data.ts.
 *   npm run db:seed-sql
 * (Node 22.6+ ejecuta TypeScript directamente.)
 */
import { writeFileSync } from "node:fs";
import { NEWS, PRODUCTS, SERVICES, img } from "../src/lib/data.ts";

const q = (v: unknown) =>
  v === null || v === undefined
    ? "null"
    : typeof v === "number" || typeof v === "boolean"
      ? String(v)
      : `'${String(v).replace(/'/g, "''")}'`;

const rows = (table: string, cols: string[], values: unknown[][]) =>
  `insert into public.${table} (${cols.join(", ")}) values\n` +
  values.map((r) => `  (${r.map(q).join(", ")})`).join(",\n") +
  `\non conflict (id) do update set ${cols
    .filter((c) => c !== "id")
    .map((c) => `${c} = excluded.${c}`)
    .join(", ")};\n`;

const sql = [
  "-- Contenido inicial de UBEE (generado por scripts/gen-seed.ts). Se puede ejecutar más de una vez.",
  rows(
    "services",
    ["id", "category", "name", "description", "duration", "price", "signature", "active", "sort"],
    SERVICES.map((s, i) => [s.id, s.category, s.name, s.description, s.duration, s.price, Boolean(s.signature), true, i]),
  ),
  rows(
    "products",
    ["id", "name", "line", "category", "size", "price", "image", "note", "active", "sort"],
    PRODUCTS.map((p, i) => [p.id, p.name, p.line, p.category, p.size, p.price, img(p.image, 900), p.note, true, i]),
  ),
  rows(
    "news",
    ["id", "type", "title", "text", "date", "image", "cta_label", "cta_href", "members", "published"],
    NEWS.map((n) => [n.id, n.type, n.title, n.text, n.date, img(n.image, 1400), n.cta.label, n.cta.href, Boolean(n.members), true]),
  ),
].join("\n");

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql);
console.log("supabase/seed.sql generado");
