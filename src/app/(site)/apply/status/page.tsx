import type { Metadata } from "next";
import Link from "next/link";
import { StatusLookup } from "@/components/forms/ApplicationForm";
import { PageHero } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Check Application Status",
  description: "Check the status of your MindsNova Hub application using your reference number.",
  robots: { index: false },
};

export default function StatusPage() {
  return (
    <>
      <PageHero
        eyebrow="Application status"
        title="Check your application."
        intro="Enter the reference number from your confirmation email and the email address you applied with."
      />
      <section className="section pt-12" data-form-scroll>
        <div className="container-page max-w-2xl">
          <StatusLookup />
          <p className="mt-8 text-sm text-muted">
            Lost your reference number? <Link href="/contact" className="link">Contact us</Link> using the email you applied with.
          </p>
        </div>
      </section>
    </>
  );
}
