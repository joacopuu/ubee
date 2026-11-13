import type { Metadata, Viewport } from "next";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import "./globals.css";

/*
 * Type system (Fontshare · ITF Free Font License, free for commercial use):
 *   Melodrama — display. High-contrast serif with geometric bowls that echo
 *               the round U and the dots of the UBEE wordmark.
 *   Boska     — italic accents. Sharp, calligraphic; the "luz" in the copy.
 *   Panchang  — wide labels, the voice of "MODERN HAIR STUDIO".
 *   Switzer   — body and UI.
 * Served from Fontshare's CDN, as the license intends for the web.
 */
const FONTS =
  "https://api.fontshare.com/v2/css?f[]=melodrama@300,400,500&f[]=boska@300,400,300i,400i&f[]=panchang@500,600,700,800&f[]=switzer@400,500,600&display=swap";

export const metadata: Metadata = {
  metadataBase: new URL("https://ubee.com.ar"),
  title: {
    default: "UBEE · Modern Hair Studio — Córdoba y Villa Carlos Paz",
    template: "%s · UBEE Modern Hair Studio",
  },
  description:
    "Color de autor, balayage, rubios y cortes a medida. Reservá tu turno online en UBEE Córdoba o Villa Carlos Paz.",
  openGraph: {
    title: "UBEE · Modern Hair Studio",
    description: "Color de autor con luz propia. Reservá tu turno online.",
    locale: "es_AR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#100c09",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className="antialiased">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body className="min-h-dvh">
        <SmoothScroll>
          <Header />
          <main id="contenido">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
