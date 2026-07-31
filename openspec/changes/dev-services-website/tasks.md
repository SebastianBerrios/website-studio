# Tasks: dev-services-website

> Size note: this artifact exceeds the usual word budget deliberately. The
> orchestrator required per-task decision citations, human/code separation,
> and an explicit verification step for everything the four build-time gates
> cannot catch. Density is managed with tables and checklists, not prose.

Delivery strategy: `auto-chain`. Chain strategy: `stacked-to-main` — each PR
merges to `main` in order before the next slice starts.

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ~3400+ total across 6 slices (see per-slice table below) |
| 400-line budget risk | High overall — 3 of 6 slices individually exceed budget |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2a → PR 2b → PR 2c → **PR 4 → PR 5** → **PR 3a → PR 3b** → PR 6a → PR 6b — reordered, see "Delivery order correction" below |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

```text
Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High
```

### Suggested Work Units

| Order | Unit | Goal | Est. lines | Base | Notes |
|---|---|---|---|---|---|
| 1 | PR 1 | Truth pass | ~200-250 | main | Single PR, under budget |
| 2 | PR 2a | `lib/content/**` core types, service lines, pricing/retainer/authority/contact stubs | ~350 | PR 1 | Zero React imports; pure data |
| 3 | PR 2b | `lib/content/projects/**`, `projections.ts`, `invariants.ts`, `lib/dictionaries/**` | ~400 | PR 2a | Watch this one — near budget alone |
| 4 | PR 2c | `app/[locale]/**` routing, `next.config.ts`, `hover-border-gradient.tsx` retype, `hero-header.tsx` slot | ~370 | PR 2b | Completes slice 2 |
| 5 | PR 4 | Pricing page — **now includes task 3.7** (`Price` / `PricePending`), moved here because this PR is their first consumer | ~470 | PR 2c | Borderline — measure actual diff; split blocks 2-3 vs 4-8 if it overshoots |
| 6 | PR 5 | Case studies (first 2: Luang, Blu Café) | ~350 | PR 4 | Self-contained (`components/case-study/**`). Additional write-ups (5.5) ship as small follow-on PRs, one per project |
| 7 | PR 3a | Servicios, Proceso, Proyectos grid + portfolio components | ~355 | PR 5 | Case-study links resolve on arrival — absorbs old task 5.7 |
| 8 | PR 3b | Autoridad, Retainer, Precios-summary | ~250 | PR 3a | `/precios` link resolves on arrival. Completes slice 3 |
| 9 | PR 6a | Brief server logic (`lib/brief/**`) | ~260 | PR 3b | No UI yet |
| 10 | PR 6b | `BriefForm` UI, landing wiring, `/gracias` | ~240 | PR 6a | Completes slice 6 |

### Delivery order correction

**PR numbering is preserved for traceability; the delivery order is not the
numbering.** Slices 4 and 5 ship BEFORE slice 3.

Why the original order was wrong. `chain_strategy` is `stacked-to-main`, so
every PR reaches production. As originally planned, tasks 3.4 and 3.8 created
internal links to `/[locale]/precios` and `/[locale]/proyectos/[slug]` before
PR 4 and PR 5 created those routes. Three consequences, all bad:

1. **Real dead links in production** for however long slice 3 sat ahead of
   slices 4 and 5 — on a site whose entire purpose is converting a prospect.
2. **It defeated D7.** `typedRoutes: true` (task 2.23) only validates *literal*
   hrefs. Task 3.4 builds its href through `caseStudyPath()`, which returns
   `string`, so the build would have passed clean. The single protection added
   specifically to prevent another `/portfolio` would have been silently routed
   around.
3. **The production build would have failed anyway.** Old task 3.V1 relied on
   `assertContentInvariants()` only warning outside production. But merging to
   `main` *is* a production build, where that assertion throws. The original
   3.V1 was self-contradicting.

The fix is ordering, not new code: build the destinations before the things
that link to them. The proposal already states PR 4 is independent of slices 3
and 5, so the swap costs nothing. Dependency adjustments required by it:

| Change | Reason |
|---|---|
| Task 3.7 (`components/pricing/price.tsx`, `price-pending.tsx`) moves to PR 4 as task 4.0 | PR 4's tier cards are their first consumer; leaving them in PR 3b would make PR 4 depend on a later PR |
| Task 5.7 (confirm portfolio links resolve) moves to PR 3a as task 3.10 | The check belongs where the links are created, not where the targets are |
| Tasks 3.4 / 3.8 lose their "404s until PR 4/PR 5" caveats | No longer true under this order |
| Task 3.V7 (human: accept interim 404s) is deleted | The condition it asked the user to accept no longer exists |
| Task 3.V1 no longer depends on the invariant assertion staying in warn mode | Links resolve, so the assertion passes on its own terms |

Net effect: the success criterion "zero dead internal links in the built
output" holds at **every** point in the chain, not only after the last merge.

Since `delivery_strategy: auto-chain`, `Decision needed before apply: No` —
proceed slice by slice without pausing for user confirmation, per the
`chained-pr` and `work-unit-commits` skills.

---

## PR 1 — Truth pass

Satisfies: `site-shell` (Brand Metadata, Header Navigation), `project-portfolio`
(No Self-Referential Links, Row Derivation, Conditional Card Link Target).
Design decisions: D4, D6.

### Code tasks

- [x] 1.1 `app/layout.tsx`: replace `title: "Website Studio"` / empty
      `description` with "ElectroCode Studio" branding and a real
      description; add matching `openGraph` fields. — *site-shell: Brand
      Metadata Requirement*
- [x] 1.2 `app/page.tsx`: remove the 5 duplicate `products` entries (indices
      4-8); keep the 4 unique entries. Change the "Blu Finances" entry's
      `link` from `"/"` to `"/#proyectos"` (interim internal anchor — no
      case-study route exists yet; replace with `/es/proyectos/blu` in PR 5).
      Add a code comment noting this is temporary. — *project-portfolio: No
      Self-Referential Links*
- [x] 1.3 Create `lib/links.ts` exporting pure `isExternalHref(href: string):
      boolean` per design D6's regex (`//` protocol or `mailto|tel:`).
- [x] 1.4 `components/ui/hero-parallax.tsx` — `ProductCard`: branch on
      `isExternalHref(product.link)`. External → `<a target="_blank"
      rel="noopener noreferrer">` (adds the missing `rel`). Internal →
      `<Link>` (import from `next/link`), no `target`. **FLAGGED: hand-built
      component, extra review required.** — *design D6; project-portfolio:
      Conditional Card Link Target*
- [x] 1.5 `components/ui/hero-parallax.tsx` — row derivation: replace the
      fixed `0-5/5-10/10-15` slices with `SINGLE_ROW_MAX = 4;
      splitAt = products.length <= 4 ? products.length :
      Math.ceil(products.length / 2)`; delete the third `motion.div` track;
      keep `translateX` (row 1) and `translateXReverse` (row 2) both
      referenced; render row 2 only when non-empty. **FLAGGED: hand-built
      component, extra review required.** — *design D4; project-portfolio:
      Row Derivation From Array Length*
- [x] 1.6 `components/ui/hero-parallax.tsx` — `Header()`: change CTA `href`
      from `/portfolio` to `/#proyectos`. Keep copy hardcoded for now
      (dictionary extraction is PR 2c's job — do not write the strings
      twice). — *site-shell: Header Navigation, CTA no longer targets a dead
      route*
- [x] 1.7 Create `components/layout/site-header.tsx` (Server Component):
      brand name + nav links to `#proyectos`, `#precios` (same-page anchor
      until PR 4 ships the real route), WhatsApp link from 1.9. Render above
      `<HeroParallax>` in `app/page.tsx`.
- [x] 1.8 Create `components/layout/site-footer.tsx` (Server Component):
      brand, nav links, WhatsApp reference, no locale-switcher implication
      (only `es` ships). Render below `<HeroParallax>`. — *site-shell:
      Footer Navigation*
- [x] 1.9 Create `lib/contact.ts` (temporary, pre-content-model shape):
      exports a `ContactChannel` discriminated union and `WHATSAPP` in its
      `pending` state — the human-supplied number (1.H1) was not available
      this batch, so nothing was invented; the pending state renders no
      WhatsApp affordance at all. Superseded by `lib/content/contact.ts` in
      PR 2a (delete this file then). — *lead-capture: WhatsApp Escape Hatch*

### Human tasks (blocking)

- [ ] 1.H1 **[HUMAN, blocks 1.7/1.8/1.9]** Supply the studio's real WhatsApp
      business number. **Still open** — not supplied this batch;
      `lib/contact.ts` stays in `pending` state.
- [x] 1.H2 **[HUMAN]** Confirm `https://www.atemporalarq.com/` is live
      (currently UNVERIFIED). If unreachable, flag the Atemporal entry for a
      future evidence-state downgrade (affects PR 5, not this slice's
      structure). **Closed, negatively**, by the `fix/content-honesty`
      remediation slice: `nslookup`/`curl` confirm NXDOMAIN on the apex and
      `www`, from a resolver that correctly resolved the other three
      project domains in the same run. `atemporal` is downgraded to
      `evidence.state: "not-deployed"` (see verify-report.md finding C2).
      One independent cross-network check is still recommended before
      treating this as permanent.

### Verification

- [x] 1.V1 `npm run build` passes.
- [x] 1.V2 `npm run lint` passes.
- [ ] 1.V3 **Human**: check the hero at ~375px, ~768px, ~1440px, ~1920px+ —
      one row of 4 cards, no empty row, parallax slides symmetrically (no
      dragging a short row across empty space). No automated check exists
      for this. **Not performed by the apply agent** — requires a browser.
- [ ] 1.V4 **Human**: click every internal/external link (nav, footer, hero
      CTA, every product card) — confirm none targets `/portfolio` or bare
      `/`. **Partially substituted**: a repo-wide text search confirms zero
      remaining `/portfolio` or `link: "/"` occurrences, but the live
      browser click-through was not performed by the apply agent.
- [ ] 1.V5 **Human**: confirm `HoverBorderGradient`'s CTA still renders its
      hover-gradient animation correctly after the href change. **Not
      performed by the apply agent** — requires a browser.

**Rollback**: revert the single squashed merge commit — restores today's page
including its bugs. Zero data, zero infra.

---

## PR 2 — Locale skeleton + content model (split 2a/2b/2c)

Satisfies: `site-shell` (Locale Root Resolution, Discoverability, Not Found),
`content-model` (all requirements). Design decisions: D2, D3, D5, D7, D8
(layers 1-2 scaffolding), D9, D12.

### PR 2a — `lib/content/**` core types and data (no routing)

- [x] 2.1 Create `lib/content/locales.ts`: `Locale` union (`'es'`), `LOCALES`,
      `DEFAULT_LOCALE`, `isLocale()`, `assertLocale()` (calls `notFound()` on
      a miss). — *design D3 layer 3*
- [x] 2.2 Create `lib/content/types.ts`: `Localized<T>`, `Project`,
      `Evidence` (4-state discriminated union), `Consent` (3-state
      discriminated union), `Outcome` (metric-with-source vs qualitative),
      `MediaAsset`. — *content-model: Project Entity Shape, Evidence Field,
      Consent Field Semantics; case-study: No Invented Metric*
- [x] 2.3 Create `lib/content/service-lines.ts`: `ServiceLine` union +
      `SERVICE_LINES` — exactly 4 (A/B/C/D). — *service-catalog: Fixed
      Four-Line Catalog*
- [x] 2.4 Create `lib/content/pricing.ts`: `Currency`, `PriceToken` union (8
      tokens), `Money`, `PriceEntry` (`set` | `pending`), `PRICES` as
      `const satisfies Record<PriceToken, PriceEntry>` — every entry
      `status: 'pending'` (no figures decided yet). — *design D8;
      content-model: Pricing Module*
- [x] 2.5 Create `lib/content/retainer.ts`: `RetainerCommitments` type with
      all 6 required fields (`responseWindow`, `channels`, `monthlyHours`,
      `includedScope`, `excludedScope`, `cancellationTerms`); instance with
      placeholder values pending 4.H2. — *trust-signals: Retainer Published
      Commitments*
- [x] 2.6 Create `lib/content/authority.ts`: `Authority` union (`no-link` |
      `linked`); instance set to `no-link` (Academy deployment 404s,
      VERIFIED). — *trust-signals: Academy No-Link State*
- [x] 2.7 Create `lib/content/contact.ts`: business contact + `WHATSAPP`
      using the same `pending`-style discriminant if the number from 1.H1 is
      still unknown. Delete PR 1's temporary `lib/contact.ts`.

### PR 2b — projects, projections, invariants, dictionaries

- [x] 2.8 Create `lib/content/projects/index.ts`: `PROJECTS: readonly
      Project[]` — metadata only, no long prose. Cover Luang, Atemporal, Blu
      Café, `blu`, plus stub entries for the remaining curated slots, each
      honestly in `no-visual`/`not-deployed` evidence until captures land. —
      *project-portfolio: Curated Set Size*
- [x] 2.9 Create `lib/content/projects/media.ts`: static `import` of the 4
      existing `public/projects/*.png` files into a `MEDIA` map keyed by
      asset id.
- [x] 2.10 Create `lib/content/projects/approach/loader.ts` (`async
      getProjectApproach(slug)`) + one short placeholder `approach/<slug>.ts`
      per project in 2.8 (real write-ups arrive in PR 5). — *design D9 prose
      isolation*
- [x] 2.11 Create `lib/content/projections.ts`: `toHeroProducts(locale)`,
      `toPortfolioCards(locale)`, `publishableProjects()`. — *project-
      portfolio: Hero Projection Preserves Prop Contract*
- [x] 2.12 Create `lib/content/invariants.ts` (`import "server-only"`):
      `assertContentInvariants()` implementing design §6 layer-2 checks
      (duplicate slugs, dead internal link, service line without proof,
      evidence/media mismatch, empty `Localized` value, published project
      with empty approach, hero projection below 4 entries). Pending-price
      check activates in PR 4 once pricing data exists. Strict when
      `VERCEL_ENV === 'production'` unless `SITE_CONTENT_GATE=warn`.
- [x] 2.13 Create `lib/dictionaries/types.ts`, `lib/dictionaries/es.ts`
      (includes the hero `header` key extracted from `hero-parallax.tsx`'s
      `Header()`), `lib/dictionaries/index.ts` (`getDictionary(locale)`). —
      *content-model: Locale Dictionary Structure*
- [x] 2.14 `components/ui/hero-parallax.tsx`: add `header?: React.ReactNode`
      prop to `HeroParallax`; remove the internal `Header()` function's
      hardcoded strings. **FLAGGED: hand-built component, extra review
      required.** — *design D5*
- [x] 2.15 Create `components/sections/hero-header.tsx` (Server Component):
      reads `getDictionary(locale).hero`, renders title/subtitle/CTA via
      `HoverBorderGradient`, passed as the `header` prop.
- [x] 2.16 Extend `lib/links.ts`: add `caseStudyPath(locale, slug)`,
      `pricingPath(locale)`, `landingAnchor(locale, id)` (pure helpers).

### PR 2c — routing, config, chrome

- [x] 2.17 Create `app/[locale]/layout.tsx`: `generateStaticParams() =>
      LOCALES.map(locale => ({locale}))`; `export const dynamicParams =
      false`; call `assertLocale()`; `await assertContentInvariants()`;
      render `site-header`/`site-footer` from PR 1 (moved here) + dictionary
      context. — *design D3 layers 1 & 3; D8 layer 2*
- [x] 2.18 Move `app/page.tsx` → `app/[locale]/page.tsx`: compose
      `hero-header.tsx` + `toHeroProducts(locale)` into `HeroParallax` (only
      the hero for now — sections 2-7 land in PR 3). Delete old
      `app/page.tsx`.
- [x] 2.19 Create `app/not-found.tsx` (root, locale-neutral, default Spanish
      copy, no dictionary/chrome dependency). — *design §3 layout
      boundaries*
- [x] 2.20 Create `app/[locale]/not-found.tsx` (uses dictionary, full
      chrome). — *site-shell: Not Found Handling*
- [x] 2.21 Create `app/sitemap.ts`: cross-product `LOCALES ×
      publishableProjects()` (`/gracias` excluded once it exists in PR 6). —
      *site-shell: Discoverability Files*. **Deviation**: emits only the
      home entry per locale this batch — see apply-progress.md for why
      `precios`/`proyectos/<slug>` entries are deliberately deferred to
      PR 4/PR 5.
- [x] 2.22 Create `app/robots.ts`: allow crawling, reference the sitemap.
- [x] 2.23 `next.config.ts`: add `typedRoutes: true`; add `redirects()`
      per design D2's six entries (`/`→`/es`, `/precios`→`/es/precios`,
      `/gracias`→`/es/gracias`, `/proyectos/:slug`→`/es/proyectos/:slug`,
      `/portfolio`→`/es#proyectos`, `/es/proyectos`→`/es#proyectos`). No
      `images` block (D12). — *design D2, D7, D12*
- [x] 2.24 `components/ui/hover-border-gradient.tsx:103`: retype `href?:
      string` → `href?: Route` (`import type { Route } from "next"`); update
      the `<Link href={href}>` call site. **FLAGGED: hand-built component;
      required by `typedRoutes: true` or the build fails (design risk 2).**
- [x] 2.25 `components/ui/hero-parallax.tsx` `ProductCard` internal-link
      branch: contained `link as Route` cast at the one boundary produced by
      `lib/content/projections.ts`'s `publicLink()`, with a comment citing
      D7 and `checkNoSelfReferentialLinks`'s coverage. **Correction**: the
      task text named `app/[locale]/page.tsx`, but `ProductCard` is defined
      in and exported from `components/ui/hero-parallax.tsx` — the cast was
      applied at its actual location.
- [x] 2.26 Root `app/layout.tsx`: set `metadataBase` from
      `NEXT_PUBLIC_SITE_URL`; add `alternates.canonical` /
      `alternates.languages` / `x-default`. — *design D2 SEO consequences*

### Human tasks

- [ ] 2.H1 **[HUMAN]** Confirm the two fragment redirects (`#proyectos`
      cases in D2) behave as expected once deployed; fall back to `/es`
      without the anchor if not (design risk 4).
- [ ] 2.H2 **[HUMAN]** Supply `NEXT_PUBLIC_SITE_URL` for the target
      deployment.

### Verification

- [ ] 2.V1 `npm run build` passes — confirms `generateStaticParams`,
      `dynamicParams = false`, `typedRoutes`, and `assertContentInvariants()`
      all compile and run without throwing (non-production: warns only).
- [ ] 2.V2 `npm run lint` passes.
- [ ] 2.V3 **Human**: request `/precios`, `/gracias`, `/proyectos/x`
      unprefixed — confirm 307 to the `/es/...` counterpart, not a 404.
- [ ] 2.V4 **Human**: request an unknown first segment (e.g. `/xx`) — confirm
      the root `app/not-found.tsx` renders (404), not a phantom locale page.
- [ ] 2.V5 **Human**: request `/es` — identical content to today's `/`;
      confirm `/` itself 307-redirects to `/es`.
- [ ] 2.V6 **Human**: inspect `<head>` for `metadataBase`, canonical, OG tags
      resolving to absolute URLs.

**Rollback**: proposal flags this as "the risky one" — URL moves. Revert
restores `/` as the sole route. Since only `/` exists in the wild before this
slice merges, reverting costs nothing (do this before any new URL is shared
externally).

---

## PR 3 — Landing narrative (split 3a/3b)

Satisfies: `landing-narrative` (all requirements), `trust-signals` (Academy
placement/no-link/no-scale, Retainer commitments), `service-catalog`
(Line-to-Pricing Anchor Mapping). Design decision: D10.

### PR 3a — Servicios, Proceso, Proyectos

- [ ] 3.1 Create `components/sections/services.tsx` (Server): 4
      `SERVICE_LINES` cards, each linking to its pricing anchor (temporary
      same-page anchor until PR 4 ships `/precios`) and its available proof
      project. — *landing-narrative: Servicios Section Contract; service-
      catalog: Line-to-Pricing Anchor Mapping*
- [ ] 3.2 Create `lib/content/process.ts` (data) + `components/sections/
      process.tsx` (Server): discovery→proposal→build→handover sequence,
      response-time value read from the data module, not hardcoded. —
      *landing-narrative: Proceso Section Contract*
- [ ] 3.3 Create `components/portfolio/project-card.tsx`,
      `components/portfolio/evidence.tsx` (switches on the 4 evidence
      states), `components/portfolio/service-badge.tsx` (Server). — *design
      D10; project-portfolio: Evidence State Rendering*
- [ ] 3.4 Create `components/sections/portfolio.tsx` (Server): renders
      `toPortfolioCards(locale)`. Internal links via `caseStudyPath()` now
      resolve, because PR 5 shipped before this PR. **Critical constraint:**
      PR 5 publishes only two case studies (Luang, Blu Café) while this grid
      shows 6-8 projects, so a card MUST render a link ONLY when its project
      has a published case study. Every other card renders as a non-link.
      Deriving link-vs-non-link from published state — not from the project
      list — is what keeps this correct as follow-up write-ups land. —
      *landing-narrative: Proyectos Section Contract; project-portfolio:
      Portfolio Grid Consistency With Hero; success criterion: zero dead
      internal links*
- [ ] 3.10 Confirm no card in this section links to an unpublished slug.
      (Absorbed from old task 5.7, which checked this from the wrong side of
      the chain.) — *design D7*

### PR 3b — Autoridad, Retainer, Precios summary

- [ ] 3.5 Create `components/sections/authority.tsx` (Server): renders
      `ACADEMY` from `lib/content/authority.ts` in `no-link` state — brand
      mark/local screenshot only, no CTA/link. — *design §8.1; trust-
      signals: Academy Block Placement, No-Link State, No-Scale-Claim*
- [ ] 3.6 Create `components/sections/retainer.tsx` (Server): renders
      `RETAINER_COMMITMENTS` structured fields — no testimonial. — *design
      §8.2; trust-signals: Retainer Published Commitments, Itemized
      Maintenance Scope, No Testimonial Without Consent*
- [ ] ~~3.7~~ **Moved to PR 4 as task 4.0** — `components/pricing/price.tsx`
      and `price-pending.tsx`. PR 4 is their first consumer, so leaving them
      here would make PR 4 depend on a later PR. See "Delivery order
      correction".
- [ ] 3.8 Create `components/sections/pricing-summary.tsx` (Server): subset
      of the full tier anatomy + link to `/[locale]/precios`, which resolves
      because PR 4 shipped before this PR. Reuses `Price`/`PricePending`
      from task 4.0. — *landing-narrative: Precios Summary Section Contract*
- [ ] 3.9 `app/[locale]/page.tsx`: compose sections 2-7 in the fixed order
      between the hero (section 1, PR 2) and the brief/footer placeholders
      (sections 8-9, PR 6). — *landing-narrative: Fixed Section Order*

### Human tasks

- [ ] 3.H1 **[HUMAN, blocks reaching 6-8 visual density]** Deliver screenshot
      captures for the outstanding entries: run `fast-route`,
      `electrocode-academy`, `blu-biolink`, `wedding-invitation-piero`
      locally; obtain an authorized sanitized capture of `blu`.
- [ ] 3.H2 **[HUMAN]** Confirm consent for `wedding-invitation-piero`
      (couple), `blu-biolink` (proprietary per README), and `blu` (sanitized
      capture) before their entries leave `withheld`/anonymized state.
- [x] 3.H3 **[HUMAN]** Carry forward 1.H2 if `atemporalarq.com` liveness is
      still unconfirmed. **Resolved via 1.H2** — see its note above.

### Verification

- [ ] 3.V1 `npm run build` passes **with `assertContentInvariants()` running
      in production mode** — no warn-mode escape hatch. Under the corrected
      order every internal link this PR renders has an existing target, so the
      assertion passes on its own terms instead of being tolerated. Merging to
      `main` is a production build; a plan that needs the assertion downgraded
      in order to pass is a plan that ships broken links.
- [ ] 3.V2 `npm run lint` passes.
- [ ] 3.V3 **Human**: verify section order top-to-bottom matches Hero →
      Servicios → Proceso → Proyectos → Autoridad → Precios → Retainer.
- [ ] 3.V4 **Human**: verify the Academy block has no clickable link/CTA and
      no scale claims.
- [ ] 3.V5 **Human**: verify the retainer section shows structured values,
      not prose promises, and no testimonial.
- [ ] 3.V6 **Human**: verify every portfolio grid card's evidence state
      renders honestly (no broken image frame for `no-visual` entries).
- [ ] 3.V7 **Human**: verify that portfolio cards for projects without a
      published case study render as non-links, with no hover or cursor
      affordance suggesting they are clickable. (Replaces the deleted "accept
      interim 404s" check — that condition no longer exists.)

**Rollback**: additive sections; revert removes sections 2-7, landing
degrades to PR 2's hero-only state. Earlier slices keep working.

---

## PR 4 — Pricing page

Satisfies: `pricing` (all requirements). Design decision: D8 (layers 1-4
complete).

### Code tasks

- [ ] 4.1 `lib/content/pricing.ts`: populate Line A (3 tiers), Line C (1-2
      tiers) — each with all 7 required anatomy fields incl. a non-empty
      `notIncluded` tuple; Line B quote-on-request shape (typical shapes,
      pricing variables, process/turnaround, floor token); Line D retainer
      plan block (response-time, hours coverage, exclusions, cancellation
      terms). All still `status: 'pending'` until 4.H1 lands. — *pricing:
      Fixed Tier Anatomy, Line B Contract, Line D Contract*
- [ ] 4.0 Create `components/pricing/price.tsx`, `components/pricing/
      price-pending.tsx` (Server): exhaustive switch on `PriceEntry.status`;
      `pending` renders the loud dashed-outline "PRECIO PENDIENTE" state.
      **Moved here from task 3.7** — this PR is their first consumer. —
      *design D8*
- [ ] 4.2 Create `components/pricing/tier-card.tsx` (Server): renders one
      fixed tier's full anatomy including exclusions.
- [ ] 4.3 Create `components/pricing/quote-block.tsx` (Server): Line B's
      shapes/variables/process/floor.
- [ ] 4.4 Create `components/pricing/terms-table.tsx` (Server): always-
      included vs always-extra, payment schedule, `[CURRENCY]`-token-backed
      currency.
- [ ] 4.5 Create `components/pricing/faq.tsx` (Server, native
      `<details>/<summary>`): the 4 mandatory objections (price, later
      changes, code ownership, how to leave). **Rejected: Radix/shadcn
      accordion** per design D10 — costs a client boundary + dependency.
- [ ] 4.6 Create `app/[locale]/precios/page.tsx`: compose blocks 1-8 in the
      spec's exact order; `export const dynamic = 'force-static'`. —
      *pricing: Page Block Order*
- [ ] 4.7 Wire the pricing CTA's pre-tagging: append `?line=<ServiceLine>` on
      the anchor into `#brief` (form itself lands PR 6). — *design §9 CTA
      pre-tagging; lead-capture: Service Line Pre-Tagging*
- [ ] 4.8 Update PR 3's `services.tsx`/`pricing-summary.tsx` anchor links to
      the real `/[locale]/precios#<line>` block anchors now that the route
      exists (resolves 3.V7).
- [ ] 4.9 `eslint.config.mjs`: add `no-restricted-syntax` banning literal
      `[PRICE:` / `[CURRENCY]` strings under `app/**`, `components/**`,
      `lib/dictionaries/**`. — *design D8 layer 4; pricing: Placeholder
      Discipline*
- [ ] 4.10 `lib/content/invariants.ts`: activate the pending-price/currency-
      in-production check now that pricing data exists (stubbed in PR 2b).

### Human tasks (blocking this page's launch only)

- [ ] 4.H1 **[HUMAN, blocks going live]** Actual price figures for Lines A,
      C, D tiers and the Line B floor, plus the currency decision
      (PEN/USD).
- [ ] 4.H2 **[HUMAN]** Final retainer commitment figures if not already
      supplied in PR 3 (response window, monthly hours, cancellation terms).

### Verification

- [ ] 4.V1 `npm run build` passes with `PRICES` still `pending` — confirms
      the build does NOT fail in non-production mode, only warns.
- [ ] 4.V2 `npm run lint` passes; spot-check the new rule by temporarily
      typing a `[PRICE:` literal, confirming lint fails, then removing it.
- [ ] 4.V3 **Human**: verify `PricePending`'s dashed-outline/loud state is
      unmistakable in dev for every unresolved token.
- [ ] 4.V4 **Human**: verify block order matches the 8-block spec sequence.
- [ ] 4.V5 **Human**: verify the FAQ answers all 4 mandated objections.
- [ ] 4.V6 **Separate production gate**: once 4.H1 figures land, re-run
      `npm run build` with `VERCEL_ENV=production` (or equivalent) and
      confirm `assertContentInvariants()` throws if any token is still
      `pending`. Do not deploy this page to production before that check is
      clean.

**Rollback**: additive route; revert removes `/precios`, earlier slices keep
working.

---

## PR 5 — Case studies (first 2, then follow-ups)

Satisfies: `case-study` (all requirements). Internally divisible per
proposal §9/§16 Q5: ship Luang + Blu Café first (both `evidence: live`, both
VERIFIED reachable), add the rest as captures/consent land.

### Code tasks

- [ ] 5.1 Create `components/case-study/case-study-layout.tsx`,
      `components/case-study/disclosure-note.tsx` (Server). — *design D10;
      case-study: Mandatory Template Elements*
- [ ] 5.2 Create `app/[locale]/proyectos/[slug]/page.tsx`:
      `generateStaticParams({params})` from `publishableProjects()` (plain
      object — parent's already-resolved params, per design's `params`
      asymmetry note); `generateMetadata` builds canonical/alternates. —
      *design §3 asymmetry; case-study: Case Study Route*
- [ ] 5.3 Write `lib/content/projects/approach/luang.ts` and `.../blucafe.ts`
      full prose (problem, role, approach/process, stack, outcome) replacing
      PR 2b's stubs. — *case-study: Mandatory Template Elements, Persuasive
      Without Images, No Invented Metric*
- [ ] 5.4 `lib/content/projects/index.ts`: finalize `featured: true`
      metadata for Luang + Blu Café; keep the remaining curated slots
      (`blu`, `fast-route`, academy-adjacent, `blu-biolink`, `wedding-
      invitation-piero`, `atemporal`) in whatever evidence/consent state is
      currently true — do not fabricate readiness.
- [ ] 5.5 **Follow-up PRs, one per project, as captures/consent land**: add
      the `approach/<slug>.ts` write-up + flip that entry's evidence/consent
      state, up to the 6-8 target. Each is its own small commit/PR, not a
      blocking batch.
- [ ] 5.6 `app/sitemap.ts`: confirm it now emits real
      `/[locale]/proyectos/<slug>` entries via `publishableProjects()`
      (mechanism built in PR 2c, now has real data).
- [ ] ~~5.7~~ **Moved to PR 3a as task 3.10.** Under the corrected order PR 3a
      ships after this PR, so the check belongs where the links are created.

### Human tasks

- [ ] 5.H1 **[HUMAN]** Approve the Luang and Blu Café write-up copy for
      factual accuracy (stack list, outcome claims) before publishing — no
      fabricated metrics.
- [ ] 5.H2 **[HUMAN, ongoing]** Supply consent + captures for the remaining
      4-5 entries (carried from 3.H1/3.H2) to unlock their write-ups.

### Verification

- [ ] 5.V1 `npm run build` passes; confirms `generateStaticParams` for
      `[slug]` only enumerates `publishableProjects()` — unknown slugs are
      absent from the static set.
- [ ] 5.V2 `npm run lint` passes.
- [ ] 5.V3 **Human**: request an unknown slug — confirm the branded 404
      renders, not a blank page.
- [ ] 5.V4 **Human**: read each published case study with images/CSS
      disabled — confirm problem, role, approach, outcome are each
      independently legible (the "Persuasive Without Images" acceptance
      test). No automated check exists for this.
- [ ] 5.V5 **Human**: confirm each case study's disclosure line (if
      gated/sanitized) is present and specific.
- [ ] 5.V6 **Human**: confirm the next-step block links to the correct
      service-line pricing anchor, not a generic pricing landing.

**Rollback**: additive routes; revert removes `/proyectos/*`. Individual
write-ups (5.5) can also be reverted one at a time without affecting others.

---

## PR 6 — Conversion (split 6a/6b)

Satisfies: `lead-capture` (all requirements). Design decision: D1.

### PR 6a — Brief server logic

- [x] 6.1 Create `lib/brief/schema.ts`: pure `validateBrief()` against
      `ServiceLine`/`BudgetBand` unions + length/regex checks; `BriefErrors`
      keyed by field. — *design §9; lead-capture: Submission Validation*
- [x] 6.2 Create `lib/brief/abuse.ts`: honeypot field check + HMAC-signed-
      timestamp dwell-time check (reject <~3s or >~2h). — *design §2 layer
      1*
- [x] 6.3 Create `lib/brief/notify.ts` (server-only): `sendBriefNotification
      (brief)` via `fetch` to the provider's REST endpoint using
      `RESEND_API_KEY`/`BRIEF_TO_EMAIL`/`BRIEF_FROM_EMAIL`; strips CR/LF
      from any field reaching an email header. — *design D1; §2 layer 4*
- [x] 6.4 Create `lib/brief/submit.ts` (`"use server"`): abuse → validate →
      notify → `redirect()` as the LAST statement outside any try/catch (the
      documented gotcha — a `redirect()` inside `try` gets swallowed by
      `catch`). On notify failure: return error state with preserved values
      + `stderr` log, no redirect. — *design D1; §9 submission flow*
      **Note (out-of-order delivery)**: implemented ahead of PR 3a/3b/4/5 in
      this list's stated order. PR 4 (pricing figures) and PR 5 (case-study
      narratives) are blocked on business content the user has not supplied;
      PR 6a is pure server-side engineering with no such dependency, adds no
      route/component/rendered link, and is unreachable by any visitor until
      PR 6b wires the form. See apply-progress.md for the full reasoning.

### PR 6b — Form UI, landing wiring, confirmation

- [ ] 6.5 Create `components/brief/field.tsx` (Server) and `components/
      brief/brief-form.tsx` (`"use client"` — the one new client component):
      `useActionState(submitBrief, initialState)`; reads `?line=` query
      param as `defaultValue`. — *design D10, §9; lead-capture: Service Line
      Pre-Tagging*
- [ ] 6.6 Create `components/sections/brief.tsx` (Server): wraps
      `BriefForm` + the WhatsApp link (already live since PR 1) into landing
      section 8. — *landing-narrative: Conversion Section Contract*
- [ ] 6.7 `app/[locale]/page.tsx`: replace the section-8 placeholder with
      the real `brief.tsx` section.
- [ ] 6.8 Create `app/[locale]/gracias/page.tsx`: static, no `searchParams`
      read, never echoes submitted input, `robots: {index:false,
      follow:false}`. — *design §9 `/es/gracias`; lead-capture: Confirmation
      Route*
- [ ] 6.9 `app/sitemap.ts`: confirm `/gracias` is excluded now that the
      route exists (mechanism from PR 2c).
- [ ] 6.9b **Remove the `as Route` cast** at `lib/brief/submit.ts`'s
      `redirect()` call. PR 6a needed it because `typedRoutes` correctly
      flagged that `/[locale]/gracias` did not exist; once task 6.8 creates
      the page, the cast must go so `typedRoutes` resumes checking that call
      site. There are exactly two waivers of the `typedRoutes` guarantee in
      this codebase — this one and the documented `product.link as Route` in
      `hero-parallax.tsx`, which is structural and permanent. This one is
      temporary, and a comment saying so is an intention, not a commitment;
      that is why it is a task. Verify by deleting the cast and confirming
      `npm run build` still passes. — *design D7*
- [ ] 6.10 Configure a Vercel Firewall rate-limit rule on the brief action's
      path (platform config, not source — apply via Vercel dashboard/CLI).
      Scope depends on 6.H3.

### Human tasks (blocking)

- [ ] 6.H1 **[HUMAN, blocks slice going live]** Complete the email
      provider's domain verification (DNS records) for `BRIEF_FROM_EMAIL`'s
      sending domain — every send fails until this is done (design risk 7).
- [ ] 6.H2 **[HUMAN]** Provision `RESEND_API_KEY`, `BRIEF_TO_EMAIL`,
      `BRIEF_FROM_EMAIL` as server-only environment variables (never
      `NEXT_PUBLIC_`).
- [ ] 6.H3 **[HUMAN]** Decide whether to enable Vercel BotID now or only if
      abuse appears (design §2 layer 2) — informs 6.10's scope.

### Verification

- [ ] 6.V1 `npm run build` passes.
- [ ] 6.V2 `npm run lint` passes.
- [ ] 6.V3 **Human**: submit the form with JavaScript disabled — confirm it
      still posts via `<form action={...}>` and redirects to `/es/gracias`
      on success. No automated check exists for this.
- [ ] 6.V4 **Human**: submit with a missing required field — confirm inline
      errors render (JS on) and no redirect happens.
- [ ] 6.V5 **Human**: trigger the honeypot/dwell-time path (fill the hidden
      field, or submit faster than ~3s) — confirm silent rejection, no
      confirmation page.
- [ ] 6.V6 **Human**: temporarily break `notify.ts` (bad API key) — confirm
      the form re-renders with preserved values, an error state, the
      WhatsApp fallback is visible, and the payload appears in server logs.
- [ ] 6.V7 **Human**: confirm `/es/gracias` is reachable directly without
      submitting, reads sensibly standalone, and never echoes query/form
      data.
- [ ] 6.V8 **Human**: confirm `/es/gracias` is excluded from `sitemap.xml`
      and carries `noindex`.

**Rollback**: do NOT revert this slice if delivery fails — disable the
brief-form section behind a flag; WhatsApp (live since PR 1) carries
conversion.

---

## Remediation slice — `fix/content-honesty` (post-`sdd-verify`)

Fixes CRITICAL findings C1/C2 and WARNING findings W1/W2 from
`sdd/dev-services-website/verify-report.md`, all confined to `lib/content/**`
and the hero component/page. Does not widen scope beyond those four
findings and the coupled hero-floor decision.

- [x] R1 (C1) Remove `blucafefinance.png` from `lib/content/projects/
      media.ts` and delete it from `public/projects/`. Flip `blu`'s
      `evidence` to `{ state: "no-visual", media: [] }`. Correct the false
      "login screen" `alt` text (removed along with the media entry).
- [x] R2 (C2) Flip `atemporal`'s `evidence` to `{ state: "not-deployed",
      media: [MEDIA.atemporal] }` — domain confirmed NXDOMAIN, not merely
      unverified. Remove `UNVERIFIED_LIVENESS` (exported, read by nothing).
      Document in `lib/content/invariants.ts` why external-link reachability
      is not a build-time gate (non-deterministic network call during
      `next build`).
- [x] R3 (floor) Lower `checkHeroFloor`'s threshold from 4 to 3 in
      `lib/content/invariants.ts`, documented as a temporary launch-quality
      signal to raise as captures/consent land — not a new permanent target.
- [x] R4 (W1) Correct `components/sections/hero-header.tsx`'s comment: it
      falsely claimed `checkNoSelfReferentialLinks` covers the CTA's
      `as Route` cast. State plainly that no build-time control covers it.
- [x] R5 (W2) Move the `#proyectos` anchor off the whole hero (which
      wrapped the CTA) onto `HeroParallax`'s products track via a new
      `productsId` prop, so the anchor target sits below the CTA in
      document order. Updated `app/[locale]/page.tsx`.

### Verification (remediation slice)

- [x] R.V1 `npm run build` passes with the floor at 3 and both entries
      corrected.
- [x] R.V2 `npm run lint` passes — same 2 pre-existing
      `hover-border-gradient.tsx` warnings, no new ones.
- [x] R.V3 Fault-injection re-proof: `VERCEL_ENV=production` still throws
      real exit code 1 when a `Localized<string>` value is blanked.
- [x] R.V4 `blucafefinance` (filename and any residual comment mention)
      appears nowhere in `.next/server/app/*.html` or `lib/`.
- [x] R.V5 Every internal/external link in the compiled `es.html`/
      `_not-found.html` output resolves to a verified target: `/es`,
      `/es#proyectos` (confirmed positioned after the CTA in document
      order), `https://luang.com.pe/`, `https://blucafe.vercel.app/`. No
      `atemporalarq.com` link remains anywhere in the built output.

## Cross-cutting notes

- **No task in this list applies a schema change to any remote database.**
  D1 decided email, no persistence. If lead persistence is ever revisited,
  it requires graduating `website-studio` to its own Supabase project first
  (design §2 migration plan — recorded, not authorized).
- **No test runner exists.** Every `npm run build` / `npm run lint` line
  above is the full extent of automated coverage. Every "Human" verification
  line above covers something those two commands cannot: visual layout,
  motion behavior, the no-JS form path, and content honesty. Do not treat a
  green build as proof those are correct.
- Settled product/design decisions (proposal's nine, design's D1-D12) are
  not reopened by this task list. Where a task's phrasing might look like a
  reopening, it is honoring a decision's stated escape hatch (e.g.
  `SITE_CONTENT_GATE=warn`), not revisiting it.
