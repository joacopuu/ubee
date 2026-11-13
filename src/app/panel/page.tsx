import type { Metadata } from "next";
import { PanelApp } from "@/components/panel/panel-app";
import { getContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Panel del salón",
  robots: { index: false, follow: false },
};

export default async function PanelPage() {
  const content = await getContent();
  return <PanelApp content={content} />;
}
