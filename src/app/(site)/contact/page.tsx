import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/PublicForms";
import { SocialLinks } from "@/components/SocialIcons";
import { PageHero } from "@/components/site/ui";
import { PAGE_PHOTOS } from "@/lib/images";
import { CONTACT_CATEGORIES, SITE } from "@/lib/catalog";
import { getSetting } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with MindsNova Hub in Accra, Ghana, about programs, mentorship, volunteering, partnerships or sponsorship.",
  alternates: { canonical: "/contact" },
};

type Props = { searchParams: Promise<{ category?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const [contact, social, sp] = await Promise.all([getSetting("contact"), getSetting("social"), searchParams]);
  const defaultCategory = CONTACT_CATEGORIES.includes(sp.category ?? "") ? sp.category : undefined;

  const items = [
    { icon: MapPin, label: "Location", value: contact.address || contact.location, href: undefined },
    contact.email ? { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` } : null,
    contact.phone ? { icon: Phone, label: "Phone", value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` } : null,
    contact.whatsapp ? { icon: MessageCircle, label: "WhatsApp", value: contact.whatsapp, href: `https://wa.me/${contact.whatsapp.replace(/[^\d]/g, "")}` } : null,
    contact.officeHours ? { icon: Clock, label: "Office hours", value: contact.officeHours, href: undefined } : null,
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href?: string }[];

  return (
    <>
      <PageHero image={PAGE_PHOTOS.contact} eyebrow="Contact us" title="We would love to hear from you." intro="Questions about programs, mentorship, volunteering, partnerships or sponsorship? Send us a message and our team will respond." />
      <section className="section pt-12" data-form-scroll>
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-12">
          <aside className="space-y-6">
            <div className="card p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold">{SITE.name}</h2>
              <ul className="mt-6 space-y-5">
                {items.map(({ icon: Icon, label, value, href }) => (
                  <li key={label} className="flex gap-4">
                    <span className="icon-tile size-11"><Icon className="size-5" aria-hidden="true" /></span>
                    <div className="min-w-0">
                      <p className="text-sm text-muted">{label}</p>
                      {href ? (
                        <a href={href} className="break-words font-semibold text-brand-900 hover:text-brand" {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{value}</a>
                      ) : (
                        <p className="font-semibold text-brand-900">{value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              {!contact.email && !contact.phone ? (
                <p className="mt-6 rounded-xl bg-accent-50 p-4 text-sm text-brand-900">
                  Our official email address and phone number will be published here soon. In the meantime, the contact form is the best way to reach us.
                </p>
              ) : null}
              <SocialLinks social={social} className="mt-6" />
            </div>
            <div className="rounded-[var(--radius-card)] border border-line p-6 text-sm text-muted">
              <p className="font-semibold text-brand-900">Safeguarding concern?</p>
              <p className="mt-1">If you are worried about the safety or wellbeing of a young person connected with MindsNova Hub, choose &ldquo;Safeguarding concern&rdquo; as the category. These messages are handled confidentially and as a priority. If a child is in immediate danger, contact the police first.</p>
            </div>
          </aside>
          <div className="card p-6 sm:p-8">
            <h2 className="mb-6 text-2xl font-extrabold">Send us a message</h2>
            <ContactForm defaultCategory={defaultCategory} />
          </div>
        </div>
      </section>
    </>
  );
}
