import { desc, eq } from "drizzle-orm";
import { FileText } from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ConfirmButton, CopyButton, SubmitButton } from "@/components/admin/client";
import { Flash, PageHeader, Panel } from "@/components/admin/kit";
import { requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { MAX_UPLOAD_BYTES, deleteStored, mediaUrl, storeFile } from "@/lib/uploads";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Media library" };

async function upload(fd: FormData) {
  "use server";
  const user = await requireUser("media");
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) redirect("/admin/media?error=Choose+at+least+one+file");
  const alt = String(fd.get("alt") || "").slice(0, 300);
  let failed = "";
  for (const file of files.slice(0, 10)) {
    if (file.size > MAX_UPLOAD_BYTES) {
      failed = `${file.name} is larger than 8 MB.`;
      continue;
    }
    try {
      const buf = Buffer.from(await file.arrayBuffer());
      const { storedName, mime } = await storeFile(buf);
      await db.insert(schema.media).values({ fileName: file.name.slice(0, 200), storedName, mimeType: mime, size: buf.length, alt, uploadedBy: user.id });
    } catch (e) {
      failed = `${file.name}: ${e instanceof Error ? e.message : "upload failed"}`;
    }
  }
  revalidatePath("/admin/media");
  redirect(failed ? `/admin/media?error=${encodeURIComponent(failed)}` : "/admin/media?ok=1");
}

async function remove(fd: FormData) {
  "use server";
  await requireUser("media");
  const id = Number(fd.get("id"));
  const row = await db.query.media.findFirst({ where: eq(schema.media.id, id) });
  if (row) {
    await db.delete(schema.media).where(eq(schema.media.id, id));
    await deleteStored(row.storedName);
  }
  redirect("/admin/media?ok=deleted");
}

export default async function MediaAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  await requireUser("media");
  const { ok, error } = await searchParams;
  const items = await db.select().from(schema.media).orderBy(desc(schema.media.createdAt)).limit(300);

  return (
    <>
      <PageHeader title="Media library" description="Upload images (PNG, JPEG, WebP, GIF) and PDF documents up to 8 MB. Copy a file's URL to use it in content or share a document." />
      <Flash ok={ok === "deleted" ? "File deleted." : ok ? "Upload complete." : undefined} error={error} />

      <Panel title="Upload files" className="mb-6">
        <form action={upload} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label htmlFor="files" className="label">Files</label>
            <input id="files" name="files" type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif,application/pdf" className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-accent-100 file:px-4 file:py-2 file:font-semibold file:text-brand-900" required />
          </div>
          <div>
            <label htmlFor="alt" className="label">Description (alt text)</label>
            <input id="alt" name="alt" className="input" placeholder="What the image shows" />
          </div>
          <SubmitButton variant="primary">Upload</SubmitButton>
        </form>
        <p className="mt-3 text-sm text-muted">Only upload photos of young people with documented consent, and guardian consent for anyone under 18.</p>
      </Panel>

      {items.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((m) => {
            const href = mediaUrl(m.id, m.fileName);
            return (
              <li key={m.id} className="overflow-hidden rounded-2xl border border-line bg-white">
                <a href={href} target="_blank" rel="noopener noreferrer" className="block aspect-[4/3] bg-accent-50">
                  {m.mimeType.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={href} alt={m.alt ?? ""} className="size-full object-cover" loading="lazy" />
                  ) : (
                    <span className="grid size-full place-items-center text-brand"><FileText className="size-10" aria-hidden="true" /></span>
                  )}
                </a>
                <div className="space-y-2 p-3">
                  <p className="truncate text-sm font-semibold" title={m.fileName}>{m.fileName}</p>
                  <p className="text-xs text-muted">{(m.size / 1024).toFixed(0)} KB · {formatDate(m.createdAt, { month: "short" })}</p>
                  <div className="flex items-center justify-between">
                    <CopyButton text={href} />
                    <form action={remove}><input type="hidden" name="id" value={m.id} /><ConfirmButton message="Delete this file? Pages using it will show a broken image.">Delete</ConfirmButton></form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-line bg-white p-12 text-center text-muted">No files uploaded yet.</div>
      )}
    </>
  );
}
