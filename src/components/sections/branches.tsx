import { Clock, MapPin, Navigation } from "lucide-react";
import { BRANCHES, img, wa } from "@/lib/data";
import { Cta } from "@/components/site/cta";
import { WhatsAppIcon } from "@/components/site/icons";
import { Reveal, SplitReveal } from "@/components/site/reveal";

export function Branches() {
  return (
    <section id="sucursales" aria-labelledby="sucursales-titulo" className="relative scroll-mt-20 py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="mb-14 grid gap-6 md:grid-cols-12 md:items-end">
          <p className="label-wide text-stone md:col-span-3">Sucursales</p>
          <h2 id="sucursales-titulo" className="display text-[clamp(2.6rem,6vw,5.5rem)] md:col-span-9">
            <SplitReveal text="Dos salones, la misma mano." italic={[4]} />
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {BRANCHES.map((b, i) => (
            <Reveal key={b.id} delay={i * 0.1} as="article">
              <div className="group grid h-full overflow-hidden rounded-3xl border border-bone/[0.08] bg-walnut sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
                <div className="relative min-h-[300px] overflow-hidden">
                  <img
                    src={img(b.image, 900)}
                    alt={`Salón UBEE ${b.name}`}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-out)] group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-walnut/40" />
                </div>
                <div className="flex flex-col p-7 md:p-9">
                  <p className="label-wide text-stone">{b.area}</p>
                  <h3 className="display mt-3 text-[clamp(2.2rem,3.6vw,3.2rem)] leading-none">{b.name}</h3>
                  <ul className="mt-8 grid gap-3 text-[0.95rem] text-bone/80">
                    <li className="flex gap-3">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-filament" strokeWidth={1.5} aria-hidden />
                      <span>
                        {b.address}
                        <span className="block text-stone">{b.city}</span>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <Clock className="mt-0.5 size-4 shrink-0 text-filament" strokeWidth={1.5} aria-hidden />
                      {b.hours.label}
                    </li>
                    <li className="flex gap-3">
                      <WhatsAppIcon className="mt-0.5 size-4 shrink-0 text-filament" />
                      <a
                        href={wa(b.whatsapp, "¡Hola UBEE! Quería hacer una consulta.")}
                        target="_blank"
                        rel="noreferrer"
                        className="tabular underline-offset-4 hover:underline"
                      >
                        {b.phoneLabel}
                      </a>
                    </li>
                  </ul>
                  <div className="mt-auto flex flex-wrap gap-2 pt-10">
                    <Cta href={`/reservar?sucursal=${b.id}`} className="!h-11 !px-5">
                      Reservar acá
                    </Cta>
                    <a
                      href={b.maps}
                      target="_blank"
                      rel="noreferrer"
                      className="press inline-flex h-11 items-center gap-2 rounded-full border border-bone/20 px-5 text-sm text-bone hover:border-filament/70"
                    >
                      <Navigation className="size-3.5" aria-hidden /> Cómo llegar
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
