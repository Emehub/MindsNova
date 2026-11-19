"use client";

/**
 * Small client-side behaviours for the public site:
 *  - reveal-on-scroll for elements with the `reveal` class
 *  - privacy friendly page view counting (path and day only)
 *  - cookie consent banner, which gates Google Analytics
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";

const CONSENT_KEY = "mn-cookie-consent";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

function readConsent(): "accepted" | "declined" | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "accepted" || v === "declined" ? v : null;
  } catch {
    return null;
  }
}

export function ClientEnhancements() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<"accepted" | "declined" | null | "unknown">("unknown");

  useEffect(() => setConsent(readConsent()), []);

  // Reveal on scroll, with siblings in a grid or list appearing one after another.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!("IntersectionObserver" in window) || reduced) {
      els.forEach((el) => el.classList.add("is-visible"));
      document.querySelectorAll<HTMLElement>("[data-countup]").forEach((el) => (el.dataset.done = "1"));
      return;
    }
    els.forEach((el) => {
      if (el.style.transitionDelay) return;
      const siblings = el.parentElement ? Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal")) : [];
      const i = siblings.indexOf(el);
      if (i > 0) el.style.transitionDelay = `${Math.min(i, 6) * 90}ms`;
    });
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );
    els.forEach((el) => io.observe(el));

    // Numbers count up from zero when they come into view.
    const counters = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          counters.unobserve(el);
          const target = Number(el.dataset.countup);
          if (!Number.isFinite(target) || el.dataset.done) continue;
          el.dataset.done = "1";
          const start = performance.now();
          const step = (now: number) => {
            const p = Math.min((now - start) / 1600, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString("en-GB");
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.4 },
    );
    document.querySelectorAll<HTMLElement>("[data-countup]").forEach((el) => counters.observe(el));

    return () => {
      io.disconnect();
      counters.disconnect();
    };
  }, [pathname]);

  // Header shadow once the page is scrolled.
  useEffect(() => {
    const onScroll = () => document.documentElement.toggleAttribute("data-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Page view count
  useEffect(() => {
    const body = JSON.stringify({ path: pathname });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    else fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
  }, [pathname]);

  const choose = (v: "accepted" | "declined") => {
    try {
      localStorage.setItem(CONSENT_KEY, v);
    } catch {}
    setConsent(v);
  };

  return (
    <>
      {GA_ID && consent === "accepted" ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
          </Script>
        </>
      ) : null}

      {GA_ID && consent === null ? (
        <div role="dialog" aria-live="polite" aria-label="Cookie preferences"
          className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-2xl border border-line bg-white p-5 shadow-lift sm:inset-x-6">
          <p className="text-[0.95rem]">
            We use optional analytics cookies to understand how our site is used and improve it. Essential features work without them.{" "}
            <Link href="/cookies" className="link">Cookie policy</Link>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn-secondary btn-sm" onClick={() => choose("accepted")}>Accept analytics</button>
            <button type="button" className="btn-outline btn-sm" onClick={() => choose("declined")}>Decline</button>
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Lets visitors change their cookie choice from the Cookie Policy page. */
export function CookieSettingsButton() {
  const [msg, setMsg] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        className="btn-outline btn-sm"
        onClick={() => {
          try {
            localStorage.removeItem(CONSENT_KEY);
          } catch {}
          setMsg("Your choice has been reset. Reload the page to choose again.");
        }}
      >
        Reset cookie choice
      </button>
      {msg ? <span role="status" className="text-sm text-muted">{msg}</span> : null}
    </div>
  );
}
