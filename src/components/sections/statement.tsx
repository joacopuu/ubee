import { ScrollWords } from "@/components/site/reveal";
import { Filament } from "@/components/brand/filament";

export function Statement() {
  return (
    <section aria-label="Nuestra forma de trabajar" className="relative py-28 md:py-44">
      <div className="mx-auto max-w-[1180px] px-5 md:px-10">
        <p className="label-wide mb-10 text-stone">El arte está en cada detalle</p>
        <ScrollWords
          className="display text-[clamp(2rem,4.6vw,4.4rem)] !leading-[1.08] text-bone"
          text="En UBEE disfrutamos profundamente lo que hacemos. Nos apasiona el *color, el *corte y todo el proceso creativo que hay detrás de cada trabajo. Le dedicamos a cada cabello el tiempo y el cuidado que merece."
        />
        <Filament mode="scroll" variant="soft" className="mt-14 h-14 md:h-20" thickness={1.3} />
      </div>
    </section>
  );
}
