import { TECHNIQUES } from "@/lib/data";

/** Slow band of the salon's signature techniques. Constant motion → linear. */
export function TechniqueMarquee() {
  const items = [...TECHNIQUES.map((t) => t.name), "Color de autor", "Peinados de evento"];
  const row = (
    <ul className="flex shrink-0 items-center" aria-hidden>
      {items.map((name) => (
        <li key={name} className="flex items-center">
          <span className="display whitespace-nowrap px-8 text-[clamp(2rem,4.5vw,3.75rem)] italic text-bone/90">{name}</span>
          <span className="size-1.5 rounded-full bg-filament shadow-[0_0_12px_2px_rgba(240,190,116,0.6)]" />
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label="Técnicas" className="relative overflow-hidden border-y border-bone/[0.07] py-8 md:py-10">
      <p className="sr-only">Técnicas: {items.join(", ")}</p>
      <div
        className="flex w-max animate-marquee motion-reduce:animate-none"
        style={{ ["--marquee-duration" as string]: "48s" }}
      >
        {row}
        {row}
      </div>
    </section>
  );
}
