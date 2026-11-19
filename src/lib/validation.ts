import { z } from "zod";
import { AGE_RANGES } from "./catalog";

const req = (label: string, max = 200) =>
  z.string({ error: `${label} is required.` }).trim().min(1, `${label} is required.`).max(max, `${label} is too long.`);
const opt = (max = 2000) => z.string().trim().max(max).optional().default("");
const email = z.string({ error: "Email is required." }).trim().toLowerCase().email("Enter a valid email address.").max(200);
const phone = z
  .string({ error: "Phone number is required." })
  .trim()
  .regex(/^[+()\d\s-]{7,20}$/, "Enter a valid phone number, for example +233 20 000 0000.");
const optPhone = z
  .string()
  .trim()
  .refine((v) => v === "" || /^[+()\d\s-]{7,20}$/.test(v), "Enter a valid phone number.")
  .optional()
  .default("");
const checked = (message: string) => z.preprocess((v) => v === true || v === "on" || v === "true", z.literal(true, { error: message }));
const list = z.preprocess((v) => (Array.isArray(v) ? v : v ? [v] : []), z.array(z.string().trim().max(120)).max(20));

const MINOR_AGES = AGE_RANGES.filter((a) => a.minor).map((a) => a.value) as string[];

export const applicationSchema = z
  .object({
    fullName: req("Full name", 120),
    email,
    phone,
    ageRange: z.enum(AGE_RANGES.map((a) => a.value) as [string, ...string[]], { error: "Choose your age range." }),
    country: req("Country", 80),
    region: req("Region", 80),
    education: req("Educational background", 120),
    occupation: req("Current occupation or student status", 120),
    programSlug: req("Program of interest", 120),
    experience: req("Previous technology experience", 200),
    motivation: z.string().trim().min(40, "Tell us a little more (at least 40 characters).").max(3000),
    accessibilityNeeds: opt(1500),
    guardianName: opt(120),
    guardianEmail: z.string().trim().toLowerCase().max(200).optional().default(""),
    guardianPhone: optPhone,
    guardianConsent: z.preprocess((v) => v === true || v === "on" || v === "true", z.boolean()),
    privacyConsent: checked("You must agree to the privacy policy to apply."),
  })
  .superRefine((d, ctx) => {
    if (!MINOR_AGES.includes(d.ageRange)) return;
    if (!d.guardianName) ctx.addIssue({ code: "custom", path: ["guardianName"], message: "Parent or guardian name is required for applicants under 18." });
    if (!z.string().email().safeParse(d.guardianEmail).success && !d.guardianPhone)
      ctx.addIssue({ code: "custom", path: ["guardianEmail"], message: "Give a valid parent or guardian email or phone number." });
    if (!d.guardianConsent)
      ctx.addIssue({ code: "custom", path: ["guardianConsent"], message: "A parent or guardian must confirm consent for applicants under 18." });
  });

export const mentorSchema = z.object({
  fullName: req("Full name", 120),
  email,
  phone,
  background: z.string().trim().min(20, "Tell us a little more about your background.").max(2000),
  expertise: req("Area of expertise", 200),
  yearsExperience: req("Years of experience", 40),
  interests: list.refine((a) => a.length > 0, "Choose at least one way you would like to mentor."),
  availability: req("Availability", 80),
  linkedin: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || /^https?:\/\//.test(v), "Use a full link starting with https://")
    .optional()
    .default(""),
  privacyConsent: checked("Please agree to the privacy policy."),
  safeguardingConsent: checked("Please agree to follow our safeguarding policy."),
});

export const volunteerSchema = z.object({
  fullName: req("Full name", 120),
  email,
  phone: optPhone,
  location: opt(120),
  interests: list.refine((a) => a.length > 0, "Choose at least one area."),
  skills: opt(1500),
  availability: opt(200),
  message: opt(2000),
  privacyConsent: checked("Please agree to the privacy policy."),
});

export const partnerSchema = z.object({
  kind: z.enum(["partner", "sponsor"]),
  organization: req("Organisation name", 160),
  contactName: req("Contact name", 120),
  email,
  phone: optPhone,
  orgType: req("Organisation type", 80),
  interests: list,
  message: z.string().trim().min(20, "Tell us a little more (at least 20 characters).").max(3000),
  privacyConsent: checked("Please agree to the privacy policy."),
});

export const contactSchema = z.object({
  fullName: req("Full name", 120),
  email,
  subject: req("Subject", 160),
  category: req("Inquiry category", 80),
  message: z.string().trim().min(10, "Your message is a little short.").max(5000),
  privacyConsent: checked("Please agree to the privacy policy."),
});

export const newsletterSchema = z.object({
  email,
  name: opt(120),
  interests: list,
});

export const statusLookupSchema = z.object({
  reference: z.string().trim().toUpperCase().min(5, "Enter your reference number.").max(20),
  email,
});

/** Flattens zod errors into { field: message } for the form UI. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
