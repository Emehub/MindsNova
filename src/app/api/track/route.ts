/**
 * Privacy friendly page view counter. Stores only the path and the day.
 * No cookies, no IP addresses, no personal data.
 */
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse/i;

export async function POST(req: Request) {
  try {
    if (BOT.test(req.headers.get("user-agent") || "")) return new NextResponse(null, { status: 204 });
    const { path } = (await req.json()) as { path?: string };
    if (!path || typeof path !== "string" || !path.startsWith("/") || path.startsWith("/admin") || path.length > 200)
      return new NextResponse(null, { status: 204 });
    const clean = path.split("?")[0].split("#")[0];
    const day = new Date().toISOString().slice(0, 10);
    await db
      .insert(schema.pageViews)
      .values({ path: clean, day, views: 1 })
      .onConflictDoUpdate({
        target: [schema.pageViews.path, schema.pageViews.day],
        set: { views: sql`${schema.pageViews.views} + 1` },
      });
  } catch {
    // Analytics must never break the site.
  }
  return new NextResponse(null, { status: 204 });
}
