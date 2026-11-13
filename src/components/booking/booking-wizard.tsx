"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarPlus,
  Check,
  Clock,
  Download,
  MapPin,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  BRANCHES,
  CATEGORIES,
  STAFF,
  branchById,
  img,
  minutes,
  money,
  wa,
  type BranchId,
  type CategoryId,
  type Service,
} from "@/lib/data";
import { useLiveContent } from "@/lib/live-content";
import { createBooking, fetchBusy } from "@/lib/bookings-api";
import {
  eligibleStaff,
  formatDay,
  googleCalendarUrl,
  icsFor,
  newCode,
  openDays,
  slotsFor,
  toISODate,
  toMin,
  type Booking,
  type Busy,
  type Slot,
} from "@/lib/booking";
import { Filament } from "@/components/brand/filament";
import { WhatsAppIcon } from "@/components/site/icons";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/use-hydrated";

const EASE = [0.23, 1, 0.32, 1] as const;

const STEPS = ["Sucursal", "Servicio", "Profesional", "Día y horario", "Tus datos"] as const;

type Client = { name: string; phone: string; email: string; notes: string };

/** The service catalogue (from the database, or the demo content). */
const Catalog = createContext<Service[]>([]);
function useServiceById() {
  const list = useContext(Catalog);
  return useCallback((id: string) => list.find((s) => s.id === id), [list]);
}

/** "0351 15 555-1234" / "351 555 1234" → "5493515551234" (formato que espera wa.me) */
function toWhatsApp(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("549")) return d;
  if (d.startsWith("54")) return `549${d.slice(2)}`;
  d = d.replace(/^0/, "");
  d = d.replace(/^(\d{2,4})15/, "$1");
  return `549${d}`;
}

export function BookingWizard({
  services: catalogInitial,
  initialService,
  initialBranch,
}: {
  services: Service[];
  initialService?: string;
  initialBranch?: string;
}) {
  const catalog = useLiveContent("services", catalogInitial);
  const serviceById = (id: string) => catalog.find((s) => s.id === id);
  const presetBranch = branchById(initialBranch ?? "")?.id ?? null;
  const presetService = serviceById(initialService ?? "")?.id;

  const [step, setStep] = useState(presetBranch ? (presetService ? 2 : 1) : 0);
  const [branchId, setBranchId] = useState<BranchId | null>(presetBranch);
  const [serviceIds, setServiceIds] = useState<string[]>(presetService ? [presetService] : []);
  const [pickedStaff, setStaffChoice] = useState<string>("any");
  const [date, setDate] = useState<string | null>(null);
  const [picked, setPicked] = useState<{ key: string; slot: Slot } | null>(null);
  const [client, setClient] = useState<Client>({ name: "", phone: "", email: "", notes: "" });
  const [club, setClub] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [conflict, setConflict] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const mounted = useHydrated();

  const services = serviceIds.map((id) => serviceById(id)!).filter(Boolean);
  const categories = [...new Set(services.map((s) => s.category))] as CategoryId[];
  const duration = services.reduce((a, s) => a + s.duration, 0);
  const total = services.reduce((a, s) => a + s.price, 0);
  const catKey = categories.join(",");
  const team = useMemo(
    () => (branchId ? eligibleStaff(branchId, catKey ? (catKey.split(",") as CategoryId[]) : []) : []),
    [branchId, catKey],
  );

  // Later choices are derived, so they can never go stale when an earlier
  // step changes: a professional who doesn't do the new service falls back
  // to "sin preferencia", and a time picked for another setup is dropped.
  const staffChoice = pickedStaff === "any" || team.some((s) => s.id === pickedStaff) ? pickedStaff : "any";
  const slotKey = `${branchId}|${staffChoice}|${duration}|${date}`;
  const slot = picked?.key === slotKey ? picked.slot : null;
  const setSlot = useCallback((s: Slot) => setPicked({ key: slotKey, slot: s }), [slotKey]);

  const staffIds = staffChoice === "any" ? team.map((s) => s.id) : [staffChoice];
  const assigned = slot ? (staffChoice === "any" ? slot.staffIds[0] : staffChoice) : null;

  const go = useCallback((n: number) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const confirm = async (): Promise<boolean> => {
    if (!branchId || !slot || !assigned || !date) return false;
    setSubmitError(null);
    const createdAt = new Date();
    const b: Booking = {
      id: `web-${createdAt.getTime()}`,
      code: newCode(),
      branchId,
      serviceIds,
      staffId: assigned,
      date,
      time: slot.time,
      duration,
      total,
      client: {
        name: client.name.trim(),
        phone: toWhatsApp(client.phone),
        email: client.email.trim() || undefined,
        notes: client.notes.trim() || undefined,
      },
      club,
      status: "confirmado",
      source: "web",
      createdAt: createdAt.toISOString(),
    };
    const result = await createBooking(b);
    if (!result.ok) {
      if (result.reason === "taken") {
        // Someone took this exact time a moment ago: reload availability and go back.
        setConflict(true);
        setPicked(null);
        setRefresh((r) => r + 1);
        go(3);
      } else {
        setSubmitError("No pudimos guardar el turno. Revisá tu conexión e intentá de nuevo, o escribinos por WhatsApp.");
      }
      return false;
    }
    setBooking(b);
    setStep(5);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  };

  if (booking)
    return (
      <Catalog.Provider value={catalog}>
        <Confirmation booking={booking} />
      </Catalog.Provider>
    );

  return (
    <Catalog.Provider value={catalog}>
    <div className="relative min-h-[100svh] pb-32 pt-28 md:pt-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <header className="mb-10 md:mb-14">
          <p className="label-wide mb-4 text-stone">Reservar turno</p>
          <h1 className="display text-[clamp(2.6rem,6vw,5rem)]">
            Tu turno, <span className="italic text-filament-soft">en un minuto.</span>
          </h1>
          <Progress step={step} />
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
          <div className="min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                {step === 0 && (
                  <StepBranch
                    value={branchId}
                    onChange={(id) => {
                      setBranchId(id);
                      go(serviceIds.length ? 2 : 1);
                    }}
                  />
                )}
                {step === 1 && (
                  <StepServices
                    value={serviceIds}
                    branchId={branchId!}
                    onChange={setServiceIds}
                    onBack={() => go(0)}
                    onNext={() => go(2)}
                  />
                )}
                {step === 2 && branchId && (
                  <StepStaff
                    branchId={branchId}
                    categories={categories}
                    value={staffChoice}
                    onChange={(v) => {
                      setStaffChoice(v);
                      go(3);
                    }}
                    onBack={() => go(1)}
                  />
                )}
                {step === 3 && branchId && mounted && (
                  <StepTime
                    branchId={branchId}
                    duration={duration}
                    staffIds={staffIds}
                    date={date}
                    onDate={setDate}
                    slot={slot}
                    onSlot={setSlot}
                    onBack={() => go(2)}
                    onNext={() => {
                      setConflict(false);
                      go(4);
                    }}
                    refresh={refresh}
                    conflict={conflict}
                  />
                )}
                {step === 4 && (
                  <StepClient
                    value={client}
                    onChange={setClient}
                    club={club}
                    onClub={setClub}
                    onBack={() => go(3)}
                    onConfirm={confirm}
                    error={submitError}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <Summary
            branchId={branchId}
            services={services.map((s) => s.name)}
            duration={duration}
            total={total}
            staffId={assigned ?? (staffChoice === "any" ? null : staffChoice)}
            anyStaff={staffChoice === "any" && step >= 3}
            date={date}
            time={slot?.time ?? null}
            onEdit={go}
            step={step}
          />
        </div>
      </div>
    </div>
    </Catalog.Provider>
  );
}

/* ── Progress ───────────────────────────────────────────────── */

function Progress({ step }: { step: number }) {
  return (
    <ol className="mt-10 grid grid-cols-5 gap-2" aria-label="Pasos de la reserva">
      {STEPS.map((s, i) => (
        <li key={s} aria-current={i === step ? "step" : undefined}>
          <div className="relative h-px overflow-hidden bg-bone/15">
            <motion.div
              className="absolute inset-0 origin-left bg-filament shadow-[0_0_10px_1px_rgba(240,190,116,0.7)]"
              initial={false}
              animate={{ scaleX: i < step ? 1 : i === step ? 0.5 : 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            />
          </div>
          <p
            className={cn(
              "mt-3 hidden text-xs transition-colors sm:block",
              i === step ? "text-bone" : i < step ? "text-stone" : "text-stone-dark",
            )}
          >
            <span className="tabular mr-1.5 text-stone-dark">{i + 1}</span>
            {s}
          </p>
        </li>
      ))}
    </ol>
  );
}

/* ── Step shell ─────────────────────────────────────────────── */

function StepHead({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-8">
      <h2 className="display text-[clamp(2rem,3.4vw,2.8rem)] leading-none">{title}</h2>
      {hint ? <p className="mt-3 max-w-[56ch] text-[0.95rem] text-bone/60">{hint}</p> : null}
    </div>
  );
}

function Nav({
  onBack,
  onNext,
  nextLabel = "Continuar",
  disabled,
  note,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  disabled?: boolean;
  note?: string;
}) {
  return (
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-bone/10 pt-6">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="press inline-flex h-12 items-center gap-2 rounded-full px-4 text-sm text-bone/70 hover:text-bone"
        >
          <ArrowLeft className="size-4" aria-hidden /> Volver
        </button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-4">
        {note ? <p className="text-sm text-stone">{note}</p> : null}
        {onNext ? (
          <button
            type="button"
            onClick={onNext}
            disabled={disabled}
            className="press label-wide inline-flex h-12 items-center gap-3 rounded-full bg-bone px-6 !text-[0.6rem] text-ink hover:bg-filament-soft disabled:pointer-events-none disabled:opacity-35"
          >
            {nextLabel} <ArrowRight className="size-3.5" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ── 1 · Sucursal ───────────────────────────────────────────── */

function StepBranch({ value, onChange }: { value: BranchId | null; onChange: (id: BranchId) => void }) {
  return (
    <section aria-labelledby="paso-sucursal">
      <StepHead title="¿En qué sucursal?" hint="Las dos trabajan con el mismo equipo de formación y las mismas técnicas." />
      <div id="paso-sucursal" className="grid gap-4 sm:grid-cols-2">
        {BRANCHES.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onChange(b.id)}
            aria-pressed={value === b.id}
            className={cn(
              "press group relative overflow-hidden rounded-3xl border text-left",
              value === b.id ? "border-filament/70" : "border-bone/10 hover:border-bone/30",
            )}
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={img(b.image, 800)}
                alt=""
                className="absolute inset-0 size-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-walnut to-transparent" />
            </div>
            <div className="bg-walnut p-6">
              <p className="label-wide text-stone">{b.area}</p>
              <p className="display mt-2 text-[2rem] leading-none">{b.name}</p>
              <p className="mt-4 flex items-start gap-2 text-sm text-bone/70">
                <MapPin className="mt-0.5 size-4 shrink-0 text-filament" strokeWidth={1.5} aria-hidden />
                {b.address}
              </p>
              <p className="mt-1 pl-6 text-sm text-stone">{b.hours.label}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ── 2 · Servicios ──────────────────────────────────────────── */

function StepServices({
  value,
  branchId,
  onChange,
  onBack,
  onNext,
}: {
  value: string[];
  branchId: BranchId;
  onChange: (v: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const catalog = useContext(Catalog);
  const serviceById = useServiceById();
  const [cat, setCat] = useState<CategoryId>(
    (value[0] && serviceById(value[0])?.category) || "color",
  );
  const toggle = (id: string) => {
    if (value.includes(id)) return onChange(value.filter((x) => x !== id));
    if (value.length >= 3) return;
    onChange([...value, id]);
  };
  const cats = [...new Set(value.map((id) => serviceById(id)!.category))] as CategoryId[];
  const feasible = eligibleStaff(branchId, cats).length > 0;
  const total = value.reduce((a, id) => a + serviceById(id)!.duration, 0);

  return (
    <section>
      <StepHead
        title="¿Qué te hacés?"
        hint="Podés sumar hasta tres servicios en el mismo turno. Calculamos el tiempo total por vos."
      />
      <div role="tablist" aria-label="Categorías" className="no-scrollbar -mx-5 mb-6 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={cat === c.id}
            onClick={() => setCat(c.id)}
            className={cn(
              "press h-11 shrink-0 rounded-full border px-5 text-sm",
              cat === c.id
                ? "border-filament/60 bg-filament/10 text-filament-soft"
                : "border-bone/15 text-bone/70 hover:border-bone/40 hover:text-bone",
            )}
          >
            {c.name}
            {value.some((id) => serviceById(id)?.category === c.id) ? (
              <span className="ml-2 inline-block size-1.5 rounded-full bg-filament align-middle" aria-label="con selección" />
            ) : null}
          </button>
        ))}
      </div>
      <ul className="grid gap-3" role="tabpanel">
        {catalog.filter((s) => s.category === cat).map((s) => {
          const on = value.includes(s.id);
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => toggle(s.id)}
                aria-pressed={on}
                className={cn(
                  "press flex w-full items-start gap-4 rounded-2xl border p-5 text-left md:items-center",
                  on ? "border-filament/70 bg-filament/[0.07]" : "border-bone/10 bg-walnut hover:border-bone/30",
                )}
              >
                <span
                  className={cn(
                    "mt-1 grid size-6 shrink-0 place-items-center rounded-full border transition-colors md:mt-0",
                    on ? "border-filament bg-filament text-ink" : "border-bone/30",
                  )}
                  aria-hidden
                >
                  {on ? <Check className="size-3.5" strokeWidth={2.5} /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="display text-[1.5rem] leading-none">{s.name}</span>
                    {s.signature ? (
                      <span className="label-wide rounded-full border border-filament/40 px-2 py-0.5 !text-[0.45rem] text-filament">
                        Firma
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-bone/60">{s.description}</span>
                </span>
                <span className="hidden shrink-0 text-right text-sm sm:block">
                  <span className="block tabular text-bone">{money(s.price)}</span>
                  <span className="mt-1 block tabular text-stone">{minutes(s.duration)}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {!feasible && value.length ? (
        <p role="alert" className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-bone">
          No hay un profesional en esta sucursal que haga todos estos servicios en el mismo turno. Quitá uno o reservalos por
          separado.
        </p>
      ) : null}
      <Nav
        onBack={onBack}
        onNext={onNext}
        disabled={!value.length || !feasible}
        note={value.length ? `${value.length} seleccionado${value.length > 1 ? "s" : ""} · ${minutes(total)}` : undefined}
      />
    </section>
  );
}

/* ── 3 · Profesional ────────────────────────────────────────── */

function StepStaff({
  branchId,
  categories,
  value,
  onChange,
  onBack,
}: {
  branchId: BranchId;
  categories: CategoryId[];
  value: string;
  onChange: (v: string) => void;
  onBack: () => void;
}) {
  const team = eligibleStaff(branchId, categories);
  return (
    <section>
      <StepHead title="¿Con quién?" hint="Si no tenés preferencia, te damos el primer horario libre de todo el equipo." />
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onChange("any")}
          aria-pressed={value === "any"}
          className={cn(
            "press flex items-center gap-4 rounded-2xl border p-5 text-left sm:col-span-2",
            value === "any" ? "border-filament/70 bg-filament/[0.07]" : "border-bone/10 bg-walnut hover:border-bone/30",
          )}
        >
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-filament text-ink">
            <Sparkles className="size-5" strokeWidth={1.5} aria-hidden />
          </span>
          <span>
            <span className="display block text-[1.5rem] leading-none">Sin preferencia</span>
            <span className="mt-1.5 block text-sm text-bone/60">Más horarios disponibles</span>
          </span>
        </button>
        {team.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            aria-pressed={value === s.id}
            className={cn(
              "press flex items-center gap-4 rounded-2xl border p-5 text-left",
              value === s.id ? "border-filament/70 bg-filament/[0.07]" : "border-bone/10 bg-walnut hover:border-bone/30",
            )}
          >
            <span className="display grid size-14 shrink-0 place-items-center rounded-full border border-bone/15 bg-umber text-2xl text-filament-soft">
              {s.name[0]}
            </span>
            <span>
              <span className="display block text-[1.5rem] leading-none">{s.name}</span>
              <span className="mt-1.5 block text-sm text-bone/60">{s.role}</span>
            </span>
          </button>
        ))}
      </div>
      <Nav onBack={onBack} />
    </section>
  );
}

/* ── 4 · Día y horario ──────────────────────────────────────── */

function StepTime({
  branchId,
  duration,
  staffIds,
  date,
  onDate,
  slot,
  onSlot,
  onBack,
  onNext,
  refresh,
  conflict,
}: {
  branchId: BranchId;
  duration: number;
  staffIds: string[];
  date: string | null;
  onDate: (d: string) => void;
  slot: Slot | null;
  onSlot: (s: Slot) => void;
  onBack: () => void;
  onNext: () => void;
  refresh: number;
  conflict: boolean;
}) {
  const staffKey = staffIds.join(",");
  const dates = useMemo(() => openDays(branchId, 14, new Date()), [branchId]);

  // Busy times for the next two weeks, fetched once per branch (and again
  // after a booking conflict). Kept with the key it was fetched for, so a
  // stale answer is never shown for a different branch.
  const fetchKey = `${branchId}|${refresh}`;
  const [loaded, setLoaded] = useState<{ key: string; busy: Busy[]; failed?: boolean } | null>(null);
  useEffect(() => {
    let alive = true;
    fetchBusy(branchId, dates)
      .then((busy) => alive && setLoaded({ key: fetchKey, busy }))
      .catch(() => alive && setLoaded({ key: fetchKey, busy: [], failed: true }));
    return () => {
      alive = false;
    };
  }, [branchId, dates, fetchKey]);
  const busy = loaded?.key === fetchKey ? loaded.busy : null;
  const failed = loaded?.key === fetchKey && loaded.failed;

  const days = useMemo(() => {
    if (!busy) return null;
    const now = new Date();
    const ids = staffKey.split(",");
    return dates.map((d) => ({
      date: d,
      free: slotsFor({ branchId, date: d, duration, staffIds: ids, busy, now }),
    }));
  }, [branchId, duration, staffKey, dates, busy]);

  useEffect(() => {
    if (!days) return;
    if (!date || !days.some((d) => d.date === date)) {
      const first = days.find((d) => d.free.length);
      if (first) onDate(first.date);
    }
  }, [date, days, onDate]);

  const current = days?.find((d) => d.date === date);
  const morning = current?.free.filter((s) => toMin(s.time) < 13 * 60) ?? [];
  const afternoon = current?.free.filter((s) => toMin(s.time) >= 13 * 60) ?? [];
  const today = toISODate(new Date());

  return (
    <section>
      <StepHead
        title="¿Cuándo te queda bien?"
        hint={`Te mostramos solo los horarios en los que entra tu servicio completo (${minutes(duration)}).`}
      />

      {conflict ? (
        <p role="alert" className="mb-6 rounded-2xl border border-filament/40 bg-filament/10 p-4 text-sm text-bone">
          Ese horario se acaba de ocupar mientras completabas tus datos. Te mostramos la agenda actualizada: elegí otro y
          listo.
        </p>
      ) : null}
      {failed ? (
        <p role="alert" className="mb-6 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-bone">
          No pudimos consultar la agenda. Revisá tu conexión o escribinos por WhatsApp y te damos un turno.
        </p>
      ) : null}

      {!days ? (
        <div className="flex gap-2 overflow-hidden" aria-busy="true" aria-label="Cargando horarios disponibles">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-[6.6rem] w-[4.75rem] shrink-0 animate-pulse rounded-2xl bg-walnut" />
          ))}
        </div>
      ) : (
      <div className="no-scrollbar -mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0" role="listbox" aria-label="Días">
        {days.map((d) => {
          const on = d.date === date;
          const full = !d.free.length;
          return (
            <button
              key={d.date}
              type="button"
              role="option"
              aria-selected={on}
              disabled={full}
              onClick={() => onDate(d.date)}
              className={cn(
                "press flex w-[4.75rem] shrink-0 snap-start flex-col items-center rounded-2xl border py-4 transition-colors",
                on
                  ? "border-filament bg-filament text-ink"
                  : full
                    ? "border-bone/5 text-stone-dark"
                    : "border-bone/10 bg-walnut hover:border-bone/30",
              )}
            >
              <span className="text-[0.7rem] uppercase tracking-wider">
                {d.date === today ? "Hoy" : formatDay(d.date, { weekday: "short" }).replace(".", "")}
              </span>
              <span className="display mt-1 text-[1.9rem] leading-none tabular">{formatDay(d.date, { day: "numeric" })}</span>
              <span className={cn("mt-2 text-[0.65rem]", on ? "text-ink/70" : "text-stone")}>
                {full ? "Completo" : `${d.free.length} libres`}
              </span>
            </button>
          );
        })}
      </div>
      )}

      {current ? (
        <div className="mt-8 grid gap-8">
          <p className="text-sm text-bone/70 first-letter:uppercase">{formatDay(current.date)}</p>
          {[
            { label: "Mañana", list: morning },
            { label: "Tarde", list: afternoon },
          ].map((g) =>
            g.list.length ? (
              <div key={g.label}>
                <p className="label-wide mb-3 text-stone">{g.label}</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
                  {g.list.map((s) => {
                    const on = slot?.time === s.time;
                    return (
                      <button
                        key={s.time}
                        type="button"
                        onClick={() => onSlot(s)}
                        aria-pressed={on}
                        className={cn(
                          "press h-12 rounded-xl border text-sm tabular",
                          on
                            ? "border-filament bg-filament/15 text-filament-soft shadow-[0_0_18px_-4px_rgba(240,190,116,0.7)]"
                            : "border-bone/10 bg-walnut text-bone/85 hover:border-bone/35",
                        )}
                      >
                        {s.time}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null,
          )}
          {!morning.length && !afternoon.length ? (
            <p className="text-sm text-stone">Este día ya no tiene lugar. Probá con otro.</p>
          ) : null}
        </div>
      ) : days ? (
        <p className="mt-8 text-sm text-stone">
          No encontramos lugar en las próximas dos semanas para este servicio. Escribinos por WhatsApp y lo resolvemos.
        </p>
      ) : null}

      <Nav onBack={onBack} onNext={onNext} disabled={!slot} />
    </section>
  );
}

/* ── 5 · Datos ──────────────────────────────────────────────── */

function StepClient({
  value,
  onChange,
  club,
  onClub,
  onBack,
  onConfirm,
  error,
}: {
  value: Client;
  onChange: (c: Client) => void;
  club: boolean;
  onClub: (v: boolean) => void;
  onBack: () => void;
  onConfirm: () => Promise<boolean>;
  error: string | null;
}) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const errors = {
    name: value.name.trim().length < 3 ? "Escribí tu nombre y apellido." : "",
    phone: value.phone.replace(/\D/g, "").length < 8 ? "Ingresá un WhatsApp con código de área, por ejemplo 351 555 1234." : "",
    email: value.email && !/^\S+@\S+\.\S+$/.test(value.email) ? "Revisá el mail: falta el @ o el dominio." : "",
  };
  const valid = !errors.name && !errors.phone && !errors.email;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, email: true });
    if (!valid) {
      const first = (["name", "phone", "email"] as const).find((k) => errors[k]);
      if (first) document.getElementById(`f-${first}`)?.focus();
      return;
    }
    setBusy(true);
    void onConfirm().then((ok) => {
      if (!ok) setBusy(false);
    });
  };

  const field = (key: keyof Client, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label htmlFor={`f-${key}`} className="mb-2 block text-sm text-bone/80">
        {label}
      </label>
      <input
        id={`f-${key}`}
        value={value[key]}
        onChange={(e) => onChange({ ...value, [key]: e.target.value })}
        onBlur={() => setTouched((t) => ({ ...t, [key]: true }))}
        aria-invalid={Boolean(touched[key] && errors[key as keyof typeof errors])}
        aria-describedby={`e-${key}`}
        className="h-13 w-full rounded-xl border border-bone/15 bg-walnut px-4 text-base text-bone outline-none transition-colors placeholder:text-stone-dark focus:border-filament aria-invalid:border-destructive"
        {...props}
      />
      <p id={`e-${key}`} className="mt-2 min-h-5 text-sm text-destructive" aria-live="polite">
        {touched[key] ? errors[key as keyof typeof errors] : ""}
      </p>
    </div>
  );

  return (
    <form onSubmit={submit} noValidate>
      <StepHead title="Último paso" hint="Te mandamos la confirmación y un recordatorio por WhatsApp el día anterior." />
      <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
        {field("name", "Nombre y apellido *", { autoComplete: "name", placeholder: "Ej. Lucía Martínez" })}
        {field("phone", "WhatsApp *", { type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: "351 555 1234" })}
        <div className="sm:col-span-2">
          {field("email", "Mail (opcional)", { type: "email", autoComplete: "email", placeholder: "lucia@mail.com" })}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="f-notes" className="mb-2 block text-sm text-bone/80">
            ¿Algo que tengamos que saber? (opcional)
          </label>
          <textarea
            id="f-notes"
            rows={3}
            value={value.notes}
            onChange={(e) => onChange({ ...value, notes: e.target.value })}
            placeholder="Ej. tengo una foto de referencia, me hice alisado hace 2 meses…"
            className="w-full rounded-xl border border-bone/15 bg-walnut px-4 py-3 text-base text-bone outline-none transition-colors placeholder:text-stone-dark focus:border-filament"
          />
        </div>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-4 rounded-2xl border border-bone/10 bg-walnut p-5">
        <input
          type="checkbox"
          checked={club}
          onChange={(e) => onClub(e.target.checked)}
          className="mt-1 size-5 shrink-0 accent-[var(--filament)]"
        />
        <span>
          <span className="block text-bone">Quiero sumarme al Club de beneficios UBEE</span>
          <span className="mt-1 block text-sm text-bone/60">
            Beneficios exclusivos, oportunidades de la semana y novedades. Gratis.
          </span>
        </span>
      </label>

      {error ? (
        <p role="alert" className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-bone">
          {error}
        </p>
      ) : null}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-bone/10 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="press inline-flex h-12 items-center gap-2 rounded-full px-4 text-sm text-bone/70 hover:text-bone"
        >
          <ArrowLeft className="size-4" aria-hidden /> Volver
        </button>
        <button
          type="submit"
          disabled={busy}
          className="press label-wide inline-flex h-12 min-w-56 items-center justify-center gap-3 rounded-full bg-filament px-6 !text-[0.6rem] text-ink hover:bg-filament-soft disabled:opacity-70"
        >
          {busy ? (
            <>
              <span className="size-3.5 animate-spin rounded-full border-2 border-ink/30 border-t-ink" aria-hidden />
              Confirmando…
            </>
          ) : (
            <>
              Confirmar turno <Check className="size-3.5" aria-hidden />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/* ── Resumen ────────────────────────────────────────────────── */

function Summary({
  branchId,
  services,
  duration,
  total,
  staffId,
  anyStaff,
  date,
  time,
  onEdit,
  step,
}: {
  branchId: BranchId | null;
  services: string[];
  duration: number;
  total: number;
  staffId: string | null;
  anyStaff: boolean;
  date: string | null;
  time: string | null;
  onEdit: (n: number) => void;
  step: number;
}) {
  const branch = branchId ? branchById(branchId) : null;
  const staff = STAFF.find((s) => s.id === staffId);
  const rows = [
    { i: 0, icon: MapPin, label: "Sucursal", value: branch ? `${branch.name}` : null },
    { i: 1, icon: Sparkles, label: "Servicio", value: services.length ? services.join(" + ") : null },
    {
      i: 2,
      icon: UserRound,
      label: "Profesional",
      value: staff ? `${staff.name}${anyStaff ? " · primer turno libre" : ""}` : step > 2 ? "Sin preferencia" : null,
    },
    {
      i: 3,
      icon: Clock,
      label: "Día y hora",
      value: date && time ? `${formatDay(date, { weekday: "short", day: "numeric", month: "short" })} · ${time} h` : null,
    },
  ];
  return (
    <aside className="lg:sticky lg:top-28 lg:self-start" aria-label="Resumen del turno">
      <div className="relative overflow-hidden rounded-3xl border border-bone/10 bg-walnut">
        <div className="px-6 pb-2 pt-6">
          <p className="label-wide text-stone">Tu turno</p>
        </div>
        <Filament variant="soft" className="h-8" delay={0.4} duration={1.8} thickness={1.2} />
        <ul className="grid gap-1 px-3 pb-3">
          {rows.map((r) => (
            <li key={r.label}>
              <button
                type="button"
                onClick={() => r.value && onEdit(r.i)}
                disabled={!r.value}
                className="group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors enabled:hover:bg-bone/[0.04]"
              >
                <r.icon
                  className={cn("mt-0.5 size-4 shrink-0", r.value ? "text-filament" : "text-stone-dark")}
                  strokeWidth={1.5}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-stone">{r.label}</span>
                  <span className={cn("mt-0.5 block text-sm", r.value ? "text-bone" : "text-stone-dark")}>
                    {r.value ?? "—"}
                  </span>
                </span>
                {r.value ? (
                  <span className="text-xs text-stone opacity-0 transition-opacity group-hover:opacity-100">Cambiar</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-end justify-between border-t border-dashed border-bone/15 px-6 py-5">
          <div>
            <p className="text-xs text-stone">Duración</p>
            <p className="tabular text-sm">{duration ? minutes(duration) : "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-stone">Desde</p>
            <p className="display text-[1.8rem] leading-none tabular">{total ? money(total) : "—"}</p>
          </div>
        </div>
      </div>
      <p className="mt-4 px-2 text-xs leading-relaxed text-stone-dark">
        Podés cancelar o reprogramar sin cargo hasta 24 h antes. Se abona en el salón.
      </p>
    </aside>
  );
}

/* ── Confirmación ───────────────────────────────────────────── */

function Confirmation({ booking }: { booking: Booking }) {
  const serviceById = useServiceById();
  const branch = branchById(booking.branchId)!;
  const staff = STAFF.find((s) => s.id === booking.staffId);
  const services = booking.serviceIds.map((id) => serviceById(id)?.name ?? id).join(" + ");
  const when = `${formatDay(booking.date)} a las ${booking.time} h`;

  const message = [
    `¡Hola UBEE! Reservé un turno desde la web.`,
    ``,
    `• Nombre: ${booking.client.name}`,
    `• Servicio: ${services}`,
    `• Día y horario: ${when}`,
    `• Profesional: ${staff?.name ?? "Sin preferencia"}`,
    `• Código: ${booking.code}`,
  ].join("\n");

  const downloadIcs = () => {
    const blob = new Blob([icsFor(booking)], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `turno-ubee-${booking.code}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative min-h-[100svh] overflow-hidden pb-24 pt-28 md:pt-36">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[38%]">
        <Filament className="h-32" delay={0.2} duration={2.4} thickness={1.6} />
      </div>
      <div className="relative mx-auto max-w-[760px] px-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mx-auto grid size-16 place-items-center rounded-full bg-filament text-ink shadow-[0_0_40px_0_rgba(240,190,116,0.55)]"
        >
          <Check className="size-7" strokeWidth={2} aria-hidden />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          className="text-center"
        >
          <p className="label-wide mt-8 text-stone">Turno confirmado</p>
          <h1 className="display mt-4 text-[clamp(2.6rem,6vw,4.6rem)]">
            Te esperamos, <span className="italic text-filament-soft">{booking.client.name.split(" ")[0]}.</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          className="mt-12 overflow-hidden rounded-3xl border border-bone/10 bg-walnut/90 backdrop-blur-md"
        >
          <div className="flex items-center justify-between border-b border-dashed border-bone/15 px-6 py-5">
            <span className="label-wide text-stone">Código</span>
            <span className="display text-2xl tracking-wider tabular text-filament-soft">{booking.code}</span>
          </div>
          <dl className="grid gap-5 p-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-stone">Servicio</dt>
              <dd className="mt-1">{services}</dd>
            </div>
            <div>
              <dt className="text-xs text-stone">Día y horario</dt>
              <dd className="mt-1 first-letter:uppercase">{when}</dd>
            </div>
            <div>
              <dt className="text-xs text-stone">Profesional</dt>
              <dd className="mt-1">{staff ? `${staff.name} · ${staff.role}` : "Sin preferencia"}</dd>
            </div>
            <div>
              <dt className="text-xs text-stone">Sucursal</dt>
              <dd className="mt-1">
                {branch.name} · {branch.address}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-stone">Duración estimada</dt>
              <dd className="mt-1 tabular">{minutes(booking.duration)}</dd>
            </div>
            <div>
              <dt className="text-xs text-stone">Valor de referencia</dt>
              <dd className="mt-1 tabular">desde {money(booking.total)}</dd>
            </div>
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-6 grid gap-3 sm:grid-cols-3"
        >
          <a
            href={wa(branch.whatsapp, message)}
            target="_blank"
            rel="noreferrer"
            className="press flex h-14 items-center justify-center gap-2 rounded-2xl bg-bone text-sm text-ink hover:bg-filament-soft"
          >
            <WhatsAppIcon className="size-4" /> Avisar por WhatsApp
          </a>
          <a
            href={googleCalendarUrl(booking)}
            target="_blank"
            rel="noreferrer"
            className="press flex h-14 items-center justify-center gap-2 rounded-2xl border border-bone/15 text-sm hover:border-filament/60"
          >
            <CalendarPlus className="size-4" aria-hidden /> Google Calendar
          </a>
          <button
            type="button"
            onClick={downloadIcs}
            className="press flex h-14 items-center justify-center gap-2 rounded-2xl border border-bone/15 text-sm hover:border-filament/60"
          >
            <Download className="size-4" aria-hidden /> Agregar al calendario
          </button>
        </motion.div>

        <p className="mt-10 text-center text-sm text-stone">
          ¿Necesitás cambiar algo? Escribinos al{" "}
          <a href={wa(branch.whatsapp, `Hola! Quiero reprogramar mi turno ${booking.code}.`)} className="text-bone underline underline-offset-4">
            {branch.phoneLabel}
          </a>
          .{" "}
          <Link href="/" className="text-bone underline underline-offset-4">
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
