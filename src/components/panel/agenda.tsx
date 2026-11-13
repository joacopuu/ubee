"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, CalendarDays, ChevronLeft, ChevronRight, Globe, Phone, Wallet, Users } from "lucide-react";
import { WhatsAppIcon } from "@/components/site/icons";
import { BRANCHES, STAFF, branchById, minutes, money, wa, type BranchId, type Service } from "@/lib/data";
import {
  formatDay,
  fromISODate,
  toHHMM,
  toISODate,
  toMin,
  type Booking,
  type BookingStatus,
} from "@/lib/booking";
import { listBookings, onBookingsChange, setBookingStatus, upcomingBookings } from "@/lib/bookings-api";
import { hasDb } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const PX_PER_MIN = 1.6;

const STATUS: { id: BookingStatus; label: string; dot: string }[] = [
  { id: "confirmado", label: "Confirmado", dot: "bg-bone/70" },
  { id: "en-salon", label: "En el salón", dot: "bg-filament" },
  { id: "completado", label: "Completado", dot: "bg-emerald-400" },
  { id: "cancelado", label: "Cancelado", dot: "bg-destructive" },
];

type Loaded = { view: string; list: Booking[]; upcoming: Booking[]; error?: string };

export function AgendaBoard({ services }: { services: Service[] }) {
  const [branchId, setBranchId] = useState<BranchId>("cordoba");
  const [now, setNow] = useState<Date>(() => new Date());
  const [date, setDate] = useState<string | null>(() => toISODate(now));
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [overrides, setOverrides] = useState<Record<string, BookingStatus>>({});
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const svcName = useCallback((id: string) => services.find((s) => s.id === id)?.name ?? id, [services]);

  // Refresh when a booking is created or changed (Supabase realtime, or this browser in demo mode).
  useEffect(() => {
    const off = onBookingsChange(() => setTick((t) => t + 1));
    const id = window.setInterval(() => setNow(new Date()), 60000);
    return () => {
      off();
      clearInterval(id);
    };
  }, []);

  const view = `${branchId}|${date}`;
  useEffect(() => {
    if (!date) return;
    let alive = true;
    Promise.all([listBookings(branchId, date), upcomingBookings(branchId, toISODate(new Date()))])
      .then(([list, upcoming]) => alive && setLoaded({ view, list, upcoming }))
      .catch((e: Error) => alive && setLoaded({ view, list: [], upcoming: [], error: e.message }));
    return () => {
      alive = false;
    };
  }, [branchId, date, view, tick]);
  // While refreshing the same day, keep showing what we had (no flicker).
  const current = loaded?.view === view ? loaded : null;

  const branch = branchById(branchId)!;
  const team = useMemo(() => STAFF.filter((s) => s.branches.includes(branchId)), [branchId]);

  const day = useMemo(
    () =>
      team.map((s) => ({
        staff: s,
        list: (current?.list ?? [])
          .filter((b) => b.staffId === s.id)
          .map((b) => ({ ...b, status: overrides[b.id] ?? b.status })),
      })),
    [team, current, overrides],
  );

  const all = day.flatMap((d) => d.list);
  const active = all.filter((b) => b.status !== "cancelado");
  const open = branch.hours.open * 60;
  const close = branch.hours.close * 60;
  const capacity = (close - open) * team.length;
  const busy = active.reduce((a, b) => a + b.duration, 0);
  const webCount = all.filter((b) => b.source === "web").length;
  const upcomingWeb = current?.upcoming ?? [];

  const shift = (n: number) => {
    if (!date) return;
    const d = fromISODate(date);
    d.setDate(d.getDate() + n);
    setDate(toISODate(d));
    setSelected(null);
  };

  const setStatus = useCallback(async (b: Booking, s: BookingStatus) => {
    const before = b.status;
    setActionError(null);
    setOverrides((o) => ({ ...o, [b.id]: s }));
    setSelected((cur) => (cur && cur.id === b.id ? { ...cur, status: s } : cur));
    try {
      await setBookingStatus(b, s);
    } catch {
      setOverrides((o) => ({ ...o, [b.id]: before }));
      setSelected((cur) => (cur && cur.id === b.id ? { ...cur, status: before } : cur));
      setActionError("No se pudo cambiar el estado. Revisá la conexión e intentá de nuevo.");
    }
  }, []);

  const closed = date ? !branch.hours.days.includes(fromISODate(date).getDay()) : false;
  const nowMin = date === toISODate(now) ? now.getHours() * 60 + now.getMinutes() : null;

  return (
    <div>
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8 md:py-8">
        {!hasDb ? (
          <p className="mb-6 rounded-2xl border border-filament/25 bg-filament/[0.06] px-4 py-3 text-sm text-bone/80">
            <span className="text-filament-soft">Modo demo.</span> La agenda de ejemplo se genera sola y los turnos que
            reserves en la web aparecen acá al instante, marcados como <span className="text-filament-soft">Web</span>.
            Con la base de datos conectada, todo el equipo ve la misma agenda en tiempo real.
          </p>
        ) : null}
        {current?.error || actionError ? (
          <p role="alert" className="mb-6 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
            {actionError ?? `No pudimos cargar la agenda: ${current?.error}`}
          </p>
        ) : null}

        <div className="mb-4 flex rounded-full border border-bone/15 p-1 sm:w-fit">
          {BRANCHES.map((b) => (
            <button
              key={b.id}
              type="button"
              aria-pressed={branchId === b.id}
              onClick={() => {
                setBranchId(b.id);
                setSelected(null);
              }}
              className={cn(
                "press h-9 flex-1 rounded-full px-4 text-sm sm:flex-none",
                branchId === b.id ? "bg-bone text-ink" : "text-bone/70 hover:text-bone",
              )}
            >
              {b.name}
            </button>
          ))}
        </div>

        {/* date + kpis */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label-wide mb-2 text-stone">{branch.name}</p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => shift(-1)}
                className="press grid size-11 place-items-center rounded-full border border-bone/15 hover:border-bone/40"
                aria-label="Día anterior"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <h1 className="display text-center text-[clamp(1.4rem,3vw,2.4rem)] leading-none first-letter:uppercase sm:min-w-[12ch]">
                {date ? formatDay(date, { weekday: "long", day: "numeric", month: "long" }) : "…"}
              </h1>
              <button
                type="button"
                onClick={() => shift(1)}
                className="press grid size-11 place-items-center rounded-full border border-bone/15 hover:border-bone/40"
                aria-label="Día siguiente"
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => {
                  setDate(toISODate(new Date()));
                  setSelected(null);
                }}
                className="press ml-1 h-11 rounded-full border border-bone/15 px-4 text-sm hover:border-bone/40"
              >
                Hoy
              </button>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { icon: CalendarDays, label: "Turnos", value: closed ? "—" : String(active.length) },
              { icon: Users, label: "Ocupación", value: closed ? "—" : `${Math.round((busy / capacity) * 100)}%` },
              { icon: Wallet, label: "Estimado", value: closed ? "—" : money(active.reduce((a, b) => a + b.total, 0)) },
              { icon: Globe, label: "Desde la web", value: closed ? "—" : String(webCount) },
            ].map((k) => (
              <div key={k.label} className="min-w-0 rounded-2xl border border-bone/10 bg-walnut px-4 py-3 sm:min-w-[8.5rem]">
                <dt className="flex items-center gap-2 text-xs text-stone">
                  <k.icon className="size-3.5" strokeWidth={1.5} aria-hidden /> {k.label}
                </dt>
                <dd className="mt-1 text-xl tabular">{k.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* timeline */}
          <div className="overflow-hidden rounded-3xl border border-bone/10 bg-walnut">
            {closed ? (
              <div className="grid h-80 place-items-center text-stone">La sucursal está cerrada este día.</div>
            ) : (
              <div className="overflow-x-auto" data-lenis-prevent>
                <div className="min-w-[640px]">
                  <div
                    className="sticky top-0 z-10 grid border-b border-bone/10 bg-walnut"
                    style={{ gridTemplateColumns: `64px repeat(${team.length}, minmax(0,1fr))` }}
                  >
                    <span />
                    {team.map((s) => (
                      <div key={s.id} className="flex items-center gap-3 border-l border-bone/10 px-4 py-3">
                        <span className="display grid size-9 place-items-center rounded-full bg-umber text-lg text-filament-soft">
                          {s.name[0]}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm">{s.name}</span>
                          <span className="block truncate text-xs text-stone">{s.role}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <div
                    className="relative grid"
                    style={{
                      gridTemplateColumns: `64px repeat(${team.length}, minmax(0,1fr))`,
                      height: (close - open) * PX_PER_MIN,
                    }}
                  >
                    {/* hours */}
                    <div className="relative">
                      {Array.from({ length: (close - open) / 60 + 1 }, (_, i) => (
                        <span
                          key={i}
                          className="absolute right-3 -translate-y-1/2 text-[0.7rem] text-stone tabular"
                          style={{ top: i * 60 * PX_PER_MIN }}
                        >
                          {toHHMM(open + i * 60)}
                        </span>
                      ))}
                    </div>
                    {day.map(({ staff, list }) => (
                      <div key={staff.id} className="relative border-l border-bone/10">
                        {Array.from({ length: (close - open) / 30 }, (_, i) => (
                          <span
                            key={i}
                            className={cn("absolute inset-x-0 border-t", i % 2 ? "border-bone/[0.03]" : "border-bone/[0.07]")}
                            style={{ top: i * 30 * PX_PER_MIN }}
                          />
                        ))}
                        {list.map((b) => {
                          const top = (toMin(b.time) - open) * PX_PER_MIN;
                          const h = b.duration * PX_PER_MIN;
                          const svc = b.serviceIds.map((id) => svcName(id)).join(" + ");
                          const st = STATUS.find((x) => x.id === b.status)!;
                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => setSelected(b)}
                              className={cn(
                                "press absolute inset-x-1.5 flex flex-col justify-start overflow-hidden rounded-xl border px-3 py-2 text-left transition-colors",
                                b.source === "web"
                                  ? "border-filament/70 bg-filament/[0.14] shadow-[0_0_20px_-6px_rgba(240,190,116,0.7)]"
                                  : "border-bone/10 bg-umber hover:border-bone/30",
                                b.status === "cancelado" && "opacity-40",
                                selected?.id === b.id && "ring-2 ring-filament",
                              )}
                              style={{ top: top + 2, height: h - 4 }}
                            >
                              <span className="flex items-center gap-1.5 text-[0.7rem] text-stone tabular">
                                <span className={cn("size-1.5 rounded-full", st.dot)} />
                                {b.time} · {minutes(b.duration)}
                                {b.source === "web" ? (
                                  <span className="label-wide ml-auto !text-[0.45rem] text-filament">Web</span>
                                ) : null}
                              </span>
                              <span className={cn("mt-0.5 block truncate text-sm", b.status === "cancelado" && "line-through")}>
                                {b.client.name}
                              </span>
                              {h > 56 ? <span className="block truncate text-xs text-bone/60">{svc}</span> : null}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                    {nowMin !== null && nowMin > open && nowMin < close ? (
                      <div
                        className="pointer-events-none absolute left-[64px] right-0 z-[5] h-px bg-filament shadow-[0_0_10px_1px_rgba(240,190,116,0.8)]"
                        style={{ top: (nowMin - open) * PX_PER_MIN }}
                      >
                        <span className="absolute -left-1 -top-1 size-2 rounded-full bg-filament" />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* side */}
          <div className="grid content-start gap-6">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  className="rounded-3xl border border-bone/10 bg-walnut p-6"
                >
                  <BookingDetail
                    booking={selected}
                    svcName={svcName}
                    onStatus={(s) => void setStatus(selected, s)}
                    onClose={() => setSelected(null)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-3xl border border-dashed border-bone/15 p-6 text-sm text-stone"
                >
                  Tocá un turno de la agenda para ver los datos de la clienta, cambiar el estado o mandarle un recordatorio.
                </motion.div>
              )}
            </AnimatePresence>

            <div className="rounded-3xl border border-bone/10 bg-walnut p-6">
              <p className="label-wide mb-4 flex items-center gap-2 text-stone">
                <Bell className="size-3.5" strokeWidth={1.5} aria-hidden /> Reservas web
              </p>
              {upcomingWeb.length ? (
                <ul className="grid gap-1">
                  {upcomingWeb.map((b) => (
                    <li key={b.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setDate(b.date);
                          setSelected(b);
                        }}
                        className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-bone/[0.04]"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm">{b.client.name}</span>
                          <span className="block truncate text-xs text-stone">
                            {b.serviceIds.map((id) => svcName(id)).join(" + ")}
                          </span>
                        </span>
                        <span className="shrink-0 text-right text-xs text-bone/70 tabular">
                          {formatDay(b.date, { day: "numeric", month: "short" })}
                          <span className="block">{b.time}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-stone">
                  Todavía no hay reservas desde la web.{" "}
                  <Link href="/reservar" className="text-bone underline underline-offset-4">
                    Probá hacer una
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingDetail({
  booking,
  svcName,
  onStatus,
  onClose,
}: {
  booking: Booking;
  svcName: (id: string) => string;
  onStatus: (s: BookingStatus) => void;
  onClose: () => void;
}) {
  const staff = STAFF.find((s) => s.id === booking.staffId);
  const branch = branchById(booking.branchId)!;
  const services = booking.serviceIds.map((id) => svcName(id)).join(" + ");
  const reminder = [
    `¡Hola ${booking.client.name.split(" ")[0]}! Te escribimos de UBEE ${branch.name}.`,
    `Te recordamos tu turno de ${services} el ${formatDay(booking.date)} a las ${booking.time} h${staff ? ` con ${staff.name}` : ""}.`,
    `Si necesitás reprogramar, respondé este mensaje. ¡Te esperamos!`,
  ].join("\n");

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-stone tabular">
            {booking.code}
            {booking.source === "web" ? <span className="ml-2 text-filament">· Reserva web</span> : null}
          </p>
          <h2 className="display mt-1 text-[1.9rem] leading-none">{booking.client.name}</h2>
        </div>
        <button type="button" onClick={onClose} className="text-sm text-stone hover:text-bone">
          Cerrar
        </button>
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="col-span-2">
          <dt className="text-xs text-stone">Servicio</dt>
          <dd className="mt-0.5">{services}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone">Horario</dt>
          <dd className="mt-0.5 tabular">
            {booking.time} – {toHHMM(toMin(booking.time) + booking.duration)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-stone">Profesional</dt>
          <dd className="mt-0.5">{staff?.name}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone">Valor</dt>
          <dd className="mt-0.5 tabular">{money(booking.total)}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone">Club</dt>
          <dd className="mt-0.5">{booking.club ? "Miembro" : "No"}</dd>
        </div>
        {booking.client.notes ? (
          <div className="col-span-2">
            <dt className="text-xs text-stone">Notas</dt>
            <dd className="mt-0.5 text-bone/80">{booking.client.notes}</dd>
          </div>
        ) : null}
      </dl>

      <p className="mb-2 mt-6 text-xs text-stone">Estado</p>
      <div className="grid grid-cols-2 gap-2">
        {STATUS.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={booking.status === s.id}
            onClick={() => onStatus(s.id)}
            className={cn(
              "press flex h-11 items-center gap-2 rounded-xl border px-3 text-sm",
              booking.status === s.id ? "border-filament/70 bg-filament/10 text-bone" : "border-bone/10 text-bone/70 hover:border-bone/30",
            )}
          >
            <span className={cn("size-2 rounded-full", s.dot)} /> {s.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-2">
        <a
          href={wa(booking.client.phone, reminder)}
          target="_blank"
          rel="noreferrer"
          className="press flex h-12 items-center justify-center gap-2 rounded-xl bg-bone text-sm text-ink hover:bg-filament-soft"
        >
          <WhatsAppIcon className="size-4" /> Enviar recordatorio
        </a>
        <a
          href={`tel:+${booking.client.phone}`}
          className="press flex h-12 items-center justify-center gap-2 rounded-xl border border-bone/15 text-sm hover:border-bone/40"
        >
          <Phone className="size-4" aria-hidden /> Llamar
        </a>
      </div>
    </div>
  );
}
