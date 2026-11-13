"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowUpRight, Crown } from "lucide-react";
import { BRANCHES, LINKS, NEWS_TYPES, img, wa, type NewsItem, type NewsType } from "@/lib/data";
import { formatDay } from "@/lib/booking";
import { useLiveContent } from "@/lib/live-content";
import { SplitReveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

const EASE = [0.23, 1, 0.32, 1] as const;

const TYPE_LABEL: Record<NewsType, string> = {
  novedad: "Novedad",
  beneficio: "Beneficio",
  oportunidad: "Oportunidad",
  workshop: "Workshop",
};

function resolve(href: string) {
  if (href === "club") return { href: LINKS.club, external: true };
  if (href.startsWith("wa:")) {
    const [, branchId, ...msg] = href.split(":");
    const b = BRANCHES.find((x) => x.id === branchId) ?? BRANCHES[0];
    return { href: wa(b.whatsapp, msg.join(":")), external: true };
  }
  return { href, external: href.startsWith("mailto:") };
}

export function News({ news: initial }: { news: NewsItem[] }) {
  const news = useLiveContent("news", initial);
  const [filter, setFilter] = useState<NewsType | "todo">("todo");
  const items = news.filter((n) => filter === "todo" || n.type === filter);

  return (
    <section id="novedades" aria-labelledby="novedades-titulo" className="relative scroll-mt-20 py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-12 md:items-end">
          <div className="min-w-0 md:col-span-7">
            <p className="label-wide mb-5 text-stone">Novedades del Club</p>
            <h2 id="novedades-titulo" className="display text-[clamp(2.6rem,6vw,5.5rem)]">
              <SplitReveal text="Esta semana en UBEE." italic={[3]} />
            </h2>
          </div>
          <div
            role="group"
            aria-label="Filtrar novedades"
            className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:col-span-5 md:mx-0 md:flex-wrap md:justify-end md:px-0"
          >
            {NEWS_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={filter === t.id}
                onClick={() => setFilter(t.id)}
                className={cn(
                  "press h-11 shrink-0 rounded-full border px-5 text-sm",
                  filter === t.id
                    ? "border-bone bg-bone text-ink"
                    : "border-bone/15 text-bone/70 hover:border-bone/40 hover:text-bone",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <motion.ul layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((n, i) => {
              const link = resolve(n.cta.href);
              const featured = filter === "todo" && i === 0;
              return (
                <motion.li
                  key={n.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-3xl border border-bone/[0.08] bg-walnut",
                    featured && "sm:col-span-2 lg:row-span-2",
                  )}
                >
                  <div className={cn("relative overflow-hidden", featured ? "aspect-[16/11] lg:aspect-auto lg:flex-1" : "aspect-[16/10]")}>
                    <img
                      src={img(n.image, featured ? 1400 : 800)}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 size-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-walnut via-walnut/10 to-transparent" />
                    <div className="absolute left-4 top-4 flex gap-2">
                      <span className="label-wide rounded-full bg-ink/70 px-3 py-1.5 !text-[0.5rem] text-bone backdrop-blur-md">
                        {TYPE_LABEL[n.type]}
                      </span>
                      {n.members ? (
                        <span className="label-wide inline-flex items-center gap-1.5 rounded-full bg-ember px-3 py-1.5 !text-[0.5rem] text-ink">
                          <Crown className="size-3" strokeWidth={1.8} aria-hidden /> Club
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-col p-6 md:p-7">
                    <time dateTime={n.date} className="text-xs text-stone tabular">
                      {formatDay(n.date, { day: "numeric", month: "long" })}
                    </time>
                    <h3 className={cn("display mt-3 leading-[1.02]", featured ? "text-[clamp(2rem,3.4vw,3rem)]" : "text-[1.8rem]")}>
                      {n.title}
                    </h3>
                    <p className="mt-3 max-w-[48ch] text-[0.95rem] leading-relaxed text-bone/65">{n.text}</p>
                    {link.external ? (
                      <a
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel="noreferrer"
                        className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 text-sm text-filament-soft after:absolute after:inset-0"
                      >
                        {n.cta.label} <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 text-sm text-filament-soft after:absolute after:inset-0"
                      >
                        {n.cta.label} <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                      </Link>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}
