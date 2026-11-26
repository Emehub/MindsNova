/**
 * Editable site content. Defaults live here; anything saved from the admin
 * dashboard (Content section) overrides them through the site_settings table.
 */
import { eq } from "drizzle-orm";
import { cache } from "react";
import { db, schema } from "./db";

export type ContactSettings = {
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  address: string;
  officeHours: string;
};

export type SocialSettings = {
  linkedin: string;
  instagram: string;
  x: string;
  facebook: string;
  youtube: string;
  tiktok: string;
};

export type HomeSettings = {
  heroImage: string;
  heroImageAlt: string;
  communityImage: string;
  communityImageAlt: string;
  announcement: string;
};

export type AboutSettings = {
  whoWeAre: string;
  vision: string;
  mission: string;
  objectives: string[];
  values: { title: string; text: string }[];
  philosophy: string;
  brandMeaning: string;
  image: string;
  imageAlt: string;
};

export type SettingsMap = {
  contact: ContactSettings;
  social: SocialSettings;
  home: HomeSettings;
  about: AboutSettings;
};

export const DEFAULT_SETTINGS: SettingsMap = {
  contact: {
    // Official details. They can be changed from the admin dashboard (Site content).
    // The full street address is deliberately not published (it is also a private residence).
    email: "minds.novahub@gmail.com",
    phone: "+233 55 218 4599",
    whatsapp: "",
    location: "Spintex, Accra, Ghana",
    address: "",
    officeHours: "",
  },
  social: { linkedin: "", instagram: "", x: "", facebook: "", youtube: "", tiktok: "" },
  home: {
    heroImage: "",
    heroImageAlt: "",
    communityImage: "",
    communityImageAlt: "",
    announcement: "",
  },
  about: {
    whoWeAre:
      "MindsNova Hub is a registered social enterprise based in Accra, Ghana, with an African and global outlook. We work in digital skills and career development.\n\nWe help young people, particularly girls and young women, build the confidence, digital skills and connections to step into the world of work.\n\nWe also bring experienced professionals to speak with our young people about the job market, the skills employers want and how to navigate the workplace, so they leave not only skilled but ready to start their careers.",
    vision:
      "To build an inclusive future where young people, particularly girls and young women, have the digital skills, confidence and connections to secure meaningful work and grow in their careers.",
    mission:
      "To equip young people with practical, job-ready digital skills and connect them with professionals who guide them into the world of work.",
    objectives: [
      "Promote digital literacy.",
      "Equip girls and young women with practical, job-ready digital skills.",
      "Help young people understand and use AI responsibly.",
      "Connect young people with professionals through career talks and mentorship.",
      "Prepare learners for job searches, interviews and the workplace.",
      "Promote digital inclusion.",
    ],
    values: [
      { title: "Innovation", text: "We stay curious, experiment boldly and look for better ways to solve problems." },
      { title: "Inclusion", text: "We open doors for people who have been left out of technology, especially girls and young women." },
      { title: "Excellence", text: "We hold our teaching, our learners and ourselves to a high, practical standard." },
      { title: "Empowerment", text: "We build confidence and independence, not dependence." },
      { title: "Collaboration", text: "We achieve more together, with learners, mentors, partners and communities." },
      { title: "Integrity", text: "We are honest, transparent and accountable in everything we do." },
      { title: "Lifelong Learning", text: "Technology keeps changing, and so do we. Learning never stops." },
      { title: "Impact", text: "We measure success by the real difference we make in people's lives." },
    ],
    philosophy:
      "We believe talent is everywhere, but opportunity is not. Our work starts from a simple idea: when people gain knowledge, confidence and access to opportunity, they do not only change their own lives, they change their communities.\n\nSo we teach by doing. Learners practise real workplace tasks and learn from professionals who have walked the journey before them.",
    brandMeaning:
      "Minds stands for the people at the heart of our work: curious, capable young minds with ideas worth developing.\n\nNova is a star that suddenly shines far brighter than before. It represents the moment potential becomes visible, when a learner discovers what they can create.\n\nHub is the place where it all connects: learning, mentorship, innovation and community, in one ecosystem.",
    image: "",
    imageAlt: "",
  },
};

export type SettingKey = keyof SettingsMap;

export const getSetting = cache(async <K extends SettingKey>(key: K): Promise<SettingsMap[K]> => {
  try {
    const row = await db.query.siteSettings.findFirst({ where: eq(schema.siteSettings.key, key) });
    if (row) return { ...DEFAULT_SETTINGS[key], ...(row.value as object) } as SettingsMap[K];
  } catch {
    // Database not ready (e.g. during first build). Fall back to defaults.
  }
  return DEFAULT_SETTINGS[key];
});

export async function saveSetting<K extends SettingKey>(key: K, value: SettingsMap[K]) {
  await db
    .insert(schema.siteSettings)
    .values({ key, value })
    .onConflictDoUpdate({ target: schema.siteSettings.key, set: { value, updatedAt: new Date() } });
}
