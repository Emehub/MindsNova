import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, PageHero, PostCard } from "@/components/site/ui";
import { RESOURCE_CATEGORIES, resourceCategory } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { getPosts } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Technology articles, career guidance, digital skills tutorials, AI education, scholarships, internships and event announcements from MindsNova Hub.",
  alternates: { canonical: "/resources" },
};

type Props = { searchParams: Promise<{ category?: string; q?: string; page?: string }> };

export default async function ResourcesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const category = sp.category && resourceCategory(sp.category) ? sp.category : undefined;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const page = Math.max(1, Number(sp.page) || 1);
  const { rows, total, pages } = await getPosts({ category, q, page });

  const href = (o: { category?: string; q?: string; page?: number }) => {
    const p = new URLSearchParams();
    if (o.category) p.set("category", o.category);
    if (o.q) p.set("q", o.q);
    if (o.page && o.page > 1) p.set("page", String(o.page));
    const s = p.toString();
    return `/resources${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHero
        eyebrow="Resource centre"
        title="Learn, explore and grow."
        intro="Articles, tutorials, career guidance and opportunities to help you keep learning and take your next step in technology."
      >
        <form action="/resources" role="search" className="flex max-w-xl gap-2">
          {category ? <input type="hidden" name="category" value={category} /> : null}
          <label htmlFor="q" className="sr-only">Search resources</label>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input id="q" name="q" type="search" defaultValue={q} placeholder="Search articles, tutorials and opportunities" className="input pl-12" />
          </div>
          <button type="submit" className="btn-secondary">Search</button>
        </form>
      </PageHero>

      <section className="section pt-10">
        <div className="container-page">
          <nav aria-label="Resource categories">
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link href={href({ q })} aria-current={!category ? "page" : undefined}
                  className={cn("inline-flex rounded-full border px-4 py-2 text-sm font-semibold", !category ? "border-brand bg-brand text-white" : "border-line text-brand-900 hover:border-brand hover:bg-accent-50")}>
                  All
                </Link>
              </li>
              {RESOURCE_CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link href={href({ category: c.slug, q })} aria-current={category === c.slug ? "page" : undefined}
                    className={cn("inline-flex rounded-full border px-4 py-2 text-sm font-semibold", category === c.slug ? "border-brand bg-brand text-white" : "border-line text-brand-900 hover:border-brand hover:bg-accent-50")}>
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <p className="mt-8 text-sm text-muted" role="status">
            {q ? <>Showing {total} result{total === 1 ? "" : "s"} for &ldquo;{q}&rdquo;{category ? ` in ${resourceCategory(category)?.title}` : ""}. </> : null}
            {q ? <Link href={href({ category })} className="link">Clear search</Link> : null}
          </p>

          {rows.length ? (
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{rows.map((p) => <PostCard key={p.id} post={p} />)}</div>
          ) : (
            <div className="mt-6">
              <EmptyState
                title={q ? "No results found" : "Resources are coming soon"}
                action={q ? <Link href="/resources" className="btn-outline">View all resources</Link> : <Link href="/#newsletter" className="btn-primary">Subscribe for updates</Link>}
              >
                {q ? "Try different keywords or browse a category." : "We are preparing articles, tutorials and opportunities. Subscribe to hear when new resources are published."}
              </EmptyState>
            </div>
          )}

          {pages > 1 ? (
            <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
              {page > 1 ? <Link href={href({ category, q, page: page - 1 })} className="btn-outline btn-sm">Previous</Link> : null}
              <span className="px-3 text-sm text-muted">Page {page} of {pages}</span>
              {page < pages ? <Link href={href({ category, q, page: page + 1 })} className="btn-outline btn-sm">Next</Link> : null}
            </nav>
          ) : null}
        </div>
      </section>
    </>
  );
}
