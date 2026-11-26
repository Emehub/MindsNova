"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { SocialLinks } from "@/components/SocialIcons";
import { cn } from "@/lib/cn";
import { MAIN_NAV } from "@/lib/nav";
import type { SocialSettings } from "@/lib/settings";

export function SiteHeader({ announcement, social }: { announcement?: string; social: SocialSettings }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuTop, setMenuTop] = useState(72);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    // Place the menu panel directly under the header, wherever it currently sits.
    if (open && headerRef.current) setMenuTop(headerRef.current.getBoundingClientRect().bottom);
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      {announcement ? (
        <div className="bg-brand-900 px-4 py-2 text-center text-sm font-medium text-white">{announcement}</div>
      ) : null}
      <header
        ref={headerRef}
        // Floating bar: the header strip itself is transparent and lets clicks through;
        // only the rounded bar and the menu panel are interactive.
        className="pointer-events-none sticky top-0 z-50 -mb-[var(--header-space)] h-[var(--header-space)] pt-3 sm:pt-4"
      >
        <div className="container-page">
          <div
            className={cn(
              "pointer-events-auto flex h-16 items-center justify-between gap-4 rounded-full border pl-4 pr-2.5 transition-[box-shadow,background-color,border-color] duration-300 sm:pl-6 sm:pr-3 xl:h-[4.5rem]",
              open || scrolled
                ? "border-line/80 bg-white/95 shadow-[0_12px_40px_-16px_rgb(40_36_120/0.35)] backdrop-blur-md"
                : "border-white/70 bg-white/80 shadow-[0_8px_30px_-18px_rgb(40_36_120/0.3)] backdrop-blur-md",
            )}
          >
            <Link href="/" aria-label="MindsNova Hub home" className="shrink-0 rounded-xl">
              <Logo />
            </Link>

            {/* Desktop menu */}
            <nav aria-label="Main" className="hidden xl:block">
              <ul className="flex items-center gap-1">
                {MAIN_NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "whitespace-nowrap rounded-full px-4 py-2 text-[0.95rem] font-medium transition-colors",
                        isActive(item.href) ? "bg-accent-100 text-brand-700" : "text-ink hover:bg-accent-50 hover:text-accent",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-3">
              <SocialLinks social={social} variant="plain" className="hidden 2xl:flex" />
              <Link href="/apply" className="btn-primary btn-sm hidden whitespace-nowrap sm:inline-flex">
                Apply Now
              </Link>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-full text-ink hover:bg-accent-50 xl:hidden"
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((o) => !o)}
              >
                {open ? <X className="size-6" /> : <Menu className="size-6" />}
              </button>
            </div>
          </div>
        </div>

        <div
          id="mobile-menu"
          hidden={!open}
          style={{ top: menuTop + 8 }}
          className="pointer-events-auto fixed inset-x-3 z-40 max-h-[calc(100dvh-var(--header-space)-1.5rem)] overflow-y-auto rounded-3xl border border-line bg-white shadow-lift sm:inset-x-6 xl:hidden"
        >
          <nav aria-label="Mobile" className="px-5 py-4 sm:px-8">
            <ul className="divide-y divide-line">
              {MAIN_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between py-4 text-lg font-semibold",
                      isActive(item.href) ? "text-accent" : "text-ink",
                    )}
                  >
                    {item.label}
                    {isActive(item.href) ? <span className="size-2 rounded-full bg-accent" aria-hidden="true" /> : null}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/apply" className="btn-primary mt-6 w-full">
              Apply Now
            </Link>
            <SocialLinks social={social} className="mt-6 justify-center" />
          </nav>
        </div>
      </header>
    </>
  );
}
