import type { SocialSettings } from "@/lib/settings";

/** Brand icons drawn as simple paths (lucide no longer ships brand logos). */
const PATHS: Record<keyof SocialSettings, { label: string; d: string }> = {
  linkedin: { label: "LinkedIn", d: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.8v1.6h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5c0-1.2-.02-2.73-1.66-2.73-1.67 0-1.92 1.3-1.92 2.64V21h-4V9.75Z" },
  instagram: { label: "Instagram", d: "M12 7.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2Zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm5.85-7.8a1.07 1.07 0 1 1-2.15 0 1.07 1.07 0 0 1 2.15 0ZM12 3.6c2.73 0 3.06.01 4.14.06 2.77.13 4.07 1.44 4.2 4.2.05 1.08.06 1.4.06 4.14s-.01 3.06-.06 4.14c-.13 2.76-1.43 4.07-4.2 4.2-1.08.05-1.4.06-4.14.06s-3.06-.01-4.14-.06c-2.78-.13-4.07-1.44-4.2-4.2C3.61 15.06 3.6 14.73 3.6 12s.01-3.06.06-4.14c.13-2.77 1.43-4.07 4.2-4.2C8.94 3.61 9.27 3.6 12 3.6ZM12 2c-2.72 0-3.06.01-4.13.06-3.63.17-5.65 2.18-5.82 5.82C2.01 8.94 2 9.28 2 12s.01 3.06.06 4.13c.17 3.63 2.18 5.65 5.82 5.82 1.07.04 1.4.05 4.12.05s3.06-.01 4.13-.06c3.62-.17 5.66-2.18 5.82-5.82.05-1.06.05-1.4.05-4.12s-.01-3.06-.06-4.13c-.16-3.62-2.18-5.65-5.82-5.82C15.06 2.01 14.72 2 12 2Z" },
  x: { label: "X", d: "M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43Z" },
  facebook: { label: "Facebook", d: "M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22C18.34 21.24 22 17.08 22 12.06Z" },
  youtube: { label: "YouTube", d: "M21.58 7.19a2.5 2.5 0 0 0-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42A2.5 2.5 0 0 0 2.42 7.2C2 8.75 2 12 2 12s0 3.25.42 4.81a2.5 2.5 0 0 0 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42a2.5 2.5 0 0 0 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81ZM10 15V9l5.2 3L10 15Z" },
  tiktok: { label: "TikTok", d: "M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48Z" },
};

export function SocialLinks({
  social,
  className = "",
  tone = "dark",
  variant = "filled",
}: {
  social: SocialSettings;
  className?: string;
  tone?: "dark" | "light";
  /** "plain" shows bare icons, as in the site header. */
  variant?: "filled" | "plain";
}) {
  const items = (Object.keys(PATHS) as (keyof SocialSettings)[]).filter((k) => social[k]);
  if (items.length === 0) return null;
  const color =
    variant === "plain"
      ? tone === "light" ? "text-white/80 hover:text-white" : "text-ink hover:text-accent"
      : tone === "light" ? "bg-white/10 text-white hover:bg-white/20" : "bg-accent-100 text-brand hover:bg-accent-200";
  const size = variant === "plain" ? "size-8" : "size-10";
  return (
    <ul className={`flex flex-wrap ${variant === "plain" ? "gap-1" : "gap-2"} ${className}`}>
      {items.map((k) => (
        <li key={k}>
          <a href={social[k]} target="_blank" rel="noopener noreferrer" aria-label={`MindsNova Hub on ${PATHS[k].label}`}
            className={`grid ${size} place-items-center rounded-full transition-colors ${color}`}>
            <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden="true"><path d={PATHS[k].d} /></svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
