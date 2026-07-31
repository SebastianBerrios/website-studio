# Apply Progress: dev-services-website

Batch: 3 of N (PR 1 — Truth pass, complete; PR 2a — `lib/content/**` core
types and data, complete; PR 2b — projects/projections/invariants/
dictionaries, complete)
Branch: `feat/content-model-projections` (based on `feat/content-model-core`,
PR 2a; which is based on `feat/truth-pass`, PR 1)
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
      only when `secondRow.length > 0`). **Superseded in PR 2b** — see below.
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
      number NOT supplied. Implemented honestly across all three batches:
      `lib/content/contact.ts` stays in `pending` state; `SiteHeader`/
      `SiteFooter` render no WhatsApp affordance at all until this lands.
      Nothing was invented.
- [ ] 1.H2 **[HUMAN]** `https://www.atemporalarq.com/` liveness not
      independently reverified in any batch (no browsing tool available to
      the apply agent) — carried forward as still UNVERIFIED. PR 2b now
      tracks this explicitly in data via `lib/content/projects/index.ts`'s
      `UNVERIFIED_LIVENESS` list, not only in this progress doc.

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

### PR 2a — `lib/content/**` core types and data (no routing)

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
and `design.md`'s more detailed shape appear to disagree. In both cases the
design was followed, more specific and explicitly reasoned, recorded in code
comments on `lib/content/types.ts`:

1. **`approach` is not a field on `Project`.** Resolved via
   `getProjectApproach(slug)` (built in PR 2b) instead, per design.md §5.
2. **No top-level `media`/`externalUrl` fields on `Project`.** Both live
   inside the matching `Evidence` variant instead — their required-ness
   differs per evidence state.
3. **`RetainerCommitments`'s fields are wrapped in a `Commitment<T>`
   `pending`/`set` discriminant**, not plain required values — generalizing
   D8's `PriceEntry` pattern so every field stays present (compile error if
   missing) while every current value stays honestly `pending`.

No other deviations from design or tasks for PR 2a's assigned scope.

#### Honesty check — how it was verified

Grepped `lib/content/**` for `amount:`, `currency:`, numeric `value:`,
`PEN`, `USD`, `https?://`, and `wa.me`. Every match is either (a) a type
declaration (never assigned values) or (b) a code-comment explaining why no
value is invented. Also grepped for `status: "set"` — every match is a
type-union member declaration, no constant used the `set`/`linked` branch.
Confirmed no `.png` static import exists for the Academy block.

#### Scope boundary respected

Did NOT create `lib/content/projects/**`, `projections.ts`, `invariants.ts`,
or `lib/dictionaries/**` (PR 2b, done in the next batch below). Did NOT
touch `next.config.ts`, enable `typedRoutes`, add `redirects()`, or create
`app/[locale]/` (PR 2c). Zero `.tsx` files created in this batch; zero React
imports anywhere under `lib/content/**` (confirmed by grep).

### PR 2b — projects, projections, invariants, dictionaries — THIS BATCH

Satisfies: `content-model` (remaining requirements: Slug Uniqueness, Locale
Dictionary Structure), `project-portfolio` (Curated Set Size, Hero Projection
Preserves Prop Contract, Row Derivation From Array Length — already
implemented in PR 1/refined further here, Portfolio Grid Consistency With
Hero — data source only, rendering is PR 3a), `case-study` (the prose-seam
scaffolding `getProjectApproach()` depends on, not the routes/rendering
themselves — those are PR 5). Design decisions: D5, D9 (`projects/**`,
`projections.ts`, `invariants.ts`, `dictionaries/**` per §5's file tree),
§6 (integrity gates).

#### Code tasks

- [x] 2.8 Created `lib/content/projects/index.ts`: `PROJECTS: readonly
      Project[]`, 7 entries (Luang, Atemporal, Blu Café, `blu`, `fast-route`,
      `blu-biolink`, `wedding-invitation-piero`), all sourced from
      exploration.md §4.1-§4.4's VERIFIED facts. 6 are `featured: true` and
      publishable (`consent.status !== "withheld"`); `wedding-invitation-
      piero` is `featured: false` and `withheld`. Also exports
      `PROJECT_SLUGS`/`ProjectSlug` (a closed union used by the approach
      loader's exhaustive switch) and `UNVERIFIED_LIVENESS` (see the
      dedicated note below). — *project-portfolio: Curated Set Size*
- [x] 2.9 Created `lib/content/projects/media.ts`: static `import` of all 4
      existing `public/projects/*.png` files (`luang`, `atemporal`,
      `blucafe`, `blucafefinance`) into a `MEDIA` map keyed by asset id.
      Every import path verified to resolve to an actual file on disk (see
      "Verification" below).
- [x] 2.10 Created `lib/content/projects/approach/loader.ts`
      (`getProjectApproach(slug)`, `import "server-only"`, `async` per
      design D9's MDX seam) plus one placeholder `approach/<slug>.ts` per
      project (7 files, including the withheld one, so the loader's switch
      stays exhaustive over `ProjectSlug`). Every placeholder is a visibly
      `[PENDIENTE]` marker string — no invented narrative prose anywhere.
- [x] 2.11 Created `lib/content/projections.ts`: `toHeroProducts(locale)`,
      `toPortfolioCards(locale)`, `publishableProjects()`, plus a private
      `publicTitle()` that derives the visitor-facing name strictly from
      `consent` (never returns `client`/`title` for a project whose consent
      does not allow it) and a private `publicLink()`/`primaryThumbnail()`.
      `toHeroProducts` additionally filters out `no-visual` projects (the
      hero is an image grid) — this leaves exactly 4 hero-eligible entries
      today (Luang, Atemporal, Blu Café, `blu`), matching the "4 real
      assets" state design.md D4 already describes.
- [x] 2.12 Created `lib/content/invariants.ts` (`import "server-only"`):
      `assertContentInvariants()` — unique slugs, no internal link resolving
      to `/`/`/{locale}`, every non-retainer service line has ≥1 project, no
      empty `Localized`/`approach` string, hero floor of 4 entries,
      evidence/media shape (redundant with the type system, kept as
      defense-in-depth), and a pending-price check that is fully written but
      inert behind `PRICE_INTEGRITY_CHECK_ACTIVE = false` until task 4.10
      flips it once PR 4 populates real prices. Strict in
      `VERCEL_ENV === "production"` unless `SITE_CONTENT_GATE=warn`. File
      header documents explicitly what this can and cannot catch (data
      integrity only, never rendering/visual/interaction behavior). **Not
      yet wired into any layout/page** — that is PR 2c's task 2.17.
- [x] 2.13 Created `lib/dictionaries/types.ts` (`Dictionary`,
      `HeroDictionary`), `lib/dictionaries/es.ts` (hero `heading`/`subtitle`/
      `cta`, extracted verbatim from `hero-parallax.tsx`'s former `Header()`
      — no copy invented, only relocated), `lib/dictionaries/index.ts`
      (`getDictionary(locale)`).
- [x] 2.14 `components/ui/hero-parallax.tsx`: added `header?: React.ReactNode`
      prop to `HeroParallax`; deleted the internal `Header()` function
      entirely (confirmed unused elsewhere by repo-wide grep before
      deleting) along with its now-unused `HoverBorderGradient` import.
      `{header}` renders in `Header()`'s former position.
- [x] 2.15 Created `components/sections/hero-header.tsx` (Server Component,
      `HeroHeader({ locale })`): reads `getDictionary(locale).hero`, renders
      title/subtitle/CTA via `HoverBorderGradient`, CTA `href` built with
      `landingAnchor(locale, "proyectos")`. Not yet wired into any page.
- [x] 2.16 Extended `lib/links.ts`: added `caseStudyPath(locale, slug)`,
      `pricingPath(locale)`, `landingAnchor(locale, id)` — pure, `Locale`
      imported as `import type` (erased at compile time, so this does not
      pull `next/navigation` into `hero-parallax.tsx`'s client bundle via
      `isExternalHref`'s existing import of this same module).

#### Deviations / interpretations (flagged, not silent)

1. **`atemporalarq.com`'s unverified liveness is modeled via a side-list,
   not a new `Evidence` state.** The instruction was to make this
   uncertainty visible in the data without silently calling it `live` (as
   though confirmed) or `not-deployed` (as though broken) — but
   `lib/content/types.ts`'s `Evidence` union is a closed 4-state
   discriminated union and is PR 2a's already-shipped scope, out of this
   batch's file list. Neither `live` (asserts confirmed reachability) nor
   `not-deployed` (asserts no public deployment exists — false; it may well
   be up) is honest on its own. The resolution: `evidence.state: "live"`
   is kept (matching current production behavior — nothing has proven it
   down), but `lib/content/projects/index.ts` exports a standalone
   `UNVERIFIED_LIVENESS: readonly ProjectSlug[]` naming this entry as a real
   data structure (not only a comment), and the project's own `summary`
   field states the uncertainty in the copy a reader would see in the
   module. Carried forward as human tasks 1.H2/3.H3.
2. **Consent granularity beyond the three explicitly-named exclusions.**
   The prompt named `wedding-invitation-piero`, `blu-biolink`, and
   "sanitized `blu` captures" as consent-restricted. Working through the
   curated-set-size constraint (6–8 distinct `featured` entries per
   `specs/project-portfolio/spec.md`) against `Consent`'s own semantics
   (`withheld` projects are excluded from `publishableProjects()` entirely,
   per `lib/content/types.ts`'s own doc comment) required a further choice:
   - `blu` and `blu-biolink` are `anonymised` (industry/size only, no
     client name) rather than `withheld`, so they remain part of the
     curated/publishable set (needed to reach 6, the spec's floor) while
     never surfacing an identifying detail.
   - `wedding-invitation-piero` is `withheld` and `featured: false` — a
     private couple's personal event has no meaningful "industry/size" to
     anonymise into, so full exclusion (rather than an awkward
     anonymisation) is the more honest and more protective choice. This
     still leaves 6 featured/publishable entries, satisfying the spec's
     6-8 floor without this project.
   - `fast-route` has no third-party client named anywhere in its own
     source (exploration.md §4.4) — treated as `granted`/`namedClient: true`
     with `client: "Proyecto propio de ElectroCode Studio"`, since naming
     the studio's own unattributed project carries no third-party consent
     risk.
   - `blu`'s `consent.industry` states "Alimentos y bebidas (back-office /
     punto de venta)" — a direct read of the repo's own domain
     (recipes/orders/sales in its README, exploration.md §4.4), not an
     invented classification. `size` is honestly "Tamaño no determinado"
     rather than a guessed business-size bracket.
3. **`toHeroProducts`/`toPortfolioCards` use `Array.prototype.toSorted()`,
   not `.sort()`.** `featuredProjects()` returns `readonly Project[]`;
   `.sort()` mutates in place and does not exist on a readonly array type
   (caught by `npm run build`'s first `tsc` pass — see "Issues found"
   below). `.toSorted()` (ES2023, already in tsconfig's `esnext` lib) is
   both the fix and the more correct choice for pure projection functions.
4. **`app/page.tsx` was deliberately NOT touched**, even though this leaves
   a known interim regression (see "Issues found" below) — see that
   section for the full reasoning; it follows directly from this batch's
   explicit file boundary ("do not touch... any component or route").

No other deviations from design or tasks for PR 2b's assigned scope.

#### Issues found

**Known, accepted interim regression: the hero renders with no title/
subtitle/CTA text between this PR's merge and PR 2c's.** Task 2.14 requires
deleting `Header()`'s hardcoded copy from `hero-parallax.tsx` in THIS batch;
task 2.18 (wiring `app/[locale]/page.tsx` to pass `<HeroHeader locale={...}
/>` as the `header` prop) is explicitly PR 2c's job. `app/page.tsx` (the
still-live route in this batch) was not touched — it is a route file, and
this batch's explicit scope forbids touching "any component or route" outside
the `.tsx` files tasks 2.8-2.16 name. The net effect: under `stacked-to-main`,
once this PR reaches `main`, the hero will render its product cards with no
heading/subtitle/CTA above them until PR 2c also merges. This is a real,
visible (if brief) regression, not a silent one — flagging it here loudly
because chained delivery makes it real, not merely theoretical. No code
change was made to mask it, since doing so would mean either re-adding the
hardcoded copy this same batch was asked to remove, or reaching into
`app/page.tsx`, a file this batch's boundary explicitly withholds.

**`.sort()` on a `readonly` array is a compile error, not a runtime one** —
caught immediately by `npm run build`'s first pass; fixed by switching to
`.toSorted()` before the final build recorded below. Left here as a note in
case a reviewer diffs against an earlier local run.

#### Honesty check — how it was verified

- Grepped the newly-added files for `amount:`, `currency:`, `PEN`, `USD`,
  `wa.me`, and `https?://`. The `PEN`/`USD` search only matched as a
  substring of the `[PENDIENTE]` placeholder marker (false positive from the
  regex, confirmed by inspection) — no real currency literal anywhere. Every
  `https?://` match is one of the three exploration.md-VERIFIED live URLs
  (`luang.com.pe`, `atemporalarq.com`, `blucafe.vercel.app`); grepped
  separately for `blucafefinance.vercel.app` (the login-walled URL) across
  `lib/` — zero matches, confirming it is never modeled as a usable link.
- Grepped for `status: "set"` across the new files — zero matches; every
  `blu`/`blu-biolink` consent is `anonymised`, `wedding-invitation-piero`'s
  is `withheld`, and the other four are `granted` (matching current
  production copy, unchanged from what `app/page.tsx` already publishes
  today for Luang/Atemporal/Blu Café).
- Manually reviewed every `problem`/`role`/`outcome` field across all 7
  `PROJECTS` entries and all 7 `approach/<slug>.ts` stubs — every one is the
  same honest `[PENDIENTE]` marker text, not plausible-sounding filler, per
  the explicit instruction that no narrative has been supplied for any
  project (including Luang/Blu Café, PR 5's first two write-ups).
- `stack[]` entries for `blu`, `fast-route`, `blu-biolink`, and
  `wedding-invitation-piero` are copied verbatim from exploration.md §4.4's
  README-sourced package lists; `stack: []` (empty) for Luang, Atemporal,
  and Blu Café — their source was never read (external client sites, not
  local repos), so nothing is guessed.

#### Static image import verification

All 4 imports in `lib/content/projects/media.ts` checked against
`ls public/projects/`:

| Import | File on disk |
|---|---|
| `@/public/projects/luang.png` | `public/projects/luang.png` ✓ |
| `@/public/projects/atemporal.png` | `public/projects/atemporal.png` ✓ |
| `@/public/projects/blucafe.png` | `public/projects/blucafe.png` ✓ |
| `@/public/projects/blucafefinance.png` | `public/projects/blucafefinance.png` ✓ |

No import references a file that does not exist; `npm run build`'s success
(below) is independent confirmation, since a missing static-import target is
a build error under this design (D9/§8).

#### Scope boundary respected

Touched only `lib/content/projects/**`, `lib/content/projections.ts`,
`lib/content/invariants.ts`, `lib/dictionaries/**`, plus the two `.tsx`
touches tasks.md explicitly names within 2.8-2.16
(`components/ui/hero-parallax.tsx`, `components/sections/hero-header.tsx`)
and `lib/links.ts` (task 2.16). Did NOT touch `next.config.ts`,
`typedRoutes`, `redirects()`, `app/[locale]/`, `hover-border-gradient.tsx`,
or `app/page.tsx` (PR 2c). Nothing from PR 3+ was started.

### Human tasks — status (PR 2)

- [ ] 2.H1 **[HUMAN]** Confirm fragment redirects (`#proyectos`) behave as
      expected once deployed — not applicable yet, `redirects()` is PR 2c.
- [ ] 2.H2 **[HUMAN]** Supply `NEXT_PUBLIC_SITE_URL` — not applicable yet,
      consumed starting PR 2c.

### Verification (PR 2's list, PR 2a+2b's slice)

- [x] Ran `npm run build` — passes on both PR 2a's and PR 2b's final commit.
      See "Build result" below (PR 2b's final run).
- [x] Ran `npm run lint` — passes, only the 2 pre-existing
      `hover-border-gradient.tsx` warnings (PR 2c's job, untouched here).
      See "Lint result" below.
- [x] Confirmed no invented price, currency, URL, metric, consent flag, or
      narrative prose exists anywhere in either batch's code — see the
      "Honesty check" sections above.
- [x] Confirmed every static image import resolves to a file that exists on
      disk (PR 2b's "Static image import verification" table above).

The full PR 2's `2.V1`-`2.V6` verification items (locale routing,
`typedRoutes`, redirects, `<head>` metadata) do not apply yet — they depend
on PR 2c's routing work, not yet started.

## Build result (verbatim, final commit `4440bf9`)

```
> website-studio@0.1.0 build
> next build

▲ Next.js 16.1.1 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 1694.5ms
  Running TypeScript ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (0/4) ...
  Generating static pages using 11 workers (1/4)
  Generating static pages using 11 workers (2/4)
  Generating static pages using 11 workers (3/4)
✓ Generating static pages using 11 workers (4/4) in 480.7ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
└ ○ /_not-found

○  (Static)  prerendered as static content
```

## Lint result (verbatim, final commit `4440bf9`)

```
> website-studio@0.1.0 lint
> eslint

D:\Programming\Frontend\website-studio\components\ui\hover-border-gradient.tsx
  59:6   warning  React Hook useEffect has missing dependencies: 'duration' and 'rotateDirection'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  63:22  warning  'event' is defined but never used                                                                                                    @typescript-eslint/no-unused-vars

✖ 2 problems (0 errors, 2 warnings)
```

Exit code 0. Both warnings are pre-existing in `hover-border-gradient.tsx`, a
file this batch did not touch (its `href` retype to `Route` is task 2.24,
PR 2c).

## Files changed (PR 2b)

| File | Action | What was done |
|---|---|---|
| `lib/content/projects/index.ts` | Created | `PROJECTS` (7 entries), `PROJECT_SLUGS`/`ProjectSlug`, `UNVERIFIED_LIVENESS` |
| `lib/content/projects/media.ts` | Created | `MEDIA` map, 4 static imports of existing `public/projects/*.png` |
| `lib/content/projects/approach/loader.ts` | Created | `getProjectApproach(slug)`, `ApproachContent` |
| `lib/content/projects/approach/luang.ts` | Created | `[PENDIENTE]` stub |
| `lib/content/projects/approach/atemporal.ts` | Created | `[PENDIENTE]` stub |
| `lib/content/projects/approach/blucafe.ts` | Created | `[PENDIENTE]` stub |
| `lib/content/projects/approach/blu.ts` | Created | `[PENDIENTE]` stub |
| `lib/content/projects/approach/fast-route.ts` | Created | `[PENDIENTE]` stub |
| `lib/content/projects/approach/blu-biolink.ts` | Created | `[PENDIENTE]` stub |
| `lib/content/projects/approach/wedding-invitation-piero.ts` | Created | `[PENDIENTE]` stub (unreachable — withheld) |
| `lib/content/projections.ts` | Created | `toHeroProducts`, `toPortfolioCards`, `publishableProjects` |
| `lib/content/invariants.ts` | Created | `assertContentInvariants()`, 7 active checks + 1 stubbed-inactive |
| `lib/dictionaries/types.ts` | Created | `Dictionary`, `HeroDictionary` |
| `lib/dictionaries/es.ts` | Created | Hero copy, extracted verbatim from `hero-parallax.tsx` |
| `lib/dictionaries/index.ts` | Created | `getDictionary(locale)` |
| `lib/links.ts` | Modified | Added `caseStudyPath`, `pricingPath`, `landingAnchor` |
| `components/ui/hero-parallax.tsx` | Modified | `header?: React.ReactNode` prop; deleted `Header()` and its now-unused `HoverBorderGradient` import |
| `components/sections/hero-header.tsx` | Created | `HeroHeader({ locale })` Server Component |

## Commits (in order)

**PR 1** (on `feat/truth-pass`, already merged into this branch's history):
1. `7fdf90d` — `fix(hero-parallax): derive rows from array length, fix unsafe external link`
2. `c18e6ac` — `feat(contact): add pending WhatsApp contact channel`
3. `918d329` — `feat(layout): add site header and footer chrome`
4. `5c500ec` — `fix(home): remove duplicate/dead product entries, wire site chrome`
5. `84c88ee` — `feat(seo): add ElectroCode Studio brand metadata`
6. `6343019` — `docs(sdd): mark PR 1 tasks complete, record apply progress`

**PR 2a** (on `feat/content-model-core`, based on `feat/truth-pass`):
7. `179946a` — `feat(content): add locale registry and core content types`
8. `a93ed63` — `feat(content): add pricing, retainer, and authority data modules`
9. `ced51f6` — `refactor(contact): move contact channels into content model`
10. `e6a6487` — `docs(sdd): mark PR 2a tasks complete, record apply progress`

**PR 2b** (this batch, on `feat/content-model-projections`, based on
`feat/content-model-core`):
11. `3a5e945` — `feat(content): add curated project catalog and media assets`
12. `9b69040` — `feat(content): add case-study approach prose loader and stubs`
13. `4aa5a73` — `feat(content): add hero and portfolio grid projections`
14. `8ceaf91` — `feat(content): add build-time content integrity assertion`
15. `4440bf9` — `feat(i18n): add Spanish dictionary and hero copy slot`

No push performed. No PR opened. Local commits only, per instructions.

## Workload / PR boundary

- Mode: chained PR slice (`auto-chain` / `stacked-to-main`)
- Current work unit: PR 2b — projects/projections/invariants/dictionaries
  (complete, self-contained content/data layer; zero routing work)
- **Diff vs `feat/content-model-core`: 18 files touched (16 created, 2
  modified), 945 insertions(+), 32 deletions(-) across the 5 PR 2b commits**
  (`git diff --stat` against PR 2a's tip) — **well above** tasks.md's ~400
  estimate for this slice ("watch this one — near budget alone"). This is a
  real forecast miss, flagged here rather than silently absorbed: the actual
  content (7 fully-fleshed project entries with all required fields, 7
  approach stub modules, the invariants file with 8 documented checks, and
  the dictionary/hero-header split) is more voluminous than a ~400-line
  estimate anticipated. No task was skipped or shortened to fit the
  original budget — the estimate was optimistic, not the implementation
  oversized for its assigned scope. Recommend the orchestrator/reviewer treat
  this PR's review as a single cohesive content-layer unit (5 internal
  work-unit commits tell the story) rather than trying to force a
  sub-400-line slice after the fact.
- Boundary: starts from PR 2a's tip (core content types + pricing/retainer/
  authority/contact data, zero routing); ends with the full project catalog,
  its projections, the (inert-until-PR-4) integrity assertion, and the
  Spanish dictionary all in place — zero routing changes, zero `app/page.tsx`
  changes. Rollback: revert the 5 PR 2b commits (or the squashed merge once
  this reaches `main`) — no data, no infra, no route changes to unwind;
  PR 2a's state is fully restored. Note the known interim hero-copy
  regression (see "Issues found") self-resolves once PR 2c also merges — it
  is not something rollback needs to separately account for.
- Next batch: PR 2c (`app/[locale]/**` routing, `next.config.ts`,
  `hover-border-gradient.tsx` retype, wiring `hero-header.tsx` +
  `toHeroProducts()` into the real page) — base branch should be this
  batch's tip, per `stacked-to-main`. PR 2c is also what resolves the interim
  hero-copy regression flagged above.

## Human verification still outstanding (not performed by this agent)

Carried forward from PR 1 (unchanged):
- [ ] 1.H1 — supply the real WhatsApp business number
- [ ] 1.H2 — confirm `atemporalarq.com` liveness (now also tracked in data
      via `UNVERIFIED_LIVENESS`, not only here)
- [ ] 1.V3 — visual check of the hero at 375/768/1440/1920px+
- [ ] 1.V4 (browser click-through) — click every internal/external link
      live in a browser
- [ ] 1.V5 — visually confirm `HoverBorderGradient`'s hover animation after
      the href change

New from PR 2b:
- [ ] 3.H1/3.H2 (carried forward numbering from tasks.md) — supply consent +
      screenshot captures for `blu`, `blu-biolink`, and
      `wedding-invitation-piero` before any of them can graduate past their
      current `anonymised`/`withheld` state.
- [ ] Confirm the interim hero-copy regression (no heading/subtitle/CTA on
      `main` between this PR's merge and PR 2c's) is an acceptable, brief
      window for this delivery chain, or reprioritize PR 2c immediately
      after this merges.

Not yet reached — will apply once PR 2c ships:
- [ ] 2.H1 — confirm fragment redirects behave as expected
- [ ] 2.H2 — supply `NEXT_PUBLIC_SITE_URL`
- [ ] 2.V3-2.V6 — locale routing, unknown-segment 404, `/es` parity, `<head>`
      metadata checks

## Status

**PR 1**: 9/9 code tasks complete. 2/2 automated gates pass. 2 human tasks
and 3 human verification items remain open (unchanged from batch 1).

**PR 2a**: 7/7 code tasks (2.1-2.7) complete. 2/2 automated gates pass.

**PR 2b**: 9/9 code tasks (2.8-2.16) complete. 2/2 automated gates pass
(`npm run build`, `npm run lint`) on the final commit. Zero React imports
confirmed under `lib/content/**`. Zero invented prices, currencies, external
URLs (beyond the 3 exploration.md-VERIFIED ones), metrics, or consent flags
confirmed by targeted grep. All 4 static image imports verified against
files on disk. One real, flagged interim regression (hero copy missing on
`main` until PR 2c) and one real, flagged budget miss (945 vs ~400 estimated
lines) — both documented above, neither hidden.

**Overall**: 25/25 assigned code tasks across PR 1 + PR 2a + PR 2b complete.
Ready for `sdd-apply` to continue with PR 2c, or `sdd-verify` to validate
what has shipped so far.
