import { Fragment } from "react";
import { cn } from "@/lib/utils";

/**
 * The hero's one orchestrated entrance moment: a staggered, blur-in word
 * reveal for the heading. Inspired by Aceternity UI's Text Generate Effect,
 * but driven by CSS rather than by JavaScript.
 *
 * **Why it is not a client component.** The original adaptation shipped every
 * word as `class="opacity-0" style="filter:blur(10px)"` in the static HTML and
 * revealed them from a `useEffect`. Three problems, all real
 * (verify-report-final.md, finding C5):
 *
 * 1. With JavaScript disabled or broken, the site's primary heading was
 *    invisible. Not degraded — gone.
 * 2. It is the LCP element, so the largest paint waited on hydration.
 * 3. An inline style written by JS cannot be reached by the global
 *    `prefers-reduced-motion` override in `app/globals.css`, so the one
 *    animation most likely to bother a motion-sensitive visitor was the one
 *    the override could not touch.
 *
 * As CSS every failure mode resolves to "visible": CSS animations run without
 * JavaScript, an unsupported animation leaves the element at its natural
 * opacity, and reduced motion collapses the duration so it lands on the final
 * state immediately. The stagger is a per-word `animation-delay`, which is
 * static markup — so this renders on the server and costs no client bundle.
 *
 * `words` splits on whitespace; each word becomes its own delayed span.
 */
export function TextGenerateEffect({
  words,
  className,
  staggerSeconds = 0.12,
  startDelaySeconds = 0,
}: {
  words: string;
  className?: string;
  /** Delay added per word. Keep it small — the heading should read as one gesture. */
  staggerSeconds?: number;
  /**
   * Offset applied before the first word. A multi-line heading renders one
   * instance per line, and without this every line would start together
   * instead of continuing the same sweep.
   */
  startDelaySeconds?: number;
}) {
  const wordsArray = words.split(" ");

  return (
    <span className={cn(className)}>
      {wordsArray.map((word, index) => (
        // The separating space sits BETWEEN the spans, never inside one.
        // `.reveal-word` is `display: inline-block` so each word can carry its
        // own `animation-delay`, and a browser discards trailing whitespace
        // inside an inline-block box — so a space kept inside the span
        // vanished and the heading rendered as "Tuproyectoesúnico".
        //
        // The space was present in the HTML the whole time, which is why
        // grepping the compiled output said the fix was fine. It only shows
        // up when someone looks at the page.
        <Fragment key={`${word}-${index}`}>
          <span
            className="reveal-word"
            style={{
              animationDelay: `${startDelaySeconds + index * staggerSeconds}s`,
            }}
          >
            {word}
          </span>
          {index < wordsArray.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
