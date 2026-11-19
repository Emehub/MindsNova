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
        className={cn(
          // No backdrop blur while the menu is open: it would trap the fixed menu panel inside the header.
          "sticky top-0 z-50 border-b",
          open ? "bg-white" : "bg-white/95 backdrop-blur-md",
          "border-line transition-shadow duration-300",
          scrolled && "shadow-[0_6px_20px_-14px_rgb(17_21_46/0.3)]",
        )}
      >
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-4 xl:h-[6.5rem]">
          <Link href="/" aria-label="MindsNova Hub home" className="rounded-xl">
            <Logo />
          </Link>

          {/* Desktop: social icons and Apply on top, main menu underneath. */}
          <div className="hidden flex-col items-end gap-2.5 xl:flex">
            <div className="flex items-center gap-4">
              <SocialLinks social={social} variant="plain" />
              <Link href="/apply" className="btn-primary btn-sm whitespace-nowrap">Apply Now</Link>
            </div>
            <nav aria-label="Main">
              <ul className="flex items-center">
                {MAIN_NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "whitespace-nowrap rounded-full px-2.5 py-1.5 text-[0.92rem] font-medium transition-colors",
                        isActive(item.href) ? "text-accent" : "text-ink hover:text-accent",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <Link href="/apply" className="btn-primary btn-sm hidden whitespace-nowrap sm:inline-flex">
              Apply Now
            </Link>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full text-ink hover:bg-accent-50"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        <div
          id="mobile-menu"
          hidden={!open}
          style={{ top: menuTop }}
          className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto border-t border-line bg-white xl:hidden"
        >
          <nav aria-label="Mobile" className="container-page py-6">
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
