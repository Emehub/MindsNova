"use client";

import {
  BarChart3, CalendarDays, FileText, FolderKanban, Gauge, GraduationCap, Handshake, HeartHandshake, Image as ImageIcon,
  Inbox, LayoutDashboard, Mail, Menu, Newspaper, Send, Settings, UserCog, Users, X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import type { Permission } from "@/lib/catalog";
import { cn } from "@/lib/cn";

const GROUPS: { title: string; items: { href: string; label: string; icon: typeof Gauge; perm: Permission }[] }[] = [
  { title: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, perm: "dashboard" }] },
  {
    title: "People",
    items: [
      { href: "/admin/applications", label: "Applications", icon: GraduationCap, perm: "applications" },
      { href: "/admin/mentors", label: "Mentors", icon: Users, perm: "community" },
      { href: "/admin/volunteers", label: "Volunteers", icon: HeartHandshake, perm: "community" },
      { href: "/admin/partners", label: "Partners and sponsors", icon: Handshake, perm: "community" },
      { href: "/admin/messages", label: "Messages", icon: Inbox, perm: "messages" },
      { href: "/admin/subscribers", label: "Newsletter", icon: Send, perm: "subscribers" },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/programs", label: "Programs", icon: FileText, perm: "programs" },
      { href: "/admin/events", label: "Events", icon: CalendarDays, perm: "events" },
      { href: "/admin/posts", label: "Resources and blog", icon: Newspaper, perm: "posts" },
      { href: "/admin/projects", label: "Project showcase", icon: FolderKanban, perm: "projects" },
      { href: "/admin/impact", label: "Impact statistics", icon: BarChart3, perm: "impact" },
      { href: "/admin/content", label: "Site content", icon: Settings, perm: "content" },
      { href: "/admin/media", label: "Media library", icon: ImageIcon, perm: "media" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/users", label: "Users and roles", icon: UserCog, perm: "users" },
      { href: "/admin/email-log", label: "Email log", icon: Mail, perm: "email_log" },
    ],
  },
];

export function AdminNav({ permissions, badges }: { permissions: Permission[]; badges: Partial<Record<string, number>> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const nav = (
    <nav aria-label="Admin" className="space-y-6 p-4">
      {GROUPS.map((g) => {
        const items = g.items.filter((i) => permissions.includes(i.perm));
        if (!items.length) return null;
        return (
          <div key={g.title}>
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-white/50">{g.title}</p>
            <ul className="mt-2 space-y-0.5">
              {items.map(({ href, label, icon: Icon }) => {
                const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
                const badge = badges[href];
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-[0.94rem] font-medium transition-colors",
                        active ? "bg-white text-brand-900" : "text-white/80 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                      <span className="flex-1">{label}</span>
                      {badge ? <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-brand-900">{badge}</span> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-brand-900 px-4 lg:hidden">
        <Link href="/admin"><Logo inverted /></Link>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} className="grid size-11 place-items-center rounded-full text-white hover:bg-white/10">
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>
      {open ? <div className="fixed inset-x-0 bottom-0 top-16 z-30 overflow-y-auto bg-brand-900 lg:hidden">{nav}</div> : null}
      <aside className="fixed inset-y-0 left-0 hidden w-64 overflow-y-auto bg-brand-900 lg:block">
        <div className="flex h-20 items-center px-6"><Link href="/admin"><Logo inverted /></Link></div>
        {nav}
      </aside>
    </>
  );
}
