"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect } from "react";
import { ArrowRight, Crown, Images, MapPin, Palette, ShoppingBag, Sparkles } from "lucide-react";
import { BRANCHES, LINKS, img, wa } from "@/lib/data";
import { InstagramIcon, WhatsAppIcon } from "./icons";

const ITEMS = [
  { href: "/", label: "Inicio", hint: "Modern hair studio", icon: Sparkles },
  { href: "/#servicios", label: "Servicios", hint: "Color, corte, peinados y tratamientos", icon: Palette },
  { href: "/#trabajos", label: "Trabajos", hint: "Lo último que salió del salón", icon: Images },
  { href: "/#club", label: "Club UBEE", hint: "Beneficios, novedades y oportunidades", icon: Crown },
  { href: "/tienda", label: "Tienda", hint: "Productos con pedido por WhatsApp", icon: ShoppingBag },
  { href: "/#sucursales", label: "Sucursales", hint: "Córdoba y Villa Carlos Paz", icon: MapPin },
];

const EASE = [0.32, 0.72, 0, 1] as const;

export function MenuOverlay({ onClose }: { onClose: () => void }) {
  const lenis = useLenis();

  useEffect(() => {
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lenis, onClose]);

  return (
    <motion.div
      id="menu-principal"
      role="dialog"
      aria-modal="true"
      aria-label="Menú"
      className="fixed inset-0 z-40 grid bg-ink lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      exit={{ opacity: 0, transition: { duration: 0.25, delay: 0.1 } }}
      data-lenis-prevent
    >
      {/* image side */}
      <motion.div
        className="relative hidden overflow-hidden lg:block"
        initial={{ clipPath: "inset(0 0 100% 0)" }}
        animate={{ clipPath: "inset(0 0 0% 0)", transition: { duration: 0.9, ease: EASE } }}
        exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.4, ease: EASE } }}
      >
        <motion.img
          src={img("1774660810725-fb04e002003d", 1400)}
          alt=""
          className="absolute inset-0 size-full object-cover"
          initial={{ scale: 1.15 }}
          animate={{ scale: 1, transition: { duration: 1.4, ease: EASE } }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/40" />
        <div className="absolute bottom-10 left-10 right-10 max-w-sm rounded-2xl border border-bone/15 bg-ink/40 p-5 backdrop-blur-xl">
          <p className="label-wide mb-4 text-bone/60">Escribinos</p>
          <div className="grid gap-2">
            {BRANCHES.map((b) => (
              <a
                key={b.id}
                href={wa(b.whatsapp, "¡Hola UBEE! Quería hacer una consulta.")}
                target="_blank"
                rel="noreferrer"
                className="press flex items-center justify-between rounded-xl border border-bone/10 px-4 py-3 text-sm text-bone hover:border-filament/60"
              >
                <span>{b.name}</span>
                <span className="flex items-center gap-2 text-bone/60 tabular">
                  {b.phoneLabel} <WhatsAppIcon className="size-4 text-filament" />
                </span>
              </a>
            ))}
          </div>
          <a
            href={LINKS.instagram}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-bone/70 transition-colors hover:text-bone"
          >
            <InstagramIcon className="size-4" /> @ubeepeluqueria
          </a>
        </div>
      </motion.div>

      {/* list side */}
      <div className="flex min-h-0 flex-col justify-center overflow-y-auto bg-walnut px-5 pb-10 pt-24 md:px-14">
        <nav aria-label="Menú principal">
          <ul className="grid gap-2">
            {ITEMS.map((item, i) => (
              <motion.li
                key={item.href}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0, transition: { duration: 0.7, delay: 0.15 + i * 0.05, ease: EASE } }}
                exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="press group flex items-center gap-5 rounded-2xl border border-transparent p-2 pr-5 transition-colors hover:border-bone/10 hover:bg-bone/[0.03]"
                >
                  <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-umber text-filament-soft transition-colors duration-300 group-hover:bg-filament group-hover:text-ink">
                    <item.icon className="size-5" strokeWidth={1.4} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="display block text-[1.7rem] leading-none text-bone md:text-[2.1rem]">
                      {item.label}
                    </span>
                    <span className="mt-1 block truncate text-sm text-stone">{item.hint}</span>
                  </span>
                  <ArrowRight
                    className="size-4 -translate-x-2 text-bone/40 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                    aria-hidden
                  />
                </Link>
              </motion.li>
            ))}
            <motion.li
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.7, delay: 0.5, ease: EASE } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="mt-3"
            >
              <Link
                href="/reservar"
                onClick={onClose}
                className="press group flex items-center gap-5 rounded-2xl bg-filament p-2 pr-6 text-ink hover:bg-filament-soft"
              >
                <span className="grid size-14 shrink-0 place-items-center rounded-xl border border-ink/15">
                  <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.4} />
                </span>
                <span className="label-wide min-w-0 !text-[0.6rem] sm:!text-[0.7rem]">Reservar turno online</span>
              </Link>
            </motion.li>
          </ul>
        </nav>

        <div className="mt-10 grid gap-2 lg:hidden">
          {BRANCHES.map((b) => (
            <a
              key={b.id}
              href={wa(b.whatsapp, "¡Hola UBEE! Quería hacer una consulta.")}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-xl border border-bone/10 px-4 py-3 text-sm"
            >
              <span>WhatsApp {b.name}</span>
              <WhatsAppIcon className="size-4 text-filament" />
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
