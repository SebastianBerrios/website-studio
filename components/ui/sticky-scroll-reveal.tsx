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
 *
 * **Contrast, corrected 2026-08-01 (remediation of `verify-report-final.md`
 * finding W5)**: the inactive phase used to dim to `opacity-50`, which — over
 * this section's `bg-card/60` backdrop — put its body text at **2.29:1**
 * against the WCAG AA floor of 4.5:1 (computed OKLCH → linear sRGB → relative
 * luminance, the same method `app/globals.css`'s palette comment uses). Raised
 * to `opacity-[0.85]`: body text now measures **4.87:1**, phase titles
 * **10.00:1** — both comfortably above their respective 4.5:1/3:1 floors,
 * while the dim/active distinction (the section's whole affordance) stays
 * visibly real, just less extreme. No token in `app/globals.css` changed;
 * this is a local opacity value, not a palette edit.
 *
 * **Badge contrast, same remediation (finding W6)**: the "requires approval"
 * badge used to be `text-accent-signal` on `bg-accent-signal/10` over the
 * same card backdrop — 4.08:1, just under the 4.5:1 floor for its `text-xs`
 * size. Switched to the same solid `bg-accent-signal`/`text-accent-signal-
 * foreground` pairing already used for the hero and pricing CTAs elsewhere on
 * the site (**5.05:1**), rather than inventing a new low-alpha tint — reuses
 * an already-verified pair instead of adding a second one to keep track of.
 *
 * **Keyboard/screen-reader reachability (finding W10)**: the scroll container
 * previously had no `role`, no accessible name, and was not part of the tab
 * order — a nested scroll region with no focusable children of its own is not
 * reliably keyboard-reachable. It now takes `role="region"`, an
 * `ariaLabel` prop (the section's own translated heading, so no new copy is
 * introduced), and `tabIndex={0}` so it is a real stop in the tab order; once
 * focused, arrow/Page keys scroll it natively. The `lg`-and-up sticky preview
 * panel restates the active phase's title/description **verbatim** — a
 * sighted-only convenience, not new information — so it is now `aria-hidden`
 * to stop assistive tech from hearing every phase's copy twice.
 */
export function StickyScrollReveal({
  items,
  ariaLabel,
}: {
  items: readonly StickyScrollItem[];
  /** Accessible name for the scrollable region (finding W10). */
  ariaLabel: string;
}) {
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
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        className="reveal h-[30rem] overflow-y-auto rounded-2xl border border-border bg-card/60 px-6 py-4 md:h-[34rem] md:px-10"
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            data-active={index === activeIndex}
            className="my-14 max-w-xl transition-opacity duration-300 first:mt-6 last:mb-6 data-[active=false]:opacity-[0.85]"
          >
            <span className="font-display text-sm text-muted-foreground">
              {String(item.index).padStart(2, "0")}
            </span>
            <h3 className="mt-2 font-display text-2xl font-semibold text-card-foreground md:text-3xl">
              {item.title}
            </h3>
            <p className="mt-3 text-base text-muted-foreground">{item.description}</p>
            {item.badge ? (
              <span className="mt-4 inline-flex w-fit items-center rounded-full bg-accent-signal px-3 py-1 text-xs font-medium text-accent-signal-foreground">
                {item.badge}
              </span>
            ) : null}
          </div>
        ))}
      </div>

      <motion.div
        key={active.id}
        aria-hidden="true"
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
