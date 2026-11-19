import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/catalog";
import { db, schema } from "@/lib/db";
import { MAX_UPLOAD_BYTES, mediaUrl, storeFile } from "@/lib/uploads";

/** Inline image upload used by the admin ImageField and the Media library. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !(can(user.role, "media") || can(user.role, "posts") || can(user.role, "programs") || can(user.role, "projects"))) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "Files must be 8 MB or smaller." }, { status: 400 });
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const { storedName, mime } = await storeFile(buf);
    const alt = String(form?.get("alt") || "");
    const [row] = await db
      .insert(schema.media)
      .values({ fileName: file.name.slice(0, 200), storedName, mimeType: mime, size: buf.length, alt, uploadedBy: user.id })
      .returning();
    return NextResponse.json({ url: mediaUrl(row.id, row.fileName), id: row.id });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed." }, { status: 400 });
  }
}
