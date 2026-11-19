import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ConfirmButton, SubmitButton } from "@/components/admin/client";
import { Flash, PageHeader, Panel } from "@/components/admin/kit";
import { requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { slugify } from "@/lib/utils";

export const metadata = { title: "Impact statistics" };

async function saveMetrics(fd: FormData) {
  "use server";
  await requireUser("impact");
  const ids = fd.getAll("id").map(Number);
  for (const id of ids) {
    const raw = String(fd.get(`value-${id}`) ?? "").replace(/[,\s]/g, "");
    const value = raw === "" ? null : Math.max(0, Math.floor(Number(raw)));
    const verified = fd.get(`verified-${id}`) === "on" && value !== null && !Number.isNaN(value);
    await db
      .update(schema.impactMetrics)
      .set({
        label: String(fd.get(`label-${id}`) || "").trim().slice(0, 120) || "Metric",
        value: Number.isNaN(value) ? null : value,
        suffix: String(fd.get(`suffix-${id}`) || "").slice(0, 4),
        verified,
        visible: fd.get(`visible-${id}`) === "on",
        sortOrder: Number(fd.get(`sort-${id}`)) || 0,
        updatedAt: new Date(),
      })
      .where(eq(schema.impactMetrics.id, id));
  }
  revalidatePath("/", "layout");
  redirect("/admin/impact?ok=1");
}

async function addMetric(fd: FormData) {
  "use server";
  await requireUser("impact");
  const label = String(fd.get("label") || "").trim().slice(0, 120);
  if (!label) redirect("/admin/impact");
  await db.insert(schema.impactMetrics).values({ key: `${slugify(label)}-${Date.now()}`, label, verified: false, sortOrder: 99 });
  redirect("/admin/impact?ok=added");
}

async function deleteMetric(fd: FormData) {
  "use server";
  await requireUser("impact");
  await db.delete(schema.impactMetrics).where(eq(schema.impactMetrics.id, Number(fd.get("id"))));
  revalidatePath("/", "layout");
  redirect("/admin/impact?ok=deleted");
}

export default async function ImpactAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireUser("impact");
  const { ok } = await searchParams;
  const metrics = await db.select().from(schema.impactMetrics).orderBy(asc(schema.impactMetrics.sortOrder));
  const live = metrics.filter((m) => m.verified && m.visible && m.value !== null).length;

  return (
    <>
      <PageHeader
        title="Impact statistics"
        description={<>The homepage impact section only shows metrics that are <strong>verified</strong> and <strong>visible</strong>. It stays hidden until at least one is. Currently showing: <strong>{live}</strong>.</>}
      />
      <Flash ok={ok ? (ok === "deleted" ? "Metric deleted." : ok === "added" ? "Metric added. Enter its value and verify it to show it." : "Impact statistics saved.") : undefined} />

      <form action={saveMetrics}>
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-line bg-accent-50 text-left text-xs uppercase tracking-wider text-muted">
              <tr><th className="px-4 py-3">Label</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Suffix</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Verified</th><th className="px-4 py-3">Visible</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {metrics.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3"><input type="hidden" name="id" value={m.id} /><label className="sr-only" htmlFor={`label-${m.id}`}>Label</label><input id={`label-${m.id}`} name={`label-${m.id}`} defaultValue={m.label} className="input" /></td>
                  <td className="px-4 py-3"><label className="sr-only" htmlFor={`value-${m.id}`}>Value</label><input id={`value-${m.id}`} name={`value-${m.id}`} inputMode="numeric" defaultValue={m.value ?? ""} placeholder="Not set" className="input w-32" /></td>
                  <td className="px-4 py-3"><label className="sr-only" htmlFor={`suffix-${m.id}`}>Suffix</label><input id={`suffix-${m.id}`} name={`suffix-${m.id}`} defaultValue={m.suffix} placeholder="+ or %" className="input w-20" /></td>
                  <td className="px-4 py-3"><label className="sr-only" htmlFor={`sort-${m.id}`}>Order</label><input id={`sort-${m.id}`} name={`sort-${m.id}`} type="number" defaultValue={m.sortOrder} className="input w-20" /></td>
                  <td className="px-4 py-3"><input aria-label={`${m.label} verified`} type="checkbox" name={`verified-${m.id}`} defaultChecked={m.verified} className="size-5 accent-brand" /></td>
                  <td className="px-4 py-3"><input aria-label={`${m.label} visible`} type="checkbox" name={`visible-${m.id}`} defaultChecked={m.visible} className="size-5 accent-brand" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-muted">Only tick &ldquo;Verified&rdquo; for figures backed by records, such as attendance registers or program reports.</p>
        <div className="mt-4"><SubmitButton variant="primary">Save statistics</SubmitButton></div>
      </form>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Panel title="Add a metric">
          <form action={addMetric} className="flex gap-2">
            <label htmlFor="new-label" className="sr-only">Label</label>
            <input id="new-label" name="label" placeholder="For example: Schools reached" className="input" required />
            <SubmitButton>Add</SubmitButton>
          </form>
        </Panel>
        <Panel title="Remove a metric">
          <ul className="space-y-2">
            {metrics.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3">
                <span className="text-sm">{m.label}</span>
                <form action={deleteMetric}><input type="hidden" name="id" value={m.id} /><ConfirmButton>Remove</ConfirmButton></form>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
