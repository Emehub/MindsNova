import { randomBytes } from "node:crypto";

export { cn } from "./cn";

export function siteUrl(path = "") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return base + path;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const TZ = "Africa/Accra";

export function formatDate(d: Date | string | null | undefined, opts: Intl.DateTimeFormatOptions = {}) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d.length === 10 ? d + "T00:00:00Z" : d) : d;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: TZ, ...opts }).format(date);
}

export function formatDateTime(d: Date | string | null | undefined) {
  return formatDate(d, { hour: "2-digit", minute: "2-digit" });
}

/** Human friendly application reference, e.g. MNH-7K3Q9P. No ambiguous characters. */
export function makeReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `MNH-${out}`;
}

export function randomToken(bytes = 24) {
  return randomBytes(bytes).toString("base64url");
}

export function lines(text: string) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export function readingTime(markdown: string) {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
