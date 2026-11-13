"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Filament } from "@/components/brand/filament";
import { BRANCHES, LINKS, wa } from "@/lib/data";
import { Cta } from "./cta";
import { SplitReveal } from "./reveal";
import { InstagramIcon, WhatsAppIcon } from "./icons";
import { NAV } from "./header";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/panel")) return null;
  const isBooking = pathname?.startsWith("/reservar");

  return (
    <footer className="relative overflow-hidden border-t border-bone/[0.07] bg-ink">
      {!isBooking ? (
        <div className="mx-auto max-w-[1440px] px-5 pb-20 pt-28 md:px-10 md:pt-40">
          <p className="label-wide mb-8 text-stone">Reservá online, en menos de un minuto</p>
          <h2 className="display max-w-[14ch] text-[clamp(3rem,9vw,8.5rem)] text-bone">
            <SplitReveal text="Tu próximo color empieza acá." italic={[3, 4]} />
          </h2>
          <Filament mode="scroll" className="mt-6 h-16 md:h-24" variant="soft" thickness={1.4} />
          <div className="mt-10 flex flex-wrap gap-3">
            <Cta href="/reservar">Reservar turno</Cta>
            <Cta href={LINKS.club} variant="line" external>
              Sumarme al Club
            </Cta>
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-[1440px] gap-12 border-t border-bone/[0.07] px-5 py-14 md:grid-cols-12 md:px-10">
        <div className="md:col-span-4">
          <Logo tagline className="w-44 text-bone" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-stone">
            Color de autor, cortes a medida y un equipo que se capacita todo el tiempo. En Córdoba y Villa Carlos Paz.
          </p>
          <div className="mt-6 flex gap-2">
            <a
              href={LINKS.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram de UBEE"
              className="press grid size-11 place-items-center rounded-full border border-bone/15 text-bone/80 hover:border-filament hover:text-filament"
            >
              <InstagramIcon className="size-[18px]" />
            </a>
            <a
              href={LINKS.club}
              target="_blank"
              rel="noreferrer"
              aria-label="Canal de WhatsApp del Club UBEE"
              className="press grid size-11 place-items-center rounded-full border border-bone/15 text-bone/80 hover:border-filament hover:text-filament"
            >
              <WhatsAppIcon className="size-[18px]" />
            </a>
          </div>
        </div>

        <nav aria-label="Pie de página" className="md:col-span-2">
          <p className="label-wide mb-4 text-stone-dark">Sitio</p>
          <ul className="grid gap-2 text-sm">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-bone/80 transition-colors hover:text-filament-soft">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/reservar" className="text-bone/80 transition-colors hover:text-filament-soft">
                Reservar turno
              </Link>
            </li>
          </ul>
        </nav>

        {BRANCHES.map((b) => (
          <div key={b.id} className="md:col-span-3">
            <p className="label-wide mb-4 text-stone-dark">{b.name}</p>
            <address className="grid gap-1 text-sm not-italic text-bone/80">
              <span>{b.address}</span>
              <span className="text-stone">{b.hours.label}</span>
              <a
                href={wa(b.whatsapp, "¡Hola UBEE! Quería hacer una consulta.")}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 tabular transition-colors hover:text-filament-soft"
              >
                <WhatsAppIcon className="size-4 text-filament" /> {b.phoneLabel}
              </a>
              <a href={`mailto:${b.email}`} className="transition-colors hover:text-filament-soft">
                {b.email}
              </a>
            </address>
          </div>
        ))}
      </div>

      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 border-t border-bone/[0.07] px-5 py-6 text-xs text-stone-dark md:px-10">
        <p>© 2026 UBEE Peluquería. Todos los derechos reservados.</p>
        <div className="flex gap-5">
          <a href="mailto:ubee.cba@gmail.com?subject=CV%20-%20Quiero%20trabajar%20en%20UBEE" className="hover:text-bone">
            Trabajá en UBEE
          </a>
          <Link href="/panel" className="hover:text-bone">
            Acceso salón
          </Link>
          <span>Diseño y desarrollo · FluxWeb</span>
        </div>
      </div>
    </footer>
  );
}
