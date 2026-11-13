"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import { CATEGORIES, img, minutes, money, type CategoryId, type Service } from "@/lib/data";
import { useLiveContent } from "@/lib/live-content";
import { Reveal, SplitReveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

const EASE = [0.23, 1, 0.32, 1] as const;

export function Services({ services: initial }: { services: Service[] }) {
  const services = useLiveContent("services", initial);
  const [active, setActive] = useState<CategoryId>("color");
  const [hover, setHover] = useState<CategoryId | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const list = services.filter((s) => s.category === active);

  const choose = (id: CategoryId) => {
    setActive(id);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="servicios" className="relative scroll-mt-20 py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12 md:items-end">
          <p className="label-wide text-stone md:col-span-3">Servicios</p>
          <h2 className="display text-[clamp(2.6rem,6vw,5.5rem)] md:col-span-9">
            <SplitReveal text="Elegí por dónde empezar." italic={[3]} />
          </h2>
        </div>
      </div>

      {/* Panels: the category opens wider as you approach it */}
      <div className="mx-auto max-w-[1600px] px-3 md:px-6">
        <div
          className="flex h-[132vh] flex-col gap-2 md:h-[min(78vh,760px)] md:flex-row"
          onMouseLeave={() => setHover(null)}
        >
          {CATEGORIES.map((c, i) => {
            const isHover = hover === c.id;
            const dim = hover !== null && !isHover;
            return (
              <motion.button
                key={c.id}
                type="button"
                onMouseEnter={() => setHover(c.id)}
                onFocus={() => setHover(c.id)}
                onClick={() => choose(c.id)}
                className="group relative min-h-0 flex-1 basis-0 overflow-hidden rounded-2xl text-left outline-offset-4 transition-[flex-grow] duration-700 ease-[var(--ease-out)] md:rounded-3xl"
                style={{ flexGrow: isHover ? 1.7 : 1 }}
                transition={{ duration: 0.9, delay: i * 0.08, ease: EASE }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                aria-label={`${c.name}: ${c.blurb}. Ver servicios`}
              >
                <motion.img
                  src={img(c.image, 1100)}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                  animate={{ scale: isHover ? 1.04 : 1.12 }}
                  transition={{ duration: 1.2, ease: EASE }}
                  loading="lazy"
                />
                <div
                  className={cn(
                    "absolute inset-0 bg-ink transition-opacity duration-700",
                    isHover ? "opacity-25" : dim ? "opacity-70" : "opacity-50",
                  )}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />

                <div className="relative flex h-full flex-col items-center justify-center p-6 text-center">
                  <span className="relative">
                    <span className="display block text-[clamp(2rem,2.5vw,2.9rem)] uppercase tracking-[0.02em] text-bone">
                      {c.name}
                    </span>
                    <span
                      className={cn(
                        "absolute -bottom-2 left-0 h-px w-full origin-left bg-filament shadow-[0_0_14px_1px_rgba(240,190,116,0.8)] transition-transform duration-500 ease-[var(--ease-out)]",
                        isHover ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </span>
                  <span
                    className={cn(
                      "mt-5 max-w-[22ch] text-sm text-bone/80 transition-all duration-500",
                      isHover ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 md:opacity-0",
                    )}
                  >
                    {c.blurb}
                  </span>
                </div>

                <span
                  className={cn(
                    "absolute bottom-6 left-1/2 grid size-14 -translate-x-1/2 place-items-center rounded-full border text-bone transition-all duration-500 ease-[var(--ease-out)] md:bottom-10 md:size-[4.5rem]",
                    isHover ? "border-bone/40 bg-bone/10 backdrop-blur-md" : "border-transparent",
                  )}
                  aria-hidden
                >
                  <ArrowRight className="size-6" strokeWidth={1.1} />
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* The menu */}
      <div ref={listRef} className="mx-auto mt-20 max-w-[1440px] scroll-mt-24 px-5 md:mt-28 md:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="min-w-0 md:col-span-3">
            <div className="md:sticky md:top-28">
              <p className="label-wide mb-5 text-stone">Carta de servicios</p>
              <div role="tablist" aria-label="Categorías" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-col md:items-start md:px-0">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    role="tab"
                    aria-selected={active === c.id}
                    onClick={() => setActive(c.id)}
                    className={cn(
                      "press relative h-11 shrink-0 rounded-full border px-5 text-sm transition-colors",
                      active === c.id
                        ? "border-filament/60 bg-filament/10 text-filament-soft"
                        : "border-bone/15 text-bone/70 hover:border-bone/40 hover:text-bone",
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              <p className="mt-8 hidden max-w-[28ch] text-sm leading-relaxed text-stone md:block">
                Los valores son de referencia. Cada color empieza con un diagnóstico y te confirmamos el precio final en el
                salón.
              </p>
            </div>
          </div>

          <div className="min-w-0 md:col-span-9" role="tabpanel" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.ul
                key={active}
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(4px)", transition: { duration: 0.18 } }}
                transition={{ duration: 0.45, ease: EASE }}
                className="border-t border-bone/10"
              >
                {list.map((s) => (
                  <li key={s.id} className="group relative border-b border-bone/10">
                    <span className="absolute inset-0 origin-left scale-x-0 bg-bone/[0.03] transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-x-100" />
                    <div className="relative grid gap-3 py-7 md:grid-cols-[1fr_auto] md:items-center md:gap-10 md:px-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="display text-[clamp(1.6rem,2.6vw,2.4rem)] leading-none">{s.name}</h3>
                          {s.signature ? (
                            <span className="label-wide rounded-full border border-filament/40 px-2.5 py-1 !text-[0.5rem] text-filament">
                              Firma UBEE
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-3 max-w-[60ch] text-[0.95rem] leading-relaxed text-bone/65">{s.description}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:justify-end">
                        <span className="flex items-center gap-1.5 text-sm text-stone tabular">
                          <Clock className="size-3.5" strokeWidth={1.5} aria-hidden /> {minutes(s.duration)}
                        </span>
                        <span className="text-sm tabular text-bone">
                          <span className="text-stone">desde </span>
                          {money(s.price)}
                        </span>
                        <Link
                          href={`/reservar?servicio=${s.id}`}
                          className="press inline-flex h-11 items-center gap-2 rounded-full border border-bone/20 px-4 text-sm text-bone hover:border-filament hover:bg-filament hover:text-ink"
                          aria-label={`Reservar ${s.name}`}
                        >
                          Reservar <ArrowUpRight className="size-3.5" aria-hidden />
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
            <Reveal className="mt-8 md:hidden">
              <p className="text-sm leading-relaxed text-stone">
                Los valores son de referencia. Cada color empieza con un diagnóstico y te confirmamos el precio final en el
                salón.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
