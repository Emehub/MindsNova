import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ImageField, SubmitButton } from "@/components/admin/client";
import { Flash, Input, PageHeader, Panel, Textarea } from "@/components/admin/kit";
import { requireUser } from "@/lib/auth";
import { DEFAULT_SETTINGS, getSetting, saveSetting } from "@/lib/settings";
import { lines } from "@/lib/utils";

export const metadata = { title: "Site content" };

const s = (fd: FormData, k: string, max = 10000) => String(fd.get(k) ?? "").trim().slice(0, max);
const url = (v: string) => (v === "" || v.startsWith("/") || /^https?:\/\//.test(v) ? v : "");

async function saveContent(fd: FormData) {
  "use server";
  await requireUser("content");
  const section = s(fd, "section");
  if (section === "contact") {
    const email = s(fd, "email", 200);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect("/admin/content?error=Enter+a+valid+email+address#contact");
    await saveSetting("contact", {
      email,
      phone: s(fd, "phone", 40),
      whatsapp: s(fd, "whatsapp", 40),
      location: s(fd, "location", 120) || DEFAULT_SETTINGS.contact.location,
      address: s(fd, "address", 300),
      officeHours: s(fd, "officeHours", 200),
    });
  } else if (section === "social") {
    await saveSetting("social", {
      linkedin: url(s(fd, "linkedin", 300)),
      instagram: url(s(fd, "instagram", 300)),
      x: url(s(fd, "x", 300)),
      facebook: url(s(fd, "facebook", 300)),
      youtube: url(s(fd, "youtube", 300)),
      tiktok: url(s(fd, "tiktok", 300)),
    });
  } else if (section === "home") {
    await saveSetting("home", {
      heroImage: url(s(fd, "heroImage", 500)),
      heroImageAlt: s(fd, "heroImageAlt", 300),
      communityImage: url(s(fd, "communityImage", 500)),
      communityImageAlt: s(fd, "communityImageAlt", 300),
      announcement: s(fd, "announcement", 200),
    });
  } else if (section === "about") {
    const values = lines(s(fd, "values")).map((l) => {
      const [title, ...rest] = l.split("|");
      return { title: title.trim(), text: rest.join("|").trim() };
    });
    await saveSetting("about", {
      whoWeAre: s(fd, "whoWeAre"),
      vision: s(fd, "vision", 1000),
      mission: s(fd, "mission", 1000),
      objectives: lines(s(fd, "objectives")),
      values,
      philosophy: s(fd, "philosophy"),
      brandMeaning: s(fd, "brandMeaning"),
      image: url(s(fd, "image", 500)),
      imageAlt: s(fd, "imageAlt", 300),
    });
  }
  revalidatePath("/", "layout");
  redirect(`/admin/content?ok=${section}#${section}`);
}

function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <Panel className="scroll-mt-6">
      <form action={saveContent} id={id} className="space-y-5">
        <input type="hidden" name="section" value={id} />
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          {description ? <p className="text-sm text-muted">{description}</p> : null}
        </div>
        {children}
        <SubmitButton variant="primary">Save {title.toLowerCase()}</SubmitButton>
      </form>
    </Panel>
  );
}

export default async function ContentAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  await requireUser("content");
  const { ok, error } = await searchParams;
  const [contact, social, home, about] = await Promise.all([getSetting("contact"), getSetting("social"), getSetting("home"), getSetting("about")]);

  return (
    <>
      <PageHeader title="Site content" description="Edit contact details, social links, homepage images and the About Us page." />
      <Flash ok={ok ? "Changes saved and live on the website." : undefined} error={error} />
      <nav aria-label="Sections" className="mb-6 flex flex-wrap gap-2 text-sm">
        {[["contact", "Contact details"], ["social", "Social media"], ["home", "Homepage"], ["about", "About Us page"]].map(([id, l]) => (
          <a key={id} href={`#${id}`} className="rounded-full border border-line bg-white px-3 py-1.5 font-semibold text-brand-900 hover:border-brand">{l}</a>
        ))}
      </nav>
      <div className="space-y-6">
        <Section id="contact" title="Contact details" description="Shown on the Contact page, footer and in the Privacy Policy. Leave fields empty until official details are confirmed.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input name="email" type="email" label="Official email" defaultValue={contact.email} />
            <Input name="phone" label="Phone number" defaultValue={contact.phone} placeholder="+233 ..." />
            <Input name="whatsapp" label="WhatsApp number" defaultValue={contact.whatsapp} />
            <Input name="location" label="Location" defaultValue={contact.location} />
            <Input name="address" label="Full address" defaultValue={contact.address} className="sm:col-span-2" />
            <Input name="officeHours" label="Office hours" defaultValue={contact.officeHours} className="sm:col-span-2" />
          </div>
        </Section>

        <Section id="social" title="Social media" description="Full links, for example https://www.linkedin.com/company/... Empty links are hidden.">
          <div className="grid gap-5 sm:grid-cols-2">
            {(["linkedin", "instagram", "x", "facebook", "youtube", "tiktok"] as const).map((k) => (
              <Input key={k} name={k} type="url" label={k === "x" ? "X (Twitter)" : k[0].toUpperCase() + k.slice(1)} defaultValue={social[k]} placeholder="https://" />
            ))}
          </div>
        </Section>

        <Section id="home" title="Homepage" description="Use authentic photos of MindsNova Hub activities. Do not show planned programs as if they have already happened.">
          <Input name="announcement" label="Announcement bar" defaultValue={home.announcement} hint="A short message shown at the top of every page, for example: Applications for our first cohort are now open. Leave empty to hide." />
          <ImageField name="heroImage" label="Hero image" defaultValue={home.heroImage} hint="Without a photo, a branded illustration is shown." />
          <Input name="heroImageAlt" label="Hero image description (alt text)" defaultValue={home.heroImageAlt} />
          <ImageField name="communityImage" label="Innovation and community image" defaultValue={home.communityImage} />
          <Input name="communityImageAlt" label="Community image description (alt text)" defaultValue={home.communityImageAlt} />
        </Section>

        <Section id="about" title="About Us page">
          <Textarea name="whoWeAre" label="Who we are" rows={6} defaultValue={about.whoWeAre} hint="Leave a blank line between paragraphs." />
          <Textarea name="vision" label="Vision" rows={3} defaultValue={about.vision} />
          <Textarea name="mission" label="Mission" rows={3} defaultValue={about.mission} />
          <Textarea name="objectives" label="Core objectives" rows={8} defaultValue={about.objectives.join("\n")} hint="One per line." />
          <Textarea name="values" label="Core values" rows={9} mono defaultValue={about.values.map((v) => `${v.title} | ${v.text}`).join("\n")} hint="One per line: Value name | short description" />
          <Textarea name="philosophy" label="Our philosophy" rows={5} defaultValue={about.philosophy} />
          <Textarea name="brandMeaning" label="Meaning behind the name" rows={6} defaultValue={about.brandMeaning} />
          <ImageField name="image" label="About page image" defaultValue={about.image} />
          <Input name="imageAlt" label="Image description (alt text)" defaultValue={about.imageAlt} />
        </Section>
      </div>
    </>
  );
}
