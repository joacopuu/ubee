"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { BRANCHES, PRODUCT_CATEGORIES, img, money, wa, type BranchId, type Product } from "@/lib/data";
import { SplitReveal } from "@/components/site/reveal";
import { WhatsAppIcon } from "@/components/site/icons";
import { cn } from "@/lib/utils";
import { useLiveContent } from "@/lib/live-content";

const KEY = "ubee.cart.v1";
const EASE = [0.32, 0.72, 0, 1] as const;

type Cart = Record<string, number>;

/* The cart lives in localStorage and is read as an external store, so it
 * survives reloads and stays in sync across tabs. */
let memoryCart = "{}";
const readRaw = () => {
  try {
    return localStorage.getItem(KEY) ?? "{}";
  } catch {
    return memoryCart;
  }
};
const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  window.addEventListener("ubee:cart", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("ubee:cart", cb);
  };
};

function useCart() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "{}");
  const cart = useMemo<Cart>(() => {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }, [raw]);
  const update = (next: Cart) => {
    memoryCart = JSON.stringify(next);
    try {
      localStorage.setItem(KEY, memoryCart);
    } catch {}
    window.dispatchEvent(new Event("ubee:cart"));
  };
  const set = (id: string, qty: number) => {
    const next = { ...cart };
    if (qty <= 0) delete next[id];
    else next[id] = Math.min(qty, 20);
    update(next);
  };
  return { cart, set, clear: () => update({}) };
}

export function Shop({ products: initial }: { products: Product[] }) {
  const products = useLiveContent("products", initial);
  const [cat, setCat] = useState("Todo");
  const [open, setOpen] = useState(false);
  const { cart, set, clear } = useCart();
  const items = products.filter((p) => cat === "Todo" || p.category === cat);
  const count = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div className="relative pb-32 pt-28 md:pt-36">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <header className="mb-12 grid gap-8 md:mb-16 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="label-wide mb-5 text-stone">Tienda UBEE</p>
            <h1 className="display text-[clamp(2.8rem,7vw,6.5rem)]">
              <SplitReveal text="Lo del salón, para tu casa." italic={[3, 4]} immediate delay={0.1} />
            </h1>
          </div>
          <div className="md:col-span-4 md:justify-self-end">
            <ol className="grid gap-3 text-sm text-bone/70">
              {["Elegí tus productos", "Enviá el pedido por WhatsApp", "Retiralo en tu sucursal"].map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  <span className="grid size-7 place-items-center rounded-full border border-bone/20 text-xs tabular text-filament-soft">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </header>

        <div
          role="group"
          aria-label="Filtrar productos"
          className="no-scrollbar -mx-5 mb-10 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0"
        >
          {PRODUCT_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
              className={cn(
                "press h-11 shrink-0 rounded-full border px-5 text-sm",
                cat === c ? "border-bone bg-bone text-ink" : "border-bone/15 text-bone/70 hover:border-bone/40 hover:text-bone",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <motion.ul layout className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((p) => (
              <ProductCard key={p.id} p={p} qty={cart[p.id] ?? 0} onQty={(q) => set(p.id, q)} />
            ))}
          </AnimatePresence>
        </motion.ul>

        <p className="mt-16 max-w-[60ch] text-sm leading-relaxed text-stone">
          Precios de referencia. El stock y el valor final se confirman por WhatsApp antes de preparar tu pedido.
        </p>
      </div>

      {/* floating bag */}
      <AnimatePresence>
        {count > 0 && !open ? (
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="press fixed bottom-5 right-5 z-30 flex h-14 items-center gap-3 rounded-full bg-filament pl-5 pr-2 text-ink shadow-[0_10px_40px_-8px_rgba(240,190,116,0.6)] hover:bg-filament-soft"
          >
            <ShoppingBag className="size-5" strokeWidth={1.6} aria-hidden />
            <span className="text-sm">Ver pedido</span>
            <span className="grid size-10 place-items-center rounded-full bg-ink text-sm tabular text-bone">{count}</span>
          </motion.button>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {open ? <CartDrawer products={products} cart={cart} set={set} clear={clear} onClose={() => setOpen(false)} /> : null}
      </AnimatePresence>
    </div>
  );
}

function ProductCard({ p, qty, onQty }: { p: Product; qty: number; onQty: (q: number) => void }) {
  return (
    <motion.li
      id={p.id}
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="group scroll-mt-28"
    >
      <div className="arch relative aspect-[4/5] overflow-hidden bg-walnut">
        <img
          src={img(p.image, 700)}
          alt={p.name}
          loading="lazy"
          className="absolute inset-0 size-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.05]"
        />
      </div>
      <div className="mt-4">
        <p className="label-wide !text-[0.5rem] text-stone">
          {p.line} · {p.size}
        </p>
        <h2 className="display mt-1.5 text-[1.5rem] leading-tight">{p.name}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-bone/60">{p.note}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="tabular">{money(p.price)}</span>
          {qty === 0 ? (
            <button
              type="button"
              onClick={() => onQty(1)}
              className="press inline-flex h-11 items-center gap-2 rounded-full border border-bone/20 px-4 text-sm hover:border-filament hover:bg-filament hover:text-ink"
            >
              <Plus className="size-4" aria-hidden /> Agregar
            </button>
          ) : (
            <Stepper qty={qty} onQty={onQty} label={p.name} />
          )}
        </div>
      </div>
    </motion.li>
  );
}

function Stepper({ qty, onQty, label }: { qty: number; onQty: (q: number) => void; label: string }) {
  return (
    <div className="flex h-11 items-center rounded-full border border-filament/60 bg-filament/10">
      <button
        type="button"
        onClick={() => onQty(qty - 1)}
        className="press grid size-11 place-items-center rounded-full text-filament-soft hover:bg-filament/15"
        aria-label={`Quitar una unidad de ${label}`}
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <span className="w-6 text-center text-sm tabular" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => onQty(qty + 1)}
        className="press grid size-11 place-items-center rounded-full text-filament-soft hover:bg-filament/15"
        aria-label={`Sumar una unidad de ${label}`}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}

function CartDrawer({
  products,
  cart,
  set,
  clear,
  onClose,
}: {
  products: Product[];
  cart: Cart;
  set: (id: string, q: number) => void;
  clear: () => void;
  onClose: () => void;
}) {
  const lenis = useLenis();
  const [branch, setBranch] = useState<BranchId>("cordoba");
  const [name, setName] = useState("");
  const lines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ p: products.find((x) => x.id === id)!, qty }))
        .filter((l) => l.p),
    [cart, products],
  );
  const total = lines.reduce((a, l) => a + l.p.price * l.qty, 0);
  const b = BRANCHES.find((x) => x.id === branch)!;

  useEffect(() => {
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [lenis, onClose]);

  useEffect(() => {
    if (!lines.length) onClose();
  }, [lines.length, onClose]);

  const message = [
    `¡Hola UBEE! Quiero hacer un pedido de la tienda${name.trim() ? `. Soy ${name.trim()}` : ""}.`,
    ``,
    ...lines.map((l) => `• ${l.qty} × ${l.p.name} (${l.p.size}) — ${money(l.p.price * l.qty)}`),
    ``,
    `Total de referencia: ${money(total)}`,
    `Retiro en: ${b.name}`,
  ].join("\n");

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[60] bg-ink/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
        onClick={onClose}
        aria-hidden
      />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="Tu pedido"
        className="fixed inset-y-0 right-0 z-[61] flex w-full max-w-[460px] flex-col border-l border-bone/10 bg-walnut"
        initial={{ x: "100%" }}
        animate={{ x: 0, transition: { duration: 0.5, ease: EASE } }}
        exit={{ x: "100%", transition: { duration: 0.3, ease: EASE } }}
        data-lenis-prevent
      >
        <div className="flex items-center justify-between border-b border-bone/10 px-6 py-5">
          <h2 className="display text-[2rem] leading-none">Tu pedido</h2>
          <button
            type="button"
            onClick={onClose}
            className="press grid size-11 place-items-center rounded-full border border-bone/15 hover:border-bone/40"
            aria-label="Cerrar pedido"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <ul className="flex-1 divide-y divide-bone/10 overflow-y-auto px-6">
          {lines.map((l) => (
            <li key={l.p.id} className="flex gap-4 py-5">
              <img src={img(l.p.image, 200)} alt="" className="size-20 shrink-0 rounded-xl object-cover" />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="display text-[1.25rem] leading-tight">{l.p.name}</p>
                    <p className="text-xs text-stone">{l.p.size}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set(l.p.id, 0)}
                    className="press -m-2 grid size-10 place-items-center rounded-full text-stone hover:text-bone"
                    aria-label={`Quitar ${l.p.name}`}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <Stepper qty={l.qty} onQty={(q) => set(l.p.id, q)} label={l.p.name} />
                  <span className="text-sm tabular">{money(l.p.price * l.qty)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="grid gap-4 border-t border-bone/10 px-6 py-6">
          <div>
            <p className="mb-2 text-sm text-bone/80">¿Dónde lo retirás?</p>
            <div className="grid grid-cols-2 gap-2">
              {BRANCHES.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  aria-pressed={branch === x.id}
                  onClick={() => setBranch(x.id)}
                  className={cn(
                    "press h-11 rounded-xl border text-sm",
                    branch === x.id ? "border-filament bg-filament/10 text-filament-soft" : "border-bone/15 text-bone/70",
                  )}
                >
                  {x.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="cart-name" className="mb-2 block text-sm text-bone/80">
              Tu nombre
            </label>
            <input
              id="cart-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Para identificar el pedido"
              className="h-12 w-full rounded-xl border border-bone/15 bg-ink px-4 text-base outline-none placeholder:text-stone-dark focus:border-filament"
            />
          </div>
          <div className="flex items-end justify-between pt-2">
            <span className="text-sm text-stone">Total de referencia</span>
            <span className="display text-[2rem] leading-none tabular">{money(total)}</span>
          </div>
          <a
            href={wa(b.whatsapp, message)}
            target="_blank"
            rel="noreferrer"
            onClick={() => window.setTimeout(clear, 400)}
            className="press flex h-14 items-center justify-center gap-3 rounded-2xl bg-filament text-sm text-ink hover:bg-filament-soft"
          >
            <WhatsAppIcon className="size-5" /> Enviar pedido por WhatsApp
          </a>
        </div>
      </motion.aside>
    </>
  );
}
