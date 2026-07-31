# Apply Progress: dev-services-website

Batch: 4 of N (PR 1 — Truth pass, complete; PR 2a — `lib/content/**` core
types and data, complete; PR 2b — projects/projections/invariants/
dictionaries, complete; PR 2c — `app/[locale]/**` routing, config, chrome,
complete)
Branch: `feat/locale-routing` (based on `feat/content-model-projections`,
PR 2b; which is based on `feat/content-model-core`, PR 2a; which is based on
`feat/truth-pass`, PR 1)
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

### PR 2c — routing, config, chrome — THIS BATCH

Satisfies: `site-shell` (Locale Root Resolution, Discoverability, Not Found,
Zero Dead Internal Links). Design decisions: D2, D3, D7, D11 (implicitly —
no route sets `dynamic`, none reads a dynamic API), D12.

#### Code tasks

- [x] 2.17 Created `app/[locale]/layout.tsx`: `generateStaticParams() =>
      LOCALES.map(locale => ({ locale }))`, `export const dynamicParams =
      false` (phantom-locale layer 1), `assertLocale()` (layer 3, narrows
      `string` → `Locale`), `await assertContentInvariants()` (layer 2),
      wraps `children` with `SiteHeader`/`SiteFooter`.
- [x] 2.18 Created `app/[locale]/page.tsx`, deleted `app/page.tsx`: composes
      `<HeroHeader locale={validLocale} />` into `HeroParallax`'s `header`
      slot, with `toHeroProducts(validLocale)` as the products source —
      replacing the hardcoded 4-project array `app/page.tsx` used to define
      inline. **This completes the expand-then-contract sequence PR 2b's
      `hero-parallax.tsx` comment described**: `InterimHeader` and the
      `header ?? <InterimHeader />` fallback are both deleted in the same
      work unit that wires the real `<HeroHeader>` (see "Overriding rule
      compliance" below).
- [x] 2.19 Created `app/not-found.tsx` (root): no `<html>`/`<body>` of its
      own (renders inside `app/layout.tsx`'s), locale-neutral, default
      Spanish copy, links to `/${DEFAULT_LOCALE}`, no header/footer chrome
      dependency.
- [x] 2.20 Created `app/[locale]/not-found.tsx`: renders inside the locale
      layout (chrome already wraps it), reads a new `notFound` dictionary
      entry. **Deviation, flagged**: uses `getDictionary(DEFAULT_LOCALE)`
      directly rather than reading a `locale` prop — whether Next 16.1.1
      passes `params` to a `not-found.tsx` file is not confirmed anywhere in
      this repo's `node_modules` (the next-types-plugin does not special-case
      `not-found.tsx` the way it does `page.tsx`), and `LOCALES = ['es']`
      today makes the default-locale dictionary correct for 100% of
      visitors regardless of how that question resolves.
- [x] 2.21 Created `app/sitemap.ts`: emits `${SITE_URL}/${locale}` for every
      locale. **Deviation from design.md §3's literal table, flagged, not
      silent**: the design's full cross-product also lists `precios` and
      `proyectos/{slug}` (from `publishableProjects()`) as sitemap entries.
      Neither route exists yet under `stacked-to-main`'s actual ship order
      (PR 4/PR 5 create them) — emitting those entries now would list a
      genuinely dead URL in the built output's `sitemap.xml`, which a
      crawler treats as a real link to follow. `specs/site-shell/spec.md`'s
      "Zero Dead Internal Links" requirement and the tasks.md delivery-order
      correction's own stated success criterion ("holds at every point in
      the chain") apply here just as much as to a rendered `<Link>`. PR 4
      must add the `precios` entry; PR 5's task 5.6 ("confirm it now emits
      real entries... mechanism built in PR 2c") must add the
      `publishableProjects()`-driven case-study entries — this batch does
      not pre-build that cross-product early, so task 5.6's own premise (a
      mechanism already emitting placeholder/wrong entries) does not quite
      hold; whoever picks up PR 5 will be adding the case-study branch of
      this function, not just confirming it.
- [x] 2.22 Created `app/robots.ts`: allows all crawling, references
      `${SITE_URL}/sitemap.xml`.
- [x] 2.23 `next.config.ts`: added `typedRoutes: true` and `redirects()`
      with all six entries from design.md D2 verbatim (`/`→`/es` 307,
      `/precios`→`/es/precios`, `/gracias`→`/es/gracias`,
      `/proyectos/:slug`→`/es/proyectos/:slug`, `/portfolio`→`/es#proyectos`,
      `/es/proyectos`→`/es#proyectos`). Confirmed compiled correctly via
      `.next/routes-manifest.json` (see "Verification" below) — all six
      present, all `statusCode: 307`. No `images` block added (D12). These
      are config-level redirect rules, not rendered `<Link>`/`<a>` elements
      — nothing in this batch's rendered HTML points at `/precios`,
      `/gracias`, or `/proyectos/:slug` (see the sitemap deviation above for
      why the same reasoning does NOT extend to sitemap entries).
- [x] 2.24 `components/ui/hover-border-gradient.tsx`: retyped `href?:
      string` → `href?: Route` (`import type { Route } from "next"`); the
      `<Link href={href}>` call site needed no further change since it was
      already conditionally rendered only when `href` is truthy.
- [x] 2.25 `components/ui/hero-parallax.tsx` `ProductCard`'s internal-link
      branch: added a contained, commented `product.link as Route` cast at
      the `<Link href={...}>` call site — the boundary produced by
      `lib/content/projections.ts`'s `publicLink()`. **Correction, not
      silent**: the task text named `app/[locale]/page.tsx` as the file to
      edit, but `ProductCard` is defined in and exported from
      `components/ui/hero-parallax.tsx` (confirmed by reading the file
      before editing) — the cast was applied at its actual location, with a
      comment citing design.md D7 and naming
      `lib/content/invariants.ts`'s `checkNoSelfReferentialLinks` (the
      invariants file's own header numbers this check "2", not "4" as
      tasks.md's phrasing "invariant 4's coverage" suggested — a minor
      docs/numbering mismatch between tasks.md and design.md's enforcement-
      layer prose list vs. invariants.ts's actual numbered checks, neither of
      which lines up to "4" meaning "self-referential link" under any
      reading tried. Named the function directly instead of a number to stay
      unambiguous.)
- [x] 2.26 Root `app/layout.tsx`: added `metadataBase: new URL(SITE_URL)`
      (`process.env.NEXT_PUBLIC_SITE_URL`, falls back to
      `http://localhost:3000` so the build never fails on task 2.H2 still
      being open) and `alternates: { canonical, languages, 'x-default' }`,
      all pointing at `/${DEFAULT_LOCALE}`.

#### A fourth cross-batch defect found and fixed (not part of the three named in the brief)

**`lib/content/projections.ts`'s `publicLink()` would have rendered a real
dead link the moment this PR reached `main`.** Its literal design.md §5 rule
(`externalUrl` when `evidence.state === 'live'`, else `caseStudyPath(locale,
slug)`) was written and shipped in PR 2b. The curated `featured` set already
includes a project whose evidence is `"gated"`, not `"live"` — `"blu"` — and
`toHeroProducts()`'s no-visual filter does NOT exclude `"gated"` projects, so
`"blu"` reaches the hero today. Wiring `toHeroProducts()` into the real page
in this batch (task 2.18) would therefore have rendered a hero card whose
`<Link href>` resolves to `/es/proyectos/blu` — a route that does not exist
until PR 5, which under `stacked-to-main` ships strictly after PR 2c.

Fixed in `lib/content/projections.ts`: `publicLink()` now falls back to
`landingAnchor(locale, "proyectos")` for any non-`"live"` evidence project,
mirroring the exact pattern PR 1 already established for this situation
(`app/page.tsx`'s former "Blu Finances" entry). Documented in-code as a
flagged deviation from design.md §5's literal table, with an explicit
instruction for whoever picks up PR 5 (or PR 3a's task 3.4 published-state
derivation) to replace the fallback once a project's case study is actually
published. Verified fixed by inspecting the compiled static HTML (see
"Verification" below) — no `/proyectos/` string appears anywhere in
`.next/server/app/es.html`.

#### Overriding rule compliance — the expand-then-contract contraction

PR 2b's `hero-parallax.tsx` left `InterimHeader` and the `header ?? ...`
fallback in place, with a comment explaining PR 2c must delete both in the
same commit that wires the real `<HeroHeader>`. This batch does exactly
that: `app/[locale]/page.tsx` passes `<HeroHeader locale={validLocale} />`
into `HeroParallax`'s `header` prop, and `hero-parallax.tsx` deletes
`InterimHeader` and the fallback in the same work-unit commit (commit
`3d174a6`, "feat(routing): wire locale segment layout, page, and
header/footer" — see "Commits" below). Confirmed via `grep -rn
"InterimHeader"` across the repo: zero remaining references. Confirmed via
the compiled `.next/server/app/es.html`: the deleted `InterimHeader`'s exact
heading text ("que hace crecer tu negocio") does not appear; the dictionary's
actual copy ("Tu proyecto es único", "Explora nuestros proyectos") does.

#### Human tasks — status (PR 2)

- [ ] 2.H1 **[HUMAN]** Confirm fragment redirects (`#proyectos`, `#precios`)
      behave as expected once deployed. Now applicable: `redirects()` exists
      and `#proyectos` is a real anchor on the rendered page
      (`<div id="proyectos">` in `app/[locale]/page.tsx`); `#precios` is not
      yet a real anchor (no Precios section exists until PR 3b) — see the
      `site-header.tsx`/`site-footer.tsx` code comments. Not independently
      verified in a browser by this agent (no browsing tool available).
- [ ] 2.H2 **[HUMAN]** Supply `NEXT_PUBLIC_SITE_URL` for the target
      deployment. Falls back to `http://localhost:3000` in its absence, so
      the build does not fail — but canonical/OG/sitemap/robots URLs will be
      wrong until this is set.

#### Verification (PR 2's full list, now applicable)

- [x] 2.V1 `npm run build` passes — confirms `generateStaticParams`,
      `dynamicParams = false`, `typedRoutes`, and `assertContentInvariants()`
      all compile and run without throwing. See "Build result" below.
- [x] 2.V2 `npm run lint` passes — only the 2 pre-existing
      `hover-border-gradient.tsx` warnings remain (same warnings, same line
      count as before this batch's one-line addition shifted their line
      numbers by 1). See "Lint result" below.
- [ ] 2.V3 **Human**: request `/precios`, `/gracias`, `/proyectos/x`
      unprefixed — confirm 307 to the `/es/...` counterpart. **Automated
      substitute performed**: inspected `.next/routes-manifest.json`
      directly — all three redirects present, `statusCode: 307`,
      `destination` matches design.md D2 exactly (see "Verification" prose
      below for the full table). Live HTTP request **not** performed by this
      agent — no server/browser tool available.
- [ ] 2.V4 **Human**: request an unknown first segment (e.g. `/xx`) — confirm
      the root `app/not-found.tsx` renders (404), not a phantom locale page.
      **Automated substitute performed**: `generateStaticParams()` returns
      only `[{ locale: "es" }]` and `dynamicParams = false` is set — per
      design.md D3 (VERIFIED against `next/dist/build/segment-config/app/
      app-segment-config.d.ts`), this makes Next 404 any other first segment
      at the routing layer, with zero runtime code executed (in particular,
      `assertLocale()` is never even called for `/xx` — layer 1 stops it
      before layer 3 would ever run). Confirmed the build's route table
      lists no page for any segment other than `/[locale]` (`Route (app)`
      output below shows only `/[locale]`, `/_not-found`, `/robots.txt`,
      `/sitemap.xml`). Live HTTP request to `/xx` **not** performed by this
      agent.
- [ ] 2.V5 **Human**: request `/es` — identical content to today's `/`;
      confirm `/` itself 307-redirects to `/es`. **Automated substitute
      performed**: `.next/routes-manifest.json` confirms `/` → `/es`,
      `statusCode: 307`. Live request **not** performed.
- [ ] 2.V6 **Human**: inspect `<head>` for `metadataBase`, canonical, OG tags
      resolving to absolute URLs. **Partially substituted**: `app/layout.tsx`
      sets `metadataBase`/`alternates` from source, confirmed by reading the
      file; the actual rendered `<head>` was not inspected in a browser by
      this agent.

#### Honest gap in this PR's own delivery-order guarantee

`/precios` and `/proyectos/:slug` are registered `redirects()` sources
(task 2.23, per design D2) that point at destinations (`/es/precios`,
`/es/proyectos/:slug`) which do not exist as pages until PR 4/PR 5. A visitor
who follows one of these redirects today lands on a branded, in-locale 404
(`app/[locale]/not-found.tsx`, since the redirect resolves `locale = "es"`
correctly and only the nested sub-route is missing) — not a phantom-locale
page and not the framework default, but also not the destination they were
looking for. This is different from — and less severe than — a rendered
`<Link>` to a dead route (nothing in this batch's HTML contains one, verified
below), but it is a real, honest gap worth naming: these two redirects exist
today for a destination this PR does not yet build. Design.md D2 explicitly
authorizes exactly this ("`/portfolio` may exist in a browser history or an
index; redirect it, do not leave it dead") and tasks.md task 2.23 requires
all six entries in this batch, so this was not a discretionary choice — it
is a deliberate, designed interim state, not an oversight, and is resolved
automatically once PR 4/PR 5 ship (no further code change needed here).

## Build result (verbatim, PR 2c's final commit `ac6b72f`)

```
> website-studio@0.1.0 build
> next build

▲ Next.js 16.1.1 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 1926.3ms
  Running TypeScript ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (0/6) ...
  Generating static pages using 11 workers (1/6)
  Generating static pages using 11 workers (2/6)
  Generating static pages using 11 workers (4/6)
✓ Generating static pages using 11 workers (6/6) in 523.8ms
  Finalizing page optimization ...

Route (app)
┌ ○ /_not-found
├ ● /[locale]
│ └ /es
├ ○ /robots.txt
└ ○ /sitemap.xml

○  (Static)  prerendered as static content
●  (SSG)     prerendered as static HTML (uses generateStaticParams)
```

Ran once with a stale `.next/dev/types/validator.ts` (referencing the just-
deleted `app/page.tsx`) which failed with `Cannot find module
'../../../app/page.js'`; `rm -rf .next` before rebuilding resolved it — a
generated-types cache staleness issue, not a real code defect. Recorded here
in case a reviewer hits the same thing locally.

## Lint result (verbatim, PR 2c's final commit `ac6b72f`)

```
> website-studio@0.1.0 lint
> eslint

D:\Programming\Frontend\website-studio\components\ui\hover-border-gradient.tsx
  60:6   warning  React Hook useEffect has missing dependencies: 'duration' and 'rotateDirection'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  64:22  warning  'event' is defined but never used                                                                                                    @typescript-eslint/no-unused-vars

✖ 2 problems (0 errors, 2 warnings)
```

Exit code 0. Same two pre-existing warnings as PR 2b's run — line numbers
shifted from 59/63 to 60/64 because this batch's `Route` import added one
line above them. No new warnings introduced; not made worse, per this
batch's explicit constraint on this hand-authored file.

## Link-resolution verification (PR 2c, automated, against compiled output)

Every internal `href` rendered on the compiled `/es` static page
(`grep -oE 'href="[^"]*"' .next/server/app/es.html | sort -u`):

| href | Target |
|---|---|
| `/es` | The locale landing itself (brand link, `site-header`/`site-footer`) |
| `/es#precios` | Same-page anchor, no target element yet (see honest-gap note in `site-header.tsx`/`site-footer.tsx`) — not a route-level dead link |
| `/es#proyectos` | Same-page anchor, real target (`<div id="proyectos">` in `app/[locale]/page.tsx`) — also `blu`'s hero card link, via the `publicLink()` fallback fixed this batch |
| `https://luang.com.pe/`, `https://www.atemporalarq.com/`, `https://blucafe.vercel.app/` | External, unchanged from PR 1 |
| `http://localhost:3000/es` | The `og:url`/canonical absolute URL, built from the `NEXT_PUBLIC_SITE_URL` fallback |

**Zero** `/es/precios`, `/es/proyectos/*`, or bare `/` hrefs appear anywhere
in the compiled output. Confirmed by direct `grep` on the generated static
HTML, not by reading source and assuming it compiles as intended.

`.next/routes-manifest.json`'s `redirects` array (all six, all `307`):

| source | destination |
|---|---|
| `/` | `/es` |
| `/precios` | `/es/precios` |
| `/gracias` | `/es/gracias` |
| `/proyectos/:slug` | `/es/proyectos/:slug` |
| `/portfolio` | `/es#proyectos` |
| `/:locale(es)/proyectos` | `/:locale#proyectos` |

## Files changed (PR 2c)

| File | Action | What was done |
|---|---|---|
| `next.config.ts` | Modified | `typedRoutes: true`; `redirects()` (6 entries, D2) |
| `components/ui/hover-border-gradient.tsx` | Modified | `href?: string` → `href?: Route` |
| `lib/content/projections.ts` | Modified | `publicLink()` falls back to `landingAnchor()` for non-`"live"` evidence (the 4th cross-batch defect fix) |
| `app/[locale]/layout.tsx` | Created | `generateStaticParams`, `dynamicParams = false`, `assertLocale()`, `assertContentInvariants()`, header/footer wrap |
| `app/[locale]/page.tsx` | Created | Composes `HeroHeader` + `toHeroProducts(locale)` into `HeroParallax` |
| `app/page.tsx` | Deleted | Superseded by `app/[locale]/page.tsx` |
| `components/layout/site-header.tsx` | Modified | Accepts `locale` prop; brand link → `/{locale}`; anchors locale-prefixed |
| `components/layout/site-footer.tsx` | Modified | Same as `site-header.tsx` |
| `components/ui/hero-parallax.tsx` | Modified | Deleted `InterimHeader` + `header ?? ...` fallback; widened `products` to `readonly`; `product.link as Route` cast |
| `components/sections/hero-header.tsx` | Modified | `landingAnchor(...) as Route` cast at its `HoverBorderGradient` call site |
| `app/not-found.tsx` | Created | Root 404, locale-neutral |
| `app/[locale]/not-found.tsx` | Created | In-locale 404, dictionary-driven |
| `lib/dictionaries/types.ts` | Modified | Added `NotFoundDictionary`, `Dictionary.notFound` |
| `lib/dictionaries/es.ts` | Modified | Added `notFound` entry |
| `app/sitemap.ts` | Created | Home entry per locale (deviation: no precios/case-study entries yet) |
| `app/robots.ts` | Created | Allow crawling, reference sitemap |
| `app/layout.tsx` | Modified | `metadataBase`, `alternates` (canonical/languages/x-default) |

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
16. `3fb8e2a` — `docs(sdd): mark PR 2b tasks complete, record apply progress`
17. `fc80d83` — `fix(hero-parallax): keep an interim header until PR 2c wires the slot`

**PR 2c** (this batch, on `feat/locale-routing`, based on
`feat/content-model-projections`):
18. `a7eaf52` — `fix(ui): retype HoverBorderGradient href for typedRoutes`
19. `45c8201` — `feat(config): enable typedRoutes and add locale redirects`
20. `bf66704` — `fix(content): fall back hero links to portfolio anchor before case studies exist`
21. `3d174a6` — `feat(routing): wire locale segment layout, page, and header/footer`
22. `a15ebd6` — `feat(routing): add root and locale-aware 404 pages`
23. `ac6b72f` — `feat(seo): add sitemap, robots, and root brand metadata`

No push performed. No PR opened. Local commits only, per instructions.

## Workload / PR boundary

- Mode: chained PR slice (`auto-chain` / `stacked-to-main`)
- Current work unit: PR 2c — `app/[locale]/**` routing, `next.config.ts`,
  `hover-border-gradient.tsx` retype, hero-header wiring (complete)
- **Diff vs `feat/content-model-projections` (PR 2b's tip): 17 files
  touched (10 created, 6 modified, 1 deleted), 338 insertions(+), 108
  deletions(-) across the 6 PR 2c commits** (`git diff --stat` against PR
  2b's tip, excluding `openspec/**` and `.next/**`) — **above** tasks.md's
  ~370-line estimate for this slice, though closer to budget than PR 2b's
  945-line overshoot was. Real forecast miss, flagged rather than absorbed:
  the not-found pages (root + locale, plus a new dictionary entry), the
  sitemap/robots files, and the root metadata block were not weighted as
  heavily in the ~370 estimate as they turned out to cost. No task was
  skipped or shortened to fit the original budget. Six work-unit commits
  tell the story; none is individually oversized (largest is 138+103 across
  7 files for the core routing wire-up).
- Boundary: starts from PR 2b's tip (full content model, projections,
  dictionary, zero routing); ends with the site reachable at `/es`, `/`
  redirecting there, a real branded 404 at both the root and in-locale
  boundaries, a sitemap/robots pair, and the hero rendering real dictionary
  copy with zero dead internal links in the compiled output (verified
  above). Rollback: revert the 6 PR 2c commits (or the squashed merge once
  this reaches `main`) — restores PR 2b's state, i.e. only `/` exists again
  (no `/es`, no locale routing). Since only `/` exists in the wild before
  this slice merges (per design.md D2's own rollback note), reverting costs
  nothing.
- Next batch: per tasks.md's corrected delivery order, PR 4 (pricing page)
  ships next, then PR 5 (case studies), THEN PR 3a/3b (landing narrative) —
  **not** PR 3, despite PR 3's lower number. This order is required, not
  optional: PR 3's sections link to `/precios` and case-study slugs that
  must already exist. PR 5 is also what should replace this batch's
  `publicLink()` fallback (the 4th cross-batch defect fix above) with real
  `caseStudyPath()` links once "blu"'s case study is published.

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

Carried forward from PR 2b:
- [ ] 3.H1/3.H2 (carried forward numbering from tasks.md) — supply consent +
      screenshot captures for `blu`, `blu-biolink`, and
      `wedding-invitation-piero` before any of them can graduate past their
      current `anonymised`/`withheld` state.

Resolved by PR 2c (no longer outstanding):
- [x] The interim hero-copy regression flagged in PR 2b — `app/[locale]/
      page.tsx` now wires `<HeroHeader>` and `InterimHeader` is deleted; the
      hero renders real dictionary copy (verified against compiled HTML
      above).

New from PR 2c:
- [ ] 2.H1 — confirm `#proyectos`/`#precios` fragment redirects and anchors
      behave as expected once deployed (not independently verified in a
      browser by this agent).
- [ ] 2.H2 — supply `NEXT_PUBLIC_SITE_URL` for the target deployment.
- [ ] 2.V3-2.V6 — live HTTP requests for the unprefixed-path redirects, the
      unknown-segment 404, `/` vs `/es` parity, and `<head>` metadata
      inspection. All four have an automated substitute performed in this
      batch (routes-manifest.json inspection, route-table inspection, source
      inspection) but no live browser/server request was made.
- [ ] Confirm the interim, honest gap flagged above (the `/precios` and
      `/proyectos/:slug` redirects pointing at pages that do not exist until
      PR 4/PR 5) is an acceptable, brief window for this delivery chain. It
      self-resolves once PR 4/PR 5 ship — no further code change is needed
      here, unlike the hero-copy regression PR 2b flagged (which this batch
      did have to actively resolve, see above).

## Status

**PR 1**: 9/9 code tasks complete. 2/2 automated gates pass. 2 human tasks
and 3 human verification items remain open (unchanged from batch 1).

**PR 2a**: 7/7 code tasks (2.1-2.7) complete. 2/2 automated gates pass.

**PR 2b**: 9/9 code tasks (2.8-2.16) complete. 2/2 automated gates pass.
Zero React imports confirmed under `lib/content/**`. Zero invented prices,
currencies, external URLs (beyond the 3 exploration.md-VERIFIED ones),
metrics, or consent flags confirmed by targeted grep. All 4 static image
imports verified against files on disk. One real, flagged budget miss (945
vs ~400 estimated lines) — documented above, not hidden. The interim
hero-copy regression it flagged is resolved by PR 2c (below).

**PR 2c**: 10/10 code tasks (2.17-2.26) complete. 2/2 automated gates pass
(`npm run build`, `npm run lint`) on the final commit `ac6b72f`. A fourth
cross-batch dead-link defect was found and fixed (`lib/content/
projections.ts`'s `publicLink()`, the "blu" hero card) beyond the three
named in this batch's brief. Verified against the compiled static output
(not only source): zero dead internal `<Link>`/`<a>` hrefs in `.next/server/
app/es.html`, all six `redirects()` entries compiled with `statusCode: 307`,
`InterimHeader` fully removed and the dictionary's real copy confirmed
present in the compiled HTML. One real, flagged budget miss (338+108 = 446
vs ~370 estimated lines) and one real, flagged honest gap (two `redirects()`
entries pointing at pages that do not exist until PR 4/PR 5) — both
documented above, neither hidden. `sitemap.ts` deliberately deviates from
design.md §3's full table (home entry only, not precios/case-study
entries) — flagged as a deviation, not silently narrower.

**Overall**: 35/35 assigned code tasks across PR 1 + PR 2a + PR 2b + PR 2c
complete. Per tasks.md's corrected delivery order, the next slice is **PR 4**
(pricing page), not PR 3 — PR 3's sections depend on routes PR 4/PR 5 create.
Ready for `sdd-apply` to continue with PR 4, or `sdd-verify` to validate what
has shipped so far.
