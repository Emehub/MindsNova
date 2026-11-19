"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AGE_RANGES, EDUCATION_LEVELS, EXPERIENCE_LEVELS, GHANA_REGIONS, OCCUPATIONS } from "@/lib/catalog";
import { Checkbox, FormShell, SelectField, SuccessPanel, TextArea, TextField, type Option } from "./FormKit";

export type ProgramOption = { slug: string; title: string; category: string };

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="card space-y-5 p-5 sm:p-7">
      <legend className="sr-only">{title}</legend>
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="grid size-8 place-items-center rounded-full bg-brand font-display text-sm font-bold text-white">{n}</span>
        <h2 className="text-xl">{title}</h2>
      </div>
      {children}
    </fieldset>
  );
}

export function ApplicationForm({ programs, defaultProgram }: { programs: ProgramOption[]; defaultProgram?: string }) {
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("Ghana");
  const isMinor = AGE_RANGES.find((a) => a.value === age)?.minor ?? false;

  const programOptions: Option[] = [
    ...programs.map((p) => ({ value: p.slug, label: p.title })),
    { value: "mentorship", label: "Mentorship matching (find a mentor)" },
    { value: "undecided", label: "Not sure yet, please advise me" },
  ];

  return (
    <FormShell
      endpoint="/api/forms/apply"
      submitLabel="Submit application"
      buttonClassName="w-full sm:w-auto"
      success={(r) => (
        <SuccessPanel
          title="Application received. Well done for taking this step!"
          action={
            <div className="flex flex-wrap gap-3">
              <Link href="/apply/status" className="btn-secondary">Check application status</Link>
              <Link href="/programs" className="btn-outline">Explore more programs</Link>
            </div>
          }
        >
          <p>
            Your reference number is{" "}
            <strong className="rounded-md bg-white px-2 py-0.5 font-mono text-lg text-brand-900">{String(r.reference)}</strong>
          </p>
          <p>
            We have sent a confirmation to your email. Keep your reference number safe, you will need it to check your status. We will email you each time your application status changes.
          </p>
        </SuccessPanel>
      )}
    >
      <Step n={1} title="About you">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="fullName" label="Full name" required autoComplete="name" />
          <TextField name="email" type="email" label="Email address" required autoComplete="email" />
          <TextField name="phone" type="tel" label="Phone number" required autoComplete="tel" inputMode="tel" placeholder="+233 ..." />
          <SelectField
            name="ageRange"
            label="Age range"
            required
            options={AGE_RANGES.map((a) => ({ value: a.value, label: a.label }))}
            onChange={setAge}
          />
          {country === "Ghana" ? (
            <>
              <input type="hidden" name="country" value="Ghana" />
              <SelectField name="region" label="Region in Ghana" required options={GHANA_REGIONS} />
            </>
          ) : (
            <>
              <TextField key="country" name="country" label="Country" required autoComplete="country-name" />
              <TextField key="region" name="region" label="Region, state or province" required autoComplete="address-level1" />
            </>
          )}
        </div>
        <div className="-mt-2 text-sm">
          <button type="button" className="link" onClick={() => setCountry((c) => (c === "Ghana" ? "Other" : "Ghana"))}>
            {country === "Ghana" ? "I live outside Ghana" : "I live in Ghana"}
          </button>
        </div>
      </Step>

      {isMinor ? (
        <fieldset className="card space-y-5 border-accent-200 bg-accent-50 p-5 sm:p-7" aria-describedby="guardian-note">
          <legend className="sr-only">Parent or guardian consent</legend>
          <div className="flex items-start gap-3">
            <span className="icon-tile size-10 bg-white"><ShieldCheck className="size-5" aria-hidden="true" /></span>
            <div>
              <h2 className="text-xl">Parent or guardian consent</h2>
              <p id="guardian-note" className="mt-1 text-[0.95rem] text-muted">
                Because you are under 18, a parent or guardian must agree to you taking part. We will only use their details to confirm consent and keep them informed. Read our{" "}
                <Link href="/safeguarding" className="link" target="_blank">safeguarding policy</Link>.
              </p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="guardianName" label="Parent or guardian full name" required />
            <TextField name="guardianPhone" type="tel" label="Parent or guardian phone" inputMode="tel" />
            <TextField name="guardianEmail" type="email" label="Parent or guardian email" className="sm:col-span-2"
              hint="Give an email or a phone number so we can confirm consent." />
          </div>
          <Checkbox name="guardianConsent" required>
            I am the parent or legal guardian of this applicant. I consent to them applying and to MindsNova Hub processing their information as described in the{" "}
            <Link href="/privacy" className="link" target="_blank">privacy policy</Link>.
          </Checkbox>
        </fieldset>
      ) : null}

      <Step n={2} title="Education and experience">
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField name="education" label="Highest level of education" required options={EDUCATION_LEVELS} />
          <SelectField name="occupation" label="Current occupation or student status" required options={OCCUPATIONS} />
        </div>
        <SelectField name="experience" label="Previous technology experience" required options={EXPERIENCE_LEVELS} />
      </Step>

      <Step n={3} title="Your program">
        <SelectField name="programSlug" label="Program of interest" required options={programOptions} defaultValue={defaultProgram} />
        <TextArea
          name="motivation"
          label="Why do you want to join?"
          required
          rows={6}
          hint="Tell us what you hope to learn, and what you would like to do with these skills. There are no wrong answers."
        />
        <TextArea
          name="accessibilityNeeds"
          label="Accessibility or learning support requirements"
          rows={3}
          hint="Tell us about anything that would help you take part fully. This is confidential and never affects selection."
        />
      </Step>

      <div className="space-y-3">
        <Checkbox name="privacyConsent" required>
          I agree to MindsNova Hub storing and using the information in this application to assess it and contact me, as described in the{" "}
          <Link href="/privacy" className="link" target="_blank">privacy policy</Link>.
        </Checkbox>
      </div>
    </FormShell>
  );
}

export function StatusLookup() {
  return (
    <FormShell
      endpoint="/api/forms/status"
      submitLabel="Check status"
      success={(r, reset) => {
        const a = r.application as { reference: string; programTitle: string; status: string; statusLabel: string; submittedAt: string; updatedAt: string };
        const steps = ["pending", "under_review", "decision"];
        const current = a.status === "pending" ? 0 : a.status === "under_review" ? 1 : 2;
        const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
        return (
          <div className="card p-6 sm:p-8">
            <p className="text-sm font-semibold text-muted">Reference {a.reference}</p>
            <h2 className="mt-1 text-2xl">{a.programTitle}</h2>
            <p className="mt-4 inline-flex items-center rounded-full bg-accent-100 px-4 py-1.5 font-display text-lg font-bold text-brand-900">
              {a.statusLabel}
            </p>
            <ol className="mt-6 grid grid-cols-3 gap-2 text-center text-sm" aria-label="Application progress">
              {steps.map((s, i) => (
                <li key={s} className={i <= current ? "font-semibold text-brand-900" : "text-muted"}>
                  <span className={`mb-2 block h-1.5 rounded-full ${i <= current ? "bg-accent" : "bg-line"}`} aria-hidden="true" />
                  {s === "pending" ? "Submitted" : s === "under_review" ? "Under review" : "Decision"}
                  {i === current ? <span className="sr-only"> (current step)</span> : null}
                </li>
              ))}
            </ol>
            <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-muted">Submitted</dt><dd className="font-semibold">{fmt(a.submittedAt)}</dd></div>
              <div><dt className="text-muted">Last updated</dt><dd className="font-semibold">{fmt(a.updatedAt)}</dd></div>
            </dl>
            <button type="button" className="btn-outline mt-6" onClick={reset}>Check another application</button>
          </div>
        );
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="reference" label="Reference number" required placeholder="MNH-XXXXXX" />
        <TextField name="email" type="email" label="Email used to apply" required autoComplete="email" />
      </div>
    </FormShell>
  );
}
