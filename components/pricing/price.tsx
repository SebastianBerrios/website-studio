import {
  PRICES,
  formatMoney,
  type PriceEntry,
  type PriceToken,
} from "@/lib/content/pricing";
import { PricePending } from "./price-pending";

/**
 * Server Component: the ONE place a price figure is ever rendered. Task 4.0
 * (moved here from task 3.7 — see `price-pending.tsx`'s doc comment for why).
 *
 * Exhaustive switch on `PriceEntry.status` (design.md D8). `pending` renders
 * `<PricePending>`; `set` renders the formatted `Money` value via
 * `formatMoney()` (`lib/content/pricing.ts`) — never a raw number assembled
 * inline, so no component anywhere else can accidentally hardcode a figure.
 *
 * **`tabular-nums` lives here, not per-consumer** (feat/editorial-design):
 * every figure on `/[locale]/precios` renders through this one component, so
 * putting the digit-alignment rule on its own `<span>` guarantees every
 * price on the page uses fixed-width numerals — the pricing tables align
 * whether a consumer remembers the utility class or not.
 */
export function Price({ token }: { token: PriceToken }) {
  // Widened explicitly to `PriceEntry` (not the narrower literal type
  // `PRICES[token]` infers today, when every entry happens to be "set") so
  // the exhaustive switch below still type-checks the full `pending` branch.
  // Without this, TypeScript would flag `case "pending"` as unreachable —
  // correctly, given today's data — and the very branch that must survive
  // `checkPendingPricesInProduction()`'s (`lib/content/invariants.ts`) fault
  // injection would fail to compile the moment a real regression reintroduces
  // a pending token.
  const entry = PRICES[token] as PriceEntry;

  switch (entry.status) {
    case "set":
      return (
        <span className="font-display font-semibold tabular-nums">
          {formatMoney(entry.value)}
        </span>
      );
    case "pending":
      return <PricePending token={token} />;
    default: {
      const exhaustiveCheck: never = entry;
      throw new Error(`Unhandled price status: ${String(exhaustiveCheck)}`);
    }
  }
}
