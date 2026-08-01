"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { cn } from "@/lib/utils";

export type StickyScrollItem = {
  readonly id: string;
  /** 1-based position, rendered as the sticky panel's large display numeral. */
  readonly index: number;
  readonly title: string;
  readonly description: string;
  /** Optional pill label — used here for "requires your approval". */
  readonly badge?: string;
};

/**
 * Adapted from Aceternity UI's Sticky Scroll Reveal for the "Proceso"
 * section (design brief for feat/editorial-design): five phases is
 * precisely this component's intended use case, and reading-by-scroll is
 * itself editorial language.
 *
 * Adapted, not copied verbatim: the original is built for a dark
 * marketing-site aesthetic (`bg-slate-900`/`bg-black` container, saturated
 * gradient swatches in the sticky panel). This site is light editorial
 * paper, so the container and sticky panel are restyled onto this site's own
 * OKLCH tokens (`bg-card`, `border-border`, `text-accent-signal` for the
 * active numeral) instead of importing the original's hardcoded dark
 * palette. The core mechanism is unchanged: an internal scroll container
 * (`useScroll({ container: ref })`) drives `scrollYProgress`, which is
 * mapped to the nearest item breakpoint via `useMotionValueEvent` to decide
 * which item is "active" — that scroll-linked activation is the actual
 * "sticky scroll reveal" behaviour, not the dark styling.
 *
 * **`prefers-reduced-motion`**: `useReducedMotion()` gates the sticky
 * panel's colour/opacity transition duration down to `0`. The scroll
 * position itself is the user's own scrolling, not autoplaying motion — the
 * hard constraint targets animation this component would otherwise trigger
 * on the user's behalf (the panel's cross-fade between phases), not the act
 * of reading by scrolling.
 */
export function StickyScrollReveal({ items }: { items: readonly StickyScrollItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    container: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const breakpoints = items.map((_, index) => index / items.length);
    const closest = breakpoints.reduce((closestIndex, breakpoint, index) => {
      const distance = Math.abs(latest - breakpoint);
      const closestDistance = Math.abs(latest - breakpoints[closestIndex]);
      return distance < closestDistance ? index : closestIndex;
    }, 0);
    setActiveIndex(closest);
  });

  const active = items[activeIndex];
  const transitionDuration = shouldReduceMotion ? 0 : 0.35;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div
        ref={containerRef}
        className="reveal h-[30rem] overflow-y-auto rounded-2xl border border-border bg-card/60 px-6 py-4 md:h-[34rem] md:px-10"
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            data-active={index === activeIndex}
            className="my-14 max-w-xl transition-opacity duration-300 first:mt-6 last:mb-6 data-[active=false]:opacity-50"
          >
            <span className="font-display text-sm text-muted-foreground">
              {String(item.index).padStart(2, "0")}
            </span>
            <h3 className="mt-2 font-display text-2xl font-semibold text-card-foreground md:text-3xl">
              {item.title}
            </h3>
            <p className="mt-3 text-base text-muted-foreground">{item.description}</p>
            {item.badge ? (
              <span className="mt-4 inline-flex w-fit items-center rounded-full border border-accent-signal/40 bg-accent-signal/10 px-3 py-1 text-xs font-medium text-accent-signal">
                {item.badge}
              </span>
            ) : null}
          </div>
        ))}
      </div>

      <motion.div
        key={active.id}
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: transitionDuration }}
        className={cn(
          "reveal sticky top-24 hidden h-fit rounded-2xl border border-border bg-foreground p-10 text-background lg:block",
        )}
      >
        <span className="font-display text-8xl font-medium text-accent-signal">
          {String(active.index).padStart(2, "0")}
        </span>
        <p className="mt-6 font-display text-2xl font-medium">{active.title}</p>
        <p className="mt-4 text-sm text-background/70">{active.description}</p>
      </motion.div>
    </div>
  );
}
