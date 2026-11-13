"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Filament } from "@/components/brand/filament";
import { Cta } from "@/components/site/cta";
import { SplitReveal } from "@/components/site/reveal";
import { formatDay, nextAvailable, openDays, toISODate } from "@/lib/booking";
import { fetchBusy } from "@/lib/bookings-api";
import { img } from "@/lib/data";

const EASE = [0.23, 1, 0.32, 1] as const;

/* The next free slot depends on the visitor's clock and on live bookings,
 * so it is resolved on the client after the page is shown. */
function labelFor(n: { date: string; time: string }, now: Date) {
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const day =
    n.date === toISODate(now)
      ? "hoy"
      : n.date === toISODate(tomorrow)
        ? "mañana"
        : formatDay(n.date, { weekday: "long", day: "numeric" });
  return `${day}, ${n.time} h`;
}

function useNextSlot() {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    const now = new Date();
    const dates = openDays("cordoba", 7, now);
    fetchBusy("cordoba", dates)
      .then((busy) => {
        const n = nextAvailable("cordoba", busy, 60, now);
        if (alive) setLabel(n ? labelFor(n, now) : "consultanos por WhatsApp");
      })
      .catch(() => alive && setLabel("consultanos por WhatsApp"));
    return () => {
      alive = false;
    };
  }, []);
  return label;
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const archY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-14%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.12]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const slot = useNextSlot();

  return (
    <section
      ref={ref}
      className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-24"
      aria-label="UBEE Modern Hair Studio"
    >
      {/* warm room light */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 78% 38%, rgba(240,190,116,0.13), transparent 70%), radial-gradient(55% 60% at 8% 100%, rgba(21,32,45,0.75), transparent 70%), radial-gradient(40% 45% at 100% 0%, rgba(21,32,45,0.5), transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-[1440px] flex-1 grid-cols-1 items-end gap-10 px-5 pb-10 md:px-10 lg:grid-cols-12 lg:pb-14">
        {/* arch — the backlit oval mirrors of the salon */}
        <motion.div
          style={{ y: archY }}
          className="relative order-1 mx-auto w-[min(72vw,340px)] lg:order-2 lg:col-span-4 lg:col-start-9 lg:mb-6 lg:w-full lg:max-w-[420px] lg:justify-self-end"
        >
          <motion.div
            className="arch glow-filament relative aspect-[3/4.2] overflow-hidden bg-umber"
            initial={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0 0 0 round 999px 999px 20px 20px)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0 0 0 round 999px 999px 20px 20px)" }}
            transition={{ duration: 1.5, delay: 0.25, ease: [0.77, 0, 0.175, 1] }}
          >
            <motion.img
              src={img("1524504388940-b1c1722653e1", 900)}
              alt="Clienta con balayage castaño iluminado y ondas suaves"
              className="absolute inset-0 size-full object-cover"
              style={{ scale: imgScale }}
              initial={reduce ? undefined : { scale: 1.25 }}
              animate={reduce ? undefined : { scale: 1 }}
              transition={{ duration: 2.2, delay: 0.25, ease: EASE }}
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
          </motion.div>
          <motion.p
            className="label-wide absolute -left-3 bottom-8 hidden origin-bottom-left -rotate-90 text-stone lg:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            Color de autor
          </motion.p>
        </motion.div>

        <motion.div style={{ y: textY, opacity: fade }} className="relative z-10 order-2 lg:order-1 lg:col-span-8">
          <motion.p
            className="label-wide mb-6 text-stone md:mb-8"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          >
            Modern hair studio <span className="mx-2 text-filament">·</span> Córdoba — Villa Carlos Paz
          </motion.p>
          <h1 className="display text-[clamp(3.2rem,8.2vw,8.75rem)] text-bone">
            <span className="block">
              <SplitReveal text="Color de autor," immediate delay={0.35} />
            </span>
            <span className="block pl-[0.6em] text-filament-soft">
              <SplitReveal text="con luz propia." immediate delay={0.55} italic={[0, 1, 2]} />
            </span>
          </h1>

          <motion.div
            className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.1, ease: EASE }}
          >
            <p className="max-w-[36ch] text-[0.95rem] leading-relaxed text-bone/70">
              Rubios, balayage y cortes pensados para vos, por un equipo que se capacita todo el tiempo. Elegí servicio,
              profesional y horario, y reservá en un minuto.
            </p>
            <div className="flex flex-wrap gap-3">
              <Cta href="/reservar">Reservar turno</Cta>
              <Cta href="/#servicios" variant="line" arrow={false}>
                Ver servicios
              </Cta>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* the filament runs edge to edge, behind everything */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[44%] -z-[1] lg:top-[40%]">
        <Filament className="h-28 md:h-40" delay={0.9} duration={2.8} thickness={1.8} />
      </div>

      <motion.div
        className="relative mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 border-t border-bone/[0.08] px-5 py-5 md:px-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
      >
        <Link
          href="/reservar?sucursal=cordoba"
          className="group flex min-h-11 items-center gap-3 text-sm text-bone/80 transition-colors hover:text-bone"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-filament opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-filament" />
          </span>
          <span>
            Próximo turno libre en Córdoba:{" "}
            <span className="tabular text-bone">{slot ?? "consultando agenda…"}</span>
          </span>
        </Link>
        <span className="label-wide hidden text-stone-dark md:block">Scroll</span>
      </motion.div>
    </section>
  );
}
