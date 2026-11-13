import type { NewsItem, Product, Service } from "./data";

/* ── row mappers (snake_case in SQL → camelCase in the app) ── */

type Row = Record<string, unknown>;

export function rowToService(r: Row): Service {
  return {
    id: String(r.id),
    category: r.category as Service["category"],
    name: String(r.name),
    description: String(r.description ?? ""),
    duration: Number(r.duration),
    price: Number(r.price),
    signature: Boolean(r.signature),
    active: r.active !== false,
  };
}

export function rowToProduct(r: Row): Product {
  return {
    id: String(r.id),
    name: String(r.name),
    line: String(r.line ?? r.category ?? ""),
    category: String(r.category ?? ""),
    size: String(r.size ?? ""),
    price: Number(r.price),
    image: String(r.image ?? ""),
    note: String(r.note ?? ""),
    active: r.active !== false,
  };
}

export function rowToNews(r: Row): NewsItem {
  return {
    id: String(r.id),
    type: r.type as NewsItem["type"],
    title: String(r.title),
    text: String(r.text ?? ""),
    date: String(r.date),
    image: String(r.image ?? ""),
    cta: { label: String(r.cta_label ?? "Ver más"), href: String(r.cta_href ?? "/") },
    members: Boolean(r.members),
    published: r.published !== false,
  };
}

/* ── app → row (what the panel writes) ── */

export const serviceToRow = (s: Service, sort = 0) => ({
  id: s.id,
  category: s.category,
  name: s.name,
  description: s.description,
  duration: s.duration,
  price: s.price,
  signature: Boolean(s.signature),
  active: s.active !== false,
  sort,
});

export const productToRow = (p: Product, sort = 0) => ({
  id: p.id,
  name: p.name,
  line: p.line,
  category: p.category,
  size: p.size,
  price: p.price,
  image: p.image,
  note: p.note,
  active: p.active !== false,
  sort,
});

export const newsToRow = (n: NewsItem) => ({
  id: n.id,
  type: n.type,
  title: n.title,
  text: n.text,
  date: n.date,
  image: n.image,
  cta_label: n.cta.label,
  cta_href: n.cta.href,
  members: Boolean(n.members),
  published: n.published !== false,
});
