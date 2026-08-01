"use client";

import { useEffect } from "react";
import { motion, stagger, useAnimate, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Adapted from Aceternity UI's Text Generate Effect — the hero's one
 * orchestrated entrance moment (design brief for feat/editorial-design): a
 * staggered, blur-in word reveal for the hero heading. Adapted rather than
 * copied verbatim: the original hardcodes `text-black dark:text-white` and a
 * fixed `text-2xl` size, which would fight this site's own OKLCH tokens and
 * the hero's dramatic display-serif scale. Both are removed here — `className`
 * fully controls typography, and the words themselves inherit colour from
 * their parent instead of hardcoding one.
 *
 * `words` splits on whitespace, so each word gets its own staggered
 * `<motion.span>` — matching the original mechanism exactly, just restyled.
 *
 * **`prefers-reduced-motion`**: `useReducedMotion()` (from `motion/react`,
 * not a custom media-query hook) is checked before the animate call. When
 * true, every word is animated with `duration: 0` — it still runs through
 * `useAnimate`'s imperative API (so the component has one code path, not
 * two), but resolves instantly with no blur, no stagger, no visible motion.
 * This is a scroll-independent, autoplaying entrance animation, exactly the
 * class of motion the hard constraint requires reduced/disabled.
 */
export function TextGenerateEffect({
  words,
  className,
  filter = true,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}) {
  const [scope, animate] = useAnimate();
  const shouldReduceMotion = useReducedMotion();
  const wordsArray = words.split(" ");

  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      shouldReduceMotion
        ? { duration: 0 }
        : { duration, delay: stagger(0.15) },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope.current, shouldReduceMotion]);

  return (
    <motion.div ref={scope} className={cn(className)}>
      {wordsArray.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="opacity-0"
          style={{ filter: filter ? "blur(10px)" : "none" }}
        >
          {word}
          {index < wordsArray.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.div>
  );
}
