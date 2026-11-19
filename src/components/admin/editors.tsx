import Link from "next/link";
import {
  deleteEvent, deletePost, deleteProgram, deleteProject, saveEvent, savePost, saveProgram, saveProject,
} from "@/app/admin/(dash)/content-actions";
import { ConfirmButton, ImageField, SubmitButton } from "@/components/admin/client";
import { Input, Panel, Select, Textarea, Toggle, opts } from "@/components/admin/kit";
import { EVENT_TYPES, PROGRAM_APPLICATION_STATUS, PROGRAM_CATEGORIES, PROJECT_TYPES, RESOURCE_CATEGORIES } from "@/lib/catalog";
import type { Event, Post, Program, Project } from "@/lib/queries";

/** Formats a Date for a datetime-local input in Ghana time (GMT). */
const dtLocal = (d?: Date | null) => (d ? new Date(d).toISOString().slice(0, 16) : "");

const MD_HINT = (
  <>Formatting: <code>## Heading</code>, <code>**bold**</code>, <code>- list item</code>, <code>[link text](https://...)</code>. Leave a blank line between paragraphs.</>
);

function DeleteForm({ action, id, label }: { action: (fd: FormData) => Promise<void>; id: number; label: string }) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <ConfirmButton message={`Delete this ${label}? This cannot be undone.`}>Delete {label}</ConfirmButton>
    </form>
  );
}

/* ---------------- Program ---------------- */

export function ProgramEditor({ p }: { p?: Program }) {
  return (
    <div className="space-y-6">
      <form action={saveProgram} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {p ? <input type="hidden" name="id" value={p.id} /> : null}
        <div className="space-y-6">
          <Panel title="Basics">
            <div className="grid gap-5">
              <Input name="title" label="Program name" required defaultValue={p?.title} />
              <Textarea name="summary" label="Short description" required rows={2} defaultValue={p?.summary} hint="Shown on program cards. One or two sentences." />
              <Textarea name="description" label="Full description" rows={6} defaultValue={p?.description} hint="Leave a blank line between paragraphs." />
              <div className="grid gap-5 sm:grid-cols-2">
                <Input name="audience" label="Target audience" defaultValue={p?.audience} placeholder="For example: SHS students and graduates" />
                <Input name="format" label="Learning format" defaultValue={p?.format} placeholder="Leave empty until confirmed" hint="For example: In person, Accra. Weekends." />
                <Input name="duration" label="Duration" defaultValue={p?.duration} placeholder="Leave empty until confirmed" hint="Only fill in once confirmed. Empty shows “To be confirmed”." />
                <Input name="startDate" type="date" label="Start date" defaultValue={p?.startDate} hint="Only when confirmed." />
              </div>
              <Textarea name="eligibility" label="Eligibility" rows={3} defaultValue={p?.eligibility} />
            </div>
          </Panel>
          <Panel title="Learning content">
            <div className="grid gap-5">
              <Textarea name="outcomes" label="Learning outcomes" rows={6} defaultValue={p?.outcomes.join("\n")} hint="One outcome per line." />
              <Textarea name="curriculum" label="Curriculum modules" rows={8} mono defaultValue={p?.curriculum.map((m) => (m.description ? `${m.title} | ${m.description}` : m.title)).join("\n")} hint="One module per line. Optionally add a description after a | character, for example: Python | Variables, loops and functions." />
            </div>
          </Panel>
          <Panel title="Image">
            <div className="grid gap-5">
              <ImageField name="imageUrl" label="Program image" defaultValue={p?.imageUrl} hint="Use authentic photos. Without an image, a branded illustration is shown." />
              <Input name="imageAlt" label="Image description (alt text)" defaultValue={p?.imageAlt} hint="Describe the photo for people using screen readers." />
            </div>
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Publishing">
            <div className="space-y-5">
              <Select name="category" label="Category" required defaultValue={p?.category} options={PROGRAM_CATEGORIES.map((c) => ({ value: c.slug, label: c.title }))} />
              <Select name="applicationStatus" label="Application status" required defaultValue={p?.applicationStatus ?? "interest"} options={Object.entries(PROGRAM_APPLICATION_STATUS).map(([v, s]) => ({ value: v, label: s.label }))} hint="Only choose “Applications open” when an intake is confirmed." />
              <Input name="applicationDeadline" type="date" label="Application deadline" defaultValue={p?.applicationDeadline} />
              <Toggle name="published" label="Published" defaultChecked={p?.published ?? true} hint="Visible on the website." />
              <Toggle name="featured" label="Featured on homepage" defaultChecked={p?.featured} />
              <Input name="sortOrder" type="number" label="Sort order" defaultValue={p?.sortOrder ?? 0} hint="Lower numbers appear first." />
              <Input name="slug" label="URL" defaultValue={p?.slug} hint="Created from the name if left empty." />
              <SubmitButton variant="primary" className="w-full">Save program</SubmitButton>
              {p ? <Link href={`/programs/${p.slug}`} target="_blank" className="block text-center text-sm font-semibold text-brand">View on website</Link> : null}
            </div>
          </Panel>
        </div>
      </form>
      {p ? <DeleteForm action={deleteProgram} id={p.id} label="program" /> : null}
    </div>
  );
}

/* ---------------- Event ---------------- */

export function EventEditor({ e, programs }: { e?: Event; programs: { id: number; title: string }[] }) {
  return (
    <div className="space-y-6">
      <form action={saveEvent} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {e ? <input type="hidden" name="id" value={e.id} /> : null}
        <div className="space-y-6">
          <Panel title="Event details">
            <div className="grid gap-5">
              <Input name="title" label="Event title" required defaultValue={e?.title} />
              <Textarea name="summary" label="Summary" required rows={2} defaultValue={e?.summary} />
              <Textarea name="description" label="Full description" rows={8} defaultValue={e?.description} hint={MD_HINT} />
              <div className="grid gap-5 sm:grid-cols-2">
                <Input name="startsAt" type="datetime-local" label="Starts (Ghana time)" required defaultValue={dtLocal(e?.startsAt)} />
                <Input name="endsAt" type="datetime-local" label="Ends (Ghana time)" defaultValue={dtLocal(e?.endsAt)} />
                <Input name="location" label="Location" defaultValue={e?.location} placeholder="Venue and town" />
                <Input name="registrationUrl" type="url" label="Registration link" defaultValue={e?.registrationUrl} placeholder="https://" />
              </div>
              <Toggle name="isOnline" label="This is an online event" defaultChecked={e?.isOnline} />
              <ImageField name="imageUrl" label="Event image" defaultValue={e?.imageUrl} />
            </div>
          </Panel>
        </div>
        <Panel title="Publishing" className="self-start">
          <div className="space-y-5">
            <Select name="type" label="Event type" required defaultValue={e?.type ?? "workshop"} options={opts(EVENT_TYPES)} />
            <Select name="programId" label="Related program" defaultValue={e?.programId ? String(e.programId) : ""} options={programs.map((p) => ({ value: String(p.id), label: p.title }))} />
            <Toggle name="published" label="Published" defaultChecked={e?.published} hint="Only publish confirmed events." />
            <Input name="slug" label="URL" defaultValue={e?.slug} hint="Created automatically if left empty." />
            <SubmitButton variant="primary" className="w-full">Save event</SubmitButton>
          </div>
        </Panel>
      </form>
      {e ? <DeleteForm action={deleteEvent} id={e.id} label="event" /> : null}
    </div>
  );
}

/* ---------------- Post ---------------- */

export function PostEditor({ p }: { p?: Post }) {
  return (
    <div className="space-y-6">
      <form action={savePost} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {p ? <input type="hidden" name="id" value={p.id} /> : null}
        <div className="space-y-6">
          <Panel>
            <div className="grid gap-5">
              <Input name="title" label="Title" required defaultValue={p?.title} />
              <Textarea name="excerpt" label="Excerpt" rows={2} defaultValue={p?.excerpt} hint="Shown on cards and in search results. Created from the article if left empty." />
              <Textarea name="body" label="Article" required rows={18} mono defaultValue={p?.body} hint={MD_HINT} />
            </div>
          </Panel>
          <Panel title="Cover image">
            <div className="grid gap-5">
              <ImageField name="coverImage" label="Cover image" defaultValue={p?.coverImage} />
              <Input name="coverAlt" label="Image description (alt text)" defaultValue={p?.coverAlt} />
            </div>
          </Panel>
        </div>
        <Panel title="Publishing" className="self-start">
          <div className="space-y-5">
            <Select name="category" label="Category" required defaultValue={p?.category} options={RESOURCE_CATEGORIES.map((c) => ({ value: c.slug, label: c.title }))} />
            <Input name="authorName" label="Author" defaultValue={p?.authorName} placeholder="Defaults to your name" />
            <Input name="publishAt" type="datetime-local" label="Publish date (Ghana time)" defaultValue={dtLocal(p?.publishAt)} hint="Set a future date to schedule. Empty publishes immediately." />
            <Input name="slug" label="URL" defaultValue={p?.slug} />
            <p className="text-sm text-muted">Current status: <strong>{p?.status === "published" ? (p.publishAt && p.publishAt > new Date() ? "Scheduled" : "Published") : "Draft"}</strong></p>
            <div className="grid gap-2">
              <SubmitButton variant="primary" name="intent" value="publish" className="w-full">{p?.status === "published" ? "Update and publish" : "Publish or schedule"}</SubmitButton>
              <SubmitButton variant="outline" name="intent" value="draft" className="w-full">{p?.status === "published" ? "Unpublish (save as draft)" : "Save draft"}</SubmitButton>
            </div>
            {p?.status === "published" ? <Link href={`/resources/${p.slug}`} target="_blank" className="block text-center text-sm font-semibold text-brand">View on website</Link> : null}
          </div>
        </Panel>
      </form>
      {p ? <DeleteForm action={deletePost} id={p.id} label="article" /> : null}
    </div>
  );
}

/* ---------------- Project ---------------- */

export function ProjectEditor({ p }: { p?: Project }) {
  return (
    <div className="space-y-6">
      <form action={saveProject} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {p ? <input type="hidden" name="id" value={p.id} /> : null}
        <div className="space-y-6">
          <Panel>
            <div className="grid gap-5">
              <Input name="title" label="Project name" required defaultValue={p?.title} />
              <Textarea name="summary" label="Summary" required rows={2} defaultValue={p?.summary} />
              <Textarea name="description" label="Description" rows={8} defaultValue={p?.description} hint={MD_HINT} />
              <Input name="technologies" label="Technologies used" defaultValue={p?.technologies.join(", ")} hint="Separate with commas, for example: Python, Arduino, Figma" />
              <Textarea name="outcomes" label="Project outcomes" rows={4} defaultValue={p?.outcomes} />
              <Input name="team" label="Team" defaultValue={p?.team} hint="Only include names with written consent, and guardian consent for anyone under 18. First names or initials are safer." />
              <Input name="projectUrl" type="url" label="Project link" defaultValue={p?.projectUrl} placeholder="https://" />
            </div>
          </Panel>
          <Panel title="Image">
            <div className="grid gap-5">
              <ImageField name="imageUrl" label="Project image" defaultValue={p?.imageUrl} hint="Do not show identifiable minors without written consent." />
              <Input name="imageAlt" label="Image description (alt text)" defaultValue={p?.imageAlt} />
            </div>
          </Panel>
        </div>
        <Panel title="Publishing" className="self-start">
          <div className="space-y-5">
            <Select name="type" label="Project type" required defaultValue={p?.type ?? "student"} options={opts(PROJECT_TYPES)} />
            <Toggle name="published" label="Approved and published" defaultChecked={p?.published} hint="Only approved projects appear in the showcase." />
            <Input name="slug" label="URL" defaultValue={p?.slug} />
            <SubmitButton variant="primary" className="w-full">Save project</SubmitButton>
          </div>
        </Panel>
      </form>
      {p ? <DeleteForm action={deleteProject} id={p.id} label="project" /> : null}
    </div>
  );
}
