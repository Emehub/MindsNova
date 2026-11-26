import { Handshake, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { NewsletterForm } from "@/components/forms/PublicForms";
import { Logo } from "@/components/Logo";
import { SocialLinks } from "@/components/SocialIcons";
import { SITE } from "@/lib/catalog";
import { LEGAL_NAV, MAIN_NAV } from "@/lib/nav";
import type { ContactSettings, SocialSettings } from "@/lib/settings";

const GET_INVOLVED = [
  { href: "/apply", label: "Apply to a program" },
  { href: "/get-involved#mentor", label: "Become a mentor" },
  { href: "/get-involved#volunteer", label: "Volunteer" },
  { href: "/get-involved#partner", label: "Partner with us" },
  { href: "/get-involved#sponsor", label: "Sponsor a program" },
  { href: "/events", label: "Events" },
  { href: "/apply/status", label: "Check application status" },
];

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-white">{title}</h2>
      <ul className="mt-5 space-y-3 text-[0.95rem]">{children}</ul>
    </div>
  );
}

const linkCls = "text-white/70 transition-colors hover:text-white";

export function SiteFooter({ contact, social }: { contact: ContactSettings; social: SocialSettings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-brand-900 text-white">
      <div className="container-page pt-12">
        {/* Partnership call to action */}
        <div className="flex flex-col gap-8 rounded-[1.75rem] bg-brand-950 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-accent text-white">
              <Handshake className="size-7" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">Partner with us to create greater impact.</h2>
              <p className="mt-3 max-w-2xl text-white/75 sm:text-lg">
                Together with schools, companies, foundations and government, we can open more doors for young people, especially girls and young women, in technology.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <Link href="/get-involved#partner" className="btn-primary">Let&apos;s Partner</Link>
          </div>
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-12">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link href="/" aria-label="MindsNova Hub home" className="inline-block rounded-xl">
              <Logo inverted />
            </Link>
            <p className="mt-5 max-w-xs text-[0.95rem] text-white/70">
              {SITE.tagline} A registered social enterprise in Accra, Ghana, helping young people, particularly girls and young women, to learn, create and lead.
            </p>
            <SocialLinks social={social} tone="light" variant="plain" className="mt-5 -ml-1.5" />
          </div>

          <nav aria-label="Footer" className="contents">
            <div className="lg:col-span-2">
              <Column title="Quick links">
                {MAIN_NAV.map((l) => (
                  <li key={l.href}><Link href={l.href} className={linkCls}>{l.label}</Link></li>
                ))}
              </Column>
            </div>
            <div className="lg:col-span-2">
              <Column title="Get involved">
                {GET_INVOLVED.map((l) => (
                  <li key={l.href}><Link href={l.href} className={linkCls}>{l.label}</Link></li>
                ))}
              </Column>
            </div>
          </nav>

          <div className="lg:col-span-4">
            <Column title="Contact us">
              <li className="flex gap-3 text-white/70"><MapPin className="mt-0.5 size-5 shrink-0 text-accent-400" aria-hidden="true" />{contact.address || contact.location}</li>
              {contact.phone ? (
                <li className="flex gap-3"><Phone className="mt-0.5 size-5 shrink-0 text-accent-400" aria-hidden="true" /><a href={`tel:${contact.phone.replace(/\s/g, "")}`} className={linkCls}>{contact.phone}</a></li>
              ) : null}
              {contact.email ? (
                <li className="flex gap-3"><Mail className="mt-0.5 size-5 shrink-0 text-accent-400" aria-hidden="true" /><a href={`mailto:${contact.email}`} className={`break-all ${linkCls}`}>{contact.email}</a></li>
              ) : null}
            </Column>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.08em] text-white">Newsletter</p>
            <div className="mt-4">
              <NewsletterForm variant="compact" tone="dark" />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center gap-4 py-6 text-center text-sm text-white/60 md:flex-row md:justify-between md:text-left">
          <p>© {year} {SITE.name}. All rights reserved.</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {LEGAL_NAV.map((l) => (
              <li key={l.href}><Link href={l.href} className="transition-colors hover:text-white">{l.label}</Link></li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
