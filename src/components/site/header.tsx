"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { MenuOverlay } from "./menu-overlay";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/#servicios", label: "Servicios" },
  { href: "/#trabajos", label: "Trabajos" },
  { href: "/#club", label: "Club" },
  { href: "/tienda", label: "Tienda" },
  { href: "/#sucursales", label: "Sucursales" },
];

export function Header() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > 40);
    setHidden(y > 480 && y > prev + 2 && !open);
    if (y < prev - 2) setHidden(false);
  });

  // close the menu when the route changes (adjusting state during render,
  // instead of an effect, avoids a wasted render with the menu still open)
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  if (pathname?.startsWith("/panel")) return null;

  return (
    <>
      <a
        href="#contenido"
        className="label-wide fixed left-4 top-3 z-[100] -translate-y-20 rounded-full bg-bone px-4 py-3 text-ink focus:translate-y-0"
      >
        Saltar al contenido
      </a>
      <motion.header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
          solid && !open ? "border-b border-bone/[0.07] bg-ink/70 backdrop-blur-xl" : "border-b border-transparent",
        )}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="mx-auto flex h-[4.5rem] max-w-[1440px] items-center justify-between gap-6 px-5 md:px-10">
          <Link href="/" className="press relative z-10 -m-2 p-2 text-bone" aria-label="UBEE, ir al inicio">
            <Logo className="w-[92px] md:w-[104px]" />
          </Link>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group relative block px-4 py-3 text-[0.8125rem] tracking-wide text-bone/75 transition-colors duration-200 hover:text-bone"
                  >
                    {item.label}
                    <span className="absolute inset-x-4 bottom-2 h-px origin-left scale-x-0 bg-filament transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-x-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="relative z-10 flex items-center gap-2">
            <Link
              href="/reservar"
              className="press label-wide hidden h-11 items-center rounded-full bg-bone px-5 !text-[0.58rem] text-ink hover:bg-filament-soft sm:inline-flex"
            >
              Reservar turno
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-principal"
              className="press group flex h-11 items-center gap-3 rounded-full border border-bone/20 pl-4 pr-3 text-bone hover:border-bone/50"
            >
              <span className="text-[0.8125rem] tracking-wide">{open ? "Cerrar" : "Menú"}</span>
              <span className="relative block h-3 w-5" aria-hidden>
                <span
                  className={cn(
                    "absolute left-0 top-[3px] h-px w-5 bg-current transition-transform duration-300 ease-[var(--ease-out)]",
                    open && "top-1.5 rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-[9px] h-px w-5 bg-current transition-transform duration-300 ease-[var(--ease-out)]",
                    open && "top-1.5 -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>{open ? <MenuOverlay onClose={() => setOpen(false)} /> : null}</AnimatePresence>
    </>
  );
}
