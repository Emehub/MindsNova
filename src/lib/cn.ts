/** Joins class names, skipping falsy values. Safe for client components. */
export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}
