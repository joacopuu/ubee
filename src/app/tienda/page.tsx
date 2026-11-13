import type { Metadata } from "next";
import { Shop } from "@/components/shop/shop";
import { getContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Los productos que usamos en el salón. Armá tu pedido y coordinalo por WhatsApp para retirarlo en tu sucursal.",
};

export default async function TiendaPage() {
  const { products } = await getContent();
  return <Shop products={products} />;
}
