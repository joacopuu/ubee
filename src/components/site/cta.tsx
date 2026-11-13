import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "line" | "glow" | "ink";

const styles: Record<Variant, string> = {
  solid: "bg-bone text-ink hover:bg-filament-soft",
  line: "border border-bone/25 text-bone hover:border-filament/70 hover:text-filament-soft",
  glow: "bg-ink text-filament-soft glow-filament hover:bg-walnut",
  ink: "bg-ink text-bone hover:bg-umber",
};

export function Cta({
  href,
  children,
  variant = "solid",
  className,
  arrow = true,
  external,
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  arrow?: boolean;
  external?: boolean;
} & Omit<React.ComponentProps<"a">, "href">) {
  const cls = cn(
    "press group inline-flex min-h-12 max-w-full items-center justify-center gap-3 rounded-full px-6 py-3 text-center label-wide !text-[0.6rem] sm:whitespace-nowrap",
    styles[variant],
    className,
  );
  const inner = (
    <>
      <span>{children}</span>
      {arrow ? (
        <ArrowRight
          className="size-3.5 transition-transform duration-300 ease-[var(--ease-out)] group-hover:translate-x-1"
          strokeWidth={1.6}
          aria-hidden
        />
      ) : null}
    </>
  );
  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a href={href} className={cls} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {inner}
    </Link>
  );
}
