# Apply Progress: dev-services-website

Batch: 2 of N (PR 1 — Truth pass, complete; PR 2a — `lib/content/**` core
types and data, complete)
Branch: `feat/content-model-core` (based on `feat/truth-pass`, PR 1)
Delivery strategy: `auto-chain` / `stacked-to-main`
Mode: Standard (no test runner; `strict_tdd: false`)

---

## PR 1 — Truth pass

### Code tasks

- [x] 1.1 `app/layout.tsx`: replaced `"Website Studio"` / empty description
      with ElectroCode Studio branding, real description, matching
      `openGraph` fields.
- [x] 1.2 `app/page.tsx`: removed the 5 duplicate `products` entries (kept
      the 4 unique entries); changed "Blu Finances" `link` from `"/"` to
      `"/#proyectos"` with a code comment noting it is temporary until the
      case-study route ships in PR 5.
- [x] 1.3 Created `lib/links.ts` exporting `isExternalHref(href: string):
      boolean` per design D6's regex.
- [x] 1.4 `components/ui/hero-parallax.tsx` — `ProductCard` branches on
      `isExternalHref(product.link)`. External → `<a target="_blank"
      rel="noopener noreferrer">` (added the missing `rel`). Internal →
      `<Link>` (from `next/link`), no `target`.
- [x] 1.5 `components/ui/hero-parallax.tsx` — row derivation replaced with
      `SINGLE_ROW_MAX = 4; splitAt = products.length <= 4 ? products.length
      : Math.ceil(products.length / 2)`. Third `motion.div` track deleted.
      `translateX` drives row 1, `translateXReverse` drives row 2 (rendered
      only when `secondRow.length > 0`).
- [x] 1.6 `components/ui/hero-parallax.tsx` — `Header()` CTA `href` changed
      from `/portfolio` to `/#proyectos`. Copy left hardcoded (dictionary
      extraction stays PR 2c/2b's job, per task 1.6's explicit instruction
      not to write the strings twice).
- [x] 1.7 Created `components/layout/site-header.tsx` (Server Component):
      brand name + nav links to `#proyectos`, `#precios`, WhatsApp link
      (conditionally rendered, only when the contact channel is `set`).
      Rendered above `<HeroParallax>` in `app/page.tsx`.
- [x] 1.8 Created `components/layout/site-footer.tsx` (Server Component):
      brand, nav links, WhatsApp reference (same conditional rendering), no
      locale-switcher implication. Rendered below `<HeroParallax>`.
- [x] 1.9 Created `lib/contact.ts` (temporary): exports a discriminated
      `ContactChannel` and `WHATSAPP: ContactChannel = { status: "pending" }`
      — the number was not supplied (task 1.H1 is still open), so the
      channel stays `pending` and renders nothing anywhere it is consumed.
      **Superseded in PR 2a by `lib/content/contact.ts` (task 2.7); this
      file has been deleted.**

### Human tasks (blocking) — status

- [ ] 1.H1 **[HUMAN, blocks 1.7/1.8/1.9's live state]** WhatsApp business
      number NOT supplied. Implemented honestly across both batches:
      `lib/content/contact.ts` (formerly `lib/contact.ts`) stays in
      `pending` state; `SiteHeader`/`SiteFooter` render no WhatsApp
      affordance at all until this lands. Nothing was invented.
- [ ] 1.H2 **[HUMAN]** `https://www.atemporalarq.com/` liveness not
      independently reverified in either batch (no browsing tool available
      to the apply agent) — carried forward as still UNVERIFIED, unchanged
      from the proposal/design's own inherited-risk note (design.md risk
      12).

### Verification

- [x] 1.V1 `npm run build` passes.
- [x] 1.V2 `npm run lint` passes.
- [ ] 1.V3 **Human, NOT performed by this agent** — visually check the hero
      at ~375px, ~768px, ~1440px, ~1920px+.
- [x] 1.V4 Automated substitute performed: search across `*.ts`/`*.tsx` for
      `/portfolio` and `link: "/"` returns zero matches. Human browser
      click-through **not** performed by this agent — still recommended
      before merge.
- [ ] 1.V5 **Human, NOT performed by this agent** — confirm
      `HoverBorderGradient`'s hover-gradient animation still renders
      correctly after the href change.

**Status**: 9/9 code tasks complete. 2/2 automated gates pass. Rollback:
revert the single squashed merge commit once on `main` — zero data, zero
infra.

---

## PR 2 — Locale skeleton + content model (split 2a/2b/2c)

### PR 2a — `lib/content/**` core types and data (no routing) — THIS BATCH

Satisfies: `content-model` (Project Entity Shape, Evidence Field, Consent
Field Semantics, Service Line Enumeration, Pricing Module — partial, see
below), `service-catalog` (Fixed Four-Line Catalog), `trust-signals`
(Retainer Published Commitments — types only, Academy No-Link State, Academy
No-Scale-Claim Constraint). Design decisions: D8, D9.

#### Code tasks

- [x] 2.1 Created `lib/content/locales.ts`: `LOCALES = ["es"] as const`,
      `Locale`, `DEFAULT_LOCALE`, `isLocale()` (type guard), `assertLocale()`
      (calls `notFound()` from `next/navigation` on a miss, narrows
      `string` → `Locale`). — *design D3 layer 3*
- [x] 2.2 Created `lib/content/types.ts`: `Localized<T> = Record<Locale,
      T>`; `MediaAsset` (`StaticImageData` + `Localized<string>` alt, type
      import from `next/image`); `Consent` (3-state: `granted` |
      `anonymised` | `withheld`); `Outcome` (`metric` with mandatory
      `source`, or `qualitative`); `Evidence` (4-state: `live` | `gated` |
      `not-deployed` | `no-visual`, each with the media/field requirements
      design.md §5 specifies); `Project` (superset of the legacy `{ title,
      link, thumbnail }` shape). — *content-model: Project Entity Shape,
      Evidence Field, Consent Field Semantics; case-study: No Invented
      Metric*
- [x] 2.3 Created `lib/content/service-lines.ts`: `ServiceLine = "A" | "B" |
      "C" | "D"`; `SERVICE_LINES` as `const satisfies Record<ServiceLine,
      ServiceLineDefinition>` — compile-time-exhaustive, exactly 4 entries,
      each with a locale-keyed `name`/`description` describing what the
      exploration/proposal already settled (landing & corporate sites,
      custom web apps & dashboards, biolinks & event microsites,
      maintenance/evolution). — *service-catalog: Fixed Four-Line Catalog*
- [x] 2.4 Created `lib/content/pricing.ts`: `Currency = "PEN" | "USD"`;
      `PriceToken` union (8 tokens: `landing-basic/standard/premium`,
      `microsite-basic/event`, `app-from`, `care-basic/standard`); `Money`;
      `PriceEntry` (`set` | `pending`); `PRICES` as `const satisfies
      Record<PriceToken, PriceEntry>` — **every entry `status: 'pending'`**.
      No figure, no currency decided (blocked on 4.H1). — *design D8;
      content-model: Pricing Module*
- [x] 2.5 Created `lib/content/retainer.ts`: `Commitment<T>` generic
      wrapper (`pending` | `set`, applying D8's pattern to non-price
      commitments); `RetainerCommitments` with all 6 required fields
      (`responseWindow`, `channels`, `monthlyHours`, `includedScope`,
      `excludedScope`, `cancellationTerms`); `RETAINER_COMMITMENTS` instance
      — **every field `{ status: 'pending' }`**, none invented (blocked on
      4.H2). — *trust-signals: Retainer Published Commitments*
- [x] 2.6 Created `lib/content/authority.ts`: `Authority` union (`no-link` |
      `linked`, `url` field exists only on `linked`); `ACADEMY` instance set
      to `no-link` (repo is private, deployment 404s — VERIFIED in
      exploration.md §4.2/§4.4). `media: []` — no local capture of the
      academy exists in this repo's `public/` yet. — *trust-signals: Academy
      No-Link State, Academy No-Scale-Claim Constraint*
- [x] 2.7 Created `lib/content/contact.ts`: same `ContactChannel`
      discriminant as PR 1's temporary module, `WHATSAPP = { status:
      "pending" }` (number still not supplied, task 1.H1 still open).
      Deleted PR 1's `lib/contact.ts`; updated `site-header.tsx` and
      `site-footer.tsx` imports to the new path.

#### Deviations / interpretations (flagged, not silent)

Two places where `specs/content-model/spec.md`'s literal field enumeration
and `design.md`'s more detailed shape appear to disagree. In both cases I
followed the design, which is more specific and explicitly reasoned, and
recorded the choice in code comments on `lib/content/types.ts`:

1. **`approach` is not a field on `Project`.** The spec's "Project Entity
   Shape" requirement lists `approach` among the entity's fields. Design.md
   §5 ("Prose isolation — the MDX seam") explicitly states "`Project` holds
   **no** long prose at all" and resolves it via
   `getProjectApproach(slug)` instead (PR 2b). I followed the design: it
   directly names and reasons about this exact tension, and the spec's
   scenario for this requirement only tests that the legacy `{ title, link,
   thumbnail }` shape survives — it does not test for an `approach` field's
   presence.
2. **No top-level `media`/`externalUrl` fields on `Project`.** The spec
   lists both alongside `evidence`. Design.md §5's `Evidence` union
   description nests `media` and `externalUrl` inside the matching
   `Evidence` variant instead, because their required-ness differs per
   evidence state (e.g. `no-visual` requires empty media; `live` requires
   `externalUrl`; `not-deployed` has neither). Duplicating them as
   always-present top-level fields would create two sources of truth that
   could disagree — exactly the kind of defect `invariants.ts` (PR 2b) is
   built to catch. I nested them per design and did not duplicate.
3. **`RetainerCommitments`'s fields are wrapped in a `Commitment<T>`
   `pending`/`set` discriminant**, not plain required values. Design.md §5
   states "every field ... is required: a missing commitment is a compile
   error, not an empty section" but does not spell out how to keep that
   guarantee while also not inventing figures that have not been supplied
   (task 2.5's own text: "instance with placeholder values pending 4.H2").
   I generalized D8's exact `PriceEntry` pattern (`{status:'set'|'pending'}`)
   to retainer commitments: every field is present as a required key
   (satisfying "no missing commitment"), and every field's current value is
   honestly `pending` (satisfying "do not fabricate values"). This is an
   extension of an established in-repo pattern, not a new mechanism.

No other deviations from design or tasks for PR 2a's assigned scope.

#### Honesty check — how it was verified

Grepped `lib/content/**` for `amount:`, `currency:`, numeric `value:`,
`PEN`, `USD`, `https?://`, and `wa.me`. Every match is either (a) a type
declaration (`Currency = "PEN" | "USD"`, `amount: number`, `currency:
Currency` as field *types*, never assigned values) or (b) a code-comment
explaining why no value is invented. Also grepped for `status: "set"`
across `lib/content/**`: every match is a type-union member declaration
(`PriceEntry`, `Commitment<T>`, `ContactChannel`); no constant
(`PRICES`, `RETAINER_COMMITMENTS`, `WHATSAPP`, `ACADEMY`) currently uses the
`set`/`linked` branch — every one is in its honest unresolved state.
Confirmed no `.png`/media static import exists for the Academy block (no
such asset exists yet in this repo's `public/`), so `ACADEMY.media` is `[]`
rather than a reference to a non-existent file.

#### Scope boundary respected

Did NOT create `lib/content/projects/**`, `projections.ts`, `invariants.ts`,
or `lib/dictionaries/**` (PR 2b). Did NOT touch `next.config.ts`, enable
`typedRoutes`, add `redirects()`, or create `app/[locale]/` (PR 2c). Zero
`.tsx` files created in this batch; zero React imports anywhere under
`lib/content/**` (confirmed by grep).

### Human tasks — status (PR 2)

- [ ] 2.H1 **[HUMAN]** Confirm fragment redirects (`#proyectos`) behave as
      expected once deployed — not applicable yet, `redirects()` is PR 2c.
- [ ] 2.H2 **[HUMAN]** Supply `NEXT_PUBLIC_SITE_URL` — not applicable yet,
      consumed starting PR 2c.

### Verification (PR 2a's slice of PR 2's list)

- [x] Ran `npm run build` — passes. See "Build result" below.
- [x] Ran `npm run lint` — passes, only the 2 pre-existing
      `hover-border-gradient.tsx` warnings (PR 2c's job, untouched here).
      See "Lint result" below.
- [x] Confirmed no invented price, currency, URL, metric, or consent flag
      exists anywhere in this batch's code — see "Honesty check" above.

The full PR 2's `2.V1`-`2.V6` verification items (locale routing,
`typedRoutes`, redirects, `<head>` metadata) do not apply yet — they depend
on PR 2c's routing work, not yet started.

## Build result (verbatim, final commit `ced51f6`)

```
> website-studio@0.1.0 build
> next build

▲ Next.js 16.1.1 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 2.2s
  Running TypeScript ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (0/4) ...
  Generating static pages using 11 workers (1/4)
  Generating static pages using 11 workers (2/4)
  Generating static pages using 11 workers (3/4)
✓ Generating static pages using 11 workers (4/4) in 525.1ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
└ ○ /_not-found

○  (Static)  prerendered as static content
```

## Lint result (verbatim, final commit `ced51f6`)

```
> website-studio@0.1.0 lint
> eslint

D:\Programming\Frontend\website-studio\components\ui\hover-border-gradient.tsx
  59:6   warning  React Hook useEffect has missing dependencies: 'duration' and 'rotateDirection'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  63:22  warning  'event' is defined but never used                                                                                                    @typescript-eslint/no-unused-vars

✖ 2 problems (0 errors, 2 warnings)
```

Exit code 0. Both warnings are pre-existing in `hover-border-gradient.tsx`,
a file this batch did not touch (its `href` retype to `Route` is task 2.24,
PR 2c).

## Files changed (PR 2a)

| File | Action | What was done |
|---|---|---|
| `lib/content/locales.ts` | Created | `Locale`, `LOCALES`, `DEFAULT_LOCALE`, `isLocale()`, `assertLocale()` |
| `lib/content/types.ts` | Created | `Localized<T>`, `MediaAsset`, `Consent`, `Outcome`, `Evidence`, `Project` |
| `lib/content/service-lines.ts` | Created | `ServiceLine`, `SERVICE_LINES` (exactly 4, compile-time exhaustive) |
| `lib/content/pricing.ts` | Created | `Currency`, `PriceToken` (8), `Money`, `PriceEntry`, `PRICES` (all pending) |
| `lib/content/retainer.ts` | Created | `Commitment<T>`, `RetainerCommitments`, `RETAINER_COMMITMENTS` (all pending) |
| `lib/content/authority.ts` | Created | `Authority`, `ACADEMY` (`no-link`) |
| `lib/content/contact.ts` | Created | `ContactChannel`, `WHATSAPP` (`pending`) — supersedes `lib/contact.ts` |
| `lib/contact.ts` | Deleted | Superseded by `lib/content/contact.ts` |
| `components/layout/site-header.tsx` | Modified | Import path updated to `@/lib/content/contact` |
| `components/layout/site-footer.tsx` | Modified | Import path updated to `@/lib/content/contact` |

## Commits (in order, on `feat/content-model-core`, based on `feat/truth-pass`)

**PR 1** (on `feat/truth-pass`, already merged into this branch's history):
1. `7fdf90d` — `fix(hero-parallax): derive rows from array length, fix unsafe external link`
2. `c18e6ac` — `feat(contact): add pending WhatsApp contact channel`
3. `918d329` — `feat(layout): add site header and footer chrome`
4. `5c500ec` — `fix(home): remove duplicate/dead product entries, wire site chrome`
5. `84c88ee` — `feat(seo): add ElectroCode Studio brand metadata`
6. `6343019` — `docs(sdd): mark PR 1 tasks complete, record apply progress`

**PR 2a** (this batch, on `feat/content-model-core`):
7. `179946a` — `feat(content): add locale registry and core content types`
8. `a93ed63` — `feat(content): add pricing, retainer, and authority data modules`
9. `ced51f6` — `refactor(contact): move contact channels into content model`

No push performed. No PR opened. Local commits only, per instructions.

## Workload / PR boundary

- Mode: chained PR slice (`auto-chain` / `stacked-to-main`)
- Current work unit: PR 2a — `lib/content/**` core types and data (complete,
  self-contained, zero routing/component work)
- Diff vs `feat/truth-pass`: 10 files touched (6 created under
  `lib/content/`, 1 deleted, 3 modified), 378 insertions(+), 20
  deletions(-) across the 3 PR 2a commits (`git diff --stat 6343019
  ced51f6`) — within the ~350-line estimate in tasks.md's Review Workload
  Forecast, under the 400-line budget.
- Boundary: starts from `feat/truth-pass`'s state (PR 1 chrome +
  hero fixes, temporary `lib/contact.ts`); ends with the full core content
  type system in place (`Locale`, `Localized<T>`, `Project`, `Evidence`,
  `Consent`, `Outcome`, `ServiceLine`, pricing/retainer/authority/contact
  data, all honestly unresolved where real figures are not yet supplied)
  and zero routing changes. Rollback: revert the 3 PR 2a commits (or the
  squashed merge once this reaches `main`) — no data, no infra, no route
  changes to unwind; `feat/truth-pass`'s state is fully restored.
- Next batch: PR 2b (`lib/content/projects/**`, `projections.ts`,
  `invariants.ts`, `lib/dictionaries/**`) — base branch should be this
  batch's tip, per `stacked-to-main`.

## Human verification still outstanding (not performed by this agent)

Carried forward from PR 1 (unchanged):
- [ ] 1.H1 — supply the real WhatsApp business number
- [ ] 1.H2 — confirm `atemporalarq.com` liveness
- [ ] 1.V3 — visual check of the hero at 375/768/1440/1920px+
- [ ] 1.V4 (browser click-through) — click every internal/external link
      live in a browser
- [ ] 1.V5 — visually confirm `HoverBorderGradient`'s hover animation after
      the href change

New from PR 2 (not yet reached — will apply once PR 2b/2c ship):
- [ ] 2.H1 — confirm fragment redirects behave as expected
- [ ] 2.H2 — supply `NEXT_PUBLIC_SITE_URL`
- [ ] 2.V3-2.V6 — locale routing, unknown-segment 404, `/es` parity, `<head>`
      metadata checks — all depend on PR 2c's routing work, not started.

## Status

**PR 1**: 9/9 code tasks complete. 2/2 automated gates pass. 2 human tasks
and 3 human verification items remain open (unchanged from batch 1).

**PR 2a**: 7/7 code tasks (2.1-2.7) complete. 2/2 automated gates pass
(`npm run build`, `npm run lint`). Zero React imports confirmed under
`lib/content/**`. Zero invented prices, currencies, URLs, metrics, or
consent flags confirmed by targeted grep. PR 2a is self-contained and ready
for `sdd-verify` or the next chained batch (PR 2b).

**Overall**: 16/16 assigned code tasks across PR 1 + PR 2a complete. Ready
for `sdd-apply` to continue with PR 2b, or `sdd-verify` to validate what
has shipped so far.
