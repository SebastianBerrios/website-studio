/**
 * Server Component: the deliberately loud, unmistakable "unresolved price"
 * state. Task 4.0 (moved here from task 3.7 — this file's first consumer is
 * PR 4's pricing page, not PR 3b's retainer section, so the component was
 * held until PR 4 shipped rather than created without a caller).
 *
 * See `openspec/changes/dev-services-website/design.md` D8: "The `pending`
 * branch renders `<PricePending token={token} />` — a deliberately loud,
 * designed element (dashed outline, `PRECIO PENDIENTE`, the token name),
 * never bare text and never a gray box passed off as a number." No invented
 * number can appear here, because this component accepts no numeric prop at
 * all — only the token name, for identification during review.
 *
 * In this repo's actual state every `PriceToken` is `"set"` (task 4.1
 * populated all 8 figures), so this component renders in production only if
 * a future edit reintroduces a `pending` entry — which is exactly the case
 * `PRICE_INTEGRITY_CHECK_ACTIVE` (task 4.10, `lib/content/invariants.ts`) now
 * fails the production build on. This component stays as the dev/preview
 * signal for that same state.
 */
export function PricePending({ token }: { token: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-md border-2 border-dashed border-destructive px-3 py-1 text-sm font-semibold uppercase tracking-wide text-destructive"
      data-price-token={token}
    >
      Precio pendiente
      <span className="font-mono text-xs font-normal normal-case">
        [{token}]
      </span>
    </span>
  );
}
