import type { ReactNode } from "react";
import { PageHero } from "./ui";

/** Update this date whenever a legal page changes. */
export const LEGAL_UPDATED = "18 November 2026";

export function LegalPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} intro={intro} />
      <div className="container-page max-w-3xl py-12 sm:py-16">
        <p className="text-sm text-muted">Last updated: {LEGAL_UPDATED}</p>
        <div className="prose-mn mt-8">{children}</div>
      </div>
    </>
  );
}
