import { formatTurnaround, QUOTE_BLOCK } from "@/lib/content/pricing";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/content/locales";
import { Price } from "./price";

/**
 * Server Component: Line B's quote-on-request block. Task 4.3.
 *
 * See `specs/pricing/spec.md`'s "Line B Quote-on-Request Contract": typical
 * project shapes, the variables that move price, the quoting process, and a
 * starting-from floor — never a fixed tier. `QUOTE_BLOCK`
 * (`lib/content/pricing.ts`) is the single source for all of this; see that
 * module's doc comment for why the gap between this floor and Line A/C's
 * fixed tiers is stated plainly rather than oversold.
 */
export function QuoteBlock({ locale }: { locale: Locale }) {
  const { pricing } = getDictionary(locale);

  return (
    <div className="reveal rounded-2xl border border-border bg-card p-6">
      <div>
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {pricing.quoteShapesHeading}
        </h4>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {QUOTE_BLOCK.typicalShapes.map((shape) => (
            <li key={shape[locale]}>{shape[locale]}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {pricing.quoteVariablesHeading}
        </h4>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {QUOTE_BLOCK.variables.map((variable) => (
            <li key={variable[locale]}>{variable[locale]}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {pricing.quoteProcessHeading}
        </h4>
        <p className="mt-2 text-sm text-muted-foreground">
          {QUOTE_BLOCK.process[locale]}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {pricing.turnaroundLabel}:{" "}
          {QUOTE_BLOCK.turnaround.status === "set"
            ? formatTurnaround(QUOTE_BLOCK.turnaround.value)
            : pricing.turnaroundPendingNote}
        </p>
      </div>

      <p className="mt-6 text-2xl">
        <span className="text-sm text-muted-foreground">
          {pricing.quoteFloorPrefix}{" "}
        </span>
        <Price token={QUOTE_BLOCK.floorToken} />
      </p>
    </div>
  );
}
