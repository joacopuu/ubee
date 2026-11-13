"use client";

import { TiltedGridHero } from "@/components/ui/tilted-grid-hero";
import { InstagramIcon } from "@/components/site/icons";
import { SplitReveal, Reveal } from "@/components/site/reveal";
import { LINKS, WORKS, img } from "@/lib/data";

const IMAGES = WORKS.map((w) => ({ src: img(w.id, 900, 1100), alt: w.alt }));

export function Works() {
  return (
    <section id="trabajos" aria-labelledby="trabajos-titulo" className="relative scroll-mt-16">
      <TiltedGridHero
        images={IMAGES}
        aspectRatio={4 / 5}
        tileHeight={42}
        gap={5}
        axis={55}
        curve={72}
        fade={10}
        speed={3.4}
        className="h-[min(100svh,980px)] min-h-[620px] w-full bg-ink"
      >
        <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-between px-5 py-14 text-center md:py-16">
          <div>
            <p className="label-wide mb-4 text-stone">Trabajos recientes</p>
            <h2 id="trabajos-titulo" className="display text-[clamp(2.4rem,5.5vw,5rem)]">
              <SplitReveal text="Recién salidas del sillón." italic={[2]} />
            </h2>
          </div>
          <Reveal>
            <a
              href={LINKS.instagram}
              target="_blank"
              rel="noreferrer"
              className="press pointer-events-auto inline-flex h-12 items-center gap-3 rounded-full border border-bone/20 bg-ink/50 px-5 text-sm text-bone backdrop-blur-md hover:border-filament/70"
            >
              <InstagramIcon className="size-4" />
              Ver más en @ubeepeluqueria
              <span className="text-stone">· 269 mil</span>
            </a>
          </Reveal>
        </div>
      </TiltedGridHero>
      <ul className="sr-only">
        {WORKS.map((w) => (
          <li key={w.id}>{w.alt}</li>
        ))}
      </ul>
    </section>
  );
}
