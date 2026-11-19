/**
 * Admin UI building blocks (server components). Admin forms post to server
 * actions and use plain inputs with defaultValue, so they work without
 * client JavaScript.
 */
import { CircleCheck, CircleAlert } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PageHeader({ title, description, actions, back }: { title: string; description?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back ? <Link href={back.href} className="text-sm font-semibold text-brand hover:text-brand-800">&larr; {back.label}</Link> : null}
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Flash({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  return (
    <div role={error ? "alert" : "status"} className={cn("mb-6 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-medium", error ? "border-red-200 bg-red-50 text-red-800" : "border-accent-200 bg-accent-50 text-brand-900")}>
      {error ? <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> : <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
      {error || ok}
    </div>
  );
}

export function Panel({ title, children, className, actions }: { title?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-white p-5 sm:p-6", className)}>
      {title || actions ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? <h2 className="text-lg font-bold">{title}</h2> : <span />}
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "info" | "success" | "warning" | "danger" | "brand" }) {
  const tones = {
    neutral: "bg-neutral-100 text-neutral-700",
    info: "bg-accent-100 text-brand-800",
    brand: "bg-brand text-white",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-900",
    danger: "bg-red-100 text-red-800",
  };
  return <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold", tones[tone])}>{children}</span>;
}

type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "brand";
const TONES: Record<string, Tone> = {
    pending: "warning",
    new: "warning",
    under_review: "info",
    in_discussion: "info",
    contacted: "info",
    read: "neutral",
    accepted: "success",
    approved: "success",
    active: "success",
    confirmed: "success",
    replied: "success",
    published: "success",
    subscribed: "success",
    rejected: "danger",
    declined: "danger",
    waitlisted: "neutral",
    archived: "neutral",
    inactive: "neutral",
    unsubscribed: "neutral",
    draft: "neutral",
    scheduled: "info",
};
export const statusTone = (s: string): Tone => TONES[s] ?? "neutral";

export function Table({ head, children, empty }: { head: ReactNode[]; children: ReactNode; empty?: ReactNode }) {
  const hasRows = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-line bg-accent-50 text-xs uppercase tracking-wider text-muted">
          <tr>{head.map((h, i) => <th key={i} scope="col" className="px-4 py-3 font-bold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">
          {hasRows ? children : (
            <tr><td colSpan={head.length} className="px-4 py-12 text-center text-muted">{empty ?? "Nothing here yet."}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export const Td = ({ children, className }: { children?: ReactNode; className?: string }) => <td className={cn("px-4 py-3 align-top", className)}>{children}</td>;

/* ---------------- Form controls ---------------- */

type FieldBase = { name: string; label: string; hint?: ReactNode; required?: boolean; className?: string };

export function Field({ label, hint, required, className, children, htmlFor }: Omit<FieldBase, "name"> & { children: ReactNode; htmlFor?: string }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="label">{label}{required ? <span className="text-brand"> *</span> : null}</label>
      {children}
      {hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}

export function Input({ name, label, hint, required, className, type = "text", defaultValue, placeholder, ...rest }: FieldBase & { type?: string; defaultValue?: string | number | null; placeholder?: string; min?: number; maxLength?: number }) {
  return (
    <Field label={label} hint={hint} required={required} className={className} htmlFor={`f-${name}`}>
      <input id={`f-${name}`} name={name} type={type} required={required} defaultValue={defaultValue ?? ""} placeholder={placeholder} className="input" {...rest} />
    </Field>
  );
}

export function Textarea({ name, label, hint, required, className, defaultValue, rows = 4, placeholder, mono }: FieldBase & { defaultValue?: string | null; rows?: number; placeholder?: string; mono?: boolean }) {
  return (
    <Field label={label} hint={hint} required={required} className={className} htmlFor={`f-${name}`}>
      <textarea id={`f-${name}`} name={name} rows={rows} required={required} defaultValue={defaultValue ?? ""} placeholder={placeholder} className={cn("input resize-y", mono && "font-mono text-sm")} />
    </Field>
  );
}

export function Select({ name, label, hint, required, className, defaultValue, options }: FieldBase & { defaultValue?: string | null; options: { value: string; label: string }[] }) {
  return (
    <Field label={label} hint={hint} required={required} className={className} htmlFor={`f-${name}`}>
      <select id={`f-${name}`} name={name} required={required} defaultValue={defaultValue ?? ""} className="input">
        {!required ? <option value="">None</option> : null}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

export function Toggle({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1 size-4 accent-brand" />
      <span>
        <span className="font-semibold text-ink">{label}</span>
        {hint ? <span className="block text-sm text-muted">{hint}</span> : null}
      </span>
    </label>
  );
}

export const opts = (o: Record<string, string>) => Object.entries(o).map(([value, label]) => ({ value, label }));
