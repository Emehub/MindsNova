"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Slide = { src: string; alt: string };

/**
 * Cross-fading hero photos with a gentle slow zoom. Pauses on hover and
 * stays on the first photo when the visitor prefers reduced motion.
 */
export function HeroSlideshow({ slides, className }: { slides: Slide[]; className?: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => window.clearInterval(t);
  }, [slides.length, paused]);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={s.src}
          src={s.src}
          alt={i === index ? s.alt : ""}
          aria-hidden={i === index ? undefined : true}
          fetchPriority={i === 0 ? "high" : undefined}
          loading={i === 0 ? "eager" : "lazy"}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-[1200ms] ease-out",
            i === index ? "kenburns opacity-100" : "opacity-0",
          )}
        />
      ))}

      {slides.length > 1 ? (
        <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-black/25 px-3 py-2 backdrop-blur-sm">
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1} of ${slides.length}`}
              aria-current={i === index}
              className={cn("h-2 rounded-full bg-white transition-all duration-300", i === index ? "w-6" : "w-2 opacity-60 hover:opacity-100")}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
