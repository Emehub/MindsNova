"use client";

/**
 * Reusable form building blocks for public forms.
 *
 * <FormShell endpoint="/api/forms/contact" onSuccess={...}>
 *   <TextField name="fullName" label="Full name" required />
 * </FormShell>
 *
 * FormShell handles: JSON submission, loading state, server-side field
 * errors, focusing the first invalid field, honeypot and timing spam fields,
 * optional Cloudflare Turnstile, and a success state.
 */
import { CircleAlert, LoaderCircle } from "lucide-react";
import Script from "next/script";
import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Ctx = { errors: Record<string, string>; clear: (name: string) => void };
const FormCtx = createContext<Ctx>({ errors: {}, clear: () => {} });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useFieldError = (_name: string) => useContext(FormCtx);

const TURNSTILE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export type SubmitResult = Record<string, unknown> & { ok: boolean };

/**
 * "Website only" mode: set at build time when the site is hosted without a
 * permanent database (see next.config.ts). Submissions could not be kept, so
 * forms are replaced by contact details instead of silently losing data.
 */
const FORMS_OFFLINE = process.env.NEXT_PUBLIC_FORMS_OFFLINE === "1";
const PUBLIC_EMAIL = "minds.novahub@gmail.com";
const PUBLIC_PHONE = "+233 55 218 4599";

function FormsOfflineNotice({ compact }: { compact: boolean }) {
  if (compact) {
    return (
      <p className="text-sm opacity-80">
        Online sign-up is opening soon. Email{" "}
        <a href={`mailto:${PUBLIC_EMAIL}`} className="font-semibold underline underline-offset-4">{PUBLIC_EMAIL}</a> to join our list.
      </p>
    );
  }
  return (
    <div className="rounded-2xl border border-accent-200 bg-accent-50 p-6 text-ink">
      <p className="text-lg font-semibold">Online forms are opening soon.</p>
      <p className="mt-2 text-muted">
        In the meantime, we would love to hear from you directly. Send us your name, phone number and what you are interested in, and our team will get back to you.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a href={`mailto:${PUBLIC_EMAIL}`} className="btn-primary btn-sm">Email {PUBLIC_EMAIL}</a>
        <a href={`tel:${PUBLIC_PHONE.replace(/\s/g, "")}`} className="btn-outline btn-sm">Call {PUBLIC_PHONE}</a>
      </div>
    </div>
  );
}

export function FormShell({
  endpoint,
  children,
  submitLabel,
  success,
  className,
  buttonClassName,
  compact = false,
}: {
  endpoint: string;
  children: ReactNode;
  submitLabel: string;
  success: (result: SubmitResult, reset: () => void) => ReactNode;
  className?: string;
  buttonClassName?: string;
  compact?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  // When the visitor started filling in the form (spam timing check). Kept in
  // state so re-renders, such as choosing an age range, never clear it.
  const [started, setStarted] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    setStarted(String(Date.now()));
  }, [result]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const arrays = new Set(fd.getAll("__arrays").map(String));
    const body: Record<string, unknown> = {};
    for (const key of new Set(fd.keys())) {
      if (key === "__arrays") continue;
      const all = fd.getAll(key).map(String);
      body[key] = arrays.has(key) ? all : all[0];
    }
    for (const a of arrays) if (!(a in body)) body[a] = [];

    setPending(true);
    setFormError("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({ ok: false, message: "Unexpected response." }))) as SubmitResult & {
        message?: string;
        errors?: Record<string, string>;
      };
      if (data.ok) {
        setErrors({});
        setResult(data);
        form.reset();
        form.closest("section, [data-form-scroll]")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        setErrors(data.errors ?? {});
        setFormError(data.message ?? "Please check the form and try again.");
        requestAnimationFrame(() => {
          const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
          first?.focus();
        });
        // Turnstile tokens are single use.
        (window as unknown as { turnstile?: { reset: () => void } }).turnstile?.reset();
      }
    } catch {
      setFormError("We could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (FORMS_OFFLINE) return <FormsOfflineNotice compact={compact} />;

  if (result) {
    return (
      <div role="status" aria-live="polite">
        {success(result, () => setResult(null))}
      </div>
    );
  }

  return (
    <FormCtx.Provider
      value={{
        errors,
        clear: (name) =>
          setErrors((e) => {
            if (!e[name]) return e;
            const n = { ...e };
            delete n[name];
            return n;
          }),
      }}
    >
      <form ref={formRef} onSubmit={onSubmit} noValidate className={cn(compact ? "space-y-3" : "space-y-6", className)}>
        {/* Spam protection: bots fill the hidden field and submit instantly. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Leave this empty
            <input type="text" name="company_website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>
        <input type="hidden" name="_started" value={started} readOnly />

        {children}

        {TURNSTILE_KEY ? (
          <>
            <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
            <div className="cf-turnstile" data-sitekey={TURNSTILE_KEY} data-theme="light" />
          </>
        ) : null}

        {formError ? (
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {formError}
          </p>
        ) : null}

        <button type="submit" className={cn("btn-primary", buttonClassName)} disabled={pending} aria-busy={pending}>
          {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
          {pending ? "Sending..." : submitLabel}
        </button>
      </form>
    </FormCtx.Provider>
  );
}

/* ---------------- Fields ---------------- */

type BaseProps = {
  name: string;
  label: string;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
};

function FieldWrap({ id, label, hint, required, error, children, className }: BaseProps & { id: string; error?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
        {required ? <span className="text-brand" aria-hidden="true"> *</span> : <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {children}
      {hint ? <p id={`${id}-hint`} className="hint">{hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} className="field-error">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, hint?: ReactNode, error?: string) {
  return [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
}

export function TextField({
  type = "text",
  autoComplete,
  placeholder,
  defaultValue,
  inputMode,
  ...p
}: BaseProps & {
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const id = useId();
  const { errors, clear } = useFieldError(p.name);
  const error = errors[p.name];
  return (
    <FieldWrap {...p} id={id} error={error}>
      <input
        id={id}
        name={p.name}
        type={type}
        className="input"
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
        inputMode={inputMode}
        required={p.required}
        aria-required={p.required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, p.hint, error)}
        onInput={() => clear(p.name)}
      />
    </FieldWrap>
  );
}

export function TextArea({ rows = 5, placeholder, ...p }: BaseProps & { rows?: number; placeholder?: string }) {
  const id = useId();
  const { errors, clear } = useFieldError(p.name);
  const error = errors[p.name];
  return (
    <FieldWrap {...p} id={id} error={error}>
      <textarea
        id={id}
        name={p.name}
        rows={rows}
        className="input resize-y"
        placeholder={placeholder}
        required={p.required}
        aria-required={p.required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, p.hint, error)}
        onInput={() => clear(p.name)}
      />
    </FieldWrap>
  );
}

export type Option = string | { value: string; label: string };
const optValue = (o: Option) => (typeof o === "string" ? o : o.value);
const optLabel = (o: Option) => (typeof o === "string" ? o : o.label);

export function SelectField({
  options,
  placeholder = "Choose one",
  defaultValue,
  onChange,
  ...p
}: BaseProps & { options: Option[]; placeholder?: string; defaultValue?: string; onChange?: (v: string) => void }) {
  const id = useId();
  const { errors, clear } = useFieldError(p.name);
  const error = errors[p.name];
  return (
    <FieldWrap {...p} id={id} error={error}>
      <select
        id={id}
        name={p.name}
        className="input appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%234F46E5%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:1.25rem] bg-[right_0.85rem_center] bg-no-repeat pr-10"
        defaultValue={defaultValue ?? ""}
        required={p.required}
        aria-required={p.required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, p.hint, error)}
        onChange={(e) => {
          clear(p.name);
          onChange?.(e.target.value);
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={optValue(o)} value={optValue(o)}>
            {optLabel(o)}
          </option>
        ))}
      </select>
    </FieldWrap>
  );
}

export function CheckboxGroup({ options, columns = 2, defaultValues = [], ...p }: BaseProps & { options: Option[]; columns?: 1 | 2 | 3; defaultValues?: string[] }) {
  const id = useId();
  const { errors, clear } = useFieldError(p.name);
  const error = errors[p.name];
  return (
    <fieldset className={p.className} aria-describedby={describedBy(id, p.hint, error)} aria-invalid={error ? true : undefined}>
      <legend className="label">
        {p.label}
        {p.required ? <span className="text-brand" aria-hidden="true"> *</span> : <span className="font-normal text-muted"> (optional)</span>}
      </legend>
      <input type="hidden" name="__arrays" value={p.name} />
      <div className={cn("grid gap-2", columns === 2 && "sm:grid-cols-2", columns === 3 && "sm:grid-cols-3")}>
        {options.map((o) => (
          <label
            key={optValue(o)}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white px-3.5 py-2.5 text-[0.95rem] transition-colors hover:border-accent-200 has-[:checked]:border-brand has-[:checked]:bg-accent-50"
          >
            <input
              type="checkbox"
              name={p.name}
              value={optValue(o)}
              defaultChecked={defaultValues.includes(optValue(o))}
              className="mt-1 size-4 shrink-0 accent-brand"
              onChange={() => clear(p.name)}
            />
            <span>{optLabel(o)}</span>
          </label>
        ))}
      </div>
      {p.hint ? <p id={`${id}-hint`} className="hint">{p.hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} className="field-error">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export function Checkbox({ name, children, required, onChange }: { name: string; children: ReactNode; required?: boolean; onChange?: (v: boolean) => void }) {
  const id = useId();
  const { errors, clear } = useFieldError(name);
  const error = errors[name];
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-[0.95rem]">
        <input
          id={id}
          type="checkbox"
          name={name}
          className="mt-1 size-4 shrink-0 accent-brand"
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => {
            clear(name);
            onChange?.(e.target.checked);
          }}
        />
        <span>{children}</span>
      </label>
      {error ? (
        <p id={`${id}-error`} className="field-error ml-7">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SuccessPanel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-accent-200 bg-accent-50 p-6 sm:p-8">
      <div className="mb-4 grid size-12 place-items-center rounded-full bg-accent text-white">
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="text-2xl">{title}</h3>
      <div className="mt-2 space-y-3 text-muted">{children}</div>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
