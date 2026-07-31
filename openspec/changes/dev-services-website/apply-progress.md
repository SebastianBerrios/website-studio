# Apply Progress: dev-services-website

Batch: 1 of N (PR 1 — Truth pass only)
Branch: `feat/truth-pass` (based on `sdd/dev-services-website-plan`)
Delivery strategy: `auto-chain` / `stacked-to-main`
Mode: Standard (no test runner; `strict_tdd: false`)

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
      (conditionally rendered, only when `lib/contact.ts`'s channel is
      `set`). Rendered above `<HeroParallax>` in `app/page.tsx`.
- [x] 1.8 Created `components/layout/site-footer.tsx` (Server Component):
      brand, nav links, WhatsApp reference (same conditional rendering), no
      locale-switcher implication. Rendered below `<HeroParallax>`.
- [x] 1.9 Created `lib/contact.ts` (temporary): exports a discriminated
      `ContactChannel` and `WHATSAPP: ContactChannel = { status: "pending" }`
      — the number was not supplied (task 1.H1 is still open), so the
      channel stays `pending` and renders nothing anywhere it is consumed.

### Human tasks (blocking) — status

- [ ] 1.H1 **[HUMAN, blocks 1.7/1.8/1.9's live state]** WhatsApp business
      number NOT supplied this batch. Implemented honestly: `lib/contact.ts`
      stays in `pending` state; `SiteHeader`/`SiteFooter` render no WhatsApp
      affordance at all until this lands. Nothing was invented.
- [ ] 1.H2 **[HUMAN]** `https://www.atemporalarq.com/` liveness not
      independently reverified in this batch (no browsing tool available to
      the apply agent) — carried forward as still UNVERIFIED, unchanged from
      the proposal/design's own inherited-risk note (design.md risk 12).

### Verification

- [x] 1.V1 `npm run build` passes. See "Build result" below.
- [x] 1.V2 `npm run lint` passes. See "Lint result" below.
- [ ] 1.V3 **Human, NOT performed by this agent** — visually check the hero
      at ~375px, ~768px, ~1440px, ~1920px+: one row of 4 cards, no empty
      row, parallax slides symmetrically. No automated check exists; the
      apply agent did not open a browser.
- [x] 1.V4 Automated substitute performed: `grep`-equivalent search across
      `*.ts`/`*.tsx` for `/portfolio` and `link: "/"` returns zero matches
      after this batch (see "Dead link check" below). Human click-through of
      every nav/footer/hero-CTA/product-card link in a live browser was
      **not** performed by this agent — still recommended before merge.
- [ ] 1.V5 **Human, NOT performed by this agent** — confirm
      `HoverBorderGradient`'s hover-gradient animation still renders
      correctly after the href change (`/portfolio` → `/#proyectos`). The
      component itself was not modified, only the `href` value passed to it,
      but a runtime/visual check was not performed.

## Build result (verbatim, final commit `84c88ee`)

```
> website-studio@0.1.0 build
> next build

▲ Next.js 16.1.1 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 2.6s
  Running TypeScript ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (0/4) ...
✓ Generating static pages using 11 workers (4/4) in 1007.8ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
└ ○ /_not-found

○  (Static)  prerendered as static content
```

## Lint result (verbatim, final commit `84c88ee`)

```
> website-studio@0.1.0 lint
> eslint

D:\Programming\Frontend\website-studio\components\ui\hover-border-gradient.tsx
  59:6   warning  React Hook useEffect has missing dependencies: 'duration' and 'rotateDirection'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  63:22  warning  'event' is defined but never used                                                                                                    @typescript-eslint/no-unused-vars

✖ 2 problems (0 errors, 2 warnings)
```

Exit code 0. Both warnings are pre-existing in `hover-border-gradient.tsx`,
a file this batch did not touch (that file's `href` retype to `Route` is
task 2.24, PR 2c — out of scope here).

## Dead link check

`grep -rn "/portfolio\|link: \"/\"" **/*.{ts,tsx}` returns no matches after
this batch. Confirmed via ripgrep search across the whole repo.

## Deviation from the orchestrator's stated constraints (flagged, not silent)

The launch prompt's "Critical constraints" section listed **D5 (header
slot)** as something to implement in this batch, alongside D4/D6:
"D5: the `Header()` copy becomes a `header?: React.ReactNode` slot filled
by a Server Component."

This was **not implemented in this batch**, and that is a deliberate choice,
not an oversight:

- `tasks.md` line 91 states PR 1 satisfies only **D4, D6** — not D5.
- `tasks.md` task 1.6 explicitly instructs: "Keep copy hardcoded for now
  (dictionary extraction is PR 2c's job — **do not write the strings
  twice**)."
- D5's actual task assignments are **2.13** (`lib/dictionaries/es.ts`),
  **2.14** (`header?: React.ReactNode` prop on `HeroParallax`), and **2.15**
  (`components/sections/hero-header.tsx`), all listed under **PR 2b**, not
  PR 1.

Implementing D5 now would have meant either creating `lib/dictionaries/es.ts`
early (out of PR 1's declared scope, and duplicating the "do not write the
strings twice" string), or building a slot with no dictionary behind it
(pointless indirection). I followed `tasks.md` — the document explicitly
named "your work order" — over the constraint list's D5 mention, since
`tasks.md` is the vetted, dependency-ordered breakdown and the constraint
list's D5 reference appears to be carried over from the "required reading"
section rather than a considered scope decision for this specific PR.

**No other deviations from design or tasks.** Everything else in PR 1's task
list was implemented as written.

## Files changed

| File | Action | What was done |
|---|---|---|
| `lib/links.ts` | Created | `isExternalHref()` pure helper (design D6) |
| `components/ui/hero-parallax.tsx` | Modified | Row derivation from array length (D4), `ProductCard` link branching + `rel` fix (D6), CTA href fix |
| `lib/contact.ts` | Created | Temporary `ContactChannel` discriminated union, `WHATSAPP` in `pending` state |
| `components/layout/site-header.tsx` | Created | Server Component: brand + nav + conditional WhatsApp link |
| `components/layout/site-footer.tsx` | Created | Server Component: brand + nav + conditional WhatsApp link |
| `app/page.tsx` | Modified | Removed 5 duplicate products, fixed self-referential link, wired `SiteHeader`/`SiteFooter`, added `id="proyectos"` anchor target |
| `app/layout.tsx` | Modified | ElectroCode Studio brand metadata + Open Graph fields |

## Commits (in order, on `feat/truth-pass`)

1. `7fdf90d` — `fix(hero-parallax): derive rows from array length, fix unsafe external link`
2. `c18e6ac` — `feat(contact): add pending WhatsApp contact channel`
3. `918d329` — `feat(layout): add site header and footer chrome`
4. `5c500ec` — `fix(home): remove duplicate/dead product entries, wire site chrome`
5. `84c88ee` — `feat(seo): add ElectroCode Studio brand metadata`

No push performed. No PR opened. Local commits only, per instructions.

## Workload / PR boundary

- Mode: chained PR slice (`auto-chain` / `stacked-to-main`)
- Current work unit: PR 1 — Truth pass (complete, self-contained)
- Diff vs `sdd/dev-services-website-plan`: 7 files, 172 insertions(+), 70
  deletions(-) — well under the 400-line budget and close to the tasks.md
  estimate (~200-250).
- Boundary: starts from today's `main`-derived branch state (duplicate
  products, dead `/portfolio` link, missing brand metadata, no site
  chrome); ends with an honest 4-entry hero, a fixed reverse-tabnabbing
  defect, real branding, and header/footer chrome with an honest
  (non-fabricated) pending WhatsApp state. Rollback: revert the single
  squashed merge commit once this reaches `main` — zero data, zero infra,
  per tasks.md's stated rollback plan for PR 1.

## Human verification still outstanding (not performed by this agent)

- [ ] 1.H1 — supply the real WhatsApp business number
- [ ] 1.H2 — confirm `atemporalarq.com` liveness
- [ ] 1.V3 — visual check of the hero at 375/768/1440/1920px+
- [ ] 1.V4 (browser click-through) — click every internal/external link
      live in a browser; the automated grep substitute above is not a
      replacement for this
- [ ] 1.V5 — visually confirm `HoverBorderGradient`'s hover animation after
      the href change

## Status

9/9 code tasks (1.1-1.9) complete. 2/2 automated verification gates
(1.V1, 1.V2) pass. 2 human tasks (1.H1, 1.H2) and 3 human verification
items (1.V3, 1.V5, and the browser portion of 1.V4) remain open and were
not performed by this agent — they require a human with a browser and,
for 1.H1/1.H2, real-world information this agent does not have. Ready for
`sdd-verify`, with those human items called out explicitly rather than
claimed as done.
