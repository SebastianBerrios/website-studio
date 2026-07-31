# Apply Progress: dev-services-website

Batch: 5 of N (PR 1 — Truth pass, complete; PR 2a — `lib/content/**` core
types and data, complete; PR 2b — projects/projections/invariants/
dictionaries, complete; PR 2c — `app/[locale]/**` routing, config, chrome,
complete; **PR 6a — Brief server logic, complete, delivered out of order**)
Branch: `feat/brief-server` (based on `feat/locale-routing`, PR 2c; which is
based on `feat/content-model-projections`, PR 2b; which is based on
`feat/content-model-core`, PR 2a; which is based on `feat/truth-pass`, PR 1)
Delivery strategy: `auto-chain` / `stacked-to-main`
Mode: Standard (no test runner; `strict_tdd: false`)

**Delivery-order deviation, flagged explicitly**: PR 6a was implemented
immediately after PR 2c, ahead of `tasks.md`'s stated chain order
(`PR 2c → PR 4 → PR 5 → PR 3a → PR 3b → PR 6a → PR 6b`). Reason: PR 4
(pricing figures) and PR 5 (case-study narratives) are blocked on business
content the user has not yet supplied (package anatomy, retainer
commitments, real client write-ups); PR 6a is pure server-side engineering
(`lib/brief/**` only) with no such dependency. This is safe for the same
reason `tasks.md`'s own delivery-order-correction section gives for its
PR 4/PR 5 vs PR 3 swap: **PR 6a adds no route, no component, and no rendered
link.** Nothing it creates is reachable by a visitor, imported by any page,
or linked from anywhere until PR 6b wires the form in a later batch. The
zero-dead-internal-links success criterion this change set already treats as
load-bearing is untouched by this reordering because there is nothing new to
link to yet.

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
who follows one of these redirects today lands on the **root** 404
(`app/not-found.tsx`, via Next's single built-in `_not-found` route entry) —
**correction, `sdd-verify` W3**: an earlier version of this paragraph claimed
the visitor lands on the in-locale 404 (`app/[locale]/not-found.tsx`) "since
the redirect resolves `locale = "es"` correctly and only the nested sub-route
is missing." That claim is false and has been corrected here. Verified two
ways:
- **Live, in `sdd-verify`**: `/es/precios`, `/es/proyectos/blu`, and `/es/nope`
  all render the root 404 (zero `<header`/`<footer` in the response, and the
  root `not-found.tsx`'s exact `<main>` class string) — not the in-locale one,
  which is wrapped in `SiteHeader`/`SiteFooter` by `app/[locale]/layout.tsx`
  and would show both.
- **In source, in this `sdd-apply` cleanup slice**: Next only enters the
  `[locale]` segment's render tree — and can therefore hit that segment's own
  `not-found.tsx` boundary — when a component already inside that tree calls
  `notFound()` at runtime (`node_modules/next/dist/server/app-render/create-
  component-tree.js` wires a `not-found.tsx`-per-segment boundary for exactly
  that case). A request whose full path matches no page file at all — which
  is every path in this table, since nothing under `app/[locale]/**` besides
  `page.tsx` exists yet — never enters that tree; it resolves directly to
  Next's single, separately built `_not-found` route entry
  (`UNDERSCORE_NOT_FOUND_ROUTE_ENTRY` in `node_modules/next/dist/server/base-
  server.js`), built from the root layout only. This holds regardless of
  whether the URL's first segment is a valid locale.

So today `app/[locale]/not-found.tsx` is unreachable by any live request —
not a phantom-locale page, not the framework default, but also not the
destination the visitor was looking for. This is different from — and less
severe than — a rendered `<Link>` to a dead route (nothing in this batch's
HTML contains one, verified below), but it is a real, honest gap worth
naming: these two redirects exist today for a destination this PR does not
yet build. Design.md D2 explicitly authorizes exactly this ("`/portfolio` may
exist in a browser history or an index; redirect it, do not leave it dead")
and tasks.md task 2.23 requires all six entries in this batch, so this was
not a discretionary choice — it is a deliberate, designed interim state, not
an oversight. The redirect-to-404 gap itself resolves automatically once
PR 4/PR 5 ship (no further code change needed there); `app/[locale]/
not-found.tsx` itself becomes reachable once PR 5 adds a dynamic segment
(e.g. `[slug]`) whose page calls `notFound()` for an unpublished slug from
inside the already-matched `[locale]` tree — at that point the segment
boundary described above will render this file instead of bubbling to root.
Until then, it is intentional infrastructure for that near-term task, not
dead code to delete: it matches design.md §3's stated file tree, costs
nothing to keep, and deleting it now would mean recreating it verbatim for
PR 5.

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

---

## PR 6a — Brief server logic (out-of-order delivery) — THIS BATCH

Satisfies: `lead-capture` (Submission Validation, Confirmation Route — the
server-side half; the form UI and the `/gracias` route itself are PR 6b's
job). Design decision: D1 (architecture, §2 spam/abuse layers, §9
submission flow). Branch: `feat/brief-server`, based on `feat/locale-routing`
(PR 2c's tip).

### Code tasks

- [x] 6.1 Created `lib/brief/schema.ts`: pure `validateBrief(input: unknown)`
      — no `zod`, matching design.md §9's stated reasoning. Validates
      `serviceLine` against `SERVICE_LINES` (existing union, no new one
      introduced) and a new `BudgetBand` union (`undecided | small | medium
      | large`) defined **in this file, not `lib/content/**`**, since PR 6a's
      scope is `lib/brief/**` only. `BudgetBand` is **semantic, not
      numeric** — see "Honesty check" below; no figure or currency is
      invented anywhere. Length caps (name 100, email 254, phone 30,
      description 2000), an email-shape regex, a control-character
      (`CR`/`LF`/`TAB`) rejection on single-line fields, and a max-3-URL
      cap on the free-text description (design.md §2 layer 3). `BriefErrors`
      is keyed by `BriefFieldName`, matching task 6.1's exact wording.
- [x] 6.2 Created `lib/brief/abuse.ts` (`import "server-only"` — a
      deliberate, stricter addition beyond design's own architecture table,
      which only marks `notify.ts` server-only; this module also handles a
      secret and the same guard is cheap insurance, mirroring the existing
      `lib/content/invariants.ts` precedent). Exports `checkAbuseSignals()`
      (honeypot + HMAC-SHA256-signed `issuedAt` dwell check, reject
      `<3000ms` or `>2h`) and `issueFormToken()` (the counterpart PR 6b will
      call from a Server Component to embed the hidden fields). Secret read
      from `process.env.BRIEF_FORM_SECRET` — **new env var, not previously
      named in design.md §12's table** (design named the mechanism but not
      a variable), documented below.
- [x] 6.3 Created `lib/brief/notify.ts` (`import "server-only"`):
      `sendBriefNotification(brief)` via `fetch` against
      `https://api.resend.com/emails` (Resend's own documented public API
      host — not a fabricated domain; `RESEND_API_KEY` was already named in
      design.md §2, which is what identifies Resend as the chosen provider).
      Reads `RESEND_API_KEY`/`BRIEF_TO_EMAIL`/`BRIEF_FROM_EMAIL` from
      `process.env`, never hardcoded, never `NEXT_PUBLIC_`. Strips CR/LF
      unconditionally from the `Reply-To` value (the visitor's own email
      field) before it reaches the request body, regardless of what
      `schema.ts` already rejected — see "CR/LF stripping" below for exactly
      where and why.
- [x] 6.4 Created `lib/brief/submit.ts` (module-level `"use server"`):
      `submitBrief(prevState, formData)` matches `useActionState`'s expected
      signature for PR 6b. Flow: `checkAbuseSignals()` → silent rejection on
      failure (no error surfaced, matches spec's honeypot scenario) →
      `validateBrief()` → return `{ status: "invalid", errors, values }` on
      failure → `sendBriefNotification()` → on failure, return
      `{ status: "send-failed", values }` and `console.error` the full
      payload (the only durability this design has, per design.md §2's
      "honest cost of choosing email") → `redirect()` **as the literal last
      statement, outside every `try`/`catch`** (this function contains no
      `try` at all — every prior step returns early instead of throwing, so
      there is nothing for a `catch` to swallow the redirect into). See
      "The `redirect()` gotcha, concretely" below for the typed-route
      complication this surfaced.

### The `redirect()` gotcha, concretely

`npm run build`'s first pass caught a real, unanticipated type error at this
exact call site: `typedRoutes: true` (design D7) narrows `redirect()`'s
argument the same way it narrows `<Link href>`. `/{locale}/gracias` does not
exist as a page yet — PR 6a is deliberately server-logic-only and creates no
route — so the literal template `` `/${locale}/gracias` `` failed
`RouteImpl` type-checking. Fixed with a single, commented `as Route` cast at
this one call site, explicitly mirroring the existing `product.link as
Route` precedent in `components/ui/hero-parallax.tsx` (PR 2c) rather than
inventing a new pattern. This is the same class of "link before its target
exists" situation `tasks.md`'s delivery-order-correction section already
discusses at length — the difference here is that `redirect()`'s target
becomes reachable in the very next slice (PR 6b), which this batch's own
scope boundary requires, not a multi-PR gap.

### Honesty check — how it was verified

- **`BudgetBand` invents no money.** Grepped `lib/brief/**` for `PEN`, `USD`,
  `S/`, and any digit sequence resembling a price — zero matches beyond this
  sentence itself. `BUDGET_BANDS`' four identifiers (`undecided`, `small`,
  `medium`, `large`) carry only `Localized<string>` labels describing
  relative scale ("Presupuesto ajustado", etc.), never a number or a
  currency. Real band boundaries (e.g. "small = under X") are a **business
  decision the user has not made** — recorded as an open human item below,
  not guessed at.
- **No fabricated email, domain, phone, or API key.** Grepped `lib/brief/**`
  for `@`-containing string literals, `wa.me`, `+51`, and quoted API-key-
  shaped strings — the only domain literal in the three files is
  `api.resend.com`, the provider's own real REST endpoint (necessary to
  implement the `fetch` call at all), not a business contact detail.
  `RESEND_API_KEY`, `BRIEF_TO_EMAIL`, `BRIEF_FROM_EMAIL`, and the new
  `BRIEF_FORM_SECRET` are read exclusively via `process.env[...]` — no
  `.env` file was created, and no value was ever assigned to any of these
  four names anywhere in the diff.
- **CR/LF stripping — where and why.** `notify.ts`'s `stripCrlf()` is
  applied to `brief.name`, `brief.email` (as `Reply-To`), and `brief.phone`
  before any of them reaches the outgoing request body — applied
  unconditionally, not "only if `schema.ts` missed something", because
  `notify.ts` is designed not to trust its caller (design.md §2 layer 4's
  own framing). **`Reply-To` is the specific header-injection risk named in
  the brief**: it is the one header value built directly from user-supplied
  input (the visitor's own email field). A crafted value containing a raw
  `\r\n` inside that field could, on a naive implementation, inject an
  additional header (a forged `Bcc:`, a second `Subject:`) or terminate the
  header block early and start writing attacker-controlled body content —
  classic SMTP/email header injection. `schema.ts`'s own
  `CONTROL_CHAR_PATTERN` check on `email`/`name`/`phone` already rejects
  these at the validation layer, but `notify.ts` strips again regardless,
  per the explicit "defense-in-depth, not redundancy elimination" framing
  in its file header. The free-text `projectDescription` field is sent as
  the plain-text **body**, not a header value, so its internal newlines are
  left intact (they are legitimate paragraph breaks, not an injection
  vector) — the subject line is built only from the closed `ServiceLine`
  union (never free text), so it needs no stripping at all.
- **What happens when `BRIEF_FORM_SECRET` is missing — fails closed.**
  `checkAbuseSignals()` calls `getSecret()` first; if it returns `null` (env
  var absent or empty), the function returns
  `{ ok: false, reason: "config-missing" }` **unconditionally**, before
  ever looking at the honeypot value, the timestamp, or the signature.
  There is no code path in `checkAbuseSignals()` that accepts a submission
  when the secret is absent — a missing secret can never be interpreted as
  "skip verification". Separately, `issueFormToken()` (the function PR 6b
  will call to render the hidden fields) returns `null` rather than
  throwing when the secret is absent, so a page render does not crash the
  entire static build (this site is `force-static` everywhere) — but that
  is a rendering-availability choice, not a security one: the verification
  side is what actually enforces fail-closed, and it has no escape hatch.

### Scope boundary respected

Created exactly four files, all under `lib/brief/**`:
`schema.ts`, `abuse.ts`, `notify.ts`, `submit.ts`. Zero `.tsx` files. Zero
files under `app/**` or `components/**` touched. Confirmed via
`git status --porcelain` before committing: the only tracked-file change in
the diff is this repo's own `lib/content/projections.ts`, which **this batch
did not make** — see "Unrelated concurrent modification observed" below.
Nothing created by this batch is imported by any route, page, or component;
`grep -rn "lib/brief"` outside `lib/brief/**` itself returns zero matches.

### Unrelated concurrent modification observed (not made by this batch, flagged)

During verification, `git status` showed `lib/content/projections.ts` as
modified, though this batch touched only `lib/brief/**`. The working-tree
diff (observed transiently, and different between two consecutive
`npm run build` runs a few seconds apart) changed `publicLink()`'s
non-`"live"`-evidence fallback from `landingAnchor(locale, "proyectos")`
back to an unconditional `caseStudyPath(locale, project.slug)` — i.e. it
appears to **reintroduce** the exact dead-link defect PR 2c's "fourth
cross-batch defect" fix (documented above, in this same file) resolved for
projects like `"blu"` (`evidence.state: "gated"`, no case study published
yet). This file was never opened, read, or edited by this PR 6a batch. Given
the prompt's own statement that a `sdd-verify` agent is reading this repo in
parallel, and that the diff's content changed between two build runs
seconds apart, this looks like a concurrent process's in-progress edit
(possibly the real PR 3a/PR 5 work this repo's `tasks.md` describes as
"next"), not a stable, intentional change. **Flagging for the orchestrator**:
confirm this file's final state independently before treating any build
result against it as authoritative; PR 6a's own build/lint results below do
not depend on this file and are unaffected either way.

### Environment variables — human prerequisites, not performed by this agent

- [ ] 6.H1 **[HUMAN, blocks slice going live — carried from tasks.md]**
      Complete the email provider's domain verification (DNS records) for
      `BRIEF_FROM_EMAIL`'s sending domain. **Every send fails until this is
      done** — this is a human/DNS prerequisite, not a code task, and this
      batch did not and could not perform it.
- [ ] 6.H2 **[HUMAN, carried from tasks.md]** Provision `RESEND_API_KEY`,
      `BRIEF_TO_EMAIL`, `BRIEF_FROM_EMAIL` as server-only environment
      variables.
- [ ] 6.NEW1 **[HUMAN, new — not in tasks.md's original env list]**
      Provision `BRIEF_FORM_SECRET` (any sufficiently random server-only
      string) — required for the HMAC dwell-time signature. Not decided by
      this batch's design input; a placeholder was **not** created (no
      `.env` file was written), per the explicit instruction not to invent
      secrets.
- [ ] 6.NEW2 **[HUMAN/PRODUCT, new]** Decide real `BudgetBand` boundaries
      (what "small"/"medium"/"large" mean in figures and currency) — not a
      code task. This batch defined the identifiers and their `Localized`
      labels only; no number was invented per the honesty constraint in the
      brief.
- [ ] 6.H3 **[HUMAN, carried from tasks.md]** Decide whether to enable
      Vercel BotID now or only if abuse appears — still open, unchanged by
      this batch (it is a PR 6b/platform-config task, task 6.10).

### Verification

- [x] 6.V1 (partial — PR 6a's share only) `npm run build` passes. See "Build
      result" below. **Note**: `npm run build`'s full 6.V1 (tasks.md) also
      covers PR 6b's not-yet-built form/route; only this batch's share
      (compilation + no new integrity violations) is claimed here.
- [x] 6.V2 (partial — PR 6a's share only) `npm run lint` passes with the
      same 2 pre-existing `hover-border-gradient.tsx` warnings as every
      prior batch, plus one pre-existing, unrelated warning in
      `lib/content/projections.ts` (`'landingAnchor' is defined but never
      used`) that predates this batch and was not introduced by it (this
      batch never touched that file — see the concurrent-modification note
      above). No new lint errors or warnings from any file this batch
      created.
- [ ] 6.V3-6.V8 **Not applicable to this batch.** Every remaining
      verification item under PR 6a/PR 6b in `tasks.md` (no-JS submission,
      missing-field inline errors, honeypot/dwell rejection, notify-failure
      re-render, `/gracias` reachability/sitemap-exclusion) requires a
      rendered form and a rendered `/gracias` page, neither of which exists
      until PR 6b. They are correctly PR 6b's verification burden, not
      skipped here.

### Build result (verbatim)

```
> website-studio@0.1.0 build
> next build

▲ Next.js 16.1.1 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 1971.6ms
  Running TypeScript ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (0/6) ...
  Generating static pages using 11 workers (1/6)
  Generating static pages using 11 workers (2/6)
  Generating static pages using 11 workers (4/6)
✓ Generating static pages using 11 workers (6/6) in 555.7ms
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

Exit code 0. An earlier run (before the `redirect()` typed-route fix) failed
with `Type error: Argument of type '\`/${string}/gracias\`' is not
assignable to parameter of type 'RouteImpl<...>'` at `submit.ts` — resolved
by the `as Route` cast described above. A separate, unrelated run also
transiently showed the pre-existing "empty role" content-integrity warnings
from PR 2b's `[PENDIENTE]` stubs (non-production mode only warns, per
design.md §6 layer 2) — those are not new and not from this batch's files.

### Lint result (verbatim)

```
> website-studio@0.1.0 lint
> eslint

D:\Programming\Frontend\website-studio\components\ui\hover-border-gradient.tsx
  60:6   warning  React Hook useEffect has missing dependencies: 'duration' and 'rotateDirection'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  64:22  warning  'event' is defined but never used                                                                                                    @typescript-eslint/no-unused-vars

D:\Programming\Frontend\website-studio\lib\content\projections.ts
  13:25  warning  'landingAnchor' is defined but never used  @typescript-eslint/no-unused-vars

✖ 3 problems (0 errors, 3 warnings)
```

Exit code 0. The first two warnings are the same pre-existing pair every
prior batch has recorded. The third (`projections.ts`) is a byproduct of
the concurrent modification noted above (removing the only call site of
`landingAnchor` makes the import unused) — not caused by, and not fixable
within, this batch's own scope (`lib/brief/**` only). Zero warnings or
errors from any file created in this batch.

### Files changed (PR 6a)

| File | Action | What was done |
|---|---|---|
| `lib/brief/schema.ts` | Created | `BudgetBand` union + `BUDGET_BANDS` (semantic, no figures), `Brief`/`BriefErrors`/`BriefFieldName` types, pure `validateBrief(input: unknown)` |
| `lib/brief/abuse.ts` | Created | `checkAbuseSignals()` (honeypot + HMAC dwell check, fail-closed on missing secret), `issueFormToken()` |
| `lib/brief/notify.ts` | Created | `sendBriefNotification(brief)` — `fetch` to Resend's REST endpoint, CR/LF stripping on header-bound fields |
| `lib/brief/submit.ts` | Created | `submitBrief` Server Action — abuse → validate → notify → `redirect()` (typed-route cast) |

### Commits (in order, this batch)

**PR 6a** (this batch, on `feat/brief-server`, based on
`feat/locale-routing`):

24. `2843279` — `feat(brief): add pure brief validation and semantic budget bands`
25. `92ef9b6` — `feat(brief): add honeypot and signed dwell-time abuse checks`
26. `5f2df72` — `feat(brief): add transactional email notification via provider REST API`
27. `85b8229` — `feat(brief): wire brief Server Action (abuse, validate, notify, redirect)`

No push performed. No PR opened. Local commits only, per instructions.

### Workload / PR boundary (PR 6a)

- Mode: chained PR slice (`auto-chain` / `stacked-to-main`)
- Current work unit: PR 6a — `lib/brief/**` server logic only, no UI, no
  routes (complete)
- Diff: 4 files created, 0 modified, 0 deleted under `lib/brief/**`
  (`~460` lines added across the four files — under the ~260-line estimate
  in `tasks.md`'s Suggested Work Units table; the difference is mostly
  documentation-heavy comments explaining each honesty/security decision
  inline, not additional logic surface).
- Boundary: starts from PR 2c's tip (locale routing, no brief logic at all);
  ends with validation, abuse-detection, and notification primitives fully
  implemented and unit-boundary-correct, but wired into **nothing** —
  no form, no route, no visitor-reachable surface. Rollback: revert the 4
  PR 6a commits (or the squashed merge once this reaches `main`) — restores
  PR 2c's state exactly, since nothing outside `lib/brief/**` was touched by
  this batch and nothing imports from `lib/brief/**` yet.
- Next batch: per the corrected delivery order this batch's own note
  establishes, PR 4 (pricing) and PR 5 (case studies) remain next **once
  their blocking business content is supplied**; PR 6b (`BriefForm` UI,
  landing wiring, `/gracias`) can also proceed independently at any time
  since it only depends on PR 6a, not on PR 4/PR 5.

---

## Remediation slice — `fix/content-honesty` (post-`sdd-verify`)

Branch: `fix/content-honesty`, based on `feat/brief-server` (PR 6a's tip).
Fixes both CRITICAL findings (C1, C2) and two WARNING findings (W1, W2)
from `sdd/dev-services-website/verify-report.md`, plus the coupled
`checkHeroFloor` change those two CRITICALs required. Mode: Standard (no
test runner; `strict_tdd: false`). Scope held strictly to the four findings
and the floor decision — nothing else was touched.

### R1 (C1) — stop publishing the unconsented `blu` back-office capture

`public/projects/blucafefinance.png` was not a login screen, as
`lib/content/projects/media.ts`'s `alt` text falsely claimed — it is the
**authenticated** `blu` back-office dashboard: client logo/wordmark in the
sidebar, full nav tree (Categorías, Productos, Ingredientes, Recetas,
Ventas), and the heading "Bienvenido a Blu Café". Consent to publish any
capture of it is still open (task 3.H2).

- Deleted `public/projects/blucafefinance.png` via `git rm` (working tree
  only — this removes it from all future builds; the copy already
  published in git history is explicitly the user's own separate decision,
  out of this agent's scope).
- Removed the `blucafefinance` entry and its import from
  `lib/content/projects/media.ts`.
- `blu`'s `evidence` flipped from `{ state: "gated", disclosure: {...},
  media: [MEDIA.blucafefinance] }` to `{ state: "no-visual", media: [] }` —
  satisfies `specs/project-portfolio/spec.md`'s "`no-visual` degrades
  honestly" scenario (no broken frame, no grey placeholder). `blu` no
  longer appears in the hero (`toHeroProducts()` filters `no-visual` out),
  which is why the hero floor needed a paired decision (see R3).
- `thumbnail: ""` on the `blu` entry (legacy field, matches the pattern
  already used by `fast-route`/`blu-biolink`/`wedding-invitation-piero`).
- Replaced the false "login screen" `alt` text — moot now, since the media
  entry is deleted, but the comment explaining the removal states the
  correct fact plainly instead of repeating the error.

### R2 (C2) — correct `atemporal`'s dead evidence claim

`atemporalarq.com` returns NXDOMAIN on both the apex and `www`
(re-verified with `nslookup`/`curl` before writing this record), from a
resolver that correctly resolved `luang.com.pe` and `blucafe.vercel.app` in
the same run. The prior in-code justification ("local network/DNS
restriction") does not hold against that evidence.

- `atemporal`'s `evidence` flipped from `{ state: "live", externalUrl:
  "https://www.atemporalarq.com/", media: [...] }` to `{ state:
  "not-deployed", media: [MEDIA.atemporal] }`. The existing screenshot is
  kept — it is a public marketing homepage capture, not a private system,
  so the user's decision was to keep the thumbnail while dropping the dead
  link. `publicLink()` already falls back to the landing anchor for
  non-`live` evidence, so no dead external link ships.
- `link` (legacy field) changed from the external URL to
  `/es/proyectos/atemporal`, matching the pattern used by other non-`live`
  entries.
- `UNVERIFIED_LIVENESS` deleted from `lib/content/projects/index.ts` — it
  was exported and read by nothing (confirmed by repo-wide grep before
  deleting), and the liveness question it existed to flag is now answered
  negatively rather than merely unresolved. A dangling, unread "tracking"
  list is worse than no list because it looks like a control that isn't one.
- `checkInternalLinksResolve` (`lib/content/invariants.ts`) is NOT extended
  to cover external links. Documented in place, plainly: a build-time
  DNS/HTTP probe of a third party's domain during `next build` is a live
  network call — non-deterministic (this repo's own build already shows
  flakiness around `.next/types` without adding external egress
  dependencies), and often unavailable in sandboxed CI. External liveness
  stays a periodic human/product check (task 1.H2, now closed negatively),
  not an automated gate. Chosen over silently pretending coverage exists.

### R3 (floor) — `checkHeroFloor` lowered from 4 to 3

Both R1 and R2 remove an entry from the hero's `no-visual`/non-`live`
filtering path in different ways (`blu` is filtered out entirely by
`no-visual`; `atemporal` stays in the hero but loses its external link).
Net hero count after both fixes: 3 (Luang, Atemporal, Blu Café). Rather
than fabricate a fourth entry or leave the production build broken, the
constant `HERO_FLOOR` (new, in `lib/content/invariants.ts`) is set to 3,
with an in-file comment stating this is a temporary, documented
launch-quality signal — not a new permanent target — that should rise as
`fast-route`/`blu-biolink`/`wedding-invitation-piero`/`blu` captures and
consent (tasks 3.H1/3.H2) land.

### R4 (W1) — corrected the false `checkNoSelfReferentialLinks` claim

`components/sections/hero-header.tsx`'s comment on the hero CTA's
`landingAnchor(...) as Route` cast claimed `checkNoSelfReferentialLinks`
covers what the cast waives. It does not: that function only inspects
`toHeroProducts()` output and only tests equality with `/` or `/{locale}` —
a different property than "does this anchor target exist". Neither it nor
`checkInternalLinksResolve` ever sees this component's href. The comment
now states plainly that no build-time control covers this cast, and why
the target is safe today regardless (mirrors the already-accurate,
already-corrected wording in `hero-parallax.tsx`'s sibling comment).

### R5 (W2) — fixed the self-referential `#proyectos` anchor

`id="proyectos"` wrapped the **entire** `<HeroParallax>` in
`app/[locale]/page.tsx`, including the `header` slot that renders the
"Explora nuestros proyectos" CTA — so the CTA (and both header/footer
"Proyectos" nav links, which point at the same anchor) scrolled to the top
of the section the visitor was already reading.

- `HeroParallax` (`components/ui/hero-parallax.tsx`) gained an optional
  `productsId` prop, applied only to the products-track wrapper
  (`motion.div` after `{header}`), documented with a comment explaining the
  W2 defect and why this placement fixes it.
- `app/[locale]/page.tsx` now passes `productsId="proyectos"` directly to
  `HeroParallax` instead of wrapping the whole component in an anchored
  `<div>`.
- Verified in compiled output (`.next/server/app/es.html`): exactly one
  `id="proyectos"` element, positioned strictly after the CTA text
  ("Explora nuestros proyectos") in document order.

### Verification (remediation slice)

- [x] `npm run build` passes (verbatim below).
- [x] `npm run lint` passes — same 2 pre-existing
  `hover-border-gradient.tsx` warnings, no new ones.
- [x] Production-gate proof re-run: temporarily blanked `luang`'s Spanish
  `summary`, rebuilt with `VERCEL_ENV=production` — real exit code 1,
  `Content integrity check failed: Project "luang" has an empty "summary"
  for locale "es".` Restored via `git checkout --` (safe: change was
  already committed at that point) and rebuilt clean.
- [x] `grep -rn "blucafefinance" .next/server/app/*.html lib/` — zero
  matches (the two residual comment mentions found on the first pass were
  rephrased to drop the literal filename).
- [x] Full href/src inventory of `.next/server/app/es.html` and
  `_not-found.html`: `/es`, `/es#proyectos`, `https://luang.com.pe/`,
  `https://blucafe.vercel.app/`, `_next` assets, `favicon.ico`, the
  absolute canonical. No `atemporalarq.com` anywhere in built output; the
  `atemporal` product's compiled `link` is `/es#proyectos` (confirmed by
  reading the embedded flight-data JSON in `es.html`).

#### Build result (verbatim, exit 0)

```
> website-studio@0.1.0 build
> next build
▲ Next.js 16.1.1 (Turbopack)
  Creating an optimized production build ...
✓ Compiled successfully in 2.1s
  Running TypeScript ...
  Collecting page data using 11 workers ...
✓ Generating static pages using 11 workers (6/6) in 625.3ms
  Finalizing page optimization ...
Route (app)
┌ ○ /_not-found
├ ● /[locale]
│ └ /es
├ ○ /robots.txt
└ ○ /sitemap.xml
```

#### Lint result (verbatim, exit 0)

```
> website-studio@0.1.0 lint
> eslint
components/ui/hover-border-gradient.tsx
  60:6   warning  react-hooks/exhaustive-deps
  64:22  warning  @typescript-eslint/no-unused-vars
✖ 2 problems (0 errors, 2 warnings)
```

### Files changed (remediation slice)

| File | Action | What was done |
|---|---|---|
| `lib/content/projects/media.ts` | Modified | Removed `blucafefinance` entry/import; comment no longer names the deleted file |
| `lib/content/projects/index.ts` | Modified | `blu` → `no-visual`; `atemporal` → `not-deployed`; deleted `UNVERIFIED_LIVENESS`; comments corrected |
| `public/projects/blucafefinance.png` | Deleted (`git rm`) | Unconsented capture removed from the working tree going forward |
| `lib/content/invariants.ts` | Modified | `HERO_FLOOR = 3` (was inline `4`); documented why `checkInternalLinksResolve` does not probe external URLs |
| `components/sections/hero-header.tsx` | Modified | Corrected false `checkNoSelfReferentialLinks` coverage claim |
| `components/ui/hero-parallax.tsx` | Modified | Added `productsId` prop, applied to the products-track wrapper |
| `app/[locale]/page.tsx` | Modified | Passes `productsId="proyectos"` instead of wrapping `<HeroParallax>` in an anchored `<div>` |
| `openspec/changes/dev-services-website/tasks.md` | Modified | Added Remediation section (R1-R5, R.V1-R.V5); closed 1.H2/3.H3 negatively |

### Commits (in order, this batch, on `fix/content-honesty`)

1. `b6f68cf` — fix(content): stop publishing unconsented blu capture, correct atemporal evidence
2. `2645167` — fix(content): lower hero floor to 3, document external-link check gap
3. `a959aaf` — docs(hero): correct false invariant-coverage claim on CTA cast (W1)
4. `0d9ec22` — fix(hero): anchor #proyectos to the products track, not the whole hero (W2)
5. `9f9c445` — docs(sdd): record content-honesty remediation slice in tasks.md
6. `7fae2fd` — docs(content): drop the removed asset's filename from comments

No push performed. No PR opened. Local commits only, per the launch
constraints (no `git push`, no PR, no history rewrite).

### Not fixed — explicitly out of scope

- The already-published copy of `blucafefinance.png` in git history is
  untouched. Its exposure is the user's own separate decision (explicitly
  out of this agent's scope per the launch instructions); no
  `filter-repo`/`filter-branch`/BFG/`git rm` from history was performed or
  considered.
- No other verify-report finding (W3-W11, S1-S7) was touched. If any of
  those are urgent, they are reported, not fixed, per the launch
  instructions.

---

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

**PR 6a**: 4/4 code tasks (6.1-6.4) complete, on branch `feat/brief-server`
(based on `feat/locale-routing`, PR 2c's tip). 2/2 automated gates pass
(`npm run build`, `npm run lint`). **Delivered out of `tasks.md`'s stated
order** — ahead of PR 4/PR 5/PR 3a/PR 3b — because PR 4 and PR 5 are blocked
on business content (pricing figures, retainer commitments, client
narratives) the user has not supplied, while PR 6a is pure `lib/brief/**`
server logic with no route, no component, and no rendered link; nothing it
creates is reachable by a visitor until PR 6b wires the form. Full reasoning
recorded above under "Delivery-order deviation, flagged explicitly". One
unrelated, transient modification to `lib/content/projections.ts` was
observed during this batch's own verification and is flagged, not made by
and not attributable to this batch (see "Unrelated concurrent modification
observed" above) — likely a concurrent `sdd-verify` or parallel-PR process
per the launch prompt's own note that verification was running in parallel.
Four new human/product prerequisites recorded (`BRIEF_FORM_SECRET`
provisioning, the email provider's DNS domain verification, real
`BudgetBand` boundaries, the BotID/rate-limit decision) — none invented,
none silently skipped.

**Overall**: 39/39 assigned code tasks across PR 1 + PR 2a + PR 2b + PR 2c +
PR 6a complete. Per tasks.md's corrected delivery order, PR 4 (pricing page)
and PR 5 (case studies) remain the nominal next slices but are blocked on
user-supplied business content; PR 6b (`BriefForm` UI, landing wiring,
`/gracias`) is unblocked and can proceed independently, since it depends only
on PR 6a.

**Remediation slice (`fix/content-honesty`)**: 5/5 remediation tasks (R1-R5)
complete, both CRITICAL verify-report findings (C1, C2) resolved, two
WARNING findings (W1, W2) resolved, hero floor lowered to 3 with a
documented reason. `npm run build` and `npm run lint` both pass; the
production integrity gate was re-proven to genuinely throw. Human tasks
1.H2/3.H3 closed negatively. Not fixed, and not in scope: verify-report
findings W3-W11/S1-S7, and the already-published copy of
`blucafefinance.png` in git history (the user's own separate decision).

Ready for `sdd-verify` to re-validate this branch against the verify
report's CRITICAL/WARNING findings, or for `sdd-apply` to continue with
whichever of PR 4/PR 5/PR 6b the user unblocks next.

---

## Batch 7 — remediation slice `fix/restore-consented-content`, complete

Branch: `fix/restore-consented-content`, based on `fix/content-honesty`.
Mode: Standard (no test runner; `strict_tdd: false`).

New facts reversed two `fix/content-honesty` corrections, plus one
user-approved a11y fix. Scope held strictly to these three items.

**RC1 (reverses R2, closes 1.H2 positively)** — Atemporal Studio's site was
found live at `https://atemporalarq.vercel.app/`, verified by the
orchestrator: HTTP 200, `<title>Atemporal</title>`, no login wall, ~0.36s
response. The old `atemporalarq.com` NXDOMAIN finding stands — the site
simply moved. `atemporal`'s `evidence` flips back from `not-deployed` to
`{ state: "live", externalUrl: "https://atemporalarq.vercel.app/", media:
[MEDIA.atemporal] }`, keeping the existing thumbnail unchanged.

**RC2 (reverses R1, closes 3.H2 for `blu` only)** — the client authorized
use of the `blu` back-office capture (user-stated consent, dated this
session — not a signed agreement). Restored `public/projects/
blucafefinance.png` via `git checkout b6f68cf~1 -- public/projects/
blucafefinance.png` (working-tree restore only, no history rewrite — the
file's original deletion commit `b6f68cf` is untouched). Re-imported it in
`lib/content/projects/media.ts` with an `alt` that accurately describes the
AUTHENTICATED dashboard (client logo, "Bienvenido a Blu Café" heading,
sidebar: Categorías/Productos/Ingredientes/Recetas/Ventas) — the previous
description as "la pantalla de inicio de sesión" was false and is the root
cause finding C1 went unnoticed. `blu`'s `consent` flips to `{ status:
"granted", namedClient: true }` (client named: "Blu Café" — read directly
off the capture's own heading, not invented); the anonymised "Alimentos y
bebidas … Tamaño no determinado" framing is dropped from `title`/`client`.
`blu`'s `evidence` flips to `gated` (NOT `live`): the product itself
genuinely sits behind a login (`blucafefinance.vercel.app` returns 200 with
a password field, VERIFIED). `evidence.disclosure` carries the required
explicit login note plus a permission line (`specs/project-portfolio/
spec.md`, "Evidence State Rendering"). `wedding-invitation-piero` and
`blu-biolink` remain open under 3.H2 — this only resolves `blu`.

**RC3 (floor)** — `HERO_FLOOR` back to 4 in `lib/content/invariants.ts`. With
`blu` restored to `gated` (passes the `no-visual` filter in
`toHeroProducts()`) and `atemporal` back to `live`, the hero naturally has 4
entries again (Luang, Atemporal, Blu Café, `blu`). Comment rewritten to
explain the temporary dip to 3 during `fix/content-honesty` and why 4 is
restored now, not a new stricter requirement.

**RC4 (W9, user-approved)** — `components/ui/hover-border-gradient.tsx`
returned `href ? <Link href={href}>{content}</Link> : content` where
`content` was a `<Tag>` defaulting to `"button"`. With `as="button"` and an
`href` (exactly `hero-header.tsx`'s CTA usage), the compiled output was
`<a href="..."><button>…</button></a>` — nested interactive elements,
invalid HTML, a real keyboard/screen-reader defect (verify-report.md W9,
design risk 10), and the sole CTA on the sole shipped page. Fix: when `href`
is present, the inner wrapper is now forced to a plain, non-interactive tag
(`"div"`) regardless of the `as` prop — the anchor becomes the sole
interactive element, owning focus/keyboard activation. When `href` is
absent, behavior is unchanged (`as` still defaults to `"button"`). Visual
output is byte-identical: same classNames, same timing values, same
`containerClassName`/`className` split — only the rendered tag name changed
from `button` to `div`, one level of nesting, no structural change. The 2
pre-existing lint warnings on this file (`react-hooks/exhaustive-deps`,
unused `event` param) are untouched — not fixed (out of scope), not made
worse.

### Discovered but not fixed — reported, not silently absorbed

- **Duplicate hero display title.** `lib/content/projections.ts`'s
  `publicTitle()` returns `project.client` (not `project.title`) whenever
  `consent.status === "granted" && namedClient`. Both `blucafe` and `blu`
  now satisfy that condition and both have `client: "Blu Café"` (the same
  real company, two different products — the public site and the internal
  back-office). Their hero cards will render the identical label "Blu Café"
  with nothing distinguishing them (`HeroProduct` only carries `{title,
  link, thumbnail}` — no subtitle slot). This is a direct, expected
  consequence of the instructed consent change, not a bug introduced by
  guesswork, and fixing it would mean changing shared title-derivation logic
  used by every project — out of this batch's three-item scope. Flagged for
  a future content/product decision (e.g. a distinguishing subtitle), not
  fixed here.
- **`blu`'s login note/disclosure line cannot be visually confirmed.** The
  data model correctly carries `evidence.disclosure` (login note + the
  "shown with the client's permission" line), but no rendering component
  consumes it yet in this repo state: `components/portfolio/evidence.tsx`
  (task 3.3, PR 3a) has not been implemented. Today `blu` only reaches the
  hero (`ProductCard`, title + thumbnail only) — there is no portfolio-grid
  card to inspect. Verification item 5 in the launch prompt asked to confirm
  "blu's card renders its login note and disclosure line"; that cannot be
  done honestly until PR 3a ships. Reported as a gap, not claimed as done.

### Verification performed

- `npm run build` (default, non-production) — exit 0. Verbatim:
  ```
  ▲ Next.js 16.1.1 (Turbopack)
    Creating an optimized production build ...
  ✓ Compiled successfully in 2.5s
    Running TypeScript ...
    Collecting page data using 11 workers ...
  ✓ Generating static pages using 11 workers (6/6) in 607.1ms
    Finalizing page optimization ...
  Route (app)
  ┌ ○ /_not-found
  ├ ● /[locale]
  │ └ /es
  ├ ○ /robots.txt
  └ ○ /sitemap.xml
  ```
- `npm run lint` — exit 0, verbatim:
  ```
  D:\Programming\Frontend\website-studio\components\ui\hover-border-gradient.tsx
    68:6   warning  React Hook useEffect has missing dependencies: 'duration' and 'rotateDirection'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
    72:22  warning  'event' is defined but never used                                                                                                    @typescript-eslint/no-unused-vars
  ✖ 2 problems (0 errors, 2 warnings)
  ```
  Same 2 pre-existing warnings as every prior batch; zero new ones.
- **Nesting proof**: grepped the compiled `.next/server/app/es.html`.
  `grep -oE '<a[^>]*><button'` and `grep -oE '<button[^>]*><a'` both matched
  nothing; `grep -o '<button[^>]*>'` matched nothing at all — zero `<button>`
  elements exist anywhere in the compiled output. Hero CTA markup:
  `<div class="mt-4"><a href="/es#proyectos"><div class="relative flex
  border content-center bg-black/20 hover:bg-black/10 transition duration-500
  dark:bg-white/20 items-center flex-col flex-nowrap gap-10 h-min
  justify-center overflow-visible p-px box-decoration-clone w-fit
  cursor-pointer rounded-full">...<span>Explora nuestros proyectos</span>
  ...</div></a></div>` — exactly one interactive element (the anchor).
- **Atemporal URL proof**: `grep -o 'atemporalarq[^"&,]*' es.html` →
  `atemporalarq.vercel.app/` (present, twice — link + flight-data JSON);
  `grep -o 'atemporalarq\.com[^"&,]*' es.html` → zero matches.
- **`blu` restoration proof**: `ls public/projects/blucafefinance.png` →
  file present (1,341,195 bytes, restored from `b6f68cf~1`);
  `grep -rn blucafefinance lib/content/` → referenced in `media.ts` (import +
  map entry) and `index.ts` (`thumbnail` field + disclosure comment). See
  "Discovered but not fixed" above for the rendering-gap caveat.
- **Production-gate re-proof**: blanked `luang`'s Spanish `summary` to `""`,
  ran `VERCEL_ENV=production npm run build` after `rm -rf .next` → real exit
  code `1`:
  ```
  Error: Content integrity check failed:
    - Project "luang" has an empty "summary" for locale "es".
  Export encountered an error on /[locale]/page: /es, exiting the build.
  ⨯ Next.js build worker exited with code: 1 and signal: null
  ```
  Restored the exact prior string via `Edit` (not `git checkout --`, since
  the change was not yet committed at that point), confirmed `git diff
  --stat` showed the file back to its full pre-fault-injection diff against
  the prior commit, then rebuilt clean (`rm -rf .next && npm run build` —
  exit 0, same output as the first verification run above).

### Files changed (this batch)

| File | Action | What was done |
|---|---|---|
| `public/projects/blucafefinance.png` | Restored (`git checkout b6f68cf~1 --`) | Client-authorized capture back on disk, no history rewrite |
| `lib/content/projects/media.ts` | Modified | Re-added `blu` entry importing `blucafefinance.png`, with an accurate "authenticated dashboard" `alt` |
| `lib/content/projects/index.ts` | Modified | `atemporal` → `live` (vercel.app URL); `blu` → `gated` + `consent: granted/namedClient`, named "Blu Café"; fault-injected then restored `luang.summary` for RC.V6 |
| `lib/content/invariants.ts` | Modified | `HERO_FLOOR = 4` (was `3`); comment rewritten explaining the dip and restoration |
| `components/ui/hover-border-gradient.tsx` | Modified | Inner wrapper forced non-interactive when `href` is present, fixing the nested `<a><button>` defect (W9) |
| `openspec/changes/dev-services-website/tasks.md` | Modified | Closed 1.H2 positively (superseding its prior negative closure), closed 3.H2 for `blu` only, added the `fix/restore-consented-content` remediation section (RC1-RC4, RC.V1-RC.V6) |

### Commits (in order, `fix/restore-consented-content`)

1. `5402b1c` — fix(content): restore consented blu capture and atemporal live evidence
2. `0291388` — fix(a11y): stop nesting a button inside the hero CTA anchor

No push performed. No PR opened. No history rewrite. Local commits only.

### Not fixed — explicitly out of scope

- Verify-report findings W3, W5, W6, W8, W10, W11, S1-S7 — untouched,
  reported not fixed, per the launch instructions.
- The already-published copy of `blucafefinance.png` in git history — still
  untouched; that repo-history exposure is the user's own separate decision
  (noted again per the launch prompt: the `blu` repository is now private,
  `website-studio` remains public, but repo visibility did not resolve
  anything here — the client's authorization did).
- The duplicate hero title (`blucafe`/`blu` both showing "Blu Café") and the
  missing PR 3a evidence-rendering component — both discovered, both
  reported above, neither fixed (out of this batch's three-item scope).

## Status (cumulative)

39/39 PR 1-2c/6a code tasks (unchanged) + 5/5 `fix/content-honesty`
remediation tasks (R1-R5, unchanged) + 4/4 `fix/restore-consented-content`
remediation tasks (RC1-RC4) complete. Both CRITICAL findings' underlying
facts have now each flipped twice (dishonest → honestly-corrected →
honestly-reversed as new facts arrived) and are currently: `blu` = `gated`
with consented media and a login-note disclosure; `atemporal` = `live` at
its real current URL. W1 and W2 remain resolved (untouched by this batch).
W9 is fixed. Human tasks 1.H2 and 3.H2 (for `blu`) are closed.

Ready for `sdd-verify` to re-validate against the verify report, or
`sdd-apply` to continue with PR 4/PR 5/PR 6b once the user unblocks their
remaining business-content prerequisites (pricing figures, retainer
figures, case-study write-up approval, WhatsApp number, DNS domain
verification, remaining project consent/captures).

---

## PR 3a (partial) — Servicios, portfolio components, Proyectos grid

Batch: 8 of N — **partial PR 3a, complete: tasks 3.1, 3.3, 3.4, 3.9, 3.10.**
Task 3.2 (Proceso) explicitly excluded, not implemented. PR 3b (Autoridad,
Retainer, Precios summary), PR 4 (pricing page), PR 5 (case studies), PR 6b
(brief form UI) also explicitly excluded — not implemented.

Branch: `feat/landing-servicios-proyectos`, based on
`fix/restore-consented-content` (which was already `HEAD` when this batch
started; two commits landed on top of it before this batch —
`9fd01af` and `4bdbe6e` — both pre-existing, neither authored by this batch).
Mode: Standard (no test runner; `strict_tdd: false`).

### Why this batch deviates from `tasks.md`'s stated delivery order, again

`tasks.md`'s "Delivery order correction" assumes PR 4 and PR 5 ship BEFORE
PR 3a, so that `/[locale]/precios` and `/[locale]/proyectos/[slug]` already
exist by the time PR 3a's sections link to them. **That did not happen.**
This repo state has PR 1 / PR 2a / PR 2b / PR 2c / PR 6a plus two remediation
slices — PR 4 and PR 5 were never implemented. This batch was explicitly
scoped by the launch instructions to implement a **partial PR 3a** anyway
(tasks 3.1, 3.3, 3.4, 3.9, 3.10 only), against the *actual* repo state, not
the originally-planned one. Every deviation below follows from that one
fact: neither `/precios` nor `/proyectos/[slug]` exists anywhere in this
codebase yet.

### Task 3.2 (Proceso) — explicitly not implemented

Requires the studio's real engagement process (discovery→proposal→build→
handover, or whatever the actual sequence is) and its actual response-time
commitment. The user has not supplied either. No process, no step count, and
no response window was invented to fill the gap — the same discipline this
change set already applies to `RETAINER_COMMITMENTS` (every field required,
never fabricated) and to `PRICES` (never an invented figure). Left for a
future batch.

### Task 3.1 — `components/sections/services.tsx`

Renders the four `SERVICE_LINES` (from `lib/content/service-lines.ts`,
already populated with real bilingual name/description copy since PR 2a) as
self-identification cards.

**Deviation from the literal task text**, flagged rather than silently
applied (same discipline as `lib/content/projections.ts`'s existing
`publicLink()` comment): the task says "each linking to its pricing anchor
... and its available proof project" — TWO links. This batch renders
exactly ONE CTA per card, "Ver proyectos" → `#proyectos`. Reasons:

- `/es/precios` does not exist (PR 4 not implemented this batch) and is a
  hard-banned target per the launch instructions.
- A `#precios` same-page anchor equivalent (the pattern PR 1 established for
  `#proyectos` before the real section existed) is not available either,
  because its only possible target — the Precios summary section, task 3.8
  — is PR 3b scope, also excluded from this batch. Unlike `#proyectos` (which
  had `HeroParallax`'s products track as a real stand-in target from PR 1
  onward), there is no stand-in element this batch is allowed to create for
  `#precios`.
- `components/layout/site-header.tsx` already documents exactly this
  reasoning for why it carries no "Precios" nav item: "A nav item labelled
  'Precios' that does nothing when clicked is worse than no nav item."
  Applying the same standard to the Servicios section's own CTA is the
  consistent choice, not a new one.

Task 4.8 ("Update PR 3's `services.tsx`/`pricing-summary.tsx` anchor links to
the real `/[locale]/precios#<line>` block anchors now that the route
exists") already names this exact file as what a later batch updates once
PR 4/PR 3b ship — so this is a tracked, anticipated gap, not a silent one.

The CTA reuses the SAME `landingAnchor(locale, "proyectos") as Route` cast
pattern already used three times in this codebase (`site-header.tsx`,
`site-footer.tsx`, `hero-header.tsx`) — a fourth call site of an
already-established waiver, not a new one.

### Task 3.3 — `components/portfolio/{service-badge,evidence,project-card}.tsx`

All three are Server Components (D10 compliance — zero new client
components this batch).

- **`service-badge.tsx`**: reads the same `SERVICE_LINES` data the pricing
  page (PR 4, not yet built) will also read from, so a badge's label and its
  future pricing block are guaranteed to reference the same identifier
  (`specs/service-catalog/spec.md`, "Cross-Surface Consistency").
- **`evidence.tsx`**: exhaustive switch on `Evidence.state`.
  - `live`: screenshot only (the external link itself is the parent card's
    wrapping `<a>`).
  - `gated`: screenshot PLUS a generic dictionary-sourced note ("Acceso
    restringido: este producto requiere inicio de sesión.") PLUS the
    project's own specific `evidence.disclosure` text. Both render as
    separate elements — the generic note names the *kind* of restriction,
    the disclosure names the *specific, truthful reason*
    (`specs/case-study/spec.md`, "Truthful Disclosure Line"). This is the
    first batch that actually renders `blu`'s disclosure at all — a prior
    batch (`fix/restore-consented-content`) restored the data but reported
    it unverifiable because no rendering component existed yet. Now
    verified in compiled HTML (see Verification below).
  - `not-deployed`: locally-captured screenshot plus a dictionary-sourced
    "no public deployment" note.
  - `no-visual`: returns `null` — no `<img>`, no placeholder frame, no gray
    box. `project-card.tsx` is what keeps the resulting card "reading as
    complete" (design.md §8's acceptance test): badge, title, and summary
    render regardless of whether this component renders anything.
- **`project-card.tsx`**: composes badge + title + evidence + summary,
  wrapped in a plain `<a>` (not `<div>`) only when `card.link !== undefined`.

### Task 3.4 — `components/sections/portfolio.tsx`, and the `caseStudyPublished` field

**The critical constraint** ("a card MUST render a link ONLY when its
project has a published case study... today no case study is published, so
every card renders as a non-link") is satisfied literally, not just in
spirit, via a new field:

```ts
// lib/content/types.ts
readonly caseStudyPublished: boolean;
```

Added to `Project`, set `false` on all 7 entries in `lib/content/projects/
index.ts` (PR 5, or a task 5.5 follow-up, flips it per project once that
project's write-up AND the route both ship). `lib/content/projections.ts`
gained `portfolioLink()`, replacing the grid's prior reuse of the hero's
`publicLink()`:

```ts
function portfolioLink(locale: Locale, project: Project): string | undefined {
  if (project.evidence.state === "live") return project.evidence.externalUrl;
  return project.caseStudyPublished
    ? caseStudyPath(locale, project.slug)
    : undefined;
}
```

`live` evidence always keeps its independently-verified external URL,
regardless of `caseStudyPublished` — this matches
`specs/project-portfolio/spec.md`'s "Evidence State Rendering" table
(`live` → "screenshot + external link") and resolves an apparent tension in
the launch instructions' own wording ("today no case study is published, so
every card renders as a non-link") against that same spec table: read
literally against ALL cards, those two statements would contradict each
other for Luang/Atemporal/Blu Café. The "published case study" framing is
about the INTERNAL `/proyectos/[slug]` route specifically (which is what
"case study" means throughout this codebase) — not about a third-party
external URL, which trivially "exists" independent of this site's own route
table. Every non-`live` project (`blu`, `fast-route`, `blu-biolink`) renders
as a non-link today, exactly as instructed.

**Why `project-card.tsx` never uses `next/link` for the internal case-study
branch.** `typedRoutes` cannot verify a route that is not generated yet
(`/[locale]/proyectos/[slug]` does not exist in this repo state at all), so
a `<Link href={...}>` there would need a THIRD `as Route` waiver — the
launch instructions explicitly forbid adding one (only two exist/are
tracked: `hero-parallax.tsx`'s permanent `product.link` cast, compensated by
`checkInternalLinksResolve`, and `lib/brief/submit.ts`'s temporary one,
removed by task 6.9b). Since a plain `<a href={string}>` needs no `Route`
type at all, this batch uses `<a>` for BOTH the external (`live`) and the
internal (once-published) cases — no cast anywhere in this batch's new
code. Once PR 5 creates the route, upgrading the internal branch to
`<Link>` for prefetching is a natural, tracked follow-up, not a defect.

**Compensating build-time control (task 3.10)**:
`lib/content/invariants.ts` gained
`checkPortfolioLinksOnlyToPublishedCaseStudies`, which fails the production
build if any portfolio card's internal link does not exactly match
`caseStudyPath(locale, slug)` for a project whose `caseStudyPublished` is
`true`. Today this is redundant with `portfolioLink()`'s own logic (same
"defense-in-depth over a compile-time-adjacent guarantee" reasoning as the
file's existing `checkEvidenceMediaShape`) — it earns its keep the moment a
future edit drifts. Verified by fault injection (see Verification below).

**The `#proyectos` anchor moved.** Before this batch, `#proyectos` targeted
`HeroParallax`'s products track via its `productsId` prop (the
`fix/restore-consented-content` remediation's W2 fix — a stand-in, because
the real Proyectos section did not exist yet). Now that
`components/sections/portfolio.tsx` exists and owns `id="proyectos"`,
`app/[locale]/page.tsx` no longer passes `productsId` to `HeroParallax`, so
there is exactly one element with that id in the compiled output — verified,
see below. `hero-header.tsx`'s CTA-cast comment (which named the old
target) was updated to avoid becoming a second false-comment defect of the
exact kind already fixed once (verify-report.md finding W1).

### Task 3.9 — `app/[locale]/page.tsx` composition

Composes only sections 1 (Hero), 2 (Servicios), 4 (Proyectos) — sections 3,
5, 6, 7 are out of this batch's scope and not yet built. The relative order
among what IS rendered is correct per `specs/landing-narrative/spec.md`'s
"Fixed Section Order" (Hero < Servicios < Proyectos); the gaps are filled by
later slices, not reordered around, matching how PR 2c shipped a hero-only
page under the same principle.

### Deviations summary

| Task | Literal text | What actually shipped | Why |
|---|---|---|---|
| 3.1 | Two links per card (pricing + proof) | One link (proof only, `#proyectos`) | `/precios`/`#precios` are both dead targets this batch; hard-banned by launch instructions |
| 3.4 | PR 5 ships before this PR, so `caseStudyPath()` links resolve | PR 5 not implemented this batch; added `caseStudyPublished` flag, `false` everywhere | This batch is an explicitly partial PR 3a, scoped by the launch instructions against the actual (not planned) repo state |
| 3.9 | Compose sections 2-7 | Composes only 2 and 4 | Sections 3/5/6/7 out of this batch's scope |

None of these are silent — each is a documented, reasoned response to a real
constraint (a route that does not exist, or a task explicitly excluded by
this batch's own launch instructions), following the same "flag the
deviation, do not paper over it" discipline this change set has used
throughout (`publicLink()`'s comment, the "Delivery order correction"
section itself).

### Verification performed

- `npm run build` — exit 0.
  ```
  ▲ Next.js 16.1.1 (Turbopack)
    Creating an optimized production build ...
  ✓ Compiled successfully in 3.1s
    Running TypeScript ...
    Collecting page data using 11 workers ...
  ✓ Generating static pages using 11 workers (6/6) in 542.1ms
    Finalizing page optimization ...
  Route (app)
  ┌ ○ /_not-found
  ├ ● /[locale]
  │ └ /es
  ├ ○ /robots.txt
  └ ○ /sitemap.xml
  ```
- `npm run lint` — exit 0, same 2 pre-existing `hover-border-gradient.tsx`
  warnings (`react-hooks/exhaustive-deps` at line 68, `no-unused-vars` at
  line 72), zero new ones.
- `VERCEL_ENV=production npm run build` (after `rm -rf .next`) — exit 0,
  same output as above.
- **Fault injection 1** (hero-floor re-proof, as the launch instructions
  suggested — "drop a project with media from the hero projection"):
  temporarily set `blucafe.featured` to `false`. `VERCEL_ENV=production
  npm run build` → real exit code 1:
  ```
  Error: Content integrity check failed:
    - Hero projection for locale "es" has only 3 entries; the floor is 4.
  ```
  Reverted via `Edit` back to `featured: true`; rebuilt clean (exit 0).
- **Fault injection 2** (this batch's own new check,
  `checkPortfolioLinksOnlyToPublishedCaseStudies`): temporarily changed
  `portfolioLink()` to return `caseStudyPath(locale, project.slug)`
  unconditionally for non-`live` evidence, ignoring `caseStudyPublished`.
  `VERCEL_ENV=production npm run build` → real exit code 1:
  ```
  Error: Content integrity check failed:
    - Portfolio card "blu" links to "/es/proyectos/blu" but its case study
      is not published ("caseStudyPublished: false" in
      lib/content/projects/index.ts). ...
    - Portfolio card "fast-route" links to "/es/proyectos/fast-route" ...
    - Portfolio card "blu-biolink" links to "/es/proyectos/blu-biolink" ...
  ```
  Reverted via `Edit` back to the guarded version; rebuilt clean (exit 0,
  confirmed via `git diff --stat` that only the intended feature diff
  remained on both touched files after both fault injections were reverted).
- **Compiled `href` inventory** — every `href="..."` in
  `.next/server/app/es.html`:
  | `href` | Target exists? |
  |---|---|
  | `/_next/static/chunks/*.css`, `/_next/static/chunks/*.js` | Yes — build assets |
  | `/es` | Yes — locale root |
  | `/es#proyectos` | Yes — `components/sections/portfolio.tsx`'s `id="proyectos"` |
  | `/favicon.ico?favicon....ico` | Yes — static asset |
  | `http://localhost:3000/es` | Yes — absolute canonical/OG URL (via `metadataBase`) |
  | `https://atemporalarq.vercel.app/` | Yes — verified live (task 1.H2) |
  | `https://blucafe.vercel.app/` | Yes — verified live |
  | `https://luang.com.pe/` | Yes — verified live |

  Zero occurrences of `/es/precios` and zero occurrences of
  `/es/proyectos/` anywhere in `es.html` (`grep -c` both return `0`).
- **`blu`'s gated card, compiled markup** (from `.next/server/app/es.html`,
  entity-decoded for readability):
  ```html
  <div class="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors cursor-default">
    <span class="...">Aplicaciones web y dashboards a medida</span>
    <h3 class="...">Sistema de gestión interno de Blu Café</h3>
    <div class="space-y-2">
      <div class="relative aspect-video ..."><img alt="Captura de pantalla del panel administrativo autenticado de Blu Café: ..." .../></div>
      <p class="text-xs font-medium text-muted-foreground">Acceso restringido: este producto requiere inicio de sesión.</p>
      <p class="text-xs text-muted-foreground">Este panel se encuentra protegido por inicio de sesión (blucafefinance.vercel.app requiere credenciales). Captura mostrada con autorización del cliente.</p>
    </div>
    <p class="text-sm text-muted-foreground">Panel administrativo interno de Blu Café: ...</p>
  </div>
  ```
  Confirms: non-link (`<div>`, `cursor-default`, no hover class), the
  generic login note AND the specific disclosure line both render as
  separate elements, no `target="_blank"` anywhere (it is not an `<a>` at
  all).
- **A `no-visual` card, compiled markup** (`fast-route`):
  ```html
  <div class="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors cursor-default">
    <span class="...">Aplicaciones web y dashboards a medida</span>
    <h3 class="...">Optimización de rutas de entrega en tiempo real</h3>
    <p class="text-sm text-muted-foreground">Optimización de rutas de entrega en tiempo real: ...</p>
  </div>
  ```
  Confirms: zero `<img>` elements, no empty image frame, no gray box — the
  card reads as complete via badge + title + summary alone. Same shape
  confirmed for `blu-biolink`.
- **No client component created**: `grep -rl '"use client"' components app`
  returns only the two pre-existing files (`hero-parallax.tsx`,
  `hover-border-gradient.tsx`). None of this batch's five new files
  (`service-badge.tsx`, `evidence.tsx`, `project-card.tsx`, `services.tsx`,
  `portfolio.tsx`) carry the directive — D10's "exactly one new client
  component, and it is `BriefForm`" is unbroken.

### Not fixed / not verified — explicitly out of scope

- Tasks 3.5-3.8 (Autoridad, Retainer, Precios summary) — PR 3b, not this
  batch.
- Task 3.2 (Proceso) — blocked on user-supplied content, see above.
- 3.V3 (full section order Hero→...→Retainer) — only checkable for the
  subset that exists (Hero < Servicios < Proyectos, confirmed correct).
- 3.V4/3.V5 (Academy/Retainer content checks) — not applicable, those
  sections do not exist yet.
- Human-only visual checks (1.V3-1.V5-style breakpoint/hover/motion review,
  and this section's own visual polish) — no browser was used; every claim
  above is evidenced from compiled HTML/build output, not a live render.
- Verify-report findings not in this batch's three-task scope — untouched.

### Commits (in order, `feat/landing-servicios-proyectos`)

1. `baef7d2` — feat(content): derive portfolio grid links from case-study
   publication state
2. `6838456` — feat(landing): add Servicios and Proyectos sections to the
   landing page
3. (this apply-progress/tasks.md update, committed separately)

No push performed. No PR opened. No history rewrite. Local commits only.

---

## PR 3a (continued) — Proceso section (task 3.2), completing PR 3a's code tasks

Batch: 9 of N — **task 3.2 only.** Same branch,
`feat/landing-servicios-proyectos`, on top of the previous batch's two
commits (`baef7d2`, `6838456`). PR 3b, PR 4, PR 5, PR 6b remain explicitly
out of scope for this batch, unchanged from before.

### Unblocking event

The prior batch's "Task 3.2 (Proceso) — explicitly not implemented" note
(above) recorded this as blocked on the studio's real engagement process and
its response-time commitment, neither supplied at the time. This batch's
launch instructions supplied the actual process: five phases — Descubrimiento,
Propuesta y alcance, Diseño, Desarrollo, Entrega — with the first three
requiring the client's explicit approval to proceed, plus a settled figure of
2 included revision rounds (additional rounds quoted separately). The
client-side approval response deadline was explicitly named as still
unsupplied — the user was asked and did not answer — and the instructions
were explicit that no such deadline should be invented or rendered as a
placeholder resembling a real commitment.

### What shipped

- `lib/content/process.ts` (new): `ProcessPhase` (`id`, locale-keyed
  `name`/`description`, `requiresApproval: boolean`) and `ProcessContent`
  (`phases` typed as a 5-tuple — same "exactly N, compile-time guaranteed"
  discipline as `SERVICE_LINES`'s `Record<ServiceLine, ...>` — plus
  `revisionRoundsIncluded: number`). `PROCESS` instance: the five phases in
  order, `requiresApproval: true` on Descubrimiento/Propuesta y
  alcance/Diseño, `false` on Desarrollo/Entrega; `revisionRoundsIncluded: 2`.
  Zero React imports, matching every other `lib/content/**` module.
- `components/sections/process.tsx` (new, Server Component): renders
  `PROCESS.phases` as an ordered list (`<ol>`), one card per phase (number,
  name, description, and a visible approval badge rendered via ternary — not
  `&&` — only when `requiresApproval` is `true`), plus a sentence built from
  `revisionRoundsIncluded` and two dictionary-sourced label fragments. No
  link/CTA in this section — nothing it could point at has a live target in
  this batch's repo state.
- `lib/dictionaries/types.ts` / `es.ts`: added `ProcessDictionary` (`heading`,
  `approvalBadge`, `revisionsLabel`, `revisionsExtra`) and its Spanish values.
  Phase names/descriptions themselves are NOT here — they are domain facts in
  `lib/content/process.ts`, per design.md §5's dictionary-vs-content line.
- `app/[locale]/page.tsx`: composes `<Process locale={validLocale} />`
  between `<Services>` and `<Portfolio>`, completing the Hero → Servicios →
  Proceso → Proyectos order for every section built so far.

### Deviation, documented rather than silently applied

`specs/landing-narrative/spec.md`'s "Proceso Section Contract" literally
calls for a "response-time commitment... sourced from content data". No such
commitment exists for mid-project client turns (the open item below) — only
`RETAINER_COMMITMENTS.responseWindow` exists, and that covers a different
phase of the relationship (post-launch maintenance requests), not this one.
This batch satisfies the requirement's actual mechanism — a claim that
changes without a component edit when the underlying data changes — using
`revisionRoundsIncluded`, the one quantifiable commitment actually settled
for this process. No response-time figure, day count, or deadline was
invented to satisfy the requirement's literal noun instead of its mechanism.
See `lib/content/process.ts`'s doc comment for the full reasoning.

### Open item, explicitly not closed by this batch

**The studio's client-side approval response deadline is unresolved.** How
quickly the studio commits to turning around a client's review of a
deliverable (discovery brief, proposal, or design draft) is not decided —
the user was asked and did not answer. Nothing in this batch's code or copy
renders a number, a day count, or any placeholder resembling a real
commitment for it. `ProcessContent`'s shape absorbs this cleanly later: one
new optional field, read by the same single `PROCESS` constant every
consumer (today, only `process.tsx`) already imports — not a restructuring.
This is distinct from `RETAINER_COMMITMENTS.responseWindow` (PR 3b, still
`pending`), which is the tiered same-day/2-business-day retainer response
window for post-launch requests — that value belongs in the Retainer
section, not here, and this batch does not render it or contradict it.

### Copy-voice check (no fabricated headcount)

Every phase description uses first-person-plural studio voice matching the
existing hero copy (`lib/dictionaries/es.ts`'s pre-existing "Diseñamos webs
únicas..."/"...nosotros la magia"): "Relevamos...", "Definimos...",
"Diseñamos...", "Construimos...", "Publicamos...". No "nuestro equipo",
"nuestros diseñadores", "nuestro staff", or any phrase asserting a team of
developers or employees appears anywhere in `lib/content/process.ts`,
`components/sections/process.tsx`, or the new dictionary entries — confirmed
by grepping the compiled `.next/server/app/es.html` for "equipo", "nuestros",
"nosotros", "staff" (case-insensitive): zero hits inside the Proceso section;
the only 2 "nuestros"/"nosotros" hits anywhere in the whole compiled page are
both pre-existing hero copy from PR 2c ("Explora nuestros proyectos" —
possessive, referring to the studio's own body of work; "nosotros la magia" —
a figure of speech naming the studio as an entity, not a headcount claim),
unrelated to and unmodified by this batch.

### Verification performed

- `npm run build` — exit 0. Same non-strict `NEXT_PUBLIC_SITE_URL` warning as
  every prior non-production run in this change set (task 2.H2 still open);
  not a new condition introduced by this batch.
  ```
  ▲ Next.js 16.1.1 (Turbopack)
    Creating an optimized production build ...
  ✓ Compiled successfully in 2.4s
    Running TypeScript ...
    Collecting page data using 11 workers ...
  ✓ Generating static pages using 11 workers (6/6) in 559.5ms
    Finalizing page optimization ...
  Route (app)
  ┌ ○ /_not-found
  ├ ● /[locale]
  │ └ /es
  ├ ○ /robots.txt
  └ ○ /sitemap.xml
  ```
- `npm run lint` — exit 0, same 2 pre-existing `hover-border-gradient.tsx`
  warnings (`react-hooks/exhaustive-deps`, `no-unused-vars`), zero new ones.
- `VERCEL_ENV=production NEXT_PUBLIC_SITE_URL=https://example.test npm run
  build` — exit 0, same route table, no content-integrity violation (the
  `NEXT_PUBLIC_SITE_URL` check that fires without production `env` no longer
  fires once it is set; no other production-mode invariant tripped by this
  batch's new module).
- **Compiled Proceso section markup** (`.next/server/app/es.html`, extracted
  by locating `id="proceso"`):
  ```html
  <section id="proceso" class="py-16 md:py-24"><div class="max-w-7xl mx-auto px-4">
    <h2 class="text-2xl md:text-4xl font-bold">Proceso</h2>
    <ol class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
      <li>...<h3>Descubrimiento</h3>...<span>Requiere tu aprobación para avanzar</span></li>
      <li>...<h3>Propuesta y alcance</h3>...<span>Requiere tu aprobación para avanzar</span></li>
      <li>...<h3>Diseño</h3>...<span>Requiere tu aprobación para avanzar</span></li>
      <li>...<h3>Desarrollo</h3>...</li>  <!-- no approval badge -->
      <li>...<h3>Entrega</h3>...</li>     <!-- no approval badge -->
    </ol>
    <p class="mt-8 text-sm text-muted-foreground">2 rondas de revisión incluidas. Rondas adicionales se cotizan aparte.</p>
  </div></section>
  ```
  Confirms all five phases render in order, with the approval badge present
  on exactly phases 1-3 and absent on 4-5, and `revisionRoundsIncluded`'s
  value (`2`) appearing in the rendered sentence, not a hardcoded string.
- **Section order, confirmed by string offset** in the same compiled file:
  hero heading ("Tu proyecto es único") at offset 2665 < `id="servicios"` at
  7864 < `id="proceso"` at 9812 < `id="proyectos"` at 12368 — Hero < Servicios
  < Proceso < Proyectos, matching `specs/landing-narrative/spec.md`'s "Fixed
  Section Order" for every section built so far.
- **No client component created**: `grep -rl '"use client"' components app`
  returns only the two pre-existing files (`hero-parallax.tsx`,
  `hover-border-gradient.tsx`). `components/sections/process.tsx` does not
  carry the directive.

### Commits (in order, `feat/landing-servicios-proyectos`, this batch)

1. `aa85396` — feat(landing): add Proceso section to the landing page
2. `f98c0b3` — docs(sdd): mark task 3.2 complete, PR 3a code tasks done

No push performed. No PR opened. No history rewrite. Local commits only.

## Status (cumulative, through this batch)

39/39 PR 1-2c/6a code tasks + 5/5 `fix/content-honesty` tasks + 4/4
`fix/restore-consented-content` tasks (all unchanged, see above) + **6/6 PR
3a code tasks complete (3.1, 3.2, 3.3, 3.4, 3.9, 3.10 — all done)**.

PR 3a's code tasks are now fully complete. PR 3b, PR 4, PR 5, PR 6b remain
entirely unimplemented — all blocked on business content the user has not
supplied (pricing figures, retainer figures, case-study write-up
approval/content, WhatsApp number, DNS domain verification, remaining
project consent/captures). The client-side approval response deadline
(distinct open item, see task 3.2 above) remains unsupplied and is not
rendered anywhere.

Ready for `sdd-verify` to re-validate this batch against the spec/design, or
`sdd-apply` to continue once the user supplies the content blocking PR 3b,
PR 4, PR 5, or PR 6b.

---

## Batch 10 — Partial PR 3b: Autoridad, Retainer, and the Proceso approval deadline

Branch: `feat/landing-autoridad-retainer`, based on
`feat/landing-servicios-proyectos` (PR 3a, complete, merged conceptually — no
push/merge performed, local branches only). MERGED with all prior batches
(1-9, unchanged — see above for full detail).

**What**: Implemented tasks 3.5 (Autoridad) and 3.6 (Retainer), plus one
addition to the already-shipped Proceso section (a 5-business-day
client-approval deadline). Tasks 3.7 (moved to PR 4 as 4.0) and 3.8 (Precios
summary) remain explicitly OUT of scope — no price figure or currency has
been supplied for any of the 8 tokens in `lib/content/pricing.ts`; every
entry is honestly `pending`. No pricing summary block was built and no price
figure was invented. PR 4, PR 5, PR 6b also remain unimplemented.

**Why**: The user supplied, for the first time, the retainer's full terms
(tiered response window, no monthly-hour model, itemized inclusions/
exclusions, cancellation terms) and the academy's honesty constraints
(already modeled in `lib/content/authority.ts` from an earlier batch, now
finally consumed by a rendering component), plus the studio's 5-business-day
client-approval deadline for the Proceso section — closing the open item
batch 9 recorded (a process gating 3 of 5 phases on approval stalls when the
client goes quiet, with no stated consequence).

**Where**:

- `lib/content/retainer.ts` (rewritten) — `RETAINER_COMMITMENTS` populated:
  - `responseWindow`: `set`, two `ResponseTier` entries (`"Sitio caído"` →
    `"Mismo día hábil"`; `"Cualquier otro caso"` → `"2 días hábiles"`).
  - `channels`: stays `pending` — not supplied this batch.
  - `scopeModel` (new field, **replaces** the old stub `monthlyHours:
    Commitment<number>`): `set`, states scope is bound by task type, not an
    hour bucket. Verified `monthlyHours` had zero call sites anywhere in the
    codebase before this change, so the rename/replacement is free.
  - `includedScope`: `set`, 4 entries (security/dependency patches; uptime
    monitoring + backups; changes to existing content; bug fixes).
  - `excludedScope`: `set`, 4 entries (new functionality; visual redesign;
    content creation; third-party costs — managed, not absorbed).
  - `bugVsFeatureBoundary` / `contentChangeScope` (new fields): both `set`,
    both state honestly that the boundary is resolved case-by-case in
    conversation because no fixed rule exists yet — not a fabricated
    threshold, and not silently omitted either. A future fixed rule replaces
    the same field's `value` later; no restructuring needed.
  - `cancellationTerms`: `set`, "30 días de aviso, sin penalidad."
  - All scalar/tuple values upgraded from plain `string`/`string[]` to
    `Localized<string>`/`Localized<string>[]` for consistency with every
    other rendered domain-content type in `lib/content/**` (e.g.
    `ServiceLineDefinition`, `ProcessPhase`) — a deviation from the original
    PR 2a stub shape, justified because that stub predates any real content
    and had zero consumers to break.
- `components/sections/authority.tsx` (new) — landing section 5. Renders
  `ACADEMY.name`/`description` plus a conditional media slot (empty today —
  no capture exists, blocked on 3.H1). The link is rendered by
  `renderLink()`, an exhaustive switch on `ACADEMY.state`: the `no-link`
  branch returns `null` (structurally absent, not conditionally hidden); the
  `linked` branch (unreachable today) renders the anchor. No number appears
  anywhere in this component or in `ACADEMY`'s data — `Authority`'s `no-link`
  variant has no field to hold a scale claim.
- `components/sections/retainer.tsx` (new) — landing section 7. Renders each
  `RETAINER_COMMITMENTS` field only when its `Commitment` is `"set"` — a
  `"pending"` field (today: `channels`) renders nothing, never a fabricated
  value or a visible placeholder. No price or hour figure anywhere. No
  testimonial markup exists in the component at all.
- `app/[locale]/page.tsx` — composes `<Authority>` and `<Retainer>` after
  `<Portfolio>`. Section 6 (Precios summary) is the one deliberate gap
  between them, documented in the updated doc comment.
- `lib/content/process.ts` — added
  `ProcessContent.clientApprovalDeadlineBusinessDays: number`, set to `5`.
  Distinct from the still-open "client-side approval response time" item
  batch 9 recorded — this is "how long can the client sit on a phase before
  the timeline moves", not "how fast does the studio respond".
- `components/sections/process.tsx` — renders the new field as a sentence:
  "Tienes 5 días hábiles para aprobar una fase pendiente de tu revisión;
  pasado ese plazo, el proyecto se pausa y la fecha de entrega se
  recalcula."
- `lib/dictionaries/types.ts` / `es.ts` — added `AuthorityDictionary`
  (`heading`, `intro`, `visitCta`) and `RetainerDictionary` (`heading`,
  `responseHeading`, `includedHeading`, `excludedHeading`,
  `cancellationLabel`); extended `ProcessDictionary` with
  `approvalDeadlinePrefix`/`approvalDeadlineSuffix`. All Spanish, neutral
  professional register, no regional slang.
- `lib/content/invariants.ts` — two new checks (requirement per this batch's
  launch instructions, hard constraint 6):
  - `checkAuthorityNoLinkWhileUndeployed`: fails the build if `ACADEMY.state`
    is ever `"linked"` while the new `ACADEMY_VERIFIED_UNREACHABLE` constant
    (`true`, recording this batch's verified fact: private repo, 404
    deployment) is still `true`. Flipping the academy's state without also
    updating that flag is the exact class of silent-drift bug this file's
    other 9 checks already guard against.
  - `checkRetainerCommitmentsNotBlank`: fails the build if any
    `RETAINER_COMMITMENTS` field marked `"set"` is blank for any locale.
    `"pending"` fields are exempt (the designed unresolved state).
- `openspec/changes/dev-services-website/tasks.md` — tasks 3.5/3.6 marked
  `[x]` with full deviation notes; task 3.2's note extended with the
  approval-deadline addendum; PR 3b's `3.9` entry and PR 3's `3.V3`/`3.V4`/
  `3.V5` verification entries updated to reflect Autoridad/Retainer now being
  implemented; 3.7/3.8 explicitly re-confirmed as still out of scope.

**Learned**:

- The literal `monthlyHours: Commitment<number>` field from the PR 2a stub
  could not honestly hold "the studio deliberately has no hour-bucket
  model" — `pending` would misrepresent a *settled* decision as an *open*
  one. Renaming it to `scopeModel: Commitment<Localized<string>>` (zero
  existing consumers, confirmed by repo-wide grep before the change) was
  the honest fix, not a `pending` placeholder that would never resolve.
- Two retainer boundaries (bug-fix-vs-feature, content-edit size) were
  explicitly named as undefined by the launch instructions, with an
  explicit warning not to silently invent or drop them. Modeled both as
  `Commitment<Localized<string>>` fields whose *current, true* value states
  the boundary is resolved conversationally — this is not the same as
  `pending` (which would imply nothing is decided) nor a fabricated
  threshold (which would misrepresent an open question as closed). A real
  threshold later is a value swap on the same field, not a restructuring.
- `specs/trust-signals/spec.md`'s "Retainer Published Commitments"
  requirement literally lists "monthly hours" as a checkable value. This
  batch's actual supplied content rejects an hour model entirely. Per this
  codebase's established discipline (see `lib/content/process.ts`'s and
  `components/sections/services.tsx`'s own deviation notes from earlier
  batches), the deviation is documented rather than silently applied: the
  requirement's underlying intent — a structured, checkable scope
  commitment, not a vague promise — is satisfied by `scopeModel`, just not
  by the literal noun "hours".
- Verification performed (no browser, all evidenced via compiled HTML/build
  output):
  - `npm run build` exit 0, only the pre-existing non-strict
    `NEXT_PUBLIC_SITE_URL` warning (task 2.H2, still open — not a new
    condition).
  - `npm run lint` exit 0, only the 2 pre-existing
    `hover-border-gradient.tsx` warnings, zero new.
  - `VERCEL_ENV=production NEXT_PUBLIC_SITE_URL=https://example.test npm run
    build` exit 0, clean.
  - Compiled `.next/server/app/es.html` (fresh production build), extracted
    `id="autoridad"`: zero `href`/`<a` elements, zero numeric scale claims.
  - Extracted `id="retainer"`: both response tiers, all 4 inclusions, all 4
    exclusions, cancellation line, both boundary notes all render as
    structured elements; grepped the extracted markup for a price/hour
    figure — none found.
  - Extracted `id="proceso"`: confirms the 5-business-day deadline sentence
    and its pause/recalculation consequence render, alongside the unchanged
    5-phase sequence and 2-revision-round sentence from batch 9.
  - Section order by string offset in the fresh compiled `es.html`: hero
    heading (2665) < `id="servicios"` (7864) < `id="proceso"` (9812) <
    `id="proyectos"` (12594) < `id="autoridad"` (22830) < `id="retainer"`
    (23667) — Hero < Servicios < Proceso < Proyectos < Autoridad < Retainer,
    with the Precios (section 6) gap sitting, as intended, between Autoridad
    and Retainer.
  - Headcount grep (`equipo`/`nuestros`/`nosotros`/`staff`, case-insensitive)
    against the fresh compiled `es.html`: same 2 pre-existing hits as batch
    9 ("Tú pones la idea, nosotros la magia" — figure of speech; "Explora
    nuestros proyectos" — possessive), both unmodified hero copy from
    earlier batches. Zero new hits from this batch's Autoridad/Retainer/
    Proceso additions — all new copy checked and confirmed impersonal
    (no "nuestro equipo"/"nuestros desarrolladores"/"staff" anywhere).
  - Confirmed zero new `"use client"` files: `grep -rl '"use client"'
    components app` still returns only the two pre-existing files
    (`hero-parallax.tsx`, `hover-border-gradient.tsx`).
  - Confirmed zero new `as Route` casts: `grep -n "as Route"` across the new
    /changed files returns nothing.
  - Fault-injection re-proof of the two new invariants: blanked
    `RETAINER_COMMITMENTS.cancellationTerms`'s value to `{ es: "" }`, ran
    `VERCEL_ENV=production npm run build` → real exit code 1
    (`RETAINER_COMMITMENTS.cancellationTerms is "set" but blank.`), restored
    the exact original string via `Edit`, rebuilt clean (`npm run build`
    exit 0, same single pre-existing warning as before).
- **Open items, explicitly not closed by this batch**:
  - The client-side approval RESPONSE-TIME question (how fast the studio
    turns around a client's review) remains open — distinct from the
    approval DEADLINE now closed (`clientApprovalDeadlineBusinessDays`).
  - The two retainer boundaries (bug-fix-vs-feature, content-edit size) are
    modeled but not resolved to a fixed rule — see "Learned" above.
  - Tasks 3.7/3.8/4.0 (pricing components + summary) remain blocked on
    task 4.H1 (price figures + currency decision) — still entirely
    unsupplied. No figure was invented anywhere in this batch.
  - `channels` (retainer support channels — email/WhatsApp/phone/ticket)
    remains `pending` — not asked this batch.
  - PR 4, PR 5, PR 6b remain entirely unimplemented, same as batch 9.

### Commits (in order, `feat/landing-autoridad-retainer`, this batch)

1. `967be31` — feat(content): give the retainer real commitments and the
   process a client approval deadline
2. `2d2bcef` — feat(landing): render Autoridad and Retainer sections,
   surface the approval deadline in Proceso
3. (this docs commit) — docs(sdd): mark tasks 3.5/3.6 complete, record
   PR 3b apply progress

No push performed. No PR opened. No history rewrite. Local commits only.

## Status (cumulative, through Batch 10)

39/39 PR 1-2c/6a code tasks + 5/5 `fix/content-honesty` tasks + 4/4
`fix/restore-consented-content` tasks + 6/6 PR 3a code tasks (unchanged, see
above) + **2/4 PR 3b code tasks complete (3.5 Autoridad, 3.6 Retainer — both
done; 3.7 moved to PR 4 as task 4.0, still blocked on pricing figures; 3.8
Precios summary, still blocked on 4.0 and 4.H1)**.

PR 4, PR 5, PR 6b remain entirely unimplemented — all blocked on business
content the user has not supplied (pricing figures + currency, case-study
write-up approval/content, WhatsApp number, DNS domain verification,
remaining project consent/captures). Retainer `channels` remains `pending`.
The two retainer boundary notes (bug-vs-feature, content-edit size) and the
client-side approval response-time question remain open items, not rendered
as fixed commitments anywhere.

Ready for `sdd-verify` to re-validate this batch against the spec/design, or
`sdd-apply` to continue once the user supplies the pricing figures/currency
blocking the rest of PR 3b (3.7/3.8) and PR 4.
