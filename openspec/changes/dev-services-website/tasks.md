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
      structure). Closed negatively by `fix/content-honesty`
      (`atemporalarq.com` confirmed NXDOMAIN), then **re-opened and closed
      positively** by the `fix/restore-consented-content` remediation slice:
      the studio moved to `https://atemporalarq.vercel.app/`, verified HTTP
      200, `<title>Atemporal</title>`, no login wall, ~0.36s response. The
      old `atemporalarq.com` finding stands (still NXDOMAIN) — the site
      simply moved. `atemporal` is back to `evidence.state: "live"` pointing
      at the new URL.

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
- [ ] 2.27 **DEFERRED — no owner until a second locale ships.**
      `specs/site-shell/spec.md`'s "Footer Navigation" requirement calls for
      the footer to carry "navigation links, a contact/WhatsApp reference,
      **and locale indication**". `components/layout/site-footer.tsx` renders
      the first two today but nothing for the third (`sdd-verify` W6). This
      is deliberately not built now: `LOCALES = ['es']` is the only shipped
      locale, so any visible locale indication (a switcher, a language label)
      would imply a choice that does not exist — the requirement's own
      scenario ("Footer renders without a locale switcher assumption") is
      satisfied precisely by rendering nothing, not by rendering something
      unfinished. **Trigger**: the moment a second entry is added to
      `LOCALES` (`lib/content/locales.ts`), this task becomes active — add a
      minimal locale indicator (e.g. the current locale's label, or a
      switcher if more than one locale should be user-selectable) to
      `site-footer.tsx`, sourced from the dictionary like the rest of its
      copy. Until then this line keeps the requirement visibly owned rather
      than silently dropped.

### Human tasks

- [ ] 2.H1 **[HUMAN]** Confirm the two fragment redirects (`#proyectos`
      cases in D2) behave as expected once deployed; fall back to `/es`
      without the anchor if not (design risk 4).
- [ ] 2.H2 **[HUMAN]** Supply `NEXT_PUBLIC_SITE_URL` for the target
      deployment.

### Verification

- [x] 2.V1 `npm run build` passes — confirms `generateStaticParams`,
      `dynamicParams = false`, `typedRoutes`, and `assertContentInvariants()`
      all compile and run without throwing (non-production: warns only).
      **Reconciled by `sdd-verify`/this cleanup slice (W11)**: `apply-
      progress.md` already recorded this as done and passing (PR 2c's build
      result, commit `ac6b72f`), and `sdd-verify` independently re-ran and
      confirmed a clean exit 0 from a clean `.next`. This checkbox was left
      unchecked in error; corrected here, not newly performed.
- [x] 2.V2 `npm run lint` passes. **Reconciled by `sdd-verify`/this cleanup
      slice (W11)**: same as 2.V1 — `apply-progress.md` recorded this
      passing with only the 2 pre-existing `hover-border-gradient.tsx`
      warnings, `sdd-verify` re-ran and confirmed it, and the checkbox here
      was simply never ticked. Corrected here.
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

> **Partial-PR note (this apply batch):** implemented tasks 3.1, 3.3, 3.4,
> 3.9, 3.10 in a prior batch, and task 3.2 (Proceso) in this batch, on
> `feat/landing-servicios-proyectos` (based on `fix/restore-consented-content`).
> PR 3b, PR 4, PR 5, PR 6b were NOT implemented in this batch, so
> `/[locale]/precios` and `/[locale]/proyectos/[slug]` do not exist yet in
> this repo state (unlike the "Delivery order correction" section's assumed
> ordering). Every task below was implemented against that actual reality,
> not the originally-planned order — see apply-progress.md for the full
> reasoning and the resulting deviations from each task's literal text.
> With task 3.2 done, all code tasks of PR 3a are complete; PR 3b (3.5, 3.6,
> pricing-summary, retainer) remains out of scope for this batch.

- [x] 3.1 Create `components/sections/services.tsx` (Server): 4
      `SERVICE_LINES` cards, each linking to its pricing anchor (temporary
      same-page anchor until PR 4 ships `/precios`) and its available proof
      project. — *landing-narrative: Servicios Section Contract; service-
      catalog: Line-to-Pricing Anchor Mapping*
      **Deviation**: renders exactly ONE CTA per card ("Ver proyectos" →
      `#proyectos`), not two. `/es/precios` and any `#precios` anchor are
      both dead targets in this repo state (PR 4/PR 3b not implemented in
      this batch) and are hard-banned by this batch's own instructions.
      Linking to either would repeat the exact "ship the reference before
      the referent" defect this change set exists to stop. Task 4.8 already
      names this file as what it updates once the real pricing anchor
      exists — see apply-progress.md.
- [x] 3.2 Create `lib/content/process.ts` (data) + `components/sections/
      process.tsx` (Server): discovery→proposal→build→handover sequence,
      response-time value read from the data module, not hardcoded. —
      *landing-narrative: Proceso Section Contract*
      **Now unblocked and implemented**: the user supplied the studio's real
      five-phase engagement process (Descubrimiento → Propuesta y alcance →
      Diseño → Desarrollo → Entrega), the fact that the first three phases
      each require the client's explicit approval to proceed, and that 2
      revision rounds are included before additional rounds are quoted.
      `lib/content/process.ts`'s `PROCESS` constant models this: a 5-tuple of
      `ProcessPhase` (locale-keyed `name`/`description`, explicit
      `requiresApproval: boolean` per phase — the differentiator, not
      decoration) plus `revisionRoundsIncluded: 2`.
      **Deviation, documented**: the spec's literal wording calls for a
      "response-time commitment" read from data. No client-facing
      mid-project response-time figure exists — the user was asked and has
      not supplied one, and the tiered retainer response window
      (`RETAINER_COMMITMENTS.responseWindow`, PR 3b) is a different
      commitment for a different phase of the relationship (post-launch
      maintenance, not mid-project approval turns) and does not belong here.
      This task satisfies the requirement's actual mechanism — a claim that
      changes without a component edit when its underlying data changes —
      using `revisionRoundsIncluded`, the one quantifiable process
      commitment actually settled this batch. No response-time figure, day
      count, or deadline was invented anywhere. See `lib/content/process.ts`
      and `components/sections/process.tsx` doc comments for the full
      reasoning.
      **Open item carried forward, not closed by this task**: the studio's
      client-side approval response deadline (how quickly the studio commits
      to turning around a client's review of a deliverable) remains
      unsupplied. Adding it later is one new optional field on
      `ProcessContent`, not a restructuring — every consumer already reads
      through the single exported `PROCESS` constant.
      **Addendum, closed in the PR 3b batch**: the user supplied a *different*
      but related fact — not how fast the studio responds, but how long the
      client may sit on a gated phase: 5 business days to approve, after
      which the project pauses and the delivery date is recalculated, stated
      up front. `ProcessContent.clientApprovalDeadlineBusinessDays: number`
      (set to `5`) and `components/sections/process.tsx`'s rendered sentence
      close this. The client-side approval RESPONSE-TIME question above
      remains open and distinct; only the client-side approval DEADLINE
      question is resolved.
- [x] 3.3 Create `components/portfolio/project-card.tsx`,
      `components/portfolio/evidence.tsx` (switches on the 4 evidence
      states), `components/portfolio/service-badge.tsx` (Server). — *design
      D10; project-portfolio: Evidence State Rendering*
- [x] 3.4 Create `components/sections/portfolio.tsx` (Server): renders
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
      **Deviation**: PR 5 did NOT ship before this PR in this batch (partial
      PR 3a only, per explicit instructions) — `/[locale]/proyectos/[slug]`
      does not exist at all. Added `Project.caseStudyPublished: boolean`
      (defaulted `false` everywhere) so link-vs-non-link is still derived
      from published state, exactly as the task requires — it is simply
      `false` for every project today instead of `true` for Luang/Blu Café.
      `live`-evidence cards keep their independently-verified external link
      regardless of this flag. Internal case-study links use a plain `<a>`,
      never `next/link`, because `typedRoutes` cannot verify a route that
      does not exist yet and a third `as Route` waiver was explicitly
      disallowed this batch — see apply-progress.md.
- [x] 3.9 `app/[locale]/page.tsx`: compose sections 2-7 in the fixed order
      between the hero (section 1, PR 2) and the brief/footer placeholders
      (sections 8-9, PR 6). — *landing-narrative: Fixed Section Order*
      **Partial**: composes sections 1 (Hero), 2 (Servicios), 3 (Proceso, task
      3.2, this batch), and 4 (Proyectos) — sections 5, 6, 7 are PR 3b/PR 4
      scope and not yet built. Relative order among rendered sections is
      correct (Hero < Servicios < Proceso < Proyectos); gaps are filled by
      later slices, not reordered around.
- [x] 3.10 Confirm no card in this section links to an unpublished slug.
      (Absorbed from old task 5.7, which checked this from the wrong side of
      the chain.) — *design D7*
      Implemented as an automated build-time check, not just a manual
      confirmation: `lib/content/invariants.ts`'s
      `checkPortfolioLinksOnlyToPublishedCaseStudies` fails the production
      build if any portfolio card's internal link does not match
      `caseStudyPath(locale, slug)` for a project with `caseStudyPublished:
      true`. Verified by fault injection — see apply-progress.md.

### PR 3b — Autoridad, Retainer, Precios summary

> **Partial-PR note (this apply batch):** implemented tasks 3.5 (Autoridad)
> and 3.6 (Retainer) on `feat/landing-autoridad-retainer` (based on
> `feat/landing-servicios-proyectos`), plus the Proceso 5-business-day
> approval-deadline addition recorded under task 3.2 above. Tasks 3.7 (moved
> to PR 4 as 4.0) and 3.8 (Precios summary) remain explicitly OUT of scope
> for this batch — no price figure or currency has been supplied for any of
> the 8 tokens in `lib/content/pricing.ts`; every entry is honestly
> `pending`. Building a pricing summary or the `Price`/`PricePending`
> components without real figures would either invent a number or render an
> empty shell — both rejected. See apply-progress.md for the full reasoning.
>
> **Addendum (PR 4 batch, `feat/pricing-page`):** the user supplied real
> figures for all 8 tokens, unblocking both 3.7 (closed via task 4.0) and
> 3.8 (implemented). The landing now composes all 7 sections through
> Retainer — see 3.9's note below.

- [x] 3.5 Create `components/sections/authority.tsx` (Server): renders
      `ACADEMY` from `lib/content/authority.ts` in `no-link` state — brand
      mark/local screenshot only, no CTA/link. — *design §8.1; trust-
      signals: Academy Block Placement, No-Link State, No-Scale-Claim*
      Implemented as specified: `ACADEMY.media` is empty (no capture exists
      yet, blocked on 3.H1), so the image slot renders nothing rather than a
      broken frame; the link is rendered via an exhaustive switch on
      `ACADEMY.state` whose `no-link` branch returns `null` (structurally,
      not conditionally, absent) — same discipline as
      `components/portfolio/evidence.tsx`. No student/course/review count
      anywhere; `Authority`'s `no-link` variant has no field to hold one.
      `lib/content/invariants.ts`'s new `checkAuthorityNoLinkWhileUndeployed`
      fails the build if `ACADEMY.state` ever flips to `"linked"` without a
      matching update to the verification flag. Verified by fault injection
      (blanking a different retainer field — see task 3.6's note; both new
      checks share the same test run) — see apply-progress.md.
- [x] 3.6 Create `components/sections/retainer.tsx` (Server): renders
      `RETAINER_COMMITMENTS` structured fields — no testimonial. — *design
      §8.2; trust-signals: Retainer Published Commitments, Itemized
      Maintenance Scope, No Testimonial Without Consent*
      Implemented with the content the user supplied this batch: a two-tier
      response window (site down → same business day; everything else → 2
      business days), a task-type scope model (explicitly no monthly hour
      allowance — see `lib/content/retainer.ts`'s deviation note replacing
      the stub `monthlyHours` field with `scopeModel`), 4 inclusions, 4
      exclusions, and 30-days-notice/no-penalty cancellation. `channels`
      stays `pending` — not supplied this batch. No monthly price or hour
      figure appears anywhere (confirmed in compiled markup — see
      apply-progress.md).
      **Two undefined boundaries, modeled rather than invented or silently
      dropped**: `bugVsFeatureBoundary` (bug fix vs. new functionality) and
      `contentChangeScope` (a size bound on "changes to existing content").
      Both are `Commitment<Localized<string>>` fields set to the honest
      current answer — resolved case-by-case in conversation, no fixed rule
      yet — so a future fixed rule replaces the same field's value later
      without restructuring the type or the component.
      `lib/content/invariants.ts`'s new `checkRetainerCommitmentsNotBlank`
      fails the build if any commitment marked `"set"` is blank. Verified by
      fault injection: blanked `cancellationTerms`'s value, ran
      `VERCEL_ENV=production npm run build` → real exit code 1
      (`RETAINER_COMMITMENTS.cancellationTerms is "set" but blank.`),
      restored the exact original string, rebuilt clean (exit 0).
- [x] ~~3.7~~ **Closed via PR 4's task 4.0** —
      `components/pricing/price.tsx` and `price-pending.tsx` shipped as part
      of the PR 4 batch (commit `ac814a3`), now that price figures exist
      (task 4.H1 closed). See "Delivery order correction".
- [x] 3.8 Created `components/sections/pricing-summary.tsx` (Server): landing
      section 6, between Autoridad and Retainer. Renders one headline figure
      per service line via `<Price>` plus a link to `/[locale]/precios` for
      the full tier anatomy — a subset, not a duplicate, per this
      requirement. **Unblocked and implemented this batch** (commit
      `1738ce6`), now that both task 4.0 (`Price`/`PricePending`) and task
      4.H1 (real figures) exist. — *landing-narrative: Precios Summary
      Section Contract*
- [x] 3.9 `app/[locale]/page.tsx`: compose sections 2-7 in the fixed order
      between the hero (section 1, PR 2) and the brief/footer placeholders
      (sections 8-9, PR 6). — *landing-narrative: Fixed Section Order*
      **Closed (PR 4 batch)**: now composes all 7 sections through Retainer —
      1 (Hero), 2 (Servicios), 3 (Proceso), 4 (Proyectos), 5 (Autoridad), 6
      (Precios summary, task 3.8, this batch), 7 (Retainer). Verified section
      order by compiled-HTML string offset on a fresh build: servicios(8125)
      < proceso(10637) < proyectos(13419) < autoridad(23655) <
      precios(24548) < retainer(26064) — matches
      `specs/landing-narrative/spec.md`'s "Fixed Section Order" exactly for
      every section built so far. Only sections 8-9 (dedicated brief-form
      section, PR 6b) remain outside this page's composition.

### Human tasks

- [ ] 3.H1 **[HUMAN, blocks reaching 6-8 visual density]** Deliver screenshot
      captures for the outstanding entries: run `fast-route`,
      `electrocode-academy`, `blu-biolink`, `wedding-invitation-piero`
      locally; obtain an authorized sanitized capture of `blu`.
- [ ] 3.H2 **[HUMAN]** Confirm consent for `wedding-invitation-piero`
      (couple), `blu-biolink` (proprietary per README), and `blu` (sanitized
      capture) before their entries leave `withheld`/anonymized state.
      **`blu` closed, granted**, by the `fix/restore-consented-content`
      remediation slice: the client authorized use of the back-office
      dashboard capture (user-stated consent, dated that session — not a
      signed agreement). `blu` flips to `consent: granted, namedClient:
      true` (client named as "Blu Café") and `evidence: gated` with the
      restored `blucafefinance.png` capture plus a login-note/permission
      disclosure. `wedding-invitation-piero` and `blu-biolink` remain open.
- [x] 3.H3 **[HUMAN]** Carry forward 1.H2 if `atemporalarq.com` liveness is
      still unconfirmed. **Resolved via 1.H2** — see its note above.

### Verification

- [x] 3.V1 `npm run build` passes **with `assertContentInvariants()` running
      in production mode** — no warn-mode escape hatch. Under the corrected
      order every internal link this PR renders has an existing target, so the
      assertion passes on its own terms instead of being tolerated. Merging to
      `main` is a production build; a plan that needs the assertion downgraded
      in order to pass is a plan that ships broken links.
      Verified `VERCEL_ENV=production npm run build` exit 0 with the sections
      built in this batch (Servicios, Proyectos), plus two fault-injection
      re-proofs (hero floor, and this batch's new
      `checkPortfolioLinksOnlyToPublishedCaseStudies`) both producing real
      exit code 1, then a clean rebuild — see apply-progress.md.
- [x] 3.V2 `npm run lint` passes — same 2 pre-existing
      `hover-border-gradient.tsx` warnings, no new ones.
- [x] 3.V3 **Human** (performed by the apply agent via compiled HTML, not a
      browser): verify section order top-to-bottom matches Hero → Servicios
      → Proceso → Proyectos → Autoridad → Precios → Retainer.
      **Updated again in the PR 4 batch**: the Precios gap is closed (task
      3.8). Confirmed in a fresh `.next/server/app/es.html` that
      servicios(8125) < proceso(10637) < proyectos(13419) < autoridad(23655)
      < precios(24548) < retainer(26064) by string offset — Hero < Servicios
      < Proceso < Proyectos < Autoridad < Precios < Retainer holds in full
      for every section built so far.
- [x] 3.V4 **Human** (performed by the apply agent via compiled HTML, not a
      browser): verify the Academy block has no clickable link/CTA and no
      scale claims. **Implemented this batch**: extracted the compiled
      `id="autoridad"` section — contains zero `href`/`<a` elements and zero
      numeric scale claims (no student/course/review count anywhere). Text
      content is exactly `ACADEMY.name` + `ACADEMY.description.es` + the
      dictionary's framing sentence — no CTA markup rendered at all, because
      `renderLink()`'s `no-link` branch returns `null`.
- [x] 3.V5 **Human** (performed by the apply agent via compiled HTML, not a
      browser): verify the retainer section shows structured values, not
      prose promises, and no testimonial. **Implemented this batch**:
      extracted the compiled `id="retainer"` section — both response tiers
      (`Sitio caído` → `Mismo día hábil`; `Cualquier otro caso` → `2 días
      hábiles`), all 4 inclusions, all 4 exclusions, and the cancellation
      line all render as discrete `<dt>/<dd>`/`<li>` structured elements, not
      a paragraph of prose. No monthly price or hour figure appears anywhere
      in the section (grepped the extracted markup). No testimonial markup
      exists in the component at all — nothing to hide or comment out.
- [x] 3.V6 **Human** (performed by the apply agent via compiled HTML, not a
      browser): verify every portfolio grid card's evidence state renders
      honestly (no broken image frame for `no-visual` entries). Confirmed in
      `.next/server/app/es.html`: `no-visual` cards (`fast-route`,
      `blu-biolink`) render service badge + title + summary with zero
      `<img>` elements and no empty frame; `gated` (`blu`) renders its
      screenshot plus both the generic login note and its own disclosure
      line; `live` cards (Luang, Atemporal, Blu Café) render their
      screenshot inside an external link.
- [x] 3.V7 **Human** (performed by the apply agent via compiled HTML, not a
      browser): verify that portfolio cards for projects without a
      published case study render as non-links, with no hover or cursor
      affordance suggesting they are clickable. (Replaces the deleted "accept
      interim 404s" check — that condition no longer exists.)
      Confirmed: `blu`, `fast-route`, and `blu-biolink` all compile to a
      plain `<div class="... cursor-default">` — no `<a>`, no hover-border
      class. Zero occurrences of `/es/precios` or `/es/proyectos/` anywhere
      in the compiled output.

**Rollback**: additive sections; revert removes sections 2-7, landing
degrades to PR 2's hero-only state. Earlier slices keep working.

---

## PR 4 — Pricing page

Satisfies: `pricing` (all requirements). Design decision: D8 (layers 1-4
complete).

> **Batch note (sdd-apply)**: implemented on branch `feat/pricing-page`
> (based on `chore/cleanup-verify-warnings`), across three work-unit commits:
> `753fef4` (pricing data), `ac814a3` (pricing page/components/gate/eslint
> rule), `1738ce6` (landing wiring — this batch also closed 3.7/3.8). Real
> figures for all 8 tokens were supplied by the user this batch (task 4.H1
> closed). See apply-progress.md for full verification detail and open
> items.

### Code tasks

- [x] 4.1 `lib/content/pricing.ts`: populated Line A (3 tiers), Line C (2
      tiers), Line B quote-on-request shape, Line D's two named/priced
      plans, and cross-cutting terms. **Documented deviation**: `turnaround`
      and per-tier `notIncluded` are `Commitment<T>` (promoted from
      `lib/content/retainer.ts` to `lib/content/types.ts`), not the design's
      literal required-non-empty-tuple shape — neither was supplied this
      batch, so both render an honest "pending" state instead of a
      fabricated one. `revisionRounds` is read from
      `PROCESS.revisionRoundsIncluded` (2, already settled), not duplicated
      per tier. — *pricing: Fixed Tier Anatomy, Line B Contract, Line D
      Contract*
- [x] 4.0 Created `components/pricing/price.tsx`, `components/pricing/
      price-pending.tsx` (Server): exhaustive switch on `PriceEntry.status`;
      `pending` renders the loud dashed-outline "Precio pendiente" state.
      Verified rendering directly in compiled markup (see apply-progress.md).
      — *design D8*
- [x] 4.2 Created `components/pricing/tier-card.tsx` (Server): renders one
      fixed tier's full anatomy; the exclusions/turnaround slots render their
      `Commitment` state (set value, or an honest "pendiente" note).
- [x] 4.3 Created `components/pricing/quote-block.tsx` (Server): Line B's
      shapes/variables/process/floor.
- [x] 4.4 Created `components/pricing/terms-table.tsx` (Server): always-
      included vs always-extra (both restate `PROCESS.revisionRoundsIncluded`,
      not an invented list), payment schedule (`Commitment`, honestly
      pending). Currency is never hardcoded — every figure renders through
      `<Price>`/`formatMoney()`, which read `DISPLAY_CURRENCY`.
- [x] 4.5 Created `components/pricing/faq.tsx` (Server, native
      `<details>/<summary>`). 3 of the 4 mandatory objections are answered
      from real, settled facts; the 4th (code ownership) was not supplied
      this batch and renders an honest "pendiente" answer rather than an
      invented policy — see 4.V5 and apply-progress.md's open items.
      **Rejected: Radix/shadcn accordion** per design D10.
- [x] 4.6 Created `app/[locale]/precios/page.tsx`: composes all 8 blocks in
      the spec's exact order (verified by compiled-HTML string offset — see
      apply-progress.md); `export const dynamic = "force-static"`. —
      *pricing: Page Block Order*
- [x] 4.7 **Documented deviation, not the literal mechanism**: `#brief` and
      the brief form do not exist yet (PR 6b), and this batch's hard
      constraints forbid a CTA pointing at a target that does not exist when
      the commit lands. The CTA points at the already-live WhatsApp channel
      instead. The real `?line=<ServiceLine>` pre-tag into `#brief` is an
      open follow-up for PR 6b, tracked in apply-progress.md, not closed
      here. — *design §9 CTA pre-tagging; lead-capture: Service Line
      Pre-Tagging*
- [x] 4.8 Updated `services.tsx` (there is no separate
      `pricing-summary.tsx` anchor to update — that component was created in
      this same batch already linking to `pricingPath()`): each Servicios
      card now renders both `pricingCta` (`pricingLineAnchor()`, deep-linking
      to `/[locale]/precios#linea-<line>`) and the existing `proofCta`.
      Resolves 3.V7's successor concern.
- [x] 4.9 `eslint.config.mjs`: added `no-restricted-syntax` banning literal
      `[PRICE:` / `[CURRENCY]` strings (including template-literal segments)
      under `app/**`, `components/**`, `lib/dictionaries/**`. Spot-checked:
      an injected `[PRICE:test]` literal fails lint with the rule's message;
      removed, lint is clean again. — *design D8 layer 4; pricing:
      Placeholder Discipline*
- [x] 4.10 `lib/content/invariants.ts`: `PRICE_INTEGRITY_CHECK_ACTIVE`
      flipped to `true` now that every `PriceToken` is `"set"`.
      Fault-injection verified (see apply-progress.md): setting one token
      back to `pending` and running `VERCEL_ENV=production npm run build`
      produces real exit code 1 with the expected message; restoring it
      rebuilds clean (exit 0). `checkInternalLinksResolve`'s `LIVE_TARGETS`
      also extended with `/{locale}/precios` in this same commit
      (`ac814a3`), alongside the route creation, per hard constraint 2.

### Human tasks (blocking this page's launch only)

- [x] 4.H1 **[HUMAN]** Closed this batch — the user supplied all 8 figures
      (PEN, published as launch pricing for the first 5 projects) and the
      currency decision (PEN).
- [ ] 4.H2 **[HUMAN]** Mostly closed in PR 3b (response window, scope model,
      inclusions/exclusions, cancellation terms). **Still open**:
      `RETAINER_COMMITMENTS.channels` remains `pending` — not supplied in
      this batch either.

### Verification

- [x] 4.V1 **Superseded by the batch's actual sequencing, not literally
      performed as written**: tasks 4.1-4.10 landed together in this batch
      rather than 4.1-4.9 first (with `PRICES` still `pending`) followed by
      a separate 4.10. The equivalent, stronger evidence this check exists
      for is captured by 4.V6's fault injection instead (proves the gate
      fires when a token IS pending, and stays clean when every token is
      set) — see apply-progress.md.
- [x] 4.V2 `npm run lint` passes; spot-checked the new rule by temporarily
      typing a `[PRICE:test]` literal in `components/pricing/price.tsx`,
      confirmed lint failed with the rule's message, removed it, confirmed
      lint clean again (same 2 pre-existing `hover-border-gradient.tsx`
      warnings, no new ones).
- [x] 4.V3 Verified via compiled markup (no browser available to the apply
      agent, same discipline as prior PR 3 verification entries): temporarily
      set `app-from` back to `pending`, ran a non-production `npm run build`
      (warn mode), confirmed `.next/server/app/es/precios.html` renders the
      dashed-border, uppercase "Precio pendiente" state with the token name
      `[app-from]` — not bare text, not a gray box. Restored, rebuilt clean.
- [x] 4.V4 Verified via compiled-HTML string offset on a fresh build:
      intro(2786) < linea-a(3287) < linea-c(6673) < linea-b(8948) <
      linea-d(10561) < "Condiciones generales"(12702) < "Preguntas
      frecuentes"(13586) < CTA heading(15354) — matches the 8-block order
      exactly.
- [~] 4.V5 **Partial, not fully satisfied**: 3 of 4 mandated objections
      (price reasoning, later changes, how to leave) are answered from real,
      settled facts. The 4th (code ownership) has not been supplied by the
      studio and renders an honest "pendiente" note rather than an invented
      policy — this is a genuine, tracked gap against the literal
      requirement, not a silent pass. See apply-progress.md's open items.
- [x] 4.V6 **Separate production gate**: verified. `VERCEL_ENV=production
      NEXT_PUBLIC_SITE_URL=https://example.test npm run build` passes clean
      with all 8 figures `set`. Fault injection (one token forced back to
      `pending`) produces real exit code 1 with
      `Content integrity check failed: - Price token "app-from" is still
      "pending" in a production build.`; restoring it rebuilds clean.

**Rollback**: additive route; revert removes `/precios`, earlier slices keep
working.

---

## PR 5 — Case studies (first 2, then follow-ups)

Satisfies: `case-study` (all requirements). Internally divisible per
proposal §9/§16 Q5.

> **Batch note (sdd-apply, `feat/case-studies`, based on `feat/pricing-page`)**:
> the original plan named Luang + Blu Café (the public biolink site) as the
> first two case studies. This batch's actual instructions named `luang` and
> `blu` (the internal management system) instead — richer, user-supplied
> narratives exist for those two ("no tenía una web... la hicimos desde cero"
> for Luang; "antes registraban todo en un Excel... le hicimos una app" for
> `blu`), while `blucafe` (now the merged biolink entry, see the remediation
> slice below) has no supplied narrative yet. `caseStudyPublished` is `true`
> for `luang`/`blu` only; `blucafe` stays `false`. Task 5.3 below is
> implemented against `blu.ts`, not `blucafe.ts`, for this reason.

### Code tasks

- [x] 5.1 Create `components/case-study/case-study-layout.tsx`,
      `components/case-study/disclosure-note.tsx` (Server). — *design D10;
      case-study: Mandatory Template Elements*
- [x] 5.2 Create `app/[locale]/proyectos/[slug]/page.tsx`:
      `generateStaticParams` returns `publishedCaseStudyProjects()`'s slugs
      (see 5.V1's documented deviation from the literal `publishableProjects()`
      wording); `export const dynamicParams = false`; `generateMetadata`
      builds the page's own canonical via `canonicalFor()`. — *design §3
      asymmetry; case-study: Case Study Route*
- [x] 5.3 Write `lib/content/projects/approach/luang.ts` and `.../blu.ts`
      full prose (problem, role, approach/process, stack, outcome) replacing
      PR 2b's stubs — **`blu.ts`, not `blucafe.ts`, per this batch's actual
      published pair; see the batch note above.** `lib/content/projects/
      index.ts`'s `problem`/`role`/`outcome` fields for both projects were
      also filled in with real content, replacing `PENDING_PROBLEM`/
      `PENDING_ROLE`/`PENDING_OUTCOME`. — *case-study: Mandatory Template
      Elements, Persuasive Without Images, No Invented Metric*
- [x] 5.4 `lib/content/projects/index.ts`: `caseStudyPublished` flipped to
      `true` for `luang` and `blu` (both already `featured: true` from a
      prior batch). Every other curated slot (`blucafe`, `fast-route`,
      `atemporal`, `wedding-invitation-piero`) keeps its current
      evidence/consent state — no fabricated readiness.
- [ ] 5.5 **Follow-up PRs, one per project, as captures/consent land**: add
      the `approach/<slug>.ts` write-up + flip that entry's evidence/consent
      state, up to the 6-8 target. Each is its own small commit/PR, not a
      blocking batch. **Still open** — `blucafe`, `fast-route`, `atemporal`,
      `wedding-invitation-piero` have no write-up yet.
- [x] 5.6 `app/sitemap.ts`: emits real `/[locale]/proyectos/<slug>` entries —
      **documented deviation**: via `publishedCaseStudyProjects()`
      (`caseStudyPublished: true` only), not the broader
      `publishableProjects()` the task's literal text named. The broader set
      would list `/proyectos/atemporal`, `/blucafe`, `/fast-route` in
      `sitemap.xml` today even though `generateStaticParams`
      (`dynamicParams = false`) does not build pages for them — a crawler
      treats every sitemap URL as real, so that would be a genuine dead URL
      in the built output. Verified: `sitemap.xml` lists exactly `/es`,
      `/es/precios`, `/es/proyectos/luang`, `/es/proyectos/blu`.
- [x] ~~5.7~~ **Moved to PR 3a as task 3.10** (done in a prior batch).

### Human tasks

- [ ] 5.H1 **[HUMAN]** Approve the Luang and `blu` write-up copy for factual
      accuracy (stack list, outcome claims) before publishing — no
      fabricated metrics. **Not yet performed** — the write-ups exist and
      pass every automated gate, but human sign-off on the copy itself is
      still open.
- [ ] 5.H2 **[HUMAN, ongoing]** Supply consent + captures for the remaining
      curated slots (carried from 3.H1/3.H2) to unlock their write-ups.

### Verification

- [x] 5.V1 `npm run build` passes; confirms `generateStaticParams` for
      `[slug]` only enumerates `publishedCaseStudyProjects()` — **documented
      deviation from the literal `publishableProjects()` wording**, same
      reasoning as 5.6: enumerating every publishable project would
      statically generate a page full of `[PENDIENTE]` stub prose for
      `atemporal`/`blucafe`/`fast-route`. Confirmed in the build's route
      table: only `/es/proyectos/luang` and `/es/proyectos/blu` are
      generated.
- [x] 5.V2 `npm run lint` passes — same 2 pre-existing
      `hover-border-gradient.tsx` warnings, no new ones.
- [ ] 5.V3 **Human**: request an unknown slug — confirm the branded 404
      renders, not a blank page. **Not performed by the apply agent** —
      `dynamicParams = false` guarantees this at the routing layer (any
      slug outside the static set 404s with zero runtime code, same
      mechanism as the locale layout's D3), but the live browser check was
      not performed.
- [x] 5.V4 Performed by the apply agent via compiled HTML (no browser
      available, same discipline as PR 3/PR 4's verification entries): read
      each published case study's extracted text (headings + paragraphs)
      with images out of the picture entirely — problem, role, approach,
      and outcome are each a distinct, specific, independently legible
      section for both `luang` and `blu`. No percentage, no invented number,
      no number that is not a verified stack version, and no invented
      client quote in either page's compiled markup.
- [x] 5.V5 Confirmed in compiled markup: `blu`'s disclosure line renders
      both the generic "Acceso restringido: este producto requiere inicio de
      sesión" note and its own specific text ("Este panel se encuentra
      protegido por inicio de sesión (blucafefinance.vercel.app requiere
      credenciales). Captura mostrada con autorización del cliente.").
      `luang` (evidence `live`) correctly renders no disclosure line.
- [x] 5.V6 Confirmed in compiled markup: both case studies' next-step block
      links to `pricingLineAnchor(locale, project.serviceLine)` — `luang`
      (line A) to `/es/precios#linea-a`, `blu` (line B) to
      `/es/precios#linea-b` — not a generic pricing landing.
      **Documented deviation, same pattern as `app/[locale]/precios/page.tsx`
      task 4.7**: the spec's brief-form link is substituted with the
      already-live WhatsApp channel, because `#brief`/`BriefForm` do not
      exist yet (PR 6b). Tracked as a follow-up, not closed here.

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

> **Batch note (sdd-apply, `feat/brief-form`, based on `feat/case-studies`)**:
> `lib/brief/**` (PR 6a) was unreachable until this batch — nothing imported
> it. This batch wires it up, and adds the overriding rule the orchestrator
> stated for this slice: the section renders the real form ONLY when
> `RESEND_API_KEY`/`BRIEF_TO_EMAIL`/`BRIEF_FROM_EMAIL`/`BRIEF_FORM_SECRET` are
> all present (`lib/brief/config.ts`, new); otherwise it renders the
> WhatsApp-only path, never a form that cannot deliver. Two real bugs were
> found and fixed while wiring, both documented in apply-progress.md: (1)
> `submit.ts` (a `"use server"` module) exported `initialBriefSubmissionState`
> as a plain value, which Next.js resolves to `undefined` across the client
> boundary — fixed by moving it to the new `lib/brief/submission-state.ts`;
> (2) the initial `useSearchParams()`-based approach for `?line=` pre-tagging
> would have forced `/es` off static generation without a `<Suspense>`
> boundary — replaced with `useSyncExternalStore` reading
> `window.location.search`, which needs no such boundary.

- [x] 6.5 Created `components/brief/field.tsx` (Server) and `components/
      brief/brief-form.tsx` (`"use client"` — the one new client component):
      `useActionState(submitBrief, initialState)`; reads `?line=` query
      param via `useSyncExternalStore` (documented deviation from the
      literal `useSearchParams()` mechanism — see batch note above) as
      `defaultValue`. — *design D10, §9; lead-capture: Service Line
      Pre-Tagging*
- [x] 6.6 Created `components/sections/brief.tsx` (Server): renders
      `BriefForm` + the WhatsApp link (already live since PR 1) when
      `isBriefFormConfigured()` is `true`; otherwise renders the WhatsApp
      path only, into landing section 8. — *landing-narrative: Conversion
      Section Contract*
- [x] 6.7 `app/[locale]/page.tsx`: composed the real `brief.tsx` section as
      the landing's 8th and final numbered section.
- [x] 6.8 Created `app/[locale]/gracias/page.tsx`: static, no `searchParams`
      read, never echoes submitted input, `robots: {index:false,
      follow:false}`. **Documented deviation from design.md §9's literal
      text**: does NOT restate a response-time commitment — none has been
      settled for lead intake (the retainer response window is a different,
      post-launch commitment); inventing one is explicitly forbidden by this
      batch's hard constraints. — *design §9 `/es/gracias`; lead-capture:
      Confirmation Route*
- [x] 6.9 `app/sitemap.ts`: confirmed `/gracias` is excluded — that file's
      cross-product never emitted a `gracias` entry; no code change needed.
- [x] 6.9b **Removed the `as Route` cast** at `lib/brief/submit.ts`'s
      `redirect()` call, in the same commit that moved
      `initialBriefSubmissionState` out of that file (both are `submit.ts`
      correctness fixes). Verified: deleting the cast and running
      `npm run build` passes clean — `typedRoutes` now checks this call
      site again. — *design D7*
- [ ] 6.10 **Not code — recorded as a deployment task, not implemented.**
      Configure a Vercel Firewall rate-limit rule on the brief action's path
      (platform config, not source — apply via Vercel dashboard/CLI). No
      in-memory counter was added (would silently do nothing across
      serverless instances). Scope depends on 6.H3.

### Human tasks (blocking)

- [ ] 6.H1 **[HUMAN, blocks slice going live]** Complete the email
      provider's domain verification (DNS records) for `BRIEF_FROM_EMAIL`'s
      sending domain — every send fails until this is done (design risk 7).
      **Still open** — until this is done, `isBriefFormConfigured()` should
      stay `false` in production (leave the 4 env vars unset), so the
      section renders the honest WhatsApp-only path.
- [ ] 6.H2 **[HUMAN]** Provision `RESEND_API_KEY`, `BRIEF_TO_EMAIL`,
      `BRIEF_FROM_EMAIL`, and `BRIEF_FORM_SECRET` as server-only environment
      variables (never `NEXT_PUBLIC_`). **Still open** — extended this
      batch to include `BRIEF_FORM_SECRET` (see `lib/brief/config.ts`'s doc
      comment: without it, `checkAbuseSignals()` fails every submission
      closed even if the email vars are set).
- [ ] 6.H3 **[HUMAN]** Decide whether to enable Vercel BotID now or only if
      abuse appears (design §2 layer 2) — informs 6.10's scope.

### Verification

- [x] 6.V1 `npm run build` passes — verified in 4 configurations: default
      (no env vars, matches today's real deployment state), with all 4
      brief env vars set to dummy values, `VERCEL_ENV=production
      NEXT_PUBLIC_SITE_URL=https://example.test` with no brief env vars, and
      the same production flags with all 4 brief env vars set. All four
      pass clean.
- [x] 6.V2 `npm run lint` passes — same 2 pre-existing
      `hover-border-gradient.tsx` warnings, zero new ones.
- [x] 6.V3 Verified via compiled markup (no browser available to the apply
      agent, same discipline as prior batches' verification entries): with
      all 4 env vars set, `.next/server/app/es.html` contains a real
      `<form action="" encType="multipart/form-data" method="POST">` with
      hidden `$ACTION_REF_1`/`$ACTION_1:0`/`$ACTION_1:1`/`$ACTION_KEY` fields
      (Next's Server Action progressive-enhancement encoding) and real named
      inputs (`locale`, `issuedAt`, `signature`, `company`, `serviceLine`,
      `budgetBand`, `name`, `email`, `phone`, `projectDescription`) — this
      posts and redirects with JavaScript disabled by construction; the
      live no-JS submit-and-redirect round trip was not driven by an actual
      browser.
- [ ] 6.V4 **Human**: submit with a missing required field — confirm inline
      errors render (JS on) and no redirect happens. Not performed by the
      apply agent (requires a browser); the error-summary/`aria-invalid`/
      inline-error markup path was verified by code inspection only.
- [ ] 6.V5 **Human**: trigger the honeypot/dwell-time path (fill the hidden
      field, or submit faster than ~3s) — confirm silent rejection, no
      confirmation page. Not performed by the apply agent — requires a
      browser; `checkAbuseSignals()`'s fail-closed logic is unchanged from
      PR 6a and was not re-tested at the unit level this batch.
- [ ] 6.V6 **Human**: temporarily break `notify.ts` (bad API key) — confirm
      the form re-renders with preserved values, an error state, the
      WhatsApp fallback is visible, and the payload appears in server logs.
      Not performed by the apply agent — requires a live request to Resend
      (or a network double) and a browser; the `send-failed` UI branch was
      verified by code inspection only.
- [x] 6.V7 Confirmed in compiled markup: `.next/server/app/es/gracias.html`
      is reachable as a standalone static page (`generateStaticParams`
      builds it unconditionally), reads sensibly on its own, and contains no
      submitted query/form value anywhere — the page component receives only
      `params` (the locale), never form data.
- [x] 6.V8 Confirmed: `.next/server/app/sitemap.xml.body` lists exactly
      `/es`, `/es/precios`, `/es/proyectos/luang`, `/es/proyectos/blu` — no
      `/es/gracias` entry. `.next/server/app/es/gracias.html` contains
      `<meta name="robots" content="noindex, nofollow"/>`.

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

---

## Remediation slice — `fix/restore-consented-content` (post-`fix/content-honesty`)

Reverses two `fix/content-honesty` corrections now that the underlying facts
changed, and fixes verify-report.md finding W9 (approved by the user). Confined
to `lib/content/**`, `public/projects/blucafefinance.png`, and
`components/ui/hover-border-gradient.tsx`. Does not widen scope beyond these
three items.

- [x] RC1 (reverses R2) Atemporal Studio's site was found live at
      `https://atemporalarq.vercel.app/` (orchestrator-verified: HTTP 200,
      `<title>Atemporal</title>`, no login wall, ~0.36s). `atemporal` flips
      back from `not-deployed` to `evidence.state: "live"`, keeping the
      existing `atemporal.png` thumbnail. The old `atemporalarq.com` NXDOMAIN
      finding stands — the site simply moved. Closes task 1.H2 positively.
- [x] RC2 (reverses R1) The client granted consent to use the `blu`
      back-office capture (session-dated user-stated consent, not a signed
      agreement). Restored `public/projects/blucafefinance.png` via
      `git checkout b6f68cf~1 -- public/projects/blucafefinance.png` (no
      history rewrite). `blu`'s consent flips to `granted`/`namedClient:
      true` (client named: "Blu Café"); the anonymised "Alimentos y bebidas
      … Tamaño no determinado" framing is dropped. `blu`'s evidence flips to
      `gated` (not `live`): the product itself is genuinely behind a login
      (`blucafefinance.vercel.app` returns 200 with a password field,
      VERIFIED). `lib/content/projects/media.ts`'s `alt` text is corrected
      to describe the AUTHENTICATED dashboard (client logo, "Bienvenido a
      Blu Café" heading, sidebar: Categorías/Productos/Ingredientes/
      Recetas/Ventas) — the prior "pantalla de inicio de sesión" description
      was false and is why finding C1 went unnoticed. `evidence.disclosure`
      carries the explicit login note plus the permission line
      (`specs/project-portfolio/spec.md`, "Evidence State Rendering").
      Closes task 3.H2 for `blu` only (granted); `wedding-invitation-piero`
      and `blu-biolink` remain open.
- [x] RC3 (floor) `HERO_FLOOR` back to 4 in `lib/content/invariants.ts` — with
      Luang, Atemporal, Blu Café, and `blu` all honest again, the hero
      naturally has 4 entries. Comment explains the temporary dip to 3 during
      `fix/content-honesty` and why 4 is restored, not a new requirement.
- [x] RC4 (W9, user-approved) `components/ui/hover-border-gradient.tsx`:
      when `href` is present, the inner wrapper no longer renders as the
      `as` prop's tag (which defaults to `"button"`) — it renders as a plain,
      non-interactive tag instead, so the anchor (`<Link href>` → `<a>`) is
      the sole interactive element. Fixes the nested `<a><button>` defect
      (verify-report.md W9, design risk 10) on the hero's sole CTA. Visual
      output unchanged (same classes/timing, only the tag name changes);
      `href`-absent behavior unchanged (still defaults to `<button>`).

### Verification (this remediation slice)

- [x] RC.V1 `npm run build` passes with `HERO_FLOOR = 4`.
- [x] RC.V2 `npm run lint` passes — same 2 pre-existing
      `hover-border-gradient.tsx` warnings, no new ones.
- [x] RC.V3 Compiled `.next/server/app/es.html` hero CTA:
      `<a href="/es#proyectos"><div class="relative flex border ...">` — zero
      `<button` elements anywhere in the file, zero `<a><button` or
      `<button><a` nesting.
- [x] RC.V4 Built output contains `atemporalarq.vercel.app/` and zero
      occurrences of `atemporalarq.com`.
- [x] RC.V5 `blucafefinance.png` restored on disk, imported in `media.ts`,
      referenced by `blu`'s `evidence.media`. **Partial**: the disclosure
      line and explicit login note are correctly set in the data model
      (`evidence.disclosure`), but no rendering component consumes them yet
      — `components/portfolio/evidence.tsx` is PR 3a scope (task 3.3), not
      yet implemented in this repo state. Today `blu` only reaches the hero
      (`ProductCard`, title + thumbnail only, via `toHeroProducts()` since
      `gated` passes its `no-visual` filter) — no portfolio grid card exists
      to visually confirm the login note/disclosure render. This is reported
      as a gap, not silently claimed as done.
- [x] RC.V6 Fault-injection re-proof: blanked `luang`'s Spanish `summary`,
      ran `VERCEL_ENV=production npm run build` → real exit code 1,
      `Content integrity check failed: Project "luang" has an empty
      "summary" for locale "es".` Restored via `Edit` (reverted to the exact
      prior string) and rebuilt clean (exit 0).

## Remediation slice — `fix/merge-duplicate-project` (this batch, before PR 5)

`blucafe` and `blu-biolink` were one project filed twice in `lib/content/
projects/index.ts`, once under the wrong service line. Verified this session
by fetching `https://blucafe.vercel.app/` directly (logo, "Café de
especialidad", links to Carta/Ubicación/WhatsApp/TikTok/Instagram) and
comparing against the `blu-biolinks` repository's own README, which describes
exactly that page. Confined to `lib/content/projects/index.ts` and
`lib/content/projects/approach/{loader.ts, blu-biolink.ts}`.

- [x] M1 Merge `blu-biolink` into `blucafe`: service line corrected `A` → `C`,
      title changed to describe the work ("Página de enlaces (bio-link) de
      Blu Café", not just the client — required by `checkUniqueHeroTitles`),
      `blu-biolink`'s verified stack (`Astro 5.13`, `Tailwind CSS v4`) moved
      onto the surviving entry. Live evidence and named/granted consent kept.
      `blu-biolink` removed from `PROJECT_SLUGS`, `PROJECTS`, and the approach
      loader; `approach/blu-biolink.ts` deleted.
- [x] M2 **Open item recorded, not resolved either way**: the `blu-biolinks`
      README states the work is "private and proprietary to Blu Cafe TCQ".
      Flagged in `index.ts`'s doc comment for client confirmation before this
      entry becomes the basis of a future write-up — not blocking, and not a
      reason to anonymise a project the user already publishes named.

### Consequences checked

- Line A drops from 3 proofs to 2 (`luang`, `atemporal`) —
  `checkServiceLineProof` still passes (2 ≥ 1).
- Line C gains its first live, clickable, featured proof (previously its
  proofs were `no-visual`/`withheld`).
- Hero floor (`HERO_FLOOR = 4`) still met: `luang`, `atemporal`, `blucafe`
  (merged), `blu` — verified by fault injection (see below), not assumed.
- `checkHeroIsSubsetOfGrid` and `checkUniqueHeroTitles` both re-verified
  passing after the merge.

### Verification

- [x] M.V1 `npm run build` and `VERCEL_ENV=production
      NEXT_PUBLIC_SITE_URL=https://example.test npm run build` both pass
      clean with the merge applied.
- [x] M.V2 Fault-injection re-proof: temporarily duplicated `blu`'s title onto
      the merged `blucafe` entry, ran the production build → real exit code 1
      citing `checkUniqueHeroTitles`'s message; reverted, rebuilt clean.

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
- **Known, bounded gap — the `#precios` dead-anchor fix (`sdd-verify` W8):**
  `git show 9809a2b:components/layout/site-header.tsx` shows a nav item
  linking `/#precios` with no matching `id="precios"` anywhere at that
  commit, nor at the PR 2a or PR 2b tips. The fix (removing that nav item)
  landed only at commit `c44bf34`, the last commit of PR 2c. This is not
  fixed by rewriting history: doing so properly needs an interactive rebase
  this environment does not support, and the fallback — sequential rebases
  across dozens of already-verified commits — carries more risk of breaking
  working code than the defect itself. **Accepted cost**: under
  `chain_strategy: stacked-to-main`, if PR 1, PR 2a, and PR 2b are each
  merged to `main` and left to sit before PR 2c follows, each of those three
  intermediate production states ships a "Precios" nav item that scrolls
  nowhere for as long as that gap lasts. **Process mitigation, not a code
  fix**: merge PR 1 through PR 2c in one sitting, so no intermediate state is
  left running in production long enough for a visitor to hit it. This is a
  process constraint on whoever performs the merges, not a guarantee the code
  provides on its own — stating the cost honestly rather than presenting it
  as resolved.
