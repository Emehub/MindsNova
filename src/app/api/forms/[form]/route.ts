/**
 * Public form submissions: POST /api/forms/{apply|mentor|volunteer|partner|contact|newsletter|status}
 * Every request goes through spam checks, validation, storage and notifications.
 */
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { AGE_RANGES, APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/catalog";
import { db, schema } from "@/lib/db";
import { applicationReceivedEmail, notifyAdmins, sendMail, simpleAcknowledgement } from "@/lib/email";
import { checkSubmission, rateLimit } from "@/lib/spam";
import { makeReference, randomToken, siteUrl } from "@/lib/utils";
import {
  applicationSchema,
  contactSchema,
  fieldErrors,
  mentorSchema,
  newsletterSchema,
  partnerSchema,
  statusLookupSchema,
  volunteerSchema,
} from "@/lib/validation";

type Body = Record<string, unknown>;
const fail = (message: string, status = 400, errors?: Record<string, string>) =>
  NextResponse.json({ ok: false, message, errors }, { status });
const invalid = (errors: Record<string, string>) =>
  fail("Please correct the highlighted fields.", 422, errors);

export async function POST(req: Request, ctx: { params: Promise<{ form: string }> }) {
  const { form } = await ctx.params;
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return fail("Invalid request.");
  }

  try {
    switch (form) {
      case "apply":
        return await handleApply(body);
      case "mentor":
        return await handleMentor(body);
      case "volunteer":
        return await handleVolunteer(body);
      case "partner":
        return await handlePartner(body);
      case "contact":
        return await handleContact(body);
      case "newsletter":
        return await handleNewsletter(body);
      case "status":
        return await handleStatus(body);
      default:
        return fail("Unknown form.", 404);
    }
  } catch (e) {
    console.error(`[forms/${form}]`, e);
    return fail("Something went wrong on our side. Please try again in a moment.", 500);
  }
}

async function guard(body: Body, bucket: string, limit?: number) {
  const v = await checkSubmission(body, bucket, limit);
  if (!v.ok) return v.status === 200 ? NextResponse.json({ ok: true }) : fail(v.message, v.status);
  return null;
}

async function handleApply(body: Body) {
  const blocked = await guard(body, "apply", 5);
  if (blocked) return blocked;
  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) return invalid(fieldErrors(parsed.error));
  const d = parsed.data;

  let programTitle = "";
  if (d.programSlug === "mentorship") programTitle = "Mentorship matching";
  else if (d.programSlug === "undecided") programTitle = "Not sure yet, please advise me";
  else {
    const program = await db.query.programs.findFirst({
      where: and(eq(schema.programs.slug, d.programSlug), eq(schema.programs.published, true)),
    });
    if (!program) return invalid({ programSlug: "Choose a program from the list." });
    if (program.applicationStatus === "closed")
      return invalid({ programSlug: "Applications for this program are closed. Please choose another or subscribe for updates." });
    programTitle = program.title;
  }

  const isMinor = AGE_RANGES.find((a) => a.value === d.ageRange)?.minor ?? false;
  const reference = makeReference();
  const [row] = await db
    .insert(schema.applications)
    .values({
      reference,
      fullName: d.fullName,
      email: d.email,
      phone: d.phone,
      ageRange: d.ageRange,
      country: d.country,
      region: d.region,
      education: d.education,
      occupation: d.occupation,
      programSlug: d.programSlug,
      programTitle,
      experience: d.experience,
      motivation: d.motivation,
      accessibilityNeeds: d.accessibilityNeeds,
      isMinor,
      guardianName: isMinor ? d.guardianName : "",
      guardianEmail: isMinor ? d.guardianEmail : "",
      guardianPhone: isMinor ? d.guardianPhone : "",
      guardianConsent: isMinor ? d.guardianConsent : false,
      privacyConsent: true,
    })
    .returning({ id: schema.applications.id });
  await db.insert(schema.applicationEvents).values({ applicationId: row.id, toStatus: "pending", note: "Application submitted", notified: true });

  const mail = applicationReceivedEmail({ fullName: d.fullName, reference, programTitle, isMinor });
  await sendMail({ to: d.email, ...mail });
  if (isMinor && d.guardianEmail) {
    await sendMail({
      to: d.guardianEmail,
      subject: `Your child's application to MindsNova Hub (${reference})`,
      text: `Hello ${d.guardianName},\n\n${d.fullName} has applied to ${programTitle} at MindsNova Hub and named you as their parent or guardian. You confirmed consent on the application form.\n\nIf you did not give consent, or have any questions, please reply to this email or contact us through ${siteUrl("/contact")}.\n\nYou can read our safeguarding approach here: ${siteUrl("/safeguarding")}\n\nWith best wishes,\nThe MindsNova Hub team`,
    });
  }
  await notifyAdmins(
    `New application: ${d.fullName} for ${programTitle}`,
    `${d.fullName} applied to ${programTitle}.\nReference: ${reference}\nAge range: ${d.ageRange}${isMinor ? " (minor, guardian consent recorded)" : ""}\nLocation: ${d.region}, ${d.country}`,
    `/admin/applications/${row.id}`,
  );
  return NextResponse.json({ ok: true, reference });
}

async function handleMentor(body: Body) {
  const blocked = await guard(body, "mentor");
  if (blocked) return blocked;
  const parsed = mentorSchema.safeParse(body);
  if (!parsed.success) return invalid(fieldErrors(parsed.error));
  const { privacyConsent: _p, safeguardingConsent: _s, ...d } = parsed.data;
  await db.insert(schema.mentors).values(d);
  await sendMail({ to: d.email, subject: "Thank you for offering to mentor", text: simpleAcknowledgement(d.fullName, "offering to mentor with MindsNova Hub") });
  await notifyAdmins(`New mentor interest: ${d.fullName}`, `${d.fullName} (${d.expertise}, ${d.yearsExperience}) registered interest in mentoring.`, "/admin/mentors");
  return NextResponse.json({ ok: true });
}

async function handleVolunteer(body: Body) {
  const blocked = await guard(body, "volunteer");
  if (blocked) return blocked;
  const parsed = volunteerSchema.safeParse(body);
  if (!parsed.success) return invalid(fieldErrors(parsed.error));
  const { privacyConsent: _p, ...d } = parsed.data;
  await db.insert(schema.volunteers).values(d);
  await sendMail({ to: d.email, subject: "Thank you for volunteering", text: simpleAcknowledgement(d.fullName, "offering to volunteer with MindsNova Hub") });
  await notifyAdmins(`New volunteer: ${d.fullName}`, `${d.fullName} wants to help with: ${d.interests.join(", ")}`, "/admin/volunteers");
  return NextResponse.json({ ok: true });
}

async function handlePartner(body: Body) {
  const blocked = await guard(body, "partner");
  if (blocked) return blocked;
  const parsed = partnerSchema.safeParse(body);
  if (!parsed.success) return invalid(fieldErrors(parsed.error));
  const { privacyConsent: _p, ...d } = parsed.data;
  await db.insert(schema.partnerInquiries).values(d);
  const what = d.kind === "sponsor" ? "your interest in sponsoring our programs" : "your interest in partnering with MindsNova Hub";
  await sendMail({ to: d.email, subject: "Thank you for reaching out", text: simpleAcknowledgement(d.contactName, what) });
  await notifyAdmins(
    `New ${d.kind} inquiry: ${d.organization}`,
    `${d.contactName} from ${d.organization} (${d.orgType}).\nInterests: ${d.interests.join(", ") || "not specified"}\n\n${d.message}`,
    "/admin/partners",
  );
  return NextResponse.json({ ok: true });
}

async function handleContact(body: Body) {
  const blocked = await guard(body, "contact");
  if (blocked) return blocked;
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return invalid(fieldErrors(parsed.error));
  const { privacyConsent: _p, ...d } = parsed.data;
  await db.insert(schema.contactMessages).values(d);
  await sendMail({ to: d.email, subject: `We received your message: ${d.subject}`, text: simpleAcknowledgement(d.fullName, "contacting MindsNova Hub") });
  await notifyAdmins(`New message (${d.category}): ${d.subject}`, `From ${d.fullName} <${d.email}>\n\n${d.message}`, "/admin/messages");
  return NextResponse.json({ ok: true });
}

async function handleNewsletter(body: Body) {
  const blocked = await guard(body, "newsletter", 5);
  if (blocked) return blocked;
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) return invalid(fieldErrors(parsed.error));
  const d = parsed.data;
  const existing = await db.query.subscribers.findFirst({ where: eq(schema.subscribers.email, d.email) });
  let token = existing?.token;
  if (existing) {
    await db
      .update(schema.subscribers)
      .set({
        status: "subscribed",
        unsubscribedAt: null,
        name: d.name || existing.name,
        interests: d.interests.length ? d.interests : existing.interests,
      })
      .where(eq(schema.subscribers.id, existing.id));
  } else {
    token = randomToken();
    await db.insert(schema.subscribers).values({ email: d.email, name: d.name, interests: d.interests, token });
  }
  if (!existing || existing.status !== "subscribed") {
    await sendMail({
      to: d.email,
      subject: "You are subscribed to MindsNova Hub updates",
      text: `Hello${d.name ? " " + d.name.split(" ")[0] : ""},\n\nThank you for subscribing. You will hear from us about programs, training, events, resources and mentorship opportunities.\n\nYou can unsubscribe at any time: ${siteUrl(`/newsletter/unsubscribe?token=${token}`)}\n\nThe MindsNova Hub team`,
    });
  }
  return NextResponse.json({ ok: true });
}

async function handleStatus(body: Body) {
  if (!(await rateLimit("status", 10, 600))) return fail("Too many attempts. Please wait a few minutes.", 429);
  const parsed = statusLookupSchema.safeParse(body);
  if (!parsed.success) return invalid(fieldErrors(parsed.error));
  const { reference, email } = parsed.data;
  const app = await db.query.applications.findFirst({
    where: and(eq(schema.applications.reference, reference), eq(schema.applications.email, email)),
  });
  if (!app) return fail("We could not find an application with that reference and email. Check both and try again.", 404);
  return NextResponse.json({
    ok: true,
    application: {
      reference: app.reference,
      programTitle: app.programTitle,
      status: app.status,
      statusLabel: APPLICATION_STATUSES[app.status as ApplicationStatus] ?? app.status,
      submittedAt: app.createdAt,
      updatedAt: app.updatedAt,
    },
  });
}
