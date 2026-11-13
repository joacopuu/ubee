"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { img, money, type Product } from "@/lib/data";
import { useLiveContent } from "@/lib/live-content";
import { Cta } from "@/components/site/cta";
import { Reveal, SplitReveal } from "@/components/site/reveal";

/** The one light room of the page: the travertine counter. */
export function ShopPreview({ products }: { products: Product[] }) {
  const picks = useLiveContent("products", products).slice(0, 4);
  return (
    <section aria-labelledby="tienda-titulo" className="relative bg-travertine py-24 text-ink md:py-36">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="mb-14 grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="label-wide mb-5 text-stone-ink">Tienda</p>
            <h2 id="tienda-titulo" className="display text-[clamp(2.6rem,6vw,5.5rem)]">
              <SplitReveal text="La rutina sigue en casa." italic={[3, 4]} />
            </h2>
          </div>
          <div className="md:col-span-4 md:justify-self-end">
            <p className="mb-6 max-w-[34ch] text-[0.95rem] leading-relaxed text-ink/65">
              Los productos que usamos en el salón. Armá tu pedido y lo coordinamos por WhatsApp para que lo retires en tu
              sucursal.
            </p>
            <Cta href="/tienda" variant="ink">
              Ver la tienda
            </Cta>
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {picks.map((p, i) => (
            <Reveal as="li" key={p.id} delay={i * 0.06}>
              <Link href={`/tienda#${p.id}`} className="group block">
                <div className="arch relative aspect-[4/5] overflow-hidden bg-paper">
                  <img
                    src={img(p.image, 700)}
                    alt={p.name}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.05]"
                  />
                  <span className="absolute bottom-4 right-4 grid size-11 place-items-center rounded-full bg-bone text-ink opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <ArrowUpRight className="size-4" aria-hidden />
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <div className="min-w-0">
                    <p className="label-wide !text-[0.5rem] text-stone-ink">{p.line}</p>
                    <h3 className="display mt-1.5 text-[1.3rem] leading-tight md:text-[1.45rem]">{p.name}</h3>
                  </div>
                  <p className="text-sm tabular md:pt-5">{money(p.price)}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
