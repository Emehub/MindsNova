"use client";

import Link from "next/link";
import {
  CONTACT_CATEGORIES,
  MENTOR_AVAILABILITY,
  MENTOR_EXPERIENCE,
  MENTOR_INTERESTS,
  NEWSLETTER_INTERESTS,
  ORG_TYPES,
  PARTNER_INTERESTS,
  SPONSOR_AREAS,
  VOLUNTEER_INTERESTS,
} from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { Checkbox, CheckboxGroup, FormShell, SelectField, SuccessPanel, TextArea, TextField } from "./FormKit";

const PrivacyConsent = () => (
  <Checkbox name="privacyConsent" required>
    I agree to MindsNova Hub storing and using these details to respond to me, as described in the{" "}
    <Link href="/privacy" className="link" target="_blank">
      privacy policy
    </Link>
    .
  </Checkbox>
);

const AnotherButton = ({ reset, label }: { reset: () => void; label: string }) => (
  <button type="button" className="btn-outline" onClick={reset}>
    {label}
  </button>
);

/* ---------------- Newsletter ---------------- */

export function NewsletterForm({ variant = "full", tone = "light" }: { variant?: "full" | "compact"; tone?: "light" | "dark" }) {
  return (
    <FormShell
      endpoint="/api/forms/newsletter"
      submitLabel="Subscribe"
      compact={variant === "compact"}
      buttonClassName={variant === "compact" ? "w-full" : undefined}
      success={() => (
        <div className={cn("rounded-2xl p-5", tone === "dark" ? "bg-white/10 text-white" : "bg-accent-50 text-brand-900")}>
          <p className="font-display text-lg font-bold">You are subscribed.</p>
          <p className={cn("mt-1 text-sm", tone === "dark" ? "text-white/80" : "text-muted")}>
            Check your inbox for a welcome email. You can unsubscribe at any time.
          </p>
        </div>
      )}
    >
      {variant === "compact" ? (
        <div className={tone === "dark" ? "[&_.label]:text-white [&_.hint]:text-white/75 [&_.field-error]:text-red-200" : ""}>
          <TextField name="email" type="email" label="Email address" required autoComplete="email" placeholder="you@example.com" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="name" label="First name" autoComplete="given-name" />
            <TextField name="email" type="email" label="Email address" required autoComplete="email" placeholder="you@example.com" />
          </div>
          <CheckboxGroup name="interests" label="What would you like to hear about?" options={NEWSLETTER_INTERESTS} defaultValues={NEWSLETTER_INTERESTS} />
          <p className="text-sm text-muted">
            We send occasional updates, never spam. Unsubscribe with one click. Read our{" "}
            <Link href="/privacy" className="link">privacy policy</Link>.
          </p>
        </>
      )}
    </FormShell>
  );
}

/* ---------------- Contact ---------------- */

export function ContactForm({ defaultCategory }: { defaultCategory?: string }) {
  return (
    <FormShell
      endpoint="/api/forms/contact"
      submitLabel="Send message"
      success={(_r, reset) => (
        <SuccessPanel title="Thank you, your message has been sent." action={<AnotherButton reset={reset} label="Send another message" />}>
          <p>We have emailed you a confirmation and a member of our team will reply as soon as possible.</p>
        </SuccessPanel>
      )}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="fullName" label="Full name" required autoComplete="name" />
        <TextField name="email" type="email" label="Email address" required autoComplete="email" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField name="category" label="Inquiry category" required options={CONTACT_CATEGORIES} defaultValue={defaultCategory} />
        <TextField name="subject" label="Subject" required />
      </div>
      <TextArea name="message" label="Message" required rows={6} />
      <PrivacyConsent />
    </FormShell>
  );
}

/* ---------------- Mentor ---------------- */

export function MentorForm() {
  return (
    <FormShell
      endpoint="/api/forms/mentor"
      submitLabel="Register as a mentor or speaker"
      success={() => (
        <SuccessPanel title="Thank you for offering your time and experience.">
          <p>We have emailed you a confirmation. Our team will contact you to talk about mentoring opportunities and our onboarding and safeguarding process.</p>
        </SuccessPanel>
      )}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="fullName" label="Full name" required autoComplete="name" />
        <TextField name="email" type="email" label="Email address" required autoComplete="email" />
        <TextField name="phone" type="tel" label="Phone number" required autoComplete="tel" inputMode="tel" placeholder="+233 ..." />
        <TextField name="linkedin" type="url" label="LinkedIn or portfolio link" placeholder="https://" />
      </div>
      <TextArea name="background" label="Professional background" required rows={4} hint="Your current role, organisation and career journey." />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="expertise" label="Area of expertise" required placeholder="For example: banking, human resources, administration" />
        <SelectField name="yearsExperience" label="Years of experience" required options={MENTOR_EXPERIENCE} />
      </div>
      <CheckboxGroup name="interests" label="How would you like to help?" required options={MENTOR_INTERESTS} />
      <SelectField name="availability" label="Availability" required options={MENTOR_AVAILABILITY} />
      <div className="space-y-3">
        <PrivacyConsent />
        <Checkbox name="safeguardingConsent" required>
          I agree to follow MindsNova Hub&apos;s{" "}
          <Link href="/safeguarding" className="link" target="_blank">safeguarding and child protection policy</Link>
          , including background checks where required.
        </Checkbox>
      </div>
    </FormShell>
  );
}

/* ---------------- Volunteer ---------------- */

export function VolunteerForm() {
  return (
    <FormShell
      endpoint="/api/forms/volunteer"
      submitLabel="Register as a volunteer"
      success={() => (
        <SuccessPanel title="Thank you for volunteering.">
          <p>We have emailed you a confirmation. We will be in touch when there is an opportunity that matches your interests.</p>
        </SuccessPanel>
      )}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="fullName" label="Full name" required autoComplete="name" />
        <TextField name="email" type="email" label="Email address" required autoComplete="email" />
        <TextField name="phone" type="tel" label="Phone number" autoComplete="tel" inputMode="tel" />
        <TextField name="location" label="Town or city" autoComplete="address-level2" />
      </div>
      <CheckboxGroup name="interests" label="How would you like to help?" required options={VOLUNTEER_INTERESTS} />
      <TextArea name="skills" label="Skills and experience" rows={3} />
      <TextField name="availability" label="Availability" placeholder="For example: weekends, two evenings a month" />
      <TextArea name="message" label="Anything else you would like us to know?" rows={3} />
      <PrivacyConsent />
    </FormShell>
  );
}

/* ---------------- Partner and sponsor ---------------- */

export function PartnerForm({ kind }: { kind: "partner" | "sponsor" }) {
  const sponsor = kind === "sponsor";
  return (
    <FormShell
      endpoint="/api/forms/partner"
      submitLabel={sponsor ? "Send sponsorship inquiry" : "Send partnership inquiry"}
      success={() => (
        <SuccessPanel title="Thank you, we have received your inquiry.">
          <p>We have emailed you a confirmation. A member of our partnerships team will contact you to arrange a conversation.</p>
        </SuccessPanel>
      )}
    >
      <input type="hidden" name="kind" value={kind} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="organization" label={sponsor ? "Organisation or your name" : "Organisation name"} required autoComplete="organization" />
        <SelectField name="orgType" label="Type of organisation" required options={ORG_TYPES} />
        <TextField name="contactName" label="Contact name" required autoComplete="name" />
        <TextField name="email" type="email" label="Email address" required autoComplete="email" />
        <TextField name="phone" type="tel" label="Phone number" autoComplete="tel" inputMode="tel" />
      </div>
      <CheckboxGroup
        name="interests"
        label={sponsor ? "What would you like to support?" : "How would you like to work with us?"}
        options={sponsor ? SPONSOR_AREAS : PARTNER_INTERESTS}
      />
      <TextArea name="message" label="Tell us about your idea" required rows={5} />
      <PrivacyConsent />
    </FormShell>
  );
}
