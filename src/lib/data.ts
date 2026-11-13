/* ─────────────────────────────────────────────────────────────
 * UBEE — contenido del sitio
 * Todo lo editable vive acá. Las sucursales, teléfonos, técnicas
 * y textos salen del Instagram y WhatsApp de UBEE. Los precios,
 * horarios, equipo y productos son VALORES DE DEMO: reemplazar
 * por los reales antes de publicar.
 * ───────────────────────────────────────────────────────────── */

/**
 * Image source. Accepts an Unsplash photo id (demo images), or any full URL
 * / data URL — which is what the panel stores when the salon uploads a photo.
 */
export const img = (id: string, w = 1200, h?: number) => {
  if (/^(https?:|data:|blob:|\/)/.test(id)) return id;
  return `https://images.unsplash.com/photo-${id}?w=${w}${h ? `&h=${h}` : ""}&q=78&auto=format&fit=crop`;
};

export const LINKS = {
  instagram: "https://www.instagram.com/ubeepeluqueria/",
  club: "https://whatsapp.com/channel/0029VbCQwH189inbG7CM5p1c",
};

export const wa = (phone: string, text: string) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

/* ── Sucursales ─────────────────────────────────────────────── */

export type BranchId = "cordoba" | "carlos-paz";

export type Branch = {
  id: BranchId;
  name: string;
  area: string;
  address: string;
  city: string;
  whatsapp: string;
  phoneLabel: string;
  email: string;
  maps: string;
  image: string;
  /** DEMO: confirmar horarios reales. 0 = domingo. */
  hours: { days: number[]; open: number; close: number; label: string };
};

export const BRANCHES: Branch[] = [
  {
    id: "cordoba",
    name: "Córdoba",
    area: "Valle Escondido",
    address: "Av. República de China 1450, local 3",
    city: "Córdoba Capital",
    whatsapp: "5493518620700",
    phoneLabel: "351 862-0700",
    email: "ubee.cba@gmail.com",
    maps: "https://www.google.com/maps/search/?api=1&query=UBEE+Peluquer%C3%ADa+Av.+Rep%C3%BAblica+de+China+1450+C%C3%B3rdoba",
    image: "1790009419892-f6f3fd516fb2",
    hours: { days: [1, 2, 3, 4, 5, 6], open: 9, close: 20, label: "Lun a sáb · 9 a 20 h" },
  },
  {
    id: "carlos-paz",
    name: "Villa Carlos Paz",
    area: "Centro",
    address: "Alberdi 154",
    city: "Villa Carlos Paz",
    whatsapp: "5493541649604",
    phoneLabel: "3541 64-9604",
    email: "ubee.vcp@gmail.com",
    maps: "https://www.google.com/maps/search/?api=1&query=UBEE+Peluquer%C3%ADa+Alberdi+154+Villa+Carlos+Paz",
    image: "1774660810725-fb04e002003d",
    hours: { days: [1, 2, 3, 4, 5, 6], open: 9, close: 20, label: "Lun a sáb · 9 a 20 h" },
  },
];

export const branchById = (id: string) => BRANCHES.find((b) => b.id === id);

/* ── Servicios ──────────────────────────────────────────────── */

export type CategoryId = "color" | "corte" | "peinado" | "tratamiento";

export const CATEGORIES: { id: CategoryId; name: string; blurb: string; image: string }[] = [
  {
    id: "color",
    name: "Color",
    blurb: "Rubios, balayage y color de autor",
    image: "1605980766335-d3a41c7332a1",
  },
  {
    id: "corte",
    name: "Corte",
    blurb: "Cortes a medida, con asesoramiento",
    image: "1761931403671-d020a14928d9",
  },
  {
    id: "peinado",
    name: "Peinados",
    blurb: "Blowout, ondas y looks de evento",
    image: "1629397685944-7073f5589754",
  },
  {
    id: "tratamiento",
    name: "Tratamientos",
    blurb: "Nutrición y reparación post-color",
    image: "1634449571010-02389ed0f9b0",
  },
];

export type Service = {
  id: string;
  category: CategoryId;
  name: string;
  description: string;
  /** minutos */
  duration: number;
  /** DEMO: precio "desde", en pesos */
  price: number;
  signature?: boolean;
  active?: boolean;
};

export const SERVICES: Service[] = [
  {
    id: "sunkiss",
    category: "color",
    name: "Sunkiss",
    description: "Mechas suaves y naturales. Aclara hasta dos tonos, sin decoloración y sin amoníaco.",
    duration: 150,
    price: 95000,
    signature: true,
  },
  {
    id: "free-hands-balayage",
    category: "color",
    name: "Free Hands Balayage",
    description: "Aclaración a mano alzada, sin papel ni bandas térmicas. Contraste suave y crecimiento natural.",
    duration: 210,
    price: 140000,
    signature: true,
  },
  {
    id: "blonde-ice",
    category: "color",
    name: "Blonde Ice",
    description: "Rubio extra claro, frío y luminoso, con un efecto perlado que se acerca al blanco.",
    duration: 240,
    price: 165000,
    signature: true,
  },
  {
    id: "french-blending",
    category: "color",
    name: "French Blending",
    description: "Rubios luminosos que conviven con tus canas, con una transición suave y un crecimiento prolijo.",
    duration: 180,
    price: 130000,
    signature: true,
  },
  {
    id: "color-autor",
    category: "color",
    name: "Color de autor",
    description: "Diagnóstico y color a medida: global, reflejos o corrección de color.",
    duration: 120,
    price: 72000,
  },
  {
    id: "retoque-raiz",
    category: "color",
    name: "Retoque de raíz",
    description: "Mantenimiento de color en el crecimiento, con matiz incluido.",
    duration: 90,
    price: 48000,
  },
  {
    id: "corte-personalizado",
    category: "corte",
    name: "Corte personalizado",
    description: "Asesoramiento según tu rostro y textura, lavado y terminación.",
    duration: 60,
    price: 28000,
  },
  {
    id: "long-bob",
    category: "corte",
    name: "Long bob desfilado",
    description: "Puntas suavemente desfiladas que le dan movimiento a cada onda.",
    duration: 60,
    price: 30000,
  },
  {
    id: "corte-masculino",
    category: "corte",
    name: "Corte masculino",
    description: "Corte, perfilado y styling.",
    duration: 45,
    price: 20000,
  },
  {
    id: "blowout",
    category: "peinado",
    name: "Blowout",
    description: "El volumen de los 90: raíces con cuerpo, ondas suaves y puntas con movimiento.",
    duration: 60,
    price: 26000,
    signature: true,
  },
  {
    id: "brushing",
    category: "peinado",
    name: "Brushing",
    description: "Lavado y brushing con terminación lisa o con movimiento.",
    duration: 45,
    price: 18000,
  },
  {
    id: "peinado-evento",
    category: "peinado",
    name: "Peinado de evento",
    description: "Ondas con aire de los 70 y los 90, recogidos y looks para fiestas o novias.",
    duration: 90,
    price: 45000,
  },
  {
    id: "nutricion",
    category: "tratamiento",
    name: "Nutrición profunda",
    description: "Hidratación intensiva con ampolla y sellado de cutícula.",
    duration: 45,
    price: 25000,
  },
  {
    id: "reconstruccion",
    category: "tratamiento",
    name: "Reconstrucción post-color",
    description: "Repara la fibra después de aclaraciones y decoloraciones.",
    duration: 60,
    price: 35000,
  },
  {
    id: "alisado",
    category: "tratamiento",
    name: "Alisado orgánico",
    description: "Reduce el frizz y alisa sin formol. Incluye diagnóstico previo.",
    duration: 180,
    price: 110000,
  },
];

export const serviceById = (id: string) => SERVICES.find((s) => s.id === id);

/* ── Equipo (DEMO: reemplazar por el equipo real) ───────────── */

export type Staff = {
  id: string;
  name: string;
  role: string;
  branches: BranchId[];
  skills: CategoryId[];
};

export const STAFF: Staff[] = [
  { id: "sofia", name: "Sofía", role: "Colorista senior", branches: ["cordoba"], skills: ["color", "tratamiento"] },
  { id: "camila", name: "Camila", role: "Balayage y rubios", branches: ["cordoba"], skills: ["color", "peinado", "tratamiento"] },
  { id: "lucas", name: "Lucas", role: "Corte y barbería", branches: ["cordoba"], skills: ["corte", "peinado"] },
  { id: "valentina", name: "Valentina", role: "Peinados y eventos", branches: ["carlos-paz"], skills: ["peinado", "corte", "tratamiento"] },
  { id: "agustina", name: "Agustina", role: "Colorista", branches: ["carlos-paz"], skills: ["color", "tratamiento"] },
  { id: "mateo", name: "Mateo", role: "Corte y color", branches: ["carlos-paz"], skills: ["corte", "color"] },
];

export const staffById = (id: string) => STAFF.find((s) => s.id === id);

/* ── Técnicas firma (del Instagram de UBEE) ─────────────────── */

export const TECHNIQUES = [
  {
    id: "sunkiss",
    name: "Sunkiss",
    kicker: "Luz sin decoloración",
    text: "No siempre hace falta una aclaración intensa para darle luminosidad al cabello. Mechas suaves que aclaran hasta dos tonos, conservando profundidad y un contraste muy sutil. Sin decoloración, sin amoníaco.",
    image: "1605980625458-21e4d9c29c4c",
  },
  {
    id: "free-hands-balayage",
    name: "Free Hands Balayage",
    kicker: "A mano alzada",
    text: "Una de nuestras formas favoritas de iluminar. Sin papel de aluminio ni bandas térmicas: el color se pinta a mano para lograr un contraste suave y un resultado muy natural.",
    image: "1554519934-e32b1629d9ee",
  },
  {
    id: "blonde-ice",
    name: "Blonde Ice",
    kicker: "Rubio perlado",
    text: "Un rubio extra claro, frío y luminoso, con ese efecto perlado que se acerca al blanco. Con un long bob personalizado, cada onda destaca todavía más el color.",
    image: "1516018648631-0a79b7ea609c",
  },
  {
    id: "french-blending",
    name: "French Blending",
    kicker: "Rubios que conviven con tus canas",
    text: "Mechas bien claras con una transición suave que integra las canas al color. Ideal si querés dejar de taparlas por completo, con un rubio luminoso y un crecimiento prolijo.",
    image: "1605980625600-88b46abafa8d",
  },
  {
    id: "blowout",
    name: "Blowout",
    kicker: "El volumen de los 90",
    text: "Inspirado en los peinados icónicos de los 90: raíces con volumen, ondas suaves y puntas con movimiento. Una tendencia que se adapta a distintos largos y texturas.",
    image: "1533661338746-e4e47d30dfd8",
  },
];

/* ── Trabajos (galería) ─────────────────────────────────────── */

export const WORKS = [
  { id: "1554519934-e32b1629d9ee", alt: "Balayage rubio con ondas largas" },
  { id: "1605980766335-d3a41c7332a1", alt: "Rubio cenizo con ondas" },
  { id: "1638064432604-8da1fc75de09", alt: "Castaño iluminado con ondas al agua" },
  { id: "1658322558683-2524c9b62d04", alt: "Long bob cobrizo con puntas iluminadas" },
  { id: "1605980625600-88b46abafa8d", alt: "French blending sobre canas" },
  { id: "1497433550656-7fb185be365e", alt: "Rubio dorado con volumen" },
  { id: "1533661338746-e4e47d30dfd8", alt: "Ondas con volumen estilo blowout" },
  { id: "1605980625458-21e4d9c29c4c", alt: "Sunkiss en castaño" },
  { id: "1519421692594-d7a3f3e3fe5f", alt: "Rubio liso y luminoso" },
  { id: "1522337360788-8b13dee7a37e", alt: "Castaño con reflejos miel" },
  { id: "1785456283212-338f5bc44d50", alt: "Balayage miel en ondas" },
  { id: "1560264641-1b5191cc63e2", alt: "Rulos cobrizos definidos" },
];

/* ── Club de beneficios / Novedades ─────────────────────────── */

export type NewsType = "novedad" | "beneficio" | "oportunidad" | "workshop";

export const NEWS_TYPES: { id: NewsType | "todo"; label: string }[] = [
  { id: "todo", label: "Todo" },
  { id: "novedad", label: "Novedades" },
  { id: "beneficio", label: "Beneficios" },
  { id: "oportunidad", label: "Oportunidades" },
  { id: "workshop", label: "Workshops" },
];

/* DEMO: los beneficios y fechas son ejemplos para mostrar la sección. */
export type NewsItem = {
  id: string;
  type: NewsType;
  title: string;
  text: string;
  date: string;
  image: string;
  cta: { label: string; href: string };
  members?: boolean;
  published?: boolean;
};

export const NEWS: NewsItem[] = [
  {
    id: "workshop-balayage",
    type: "workshop",
    title: "Workshop de Balayage francés",
    text: "Formación intensiva para profesionales: aclaración a mano alzada, diagnóstico y matización. Cupos limitados.",
    date: "2026-11-28",
    image: "1629397685944-7073f5589754",
    cta: { label: "Consultar cupos", href: "wa:cordoba:Hola! Quiero consultar por el Workshop de Balayage." },
  },
  {
    id: "beneficio-martes",
    type: "beneficio",
    title: "Martes de tratamiento",
    text: "Miembros del Club: 20% en Nutrición profunda todos los martes, en las dos sucursales.",
    date: "2026-11-10",
    image: "1634449571010-02389ed0f9b0",
    cta: { label: "Reservar un martes", href: "/reservar?servicio=nutricion" },
    members: true,
  },
  {
    id: "sunkiss",
    type: "novedad",
    title: "Llegó Sunkiss",
    text: "Luz sin decoloración ni amoníaco: hasta dos tonos más claro, conservando profundidad.",
    date: "2026-11-07",
    image: "1605980625458-21e4d9c29c4c",
    cta: { label: "Reservar Sunkiss", href: "/reservar?servicio=sunkiss" },
  },
  {
    id: "ultimo-momento",
    type: "oportunidad",
    title: "Turnos de último momento",
    text: "Cada semana liberamos turnos con precio especial. Se publican primero en el canal del Club.",
    date: "2026-11-05",
    image: "1580618672591-eb180b1a973f",
    cta: { label: "Unirme al canal", href: "club" },
    members: true,
  },
  {
    id: "cumple",
    type: "beneficio",
    title: "Tu cumpleaños, en UBEE",
    text: "Brushing de regalo en la semana de tu cumpleaños con cualquier servicio de color.",
    date: "2026-11-01",
    image: "1497433550656-7fb185be365e",
    cta: { label: "Ver servicios de color", href: "/#servicios" },
    members: true,
  },
  {
    id: "buscamos",
    type: "novedad",
    title: "En UBEE estamos creciendo",
    text: "Buscamos peluqueros y peluqueras para nuestro equipo. Mandá tu CV por mail a la sucursal que prefieras.",
    date: "2026-11-01",
    image: "1626379501846-0df4067b8bb9",
    cta: { label: "Enviar CV", href: "mailto:ubee.cba@gmail.com?subject=CV%20-%20Quiero%20trabajar%20en%20UBEE" },
  },
];

/* ── Tienda (DEMO: reemplazar por los productos reales) ─────── */

export type Product = {
  id: string;
  name: string;
  line: string;
  category: string;
  size: string;
  price: number;
  image: string;
  note: string;
  active?: boolean;
};

/** What the salon edits from the panel. Branches and team stay in code. */
export type Content = { services: Service[]; products: Product[]; news: NewsItem[] };

export function staticContent(): Content {
  return { services: SERVICES, products: PRODUCTS, news: NEWS };
}

export const PRODUCT_CATEGORIES = ["Todo", "Rubios", "Hidratación", "Reparación", "Styling", "Herramientas"];

export const PRODUCTS: Product[] = [
  {
    id: "shampoo-matizador",
    name: "Shampoo matizador",
    line: "Rubios",
    category: "Rubios",
    size: "300 ml",
    price: 24500,
    image: "1580870069867-74c57ee1bb07",
    note: "Neutraliza tonos amarillos. Ideal después de Blonde Ice.",
  },
  {
    id: "mascara-perla",
    name: "Máscara perla",
    line: "Rubios",
    category: "Rubios",
    size: "250 ml",
    price: 31800,
    image: "1608248543803-ba4f8c70ae0b",
    note: "Matiza y nutre en una sola pasada.",
  },
  {
    id: "shampoo-hidratante",
    name: "Shampoo hidratante",
    line: "Hidratación",
    category: "Hidratación",
    size: "300 ml",
    price: 21900,
    image: "1786725009844-3daea6bd1fb0",
    note: "Limpieza suave para uso diario.",
  },
  {
    id: "acondicionador-nutritivo",
    name: "Acondicionador nutritivo",
    line: "Hidratación",
    category: "Hidratación",
    size: "300 ml",
    price: 22900,
    image: "1760895535234-2c39c57cf187",
    note: "Desenreda y deja el cabello liviano.",
  },
  {
    id: "aceite-puntas",
    name: "Aceite de puntas",
    line: "Reparación",
    category: "Reparación",
    size: "50 ml",
    price: 27400,
    image: "1567721913486-6585f069b332",
    note: "Sella puntas abiertas y suma brillo.",
  },
  {
    id: "reconstructor",
    name: "Tratamiento reconstructor",
    line: "Reparación",
    category: "Reparación",
    size: "200 ml",
    price: 36500,
    image: "1786737554096-4b22c03ad991",
    note: "Para cabellos aclarados o decolorados.",
  },
  {
    id: "protector-termico",
    name: "Protector térmico",
    line: "Styling",
    category: "Styling",
    size: "200 ml",
    price: 19800,
    image: "1780952934157-f541e70c7ece",
    note: "Protege hasta 230 °C. Antes de planchita o buclera.",
  },
  {
    id: "kit-cepillos",
    name: "Kit de cepillos",
    line: "Herramientas",
    category: "Herramientas",
    size: "3 piezas",
    price: 42000,
    image: "1527799820374-dcf8d9d4a388",
    note: "Los mismos que usamos para el blowout.",
  },
];

/* ── Utilidades ─────────────────────────────────────────────── */

export const money = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

export const minutes = (m: number) => {
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (!h) return `${r} min`;
  return r ? `${h} h ${r} min` : `${h} h`;
};
