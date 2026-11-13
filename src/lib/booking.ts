/* ─────────────────────────────────────────────────────────────
 * Motor de turnos
 *
 * En la demo no hay servidor: cada profesional tiene una agenda de
 * ejemplo generada de forma determinística (la misma fecha siempre
 * da la misma agenda), y los turnos que se reservan desde la web se
 * guardan en este navegador. La web y el panel leen la misma
 * fuente, así que un turno reservado bloquea ese horario y aparece
 * en la agenda del salón.
 *
 * Para producción, `loadBookings` / `saveBooking` se cambian por
 * llamadas a una base de datos (Supabase, por ejemplo) sin tocar
 * la interfaz.
 * ───────────────────────────────────────────────────────────── */

import {
  BRANCHES,
  SERVICES,
  STAFF,
  branchById,
  serviceById,
  type BranchId,
  type CategoryId,
  type Staff,
} from "./data";

export type BookingStatus = "confirmado" | "en-salon" | "completado" | "cancelado";

export type Booking = {
  id: string;
  code: string;
  branchId: BranchId;
  serviceIds: string[];
  staffId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number;
  total: number;
  client: { name: string; phone: string; email?: string; notes?: string };
  club: boolean;
  status: BookingStatus;
  source: "web" | "demo";
  createdAt: string;
};

const KEY = "ubee.bookings.v1";
const STEP = 30; // grilla de 30 minutos

/* ── Fechas ─────────────────────────────────────────────────── */

export const toISODate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const fromISODate = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const toHHMM = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

export const formatDay = (iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }) =>
  new Intl.DateTimeFormat("es-AR", opts).format(fromISODate(iso));

/** Próximos días en que abre la sucursal. */
export function openDays(branchId: BranchId, count = 14, from = new Date()) {
  const branch = branchById(branchId)!;
  const days: string[] = [];
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  while (days.length < count) {
    if (branch.hours.days.includes(d.getDay())) days.push(toISODate(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

/* ── Agenda de ejemplo, determinística ──────────────────────── */

function seed(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const DEMO_CLIENTS = [
  "Lucía M.", "Florencia R.", "Martina G.", "Paula S.", "Carolina B.", "Julieta P.",
  "Romina A.", "Micaela T.", "Daniela F.", "Belén C.", "Sol V.", "Ana L.",
  "Victoria D.", "Josefina N.", "Agustín R.", "Milagros E.", "Natalia K.", "Rocío Q.",
];

const cache = new Map<string, Booking[]>();

export function demoAgenda(staff: Staff, branchId: BranchId, date: string): Booking[] {
  const key = `${staff.id}|${branchId}|${date}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const branch = branchById(branchId)!;
  const rnd = seed(key);
  const pool = SERVICES.filter((s) => staff.skills.includes(s.category));
  const out: Booking[] = [];
  let t = branch.hours.open * 60;
  const end = branch.hours.close * 60;
  const load = 0.14 + rnd() * 0.22; // cada día tiene su propio ritmo

  while (t < end) {
    if (rnd() < load) {
      const svc = pool[Math.floor(rnd() * pool.length)];
      if (t + svc.duration <= end) {
        out.push({
          id: `demo-${key}-${t}`,
          code: `UB-${Math.floor(1000 + rnd() * 9000)}`,
          branchId,
          serviceIds: [svc.id],
          staffId: staff.id,
          date,
          time: toHHMM(t),
          duration: svc.duration,
          total: svc.price,
          client: { name: DEMO_CLIENTS[Math.floor(rnd() * DEMO_CLIENTS.length)], phone: "5493510000000" },
          club: rnd() > 0.5,
          status: "confirmado",
          source: "demo",
          createdAt: "",
        });
        t += svc.duration + (rnd() < 0.5 ? STEP : 0);
        continue;
      }
    }
    t += STEP;
  }
  cache.set(key, out);
  return out;
}

/* ── Persistencia (demo: localStorage) ──────────────────────── */

export function loadBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as Booking[];
  } catch {
    return [];
  }
}

export function saveBooking(b: Booking) {
  const all = loadBookings().filter((x) => x.id !== b.id);
  all.push(b);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* almacenamiento bloqueado: la reserva igual se confirma por WhatsApp */
  }
  window.dispatchEvent(new Event("ubee:bookings"));
}

export function updateBookingStatus(id: string, status: BookingStatus) {
  const all = loadBookings();
  const b = all.find((x) => x.id === id);
  if (!b) return;
  b.status = status;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
  window.dispatchEvent(new Event("ubee:bookings"));
}

/* ── Disponibilidad ─────────────────────────────────────────── */

export function eligibleStaff(branchId: BranchId, categories: CategoryId[]) {
  return STAFF.filter(
    (s) => s.branches.includes(branchId) && categories.every((c) => s.skills.includes(c)),
  );
}

export function agendaFor(staff: Staff, branchId: BranchId, date: string, stored = loadBookings()) {
  return [
    ...demoAgenda(staff, branchId, date),
    ...stored.filter(
      (b) => b.staffId === staff.id && b.branchId === branchId && b.date === date && b.status !== "cancelado",
    ),
  ].sort((a, b) => toMin(a.time) - toMin(b.time));
}

/** Minimal shape needed to block a slot: who, when, for how long. */
export type Busy = { staffId: string; date: string; time: string; duration: number };

function isFree(agenda: Busy[], start: number, duration: number) {
  const end = start + duration;
  return agenda.every((b) => {
    const s = toMin(b.time);
    return end <= s || start >= s + b.duration;
  });
}

export type Slot = { time: string; staffIds: string[] };

/**
 * Horarios en los que entra el servicio completo.
 * "busy" son los turnos ya tomados (de la demo o de Supabase).
 */
export function slotsFor({
  branchId,
  date,
  duration,
  staffIds,
  busy,
  now = new Date(),
}: {
  branchId: BranchId;
  date: string;
  duration: number;
  staffIds: string[];
  busy: Busy[];
  now?: Date;
}): Slot[] {
  const branch = branchById(branchId)!;
  const agendas = staffIds.map((id) => [id, busy.filter((b) => b.staffId === id && b.date === date)] as const);
  const isToday = date === toISODate(now);
  const earliest = isToday ? now.getHours() * 60 + now.getMinutes() + 60 : 0;

  const slots: Slot[] = [];
  for (let t = branch.hours.open * 60; t + duration <= branch.hours.close * 60; t += STEP) {
    if (t < earliest) continue;
    const free = agendas.filter(([, a]) => isFree(a, t, duration)).map(([id]) => id);
    if (free.length) slots.push({ time: toHHMM(t), staffIds: free });
  }
  return slots;
}

/** El primer turno libre de una sucursal, para mostrarlo en la portada. */
export function nextAvailable(branchId: BranchId, busy: Busy[], duration = 60, now = new Date()) {
  const team = STAFF.filter((s) => s.branches.includes(branchId)).map((s) => s.id);
  for (const date of openDays(branchId, 7, now)) {
    const slots = slotsFor({ branchId, date, duration, staffIds: team, busy, now });
    if (slots.length) return { date, time: slots[0].time };
  }
  return null;
}

export function newCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `UB-${s}`;
}

export function bookingSummary(b: Booking) {
  const services = b.serviceIds.map((id) => serviceById(id)?.name).filter(Boolean).join(" + ");
  const staff = STAFF.find((s) => s.id === b.staffId);
  const branch = BRANCHES.find((x) => x.id === b.branchId)!;
  return { services, staff, branch };
}

/** Archivo .ics para agregar el turno al calendario del cliente. */
export function icsFor(b: Booking) {
  const { services, branch } = bookingSummary(b);
  const start = fromISODate(b.date);
  const [h, m] = b.time.split(":").map(Number);
  start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + b.duration * 60000);
  const fmt = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}T${String(
      d.getHours(),
    ).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}00`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//UBEE//Turnos//ES",
    "BEGIN:VEVENT",
    `UID:${b.id}@ubee`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:UBEE · ${services}`,
    `LOCATION:${branch.address}, ${branch.city}`,
    `DESCRIPTION:Turno ${b.code}. Si necesitás reprogramar escribinos al ${branch.phoneLabel}.`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function googleCalendarUrl(b: Booking) {
  const { services, branch } = bookingSummary(b);
  const start = fromISODate(b.date);
  const [h, m] = b.time.split(":").map(Number);
  start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + b.duration * 60000);
  const f = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}T${String(
      d.getHours(),
    ).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}00`;
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `UBEE · ${services}`,
    dates: `${f(start)}/${f(end)}`,
    location: `${branch.address}, ${branch.city}`,
    details: `Turno ${b.code}`,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
