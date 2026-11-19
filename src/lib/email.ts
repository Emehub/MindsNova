import "server-only";
import nodemailer from "nodemailer";
import { APPLICATION_STATUSES, type ApplicationStatus, SITE } from "./catalog";
import { db, schema } from "./db";
import { siteUrl } from "./utils";

type Mail = { to: string; subject: string; text: string };

let transporter: ReturnType<typeof nodemailer.createTransport> | null | undefined;
function getTransporter() {
  if (transporter !== undefined) return transporter;
  const host = process.env.SMTP_HOST?.trim();
  transporter = host
    ? nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
      })
    : null;
  return transporter;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function toHtml(text: string) {
  const body = escapeHtml(text)
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;line-height:1.6">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#f5f4ff;font-family:Arial,Helvetica,sans-serif;color:#11152e">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:#4338ca;background-image:linear-gradient(135deg,#4338ca,#6d5cf0);padding:20px 28px;color:#ffffff;font-size:20px;font-weight:bold">${SITE.name}</td></tr>
<tr><td style="padding:28px">${body}</td></tr>
<tr><td style="padding:16px 28px;background:#f5f4ff;font-size:12px;color:#5f6787">${SITE.tagline}</td></tr>
</table></td></tr></table></body></html>`;
}

/** Sends an email and records it in email_log. Never throws. */
export async function sendMail({ to, subject, text }: Mail): Promise<boolean> {
  const t = getTransporter();
  let status = "not_configured";
  let error = "";
  if (t) {
    try {
      await t.sendMail({
        from: process.env.EMAIL_FROM || `${SITE.name} <no-reply@localhost>`,
        to,
        subject,
        text,
        html: toHtml(text),
      });
      status = "sent";
    } catch (e) {
      status = "failed";
      error = e instanceof Error ? e.message : String(e);
      console.error("[email] failed", error);
    }
  } else if (process.env.NODE_ENV !== "production") {
    console.info(`[email] SMTP not configured. Would send to ${to}: ${subject}`);
  }
  try {
    await db.insert(schema.emailLog).values({ to, subject, body: text, status, error });
  } catch (e) {
    console.error("[email] could not log", e);
  }
  return status === "sent";
}

export function adminRecipients() {
  return (process.env.ADMIN_NOTIFY_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function notifyAdmins(subject: string, text: string, adminPath: string) {
  const to = adminRecipients();
  const body = `${text}\n\nOpen in the dashboard: ${siteUrl(adminPath)}`;
  if (to.length === 0) {
    await sendMail({ to: "(no ADMIN_NOTIFY_EMAILS configured)", subject, text: body });
    return;
  }
  await Promise.all(to.map((addr) => sendMail({ to: addr, subject, text: body })));
}

/* ---------------- Templates ---------------- */

export function applicationReceivedEmail(a: { fullName: string; reference: string; programTitle: string; isMinor: boolean }) {
  const first = a.fullName.split(" ")[0];
  return {
    subject: `We received your application (${a.reference})`,
    text: `Hello ${first},

Thank you for applying to ${a.programTitle} at ${SITE.name}. Your application has been received and is now pending review.

Your reference number is ${a.reference}. Keep it safe. You can check your status at any time here:
${siteUrl("/apply/status")}

${a.isMinor ? "Because you are under 18, we may contact your parent or guardian to confirm their consent before you take part.\n\n" : ""}We will email you whenever your application status changes.

With best wishes,
The ${SITE.name} team`,
  };
}

const STATUS_MESSAGES: Record<ApplicationStatus, string> = {
  pending: "Your application is pending review.",
  under_review: "Good news: your application is now being reviewed by our team. We will be in touch as soon as a decision is made.",
  accepted:
    "Congratulations! Your application has been accepted. Our team will contact you shortly with the next steps, including dates, location and what to prepare.",
  rejected:
    "Thank you for your interest. Unfortunately we are not able to offer you a place this time. Please do not be discouraged: we run new programs regularly and we encourage you to apply again. You can also subscribe to our newsletter for new opportunities.",
  waitlisted:
    "Your application has been placed on our waiting list. If a place becomes available we will contact you straight away.",
};

export function applicationStatusEmail(a: { fullName: string; reference: string; programTitle: string }, status: ApplicationStatus, note?: string) {
  const first = a.fullName.split(" ")[0];
  return {
    subject: `Application update: ${APPLICATION_STATUSES[status]} (${a.reference})`,
    text: `Hello ${first},

This is an update on your application to ${a.programTitle} (reference ${a.reference}).

${STATUS_MESSAGES[status]}
${note ? `\nA message from our team:\n${note}\n` : ""}
Check your status at any time: ${siteUrl("/apply/status")}

With best wishes,
The ${SITE.name} team`,
  };
}

export function simpleAcknowledgement(name: string, what: string) {
  const first = name.split(" ")[0];
  return `Hello ${first},

Thank you for ${what}. We have received your details and a member of the ${SITE.name} team will be in touch.

With best wishes,
The ${SITE.name} team`;
}
