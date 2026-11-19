"use client";

import { Copy, LoaderCircle, Upload } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/cn";

/** Submit button that shows a spinner while its server action runs. */
export function SubmitButton({ children, className, variant = "secondary", name, value }: { children: ReactNode; className?: string; variant?: "primary" | "secondary" | "outline" | "danger"; name?: string; value?: string }) {
  const { pending } = useFormStatus();
  const styles = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-outline",
    danger: "btn bg-red-600 text-white hover:bg-red-700",
  };
  return (
    <button type="submit" name={name} value={value} disabled={pending} aria-busy={pending} className={cn(styles[variant], "btn-sm", className)}>
      {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

/** A submit button that asks for confirmation first (for deletes). */
export function ConfirmButton({ children, message = "Are you sure? This cannot be undone.", className }: { children: ReactNode; message?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn("btn btn-sm border-2 border-red-200 text-red-700 hover:bg-red-50", className)}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

export function CopyButton({ text, label = "Copy URL" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-800"
      onClick={async () => {
        await navigator.clipboard.writeText(text.startsWith("/") ? window.location.origin + text : text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      <Copy className="size-3.5" aria-hidden="true" />
      {done ? "Copied" : label}
    </button>
  );
}

/**
 * Image URL field with inline upload. Uploads go to the media library and
 * the returned URL fills the field, so non-technical editors never need to
 * copy and paste links.
 */
export function ImageField({ name, label, defaultValue, hint }: { name: string; label: string; defaultValue?: string | null; hint?: string }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed.");
      setUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <label htmlFor={`f-${name}`} className="label">{label}</label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-accent-50 text-xs text-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {url ? <img src={url} alt="" className="size-full object-cover" /> : "No image"}
        </div>
        <div className="flex-1 space-y-2">
          <input id={`f-${name}`} name={name} value={url} onChange={(e) => setUrl(e.target.value)} className="input" placeholder="/media/... or https://..." />
          <div className="flex flex-wrap items-center gap-3">
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" id={`u-${name}`} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            <label htmlFor={`u-${name}`} className="btn-outline btn-sm cursor-pointer">
              {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Upload className="size-4" aria-hidden="true" />}
              {busy ? "Uploading..." : "Upload image"}
            </label>
            {url ? <button type="button" className="text-sm font-semibold text-red-700" onClick={() => setUrl("")}>Remove</button> : null}
          </div>
          {error ? <p className="field-error">{error}</p> : null}
          {hint ? <p className="hint">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}
