import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown, PostCard, Visual } from "@/components/site/ui";
import { SITE, resourceCategory } from "@/lib/catalog";
import { getPost, getPosts } from "@/lib/queries";
import { formatDate, readingTime, siteUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPost((await params).slug);
  if (!p) return { title: "Article not found" };
  return {
    title: p.title,
    description: p.excerpt,
    alternates: { canonical: `/resources/${p.slug}` },
    openGraph: {
      type: "article",
      title: p.title,
      description: p.excerpt,
      publishedTime: p.publishAt?.toISOString(),
      images: p.coverImage ? [p.coverImage] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const cat = resourceCategory(post.category);
  const related = (await getPosts({ category: post.category, perPage: 4 })).rows.filter((p) => p.id !== post.id).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: post.authorName },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: siteUrl(`/resources/${post.slug}`),
    image: post.coverImage ? siteUrl(post.coverImage) : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="container-page max-w-3xl py-12 sm:py-16">
        <Link href={`/resources?category=${post.category}`} className="link-arrow text-sm"><ArrowLeft className="size-4" aria-hidden="true" /> {cat?.title ?? "Resources"}</Link>
        <h1 className="mt-6 text-4xl font-extrabold sm:text-5xl">{post.title}</h1>
        <p className="lead mt-5">{post.excerpt}</p>
        <p className="mt-6 text-sm text-muted">
          By <span className="font-semibold text-brand-900">{post.authorName}</span> · <time dateTime={post.publishAt?.toISOString()}>{formatDate(post.publishAt)}</time> · {readingTime(post.body)} min read
        </p>
        {post.coverImage ? <Visual src={post.coverImage} alt={post.coverAlt} className="mt-10 aspect-[16/9] w-full rounded-[var(--radius-card)]" priority /> : null}
        <Markdown className="mt-10">{post.body}</Markdown>
      </article>
      {related.length ? (
        <section className="section border-t border-line bg-accent-50">
          <div className="container-page">
            <h2 className="mb-8 text-2xl font-extrabold">More in {cat?.title ?? "Resources"}</h2>
            <div className="grid gap-6 md:grid-cols-3">{related.map((p) => <PostCard key={p.id} post={p} />)}</div>
          </div>
        </section>
      ) : null}
    </>
  );
}
