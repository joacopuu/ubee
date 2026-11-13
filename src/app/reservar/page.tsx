import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { getContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Reservar turno",
  description: "Elegí sucursal, servicio, profesional y horario. Tu turno en UBEE queda confirmado al instante.",
};

type SP = PageProps<"/reservar">["searchParams"];

async function Wizard({ searchParams }: { searchParams: SP }) {
  const [sp, { services }] = await Promise.all([searchParams, getContent()]);
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return <BookingWizard services={services} initialService={one(sp.servicio)} initialBranch={one(sp.sucursal)} />;
}

export default function ReservarPage({ searchParams }: PageProps<"/reservar">) {
  return (
    <Suspense fallback={<div className="min-h-[100svh]" />}>
      <Wizard searchParams={searchParams} />
    </Suspense>
  );
}
