import "server-only";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db, schema } from "./db";

/** Field names used by the honeypot and timing checks in <PublicForm>. */
export const HONEYPOT_FIELD = "company_website";
export const STARTED_FIELD = "_started";

export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "local").trim();
}

/**
 * Fixed window rate limit stored in the database, so it works across
 * restarts and multiple server instances.
 * Returns true when the request is allowed.
 */
export async function rateLimit(bucket: string, limit: number, windowSeconds: number) {
  const key = `${bucket}:${await clientIp()}`;
  const resetAt = new Date(Date.now() + windowSeconds * 1000);
  const rows = await db
    .insert(schema.rateLimits)
    .values({ key, count: 1, resetAt })
    .onConflictDoUpdate({
      target: schema.rateLimits.key,
      set: {
        count: sql`CASE WHEN ${schema.rateLimits.resetAt} < now() THEN 1 ELSE ${schema.rateLimits.count} + 1 END`,
        resetAt: sql`CASE WHEN ${schema.rateLimits.resetAt} < now() THEN ${resetAt.toISOString()}::timestamptz ELSE ${schema.rateLimits.resetAt} END`,
      },
    })
    .returning({ count: schema.rateLimits.count });
  return (rows[0]?.count ?? 1) <= limit;
}

async function verifyTurnstile(token: string | undefined) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Not configured: rely on honeypot, timing and rate limits.
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: await clientIp() }),
    });
    const data = (await res.json()) as { success?: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}

export type SpamVerdict = { ok: true } | { ok: false; status: number; message: string };

/** Runs honeypot, timing, captcha and rate limit checks on a public submission. */
export async function checkSubmission(body: Record<string, unknown>, bucket: string, limit = 5, windowSeconds = 600): Promise<SpamVerdict> {
  if (typeof body[HONEYPOT_FIELD] === "string" && (body[HONEYPOT_FIELD] as string).length > 0) {
    // Pretend success to bots, store nothing.
    return { ok: false, status: 200, message: "ok" };
  }
  const started = Number(body[STARTED_FIELD]);
  if (!started || Date.now() - started < 2500) {
    return { ok: false, status: 400, message: "That was very fast. Please check the form and submit again." };
  }
  if (!(await verifyTurnstile(body["cf-turnstile-response"] as string | undefined))) {
    return { ok: false, status: 400, message: "We could not verify that you are human. Please try again." };
  }
  if (!(await rateLimit(bucket, limit, windowSeconds))) {
    return { ok: false, status: 429, message: "Too many submissions. Please wait a few minutes and try again." };
  }
  return { ok: true };
}
