import { cn } from "@/lib/utils";

/**
 * UBEE wordmark, redrawn.
 *
 * Keeps what makes the original theirs — the U·B:E·E rhythm with the
 * middle colon, and MODERN HAIR STUDIO underneath — and modernises
 * the rest: monoline geometric letters drawn as strokes (crisp at any
 * size, no font dependency), optical spacing, and the black bar
 * replaced by open tracking. The upper dot of the colon can glow:
 * the one point of light in the mark, like the LED in the salon.
 */
export function Logo({
  className,
  tagline = false,
  glow = true,
  title = "UBEE Modern Hair Studio",
}: {
  className?: string;
  tagline?: boolean;
  glow?: boolean;
  title?: string;
}) {
  const h = tagline ? 128 : 92;
  return (
    <svg
      viewBox={`0 14 408 ${h}`}
      className={cn("block h-auto", className)}
      role="img"
      aria-label={title}
      fill="none"
    >
      <g stroke="currentColor" strokeWidth={4.6} strokeLinecap="butt" strokeLinejoin="miter">
        {/* U */}
        <path d="M6 20V68a32 32 0 0 0 64 0V20" />
        {/* B */}
        <path d="M126 100V20h36a20 20 0 0 1 0 40h-36m0 0h40a20 20 0 0 1 0 40h-40" />
        {/* E */}
        <path d="M294 20h-52v80h52M242 60h44" />
        {/* E */}
        <path d="M402 20h-52v80h52M350 60h44" />
      </g>
      <g fill="currentColor">
        <circle cx="98" cy="60" r="4.4" />
        <circle cx="214" cy="76" r="4.4" />
        <circle cx="322" cy="60" r="4.4" />
      </g>
      {/* the lit dot */}
      <circle cx="214" cy="44" r="4.4" fill={glow ? "var(--filament)" : "currentColor"} />
      {glow ? (
        <circle cx="214" cy="44" r="10" fill="var(--filament)" opacity="0.28" style={{ filter: "blur(4px)" }} />
      ) : null}
      {tagline ? (
        <text
          x="6"
          y="134"
          textLength="396"
          lengthAdjust="spacing"
          fill="currentColor"
          style={{ font: "700 12.5px var(--ff-wide), sans-serif", letterSpacing: "0.1em" }}
        >
          MODERN HAIR STUDIO
        </text>
      ) : null}
    </svg>
  );
}

/** Small monogram for tight places: U and the lit colon. */
export function Monogram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("block", className)} aria-hidden fill="none">
      <path d="M14 14v20a14 14 0 0 0 28 0V14" stroke="currentColor" strokeWidth="3.4" />
      <circle cx="52" cy="24" r="3" fill="var(--filament)" />
      <circle cx="52" cy="40" r="3" fill="currentColor" />
    </svg>
  );
}
