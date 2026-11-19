import { Clock, Lock, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { PageHero } from "@/components/site/ui";
import { PROGRAM_APPLICATION_STATUS, type ProgramApplicationStatus } from "@/lib/catalog";
import { getPrograms } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Apply / Join a Program",
  description: "Apply to a MindsNova Hub technology program or register your interest in upcoming intakes.",
  alternates: { canonical: "/apply" },
};

type Props = { searchParams: Promise<{ program?: string }> };

export default async function ApplyPage({ searchParams }: Props) {
  const { program } = await searchParams;
  const programs = (await getPrograms()).filter(
    (p) => PROGRAM_APPLICATION_STATUS[p.applicationStatus as ProgramApplicationStatus]?.open ?? false,
  );
  const known = programs.some((p) => p.slug === program) || program === "mentorship" || program === "undecided";

  return (
    <>
      <PageHero
        eyebrow="Apply / Join a Program"
        title="Take the first step."
        intro="Apply for an open program or register your interest in an upcoming intake. It takes about ten minutes, and no previous experience is needed for most programs."
      />
      <section className="section pt-12" data-form-scroll>
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-12">
          <div className="min-w-0">
            <ApplicationForm
              programs={programs.map((p) => ({ slug: p.slug, title: p.title, category: p.category }))}
              defaultProgram={known ? program : undefined}
            />
          </div>
          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            {[
              { icon: Clock, title: "About ten minutes", text: "Have your contact details ready and a few thoughts about why you want to join." },
              { icon: ShieldCheck, title: "Under 18?", text: "You will need your parent or guardian's name, contact details and consent." },
              { icon: Lock, title: "Your data is protected", text: "We only use your information to process your application. See our privacy policy." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="card flex gap-4 p-5">
                <span className="icon-tile size-10"><Icon className="size-5" aria-hidden="true" /></span>
                <div>
                  <p className="font-display font-bold text-brand-900">{title}</p>
                  <p className="mt-1 text-sm text-muted">{text}</p>
                </div>
              </div>
            ))}
            <p className="px-1 text-sm text-muted">
              Already applied? <Link href="/apply/status" className="link">Check your application status</Link>
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
