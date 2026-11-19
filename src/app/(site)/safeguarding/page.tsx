import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Safeguarding and Child Protection",
  description: "How MindsNova Hub keeps children and young people safe in our programs, events and online spaces.",
  alternates: { canonical: "/safeguarding" },
};

export default function SafeguardingPage() {
  return (
    <LegalPage
      eyebrow="Safeguarding"
      title="Safeguarding and Child Protection"
      intro="Every young person who learns with us has the right to be safe, respected and protected from harm."
    >
      <h2>Our commitment</h2>
      <p>
        MindsNova Hub works with children and young people, many of them girls and young women. We take our responsibility to protect them seriously and act in line with Ghana&apos;s Children&apos;s Act, 1998 (Act 560), the Data Protection Act, 2012 (Act 843) and the best interests of the child.
      </p>

      <h2>How we keep young people safe</h2>
      <ul>
        <li><strong>Consent:</strong> applicants under 18 need consent from a parent or legal guardian, and we may contact them to confirm it.</li>
        <li><strong>Safer recruitment:</strong> staff, mentors and volunteers who work with under-18s are screened, which may include references and background checks, and agree to our code of conduct.</li>
        <li><strong>Supervision:</strong> sessions with under-18s are supervised. Mentoring with minors happens in group settings or visible, recorded channels, never in private one-to-one online spaces.</li>
        <li><strong>Online safety:</strong> we teach digital safety and use moderated platforms for any online learning.</li>
        <li><strong>Images and stories:</strong> we never publish photographs, names or stories of under-18s without written consent from the young person and their parent or guardian.</li>
        <li><strong>Data protection:</strong> information about young people is kept secure and shared only when necessary.</li>
      </ul>

      <h2>Code of conduct for adults</h2>
      <ul>
        <li>Treat every young person with respect and dignity.</li>
        <li>Do not contact learners under 18 privately on personal social media or messaging apps.</li>
        <li>Do not give gifts or favours, or arrange meetings outside official activities.</li>
        <li>Report any concern immediately to the MindsNova Hub safeguarding lead.</li>
      </ul>

      <h2>Reporting a concern</h2>
      <p>
        If you are worried about the safety or wellbeing of a young person connected with MindsNova Hub, please tell us straight away using our <Link href="/contact?category=Safeguarding%20concern">contact form</Link> and choose &ldquo;Safeguarding concern&rdquo;. Concerns are handled confidentially and as a priority by our safeguarding lead.
      </p>
      <blockquote>If a child is in immediate danger, contact the Ghana Police Service (191 or 112) first.</blockquote>
      <p>We review this policy every year, and whenever the law or our activities change.</p>
    </LegalPage>
  );
}
