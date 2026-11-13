"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarHeart, Gift, Megaphone, Sparkles } from "lucide-react";
import GlyphPortal from "@/components/ui/glyph-portal";
import { Cta } from "@/components/site/cta";
import { LINKS, img } from "@/lib/data";

/**
 * The club is "inside" the brand: scrolling flies the camera into the
 * B of UBEE and the benefits open up on the other side. The word is set
 * in Syncopate, the wide face of the logo's tagline, so the letters are
 * broad enough to look through.
 */

const PERKS = [
  {
    icon: Gift,
    title: "Beneficios exclusivos",
    text: "Descuentos y regalos que solo ve la comunidad del Club.",
  },
  {
    icon: Sparkles,
    title: "Oportunidades de la semana",
    text: "Turnos liberados y precios especiales, publicados primero en el canal.",
  },
  {
    icon: Megaphone,
    title: "Lanzamientos y novedades",
    text: "Técnicas nuevas, productos y todo lo que llega al salón.",
  },
  {
    icon: CalendarHeart,
    title: "Experiencias especiales",
    text: "Workshops, eventos y encuentros para la comunidad UBEE.",
  },
];

function usePortalFace() {
  const probe = useRef<HTMLSpanElement>(null);
  const [face, setFace] = useState<string | null>(null);
  useEffect(() => {
    const el = probe.current;
    if (!el) return;
    const family = getComputedStyle(el).fontFamily;
    let done = false;
    const finish = (v: string) => {
      if (!done) {
        done = true;
        setFace(v);
      }
    };
    const timeout = window.setTimeout(() => finish("Arial Black, Arial, sans-serif"), 2000);
    document.fonts
      .load(`700 100px ${family}`, "UBEE")
      .then(() => finish(family))
      .catch(() => finish("Arial Black, Arial, sans-serif"));
    return () => {
      done = true;
      clearTimeout(timeout);
    };
  }, []);
  return { probe, face };
}

export function ClubPortal() {
  const { probe, face } = usePortalFace();

  return (
    <div id="club" className="relative scroll-mt-0" data-club>
      <span ref={probe} aria-hidden className="pointer-events-none absolute font-wide font-bold opacity-0">
        UBEE
      </span>
      <style>{`
        [data-club] [data-gp-touch-picker]{display:none!important}
        [data-club] [data-gp-hint]{display:none}
        [data-club] [data-gp-caption]{inset:auto 20px 7%;justify-content:center}
        [data-club] [data-gp-enter]{min-height:48px;padding:0 22px;gap:14px;border-radius:999px;border:1px solid rgba(243,238,231,.22);color:var(--bone);font:700 9.5px/1 var(--ff-wide),sans-serif;letter-spacing:.3em;text-transform:uppercase;backdrop-filter:blur(8px);transition:border-color .2s ease,color .2s ease}
        [data-club] [data-gp-enter]:hover{border-color:var(--filament);color:var(--filament-soft)}
        [data-club] [data-gp-content]{padding:clamp(88px,10vh,140px) clamp(20px,5vw,80px);grid-template-columns:minmax(0,1fr)}
        [data-club] [data-gp-letter]:focus-visible{outline-color:var(--filament)}
      `}</style>

      {face ? (
        <GlyphPortal
          word="UBEE"
          focusChar="B"
          fontFamily={face}
          fontWeight={700}
          scrollLength={2.6}
          enterLabel="Entrar al Club"
          style={{
            "--gp-paper": "var(--ink)",
            "--gp-ink": "var(--bone)",
            "--gp-field": "#120d09",
            "--gp-foreground": "var(--bone)",
            fontFamily: "var(--ff-body), sans-serif",
          }}
          background={
            <div className="absolute inset-0" style={{ transform: "scale(var(--gp-field-scale,1))" }}>
              <img src={img("1620939391250-eb822ac0818a", 2000)} alt="" className="absolute inset-0 size-full object-cover" />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(70% 60% at 50% 45%, rgba(240,190,116,0.18), transparent 70%), linear-gradient(180deg, rgba(16,12,9,0.6), rgba(16,12,9,0.84)), linear-gradient(0deg, rgba(21,32,45,0.35), transparent 60%)",
                }}
              />
            </div>
          }
          front={
            <>
              <p
                className="label-wide absolute inset-x-5 text-center text-stone"
                style={{ bottom: "calc(100% - var(--gp-word-top, 35%) + 28px)" }}
              >
                Club de beneficios UBEE
              </p>
              <p
                className="absolute inset-x-5 text-center text-[0.95rem] text-bone/70"
                style={{ top: "calc(var(--gp-word-bottom, 60%) + 28px)" }}
              >
                Hay una comunidad del otro lado de la B.
              </p>
            </>
          }
        >
          <div className="mx-auto w-full max-w-[1280px]">
            <p className="label-wide mb-6 text-filament">Estás adentro</p>
            <h2 className="display max-w-[16ch] text-[clamp(2.6rem,6.4vw,6rem)] text-bone">
              El Club es donde <span className="italic text-filament-soft">pasan las cosas</span> primero.
            </h2>
            <p className="mt-6 max-w-[54ch] text-[1.02rem] leading-relaxed text-bone/75">
              Un canal de WhatsApp donde compartimos beneficios exclusivos, oportunidades de la semana, lanzamientos,
              novedades y experiencias especiales para nuestra comunidad. Sumarte es gratis.
            </p>
            <ul className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-bone/10 bg-bone/10 sm:grid-cols-2 lg:grid-cols-4">
              {PERKS.map((p) => (
                <li key={p.title} className="bg-ink/70 p-6 backdrop-blur-md md:p-8">
                  <p.icon className="size-6 text-filament" strokeWidth={1.3} aria-hidden />
                  <h3 className="display mt-6 text-2xl leading-tight">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-bone/65">{p.text}</p>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Cta href={LINKS.club} external>
                Unirme al canal de WhatsApp
              </Cta>
              <Cta href="#novedades" variant="line" arrow={false}>
                Ver novedades
              </Cta>
            </div>
          </div>
        </GlyphPortal>
      ) : (
        <div className="h-[100svh]" aria-hidden />
      )}
    </div>
  );
}
