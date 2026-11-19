import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/site/LegalPage";
import { SITE } from "@/lib/catalog";

export const metadata: Metadata = { title: "Terms and Conditions", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms and Conditions" intro="The terms that apply when you use the MindsNova Hub website and apply to our programs.">
      <h2>1. About these terms</h2>
      <p>This website is operated by MindsNova Hub, a {SITE.legal.structure}, registration number {SITE.legal.registrationNo}. By using this website you agree to these terms. If you do not agree, please do not use the website. These terms are governed by the laws of the Republic of Ghana.</p>

      <h2>2. Using the website</h2>
      <ul>
        <li>Use the website lawfully and respectfully, and do not attempt to disrupt it or access areas you are not authorised to use.</li>
        <li>Do not submit false information or information about another person without their permission.</li>
        <li>Do not use automated tools to submit forms or collect data from the website.</li>
      </ul>

      <h2>3. Applications and programs</h2>
      <ul>
        <li>Submitting an application or registering interest does not guarantee a place.</li>
        <li>Program details, including dates, formats and durations, are confirmed for each intake and may change. We will tell accepted participants about any changes.</li>
        <li>Participants agree to follow our code of conduct and safeguarding policy during programs and events.</li>
        <li>Applicants under 18 must have consent from a parent or legal guardian.</li>
      </ul>

      <h2>4. Content and intellectual property</h2>
      <p>
        Content on this website, including text, graphics and the MindsNova Hub name and logo, belongs to MindsNova Hub or its licensors. You may share our learning resources for personal, non-commercial learning with credit to MindsNova Hub. Projects featured in our showcase remain the property of their creators.
      </p>

      <h2>5. External links</h2>
      <p>We link to other websites for your convenience. We are not responsible for their content or privacy practices.</p>

      <h2>6. Payments</h2>
      <p>We do not take payments through this website at present. Be cautious of anyone asking you to pay on our behalf, and contact us if you are unsure.</p>

      <h2>7. Liability</h2>
      <p>We work hard to keep the website accurate and available but cannot guarantee it will always be error free or uninterrupted. To the extent permitted by law, we are not liable for losses arising from use of the website.</p>

      <h2>8. Changes and contact</h2>
      <p>We may update these terms. The latest version will always be on this page. Questions? <Link href="/contact">Contact us</Link>.</p>
    </LegalPage>
  );
}
