import { desc } from "drizzle-orm";
import { Badge, PageHeader } from "@/components/admin/kit";
import { requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Email log" };

export default async function EmailLog() {
  await requireUser("email_log");
  const rows = await db.select().from(schema.emailLog).orderBy(desc(schema.emailLog.createdAt)).limit(200);
  const configured = !!process.env.SMTP_HOST;
  return (
    <>
      <PageHeader title="Email log" description="Every email the website has sent or tried to send. The latest 200 are shown." />
      {!configured ? (
        <div role="status" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Email sending is not configured.</strong> Messages below were recorded but not delivered. Add SMTP settings to the server environment (see README) to start sending.
        </div>
      ) : null}
      {rows.length ? (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-2xl border border-line bg-white">
              <details>
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{r.subject}</span>
                    <span className="block truncate text-sm text-muted">To {r.to}</span>
                  </span>
                  <span className="text-sm text-muted">{formatDateTime(r.createdAt)}</span>
                  <Badge tone={r.status === "sent" ? "success" : r.status === "failed" ? "danger" : "warning"}>
                    {r.status === "sent" ? "Sent" : r.status === "failed" ? "Failed" : "Not sent"}
                  </Badge>
                </summary>
                <div className="border-t border-line p-4">
                  {r.error ? <p className="mb-3 text-sm font-semibold text-red-700">{r.error}</p> : null}
                  <pre className="whitespace-pre-wrap font-sans text-sm">{r.body}</pre>
                </div>
              </details>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-line bg-white p-12 text-center text-muted">No emails yet.</div>
      )}
    </>
  );
}
