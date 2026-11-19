import { cn } from "@/lib/cn";

/**
 * The Minds Nova mark: a bright star with an orbit and gold sparkles on the
 * violet gradient tile. Source files live in /public/brand (copied from the
 * Minds Nova site assets). The mark carries its own background, so it works
 * on light and dark surfaces alike.
 */
export function LogoMark({ className }: { className?: string; inverted?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/minds-nova-mark.svg" alt="" width={48} height={48} className={cn("shrink-0", className)} aria-hidden="true" />
  );
}

/** Mark plus wordmark, styled like the Minds Nova logo: "Minds" solid, "Nova" in gradient. */
export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="size-10" />
      <span className="flex flex-col leading-none">
        <span className={cn("font-display text-xl font-extrabold tracking-tight", inverted ? "text-white" : "text-ink")}>
          Minds
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: inverted ? "linear-gradient(90deg,#a8a4ff,#c4b5fd)" : "linear-gradient(90deg,#5b5ce2,#8b5cf6)" }}
          >
            Nova
          </span>
        </span>
        <span className={cn("mt-1 text-[0.62rem] font-bold uppercase tracking-[0.22em]", inverted ? "text-white/60" : "text-muted")}>Hub</span>
      </span>
    </span>
  );
}
