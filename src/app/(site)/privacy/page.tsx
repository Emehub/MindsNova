import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/site/LegalPage";
import { SITE } from "@/lib/catalog";
import { getSetting } from "@/lib/settings";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default async function PrivacyPage() {
  const contact = await getSetting("contact");
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="How MindsNova Hub collects, uses and protects personal information, including information about children and young people."
    >
      <h2>1. Who we are</h2>
      <p>
        MindsNova Hub (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a social enterprise based in {contact.location}. It is a {SITE.legal.structure}, registration number {SITE.legal.registrationNo}, owned by {SITE.legal.proprietor}. {SITE.legal.proprietor}, trading as MindsNova Hub, is the data controller for personal information collected through this website. We process personal data in line with Ghana&apos;s Data Protection Act, 2012 (Act 843) and, where it applies, other data protection laws.
      </p>

      <h2>2. Information we collect</h2>
      <ul>
        <li><strong>Program applications:</strong> name, email, phone number, age range, country and region, education, occupation or student status, program of interest, technology experience, motivation and, if you choose to share them, accessibility or learning support needs.</li>
        <li><strong>Parent or guardian details</strong> for applicants under 18: name, contact details and a record of consent.</li>
        <li><strong>Mentor, volunteer, partner and sponsor registrations:</strong> the contact and professional details you submit.</li>
        <li><strong>Contact form messages</strong> and <strong>newsletter subscriptions</strong>.</li>
        <li><strong>Website usage:</strong> we count page views by page and day only. We do not store IP addresses for analytics. If you accept analytics cookies, Google Analytics may also collect usage data (see our <Link href="/cookies">Cookie Policy</Link>).</li>
      </ul>

      <h2>3. Why we use it and our legal basis</h2>
      <ul>
        <li>To assess applications, run programs and contact you about them (your consent, and steps taken at your request).</li>
        <li>To match learners with mentors and to coordinate volunteers and partners (consent and legitimate interests).</li>
        <li>To keep young people safe, including confirming parental or guardian consent (legal obligation and the protection of the child).</li>
        <li>To send newsletters you have asked for (consent, which you can withdraw at any time).</li>
        <li>To understand and improve our website and programs using anonymous, aggregated information (legitimate interests).</li>
      </ul>
      <p>Accessibility and learning support information is used only to support you, is shared only with staff who need it, and never affects selection.</p>

      <h2>4. Children and young people</h2>
      <p>
        Many of our learners are under 18. We collect only what we need, ask for parent or guardian consent for applicants under 18, and keep information about children particularly secure. We do not publish names, photographs or stories of under-18s without written consent from both the young person and their parent or guardian. Read our <Link href="/safeguarding">Safeguarding policy</Link>.
      </p>

      <h2>5. Sharing your information</h2>
      <p>
        We do not sell personal information. We share it only with trusted service providers who help us run our services (for example email and hosting providers) under appropriate agreements, with program partners where you have agreed to it, or where the law requires us to.
      </p>

      <h2>6. How long we keep it</h2>
      <p>
        Applications are kept for up to three years after the end of the program, unless you ask us to delete them sooner or we need to keep them for legal reasons. Newsletter data is kept until you unsubscribe. Other inquiries are kept for up to two years.
      </p>

      <h2>7. Security</h2>
      <p>
        Information is stored on secured systems, encrypted in transit, and accessible only to authorised staff with individual accounts and role-based permissions. Administrator passwords are stored using strong one-way hashing.
      </p>

      <h2>8. Your rights</h2>
      <p>
        You can ask to access, correct or delete your personal information, object to or restrict how we use it, and withdraw consent at any time. Parents and guardians can exercise these rights for their children. You can unsubscribe from our newsletter using the link in any email. You also have the right to complain to the Data Protection Commission of Ghana.
      </p>

      <h2>9. Contact us</h2>
      <p>
        To make a request or ask a question about privacy, use our <Link href="/contact">contact form</Link>
        {contact.email ? <> or email <a href={`mailto:${contact.email}`}>{contact.email}</a></> : null}.
      </p>
    </LegalPage>
  );
}
