// Content comes from the database and is edited in the admin dashboard, so pages render on request.
export const dynamic = "force-dynamic";

import { ClientEnhancements } from "@/components/site/ClientEnhancements";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getSetting } from "@/lib/settings";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [contact, social, home] = await Promise.all([getSetting("contact"), getSetting("social"), getSetting("home")]);
  return (
    <>
      <a href="#main" className="sr-only z-[100] rounded-full bg-brand px-5 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <SiteHeader announcement={home.announcement} social={social} />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
      <SiteFooter contact={contact} social={social} />
      <ClientEnhancements />
    </>
  );
}
