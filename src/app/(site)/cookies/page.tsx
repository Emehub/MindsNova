import type { Metadata } from "next";
import { CookieSettingsButton } from "@/components/site/ClientEnhancements";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata: Metadata = { title: "Cookie Policy", alternates: { canonical: "/cookies" } };

export default function CookiesPage() {
  const ga = !!process.env.NEXT_PUBLIC_GA_ID;
  return (
    <LegalPage eyebrow="Legal" title="Cookie Policy" intro="How this website uses cookies and similar technologies, and how you can control them.">
      <h2>Essential storage</h2>
      <p>
        Our public pages do not need cookies to work. We store your cookie choice in your browser so we do not ask you again. Staff who sign in to the administration area receive a secure session cookie, which is required for sign-in.
      </p>
      <h2>Page view counting</h2>
      <p>We count how many times each page is viewed each day. This does not use cookies and does not record IP addresses or identify you.</p>
      <h2>Optional analytics cookies</h2>
      {ga ? (
        <p>
          If you accept analytics cookies, we use Google Analytics to understand how visitors use the website, with IP anonymisation enabled. These cookies are only set after you choose &ldquo;Accept analytics&rdquo;. You can change your choice at any time below.
        </p>
      ) : (
        <p>We do not currently use optional analytics cookies. If we start to, we will ask for your consent first.</p>
      )}
      <h2>Embedded services</h2>
      <p>Some forms may use Cloudflare Turnstile to protect against spam. It may process technical information about your device to tell humans and bots apart.</p>
      <h2>Your choice</h2>
      <CookieSettingsButton />
    </LegalPage>
  );
}
