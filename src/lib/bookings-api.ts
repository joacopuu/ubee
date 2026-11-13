"use client";

/*
 * Bookings, through one interface for both modes.
 *
 *   Demo mode  → example agenda generated per professional + bookings saved
 *                in this browser (localStorage).
 *   Supabase   → table "bookings". Visitors can only INSERT (and read busy
 *                times through the busy_slots() function, which never exposes
 *                names or phones). The salon, logged in, reads and updates all.
 *                A database constraint makes double-booking impossible.
 */

import { BRANCHES, STAFF, type BranchId } from "./data";
import {
  agendaFor,
  loadBookings,
  saveBooking,
  updateBookingStatus,
  type Booking,
  type BookingStatus,
  type Busy,
} from "./booking";
import { db } from "./supabase";

const hhmm = (t: string) => t.slice(0, 5);

export async function fetchBusy(branchId: BranchId, dates: string[]): Promise<Busy[]> {
  if (!dates.length) return [];
  const client = db();
  if (!client) {
    const stored = loadBookings();
    const team = STAFF.filter((s) => s.branches.includes(branchId));
    return dates.flatMap((date) =>
      team.flatMap((s) =>
        agendaFor(s, branchId, date, stored).map((b) => ({
          staffId: b.staffId,
          date: b.date,
          time: b.time,
          duration: b.duration,
        })),
      ),
    );
  }
  const { data, error } = await client.rpc("busy_slots", {
    p_branch: branchId,
    p_from: dates[0],
    p_to: dates[dates.length - 1],
  });
  if (error) throw error;
  return (data as { staff_id: string; date: string; time: string; duration: number }[]).map((r) => ({
    staffId: r.staff_id,
    date: r.date,
    time: hhmm(r.time),
    duration: r.duration,
  }));
}

export type CreateResult = { ok: true } | { ok: false; reason: "taken" | "error"; message?: string };

export async function createBooking(b: Booking): Promise<CreateResult> {
  const client = db();
  if (!client) {
    saveBooking(b);
    return { ok: true };
  }
  const { error } = await client.from("bookings").insert({
    code: b.code,
    branch_id: b.branchId,
    service_ids: b.serviceIds,
    staff_id: b.staffId,
    date: b.date,
    time: b.time,
    duration: b.duration,
    total: b.total,
    client_name: b.client.name,
    client_phone: b.client.phone,
    client_email: b.client.email ?? null,
    notes: b.client.notes ?? null,
    club: b.club,
  });
  if (!error) return { ok: true };
  // 23P01 = exclusion_violation: someone booked the same professional at an overlapping time.
  if (error.code === "23P01") return { ok: false, reason: "taken" };
  return { ok: false, reason: "error", message: error.message };
}

function rowToBooking(r: Record<string, unknown>): Booking {
  return {
    id: String(r.id),
    code: String(r.code),
    branchId: r.branch_id as BranchId,
    serviceIds: (r.service_ids as string[]) ?? [],
    staffId: String(r.staff_id),
    date: String(r.date),
    time: hhmm(String(r.time)),
    duration: Number(r.duration),
    total: Number(r.total),
    client: {
      name: String(r.client_name),
      phone: String(r.client_phone),
      email: (r.client_email as string) ?? undefined,
      notes: (r.notes as string) ?? undefined,
    },
    club: Boolean(r.club),
    status: r.status as BookingStatus,
    source: (r.source as Booking["source"]) ?? "web",
    createdAt: String(r.created_at ?? ""),
  };
}

/** Every booking of a branch on a day (panel only). */
export async function listBookings(branchId: BranchId, date: string): Promise<Booking[]> {
  const client = db();
  if (!client) {
    const stored = loadBookings();
    return STAFF.filter((s) => s.branches.includes(branchId)).flatMap((s) => agendaFor(s, branchId, date, stored));
  }
  const { data, error } = await client
    .from("bookings")
    .select("*")
    .eq("branch_id", branchId)
    .eq("date", date)
    .order("time");
  if (error) throw error;
  return data.map(rowToBooking);
}

/** Upcoming web bookings, newest first (panel side list). */
export async function upcomingBookings(branchId: BranchId, from: string, limit = 6): Promise<Booking[]> {
  const client = db();
  if (!client) {
    return loadBookings()
      .filter((b) => b.branchId === branchId && b.status !== "cancelado" && b.date >= from)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .slice(0, limit);
  }
  const { data, error } = await client
    .from("bookings")
    .select("*")
    .eq("branch_id", branchId)
    .neq("status", "cancelado")
    .gte("date", from)
    .order("date")
    .order("time")
    .limit(limit);
  if (error) throw error;
  return data.map(rowToBooking);
}

export async function setBookingStatus(b: Booking, status: BookingStatus) {
  const client = db();
  if (!client) {
    if (b.source === "web") updateBookingStatus(b.id, status);
    return;
  }
  const { error } = await client.from("bookings").update({ status }).eq("id", b.id);
  if (error) throw error;
}

/** Live updates: calls back whenever a booking is created or changed. */
export function onBookingsChange(cb: () => void) {
  const client = db();
  if (!client) {
    window.addEventListener("ubee:bookings", cb);
    window.addEventListener("storage", cb);
    return () => {
      window.removeEventListener("ubee:bookings", cb);
      window.removeEventListener("storage", cb);
    };
  }
  const channel = client
    .channel("bookings-panel")
    .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, cb)
    .subscribe();
  return () => {
    void client.removeChannel(channel);
  };
}

export const branchName = (id: string) => BRANCHES.find((b) => b.id === id)?.name ?? id;
