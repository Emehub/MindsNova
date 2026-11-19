/** Serves files uploaded through the admin Media library. */
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { readStored } from "@/lib/uploads";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const n = Number(id);
  if (!Number.isInteger(n)) return new Response("Not found", { status: 404 });
  const row = await db.query.media.findFirst({ where: eq(schema.media.id, n) });
  if (!row) return new Response("Not found", { status: 404 });
  try {
    const buf = await readStored(row.storedName);
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": row.mimeType,
        "Content-Length": String(buf.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `${row.mimeType === "application/pdf" ? "inline" : "inline"}; filename="${row.fileName.replace(/"/g, "")}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
