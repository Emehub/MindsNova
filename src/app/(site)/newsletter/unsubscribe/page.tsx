import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/site/ui";
import { db, schema } from "@/lib/db";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };

type Props = { searchParams: Promise<{ token?: string; done?: string }> };

async function unsubscribe(formData: FormData) {
  "use server";
  const token = String(formData.get("token") || "");
  if (token) {
    await db
      .update(schema.subscribers)
      .set({ status: "unsubscribed", unsubscribedAt: new Date() })
      .where(eq(schema.subscribers.token, token));
  }
  redirect("/newsletter/unsubscribe?done=1");
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const { token, done } = await searchParams;
  const sub = token ? await db.query.subscribers.findFirst({ where: eq(schema.subscribers.token, token) }).catch(() => undefined) : undefined;

  return (
    <>
      <PageHero eyebrow="Newsletter" title={done ? "You have been unsubscribed." : "Unsubscribe from our newsletter"} />
      <section className="section pt-12">
        <div className="container-page max-w-xl">
          {done ? (
            <div className="card p-8">
              <p className="text-lg text-muted">You will not receive any more newsletter emails from us. Changed your mind? You can subscribe again at any time.</p>
              <Link href="/#newsletter" className="btn-outline mt-6">Subscribe again</Link>
            </div>
          ) : sub ? (
            // A button (not the link itself) unsubscribes, so email link scanners cannot unsubscribe people by accident.
            <form action={unsubscribe} className="card p-8">
              <input type="hidden" name="token" value={token} />
              <p className="text-lg text-muted">Confirm that you no longer want to receive emails at <strong className="text-brand-900">{sub.email}</strong>.</p>
              <button type="submit" className="btn-secondary mt-6">Unsubscribe</button>
            </form>
          ) : (
            <div className="card p-8">
              <p className="text-lg text-muted">This unsubscribe link is not valid. Please use the link from your most recent email, or contact us and we will remove you.</p>
              <Link href="/contact" className="btn-outline mt-6">Contact us</Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
