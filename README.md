# UBEE · Modern Hair Studio — sitio web

Sitio de UBEE Peluquería (Córdoba y Villa Carlos Paz) con reservas online, Club de beneficios, novedades, tienda con pedido por WhatsApp y un panel de agenda para el salón.

## Páginas

| Ruta | Qué es |
| --- | --- |
| `/` | Home: hero, técnicas, servicios, trabajos, Club (portal tipográfico), novedades, tienda, sucursales |
| `/reservar` | Reserva en 5 pasos: sucursal → servicio → profesional → día y horario → datos. Acepta `?servicio=sunkiss` y `?sucursal=cordoba` |
| `/tienda` | Catálogo con carrito y envío del pedido por WhatsApp a la sucursal elegida |
| `/panel` | Agenda del salón por profesional (no indexada). Muestra al instante los turnos reservados desde la web |

## Identidad

- **Paleta** (`src/app/globals.css`): tinta `#0d0b09`, nogal `#17120e`, hueso `#f3eee7` y *filamento* `#e9b872`, la luz LED dorada de la recepción del salón.
- **Tipografía**: Bodoni Moda (titulares), Syncopate (etiquetas, eco del "MODERN HAIR STUDIO" del logo), Hanken Grotesk (texto).
- **Logo** (`src/components/brand/logo.tsx`): U·B:E·E redibujado en trazo monolínea; el punto superior de los dos puntos se enciende.
- **Firma visual** (`src/components/brand/filament.tsx`): la línea de luz ondulada que se dibuja al cargar y con el scroll.

## Contenido editable

Todo el contenido está en **`src/lib/data.ts`**. Antes de publicar, reemplazar los valores de demo:

- [ ] Precios de servicios (`SERVICES[].price`) y duraciones reales
- [ ] Horarios de cada sucursal (`BRANCHES[].hours`)
- [ ] Equipo real y qué servicios hace cada uno (`STAFF`)
- [ ] Productos, precios y fotos de la tienda (`PRODUCTS`)
- [ ] Beneficios y novedades del Club (`NEWS`)
- [ ] Fotos propias del salón y de trabajos (hoy son imágenes de Unsplash)

## Reservas: cómo funciona la demo

`src/lib/booking.ts` calcula los horarios libres según la duración total de los servicios elegidos y la agenda de cada profesional. En la demo cada profesional tiene una agenda de ejemplo generada de forma determinística y los turnos nuevos se guardan en el navegador (`localStorage`), por eso aparecen en `/panel` del mismo equipo.

Para producción, reemplazar `loadBookings` / `saveBooking` / `updateBookingStatus` por una base de datos compartida (por ejemplo Supabase) y sumar recordatorios automáticos por WhatsApp. La interfaz no cambia.

## Desarrollo

```bash
npm install
npm run dev
```

```bash
npm run build
```

Stack: Next.js 16 (App Router), React 19, Tailwind CSS 4, estructura shadcn (`src/components/ui`), Motion y Lenis.

Componentes de terceros en `src/components/ui`: `tilted-grid-hero` (galería curva) y `glyph-portal` (© Christian Katzmann, MIT).

---

Diseño y desarrollo: FluxWeb.
