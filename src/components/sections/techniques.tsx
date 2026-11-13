"use client";

import Link from "next/link";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { TECHNIQUES, img } from "@/lib/data";
import { SplitReveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

const EASE = [0.77, 0, 0.175, 1] as const;

export function Techniques() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const t = TECHNIQUES[active];

  return (
    <section aria-labelledby="tecnicas-titulo" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="mb-16 grid gap-6 md:grid-cols-12 md:items-end">
          <p className="label-wide text-stone md:col-span-3">Técnicas firma</p>
          <h2 id="tecnicas-titulo" className="display text-[clamp(2.6rem,6vw,5.5rem)] md:col-span-9">
            <SplitReveal text="Lo que nos piden por nombre." italic={[4]} />
          </h2>
        </div>

        <div className="grid gap-12 md:grid-cols-12">
          {/* sticky mirror */}
          <div className="hidden md:col-span-5 md:block">
            <div className="sticky top-24 flex h-[calc(100vh-8rem)] items-center">
              <div className="arch glow-filament relative aspect-[3/4.2] w-full max-w-[440px] overflow-hidden bg-umber">
                <AnimatePresence initial={false}>
                  <motion.img
                    key={t.id}
                    src={img(t.image, 1000)}
                    alt={`Resultado de ${t.name}`}
                    className="absolute inset-0 size-full object-cover"
                    initial={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0 0 0)", scale: 1.15 }}
                    animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0 0 0)", scale: 1 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 1 }}
                    transition={{ duration: 1.1, ease: EASE }}
                  />
                </AnimatePresence>
                <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between bg-gradient-to-t from-ink/80 to-transparent p-6 pt-16">
                  <span className="label-wide text-bone/80">{t.kicker}</span>
                  <span className="flex gap-1.5" aria-hidden>
                    {TECHNIQUES.map((x, i) => (
                      <span
                        key={x.id}
                        className={cn(
                          "h-1 rounded-full transition-all duration-500",
                          i === active ? "w-6 bg-filament" : "w-1 bg-bone/40",
                        )}
                      />
                    ))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <ol className="md:col-span-7">
            {TECHNIQUES.map((x, i) => (
              <TechniqueItem key={x.id} index={i} onActive={setActive} active={active === i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function TechniqueItem({
  index,
  onActive,
  active,
}: {
  index: number;
  onActive: (i: number) => void;
  active: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  const t = TECHNIQUES[index];
  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  return (
    <li ref={ref} className="flex min-h-[auto] flex-col justify-center border-t border-bone/10 py-12 md:min-h-[72vh] md:py-0">
      <div className="arch mb-8 aspect-[4/5] w-2/3 max-w-[280px] overflow-hidden md:hidden">
        <img src={img(t.image, 700)} alt={`Resultado de ${t.name}`} className="size-full object-cover" loading="lazy" />
      </div>
      <p className={cn("label-wide mb-5 transition-colors duration-500", active ? "text-filament" : "text-stone")}>
        {t.kicker}
      </p>
      <h3
        className={cn(
          "display text-[clamp(2.8rem,6.4vw,6rem)] transition-colors duration-700",
          active ? "text-bone" : "text-bone/30 md:text-bone/25",
        )}
      >
        {t.name}
      </h3>
      <p
        className={cn(
          "mt-6 max-w-[52ch] text-[1.02rem] leading-relaxed transition-colors duration-700",
          active ? "text-bone/75" : "text-bone/40",
        )}
      >
        {t.text}
      </p>
      <Link
        href={`/reservar?servicio=${t.id}`}
        className="group mt-8 inline-flex min-h-11 w-fit items-center gap-3 text-sm text-bone"
      >
        <span className="border-b border-bone/30 pb-1 transition-colors group-hover:border-filament group-hover:text-filament-soft">
          Reservar {t.name}
        </span>
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
      </Link>
    </li>
  );
}
