# Verify Report: dev-services-website

Change: `dev-services-website`
Phase: `sdd-verify`
Artifact store: `openspec` (mirrored in Engram at `sdd/dev-services-website/verify-report`)
Date: 2026-07-31

Scope verified: **PR 1, PR 2a, PR 2b, PR 2c only** — the state committed at
`c44bf34` (tip of `feat/locale-routing`; `feat/brief-server` points at the same
commit). Slices 3, 4, 5 and 6 are not implemented and their absence is not
reported as a failure. `lib/brief/**` (untracked PR 6a work in progress) is
excluded.

`strict_tdd: false`. No test runner exists and none was installed. The only
automated gates are `npm run build` and `npm run lint`; the absence of tests is
a documented, accepted risk (proposal §2.2, §11.1) and is not reported as a
violation.

Verdict: **2 CRITICAL, 11 WARNING, 6 SUGGESTION.** Both CRITICAL findings are
content-honesty defects inherited from `main` that the delivered slices had the
data model to fix and did not. Neither is a build or routing defect: the
routing, redirect, phantom-locale, dead-internal-link and build-gate work all
verified genuinely correct — several of them by controlled experiment rather
than by reading code.

---

## 1. Automated gate results (verbatim)

### `npm run build`

Run on the restored working tree at `c44bf34` after `rm -rf .next`:

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
✓ Generating static pages using 11 workers (6/6) in 524.3ms
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

Exit code **0**.

### `npm run lint`

```
> website-studio@0.1.0 lint
> eslint


D:\Programming\Frontend\website-studio\components\ui\hover-border-gradient.tsx
  60:6   warning  React Hook useEffect has missing dependencies: 'duration' and 'rotateDirection'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  64:22  warning  'event' is defined but never used                                                                                                    @typescript-eslint/no-unused-vars

✖ 2 problems (0 errors, 2 warnings)
```

Exit code **0**. Both warnings are pre-existing on `main`, unchanged in kind and
count.

---

## 2. CRITICAL

### C1 — The `blu` back-office capture published in the hero identifies the client by name and brand, under `anonymised` consent, with consent confirmation explicitly open and no disclosure rendered

**Evidence.** `public/projects/blucafefinance.png` is not a login screen. It is
the **authenticated dashboard** of the Blu Café back-office: the client logo and
wordmark ("Blu Café / Gestión de Negocio") in the sidebar, the full navigation
tree (Categorías, Productos, Ingredientes, Recetas, Ventas), and the heading
"**Bienvenido a Blu Café**".

It ships in the delivered output. `.next/server/app/es.html` contains:

```
src="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fblucafefinance.c5618cdf.png&amp;w=1200&amp;q=75"
```

`lib/content/projects/index.ts` classifies that project as:

```ts
consent: {
  status: "anonymised",
  industry: "Alimentos y bebidas (back-office / punto de venta)",
  size: "Tamaño no determinado",
},
```

so `publicTitle()` renders the card label as *"Alimentos y bebidas (back-office /
punto de venta) — Tamaño no determinado"*. The image beside that label names the
client. **The anonymisation is defeated by its own asset**, and the result reads
as a botched redaction rather than a straightforward credit.

The entry's own `evidence.disclosure` admits the gap:

> "La confirmación de que la captura mostrada no expone datos reales de clientes
> queda pendiente (ver tarea 3.H2)."

Task 3.H2 is open in both `tasks.md` and `apply-progress.md`.

**Requirements violated.**

- `specs/content-model/spec.md`, "Consent Field Semantics": consent gates
  "client-identifying detail (name, brand assets, screenshots of their
  product)", and "Absent or unresolved consent MUST default to excluded or
  anonymized — never to publishing identifying detail by default." The consent
  field gates only the *title* here; it does not gate media at all.
- Same spec, scenario "blu captures require sanitization": "WHEN any screenshot
  of `blu` is used THEN it MUST be an authorized, sanitized capture". Neither
  authorization nor sanitization is confirmed, by the entry's own admission.
- `specs/project-portfolio/spec.md`, "Evidence State Rendering": `gated` MUST
  render "Authorized sanitized screenshot **+ explicit note that the product
  sits behind a login**". The hero renders the screenshot with **no note**.
  `HeroProduct` is `{ title, link, thumbnail }` and has no field for one, and no
  shipped surface renders `evidence.disclosure`. The disclosure text exists in
  data and reaches no visitor.

**Compounding defect.** `lib/content/projects/media.ts` describes the asset as:

```ts
alt: { es: "Captura de la pantalla de inicio de sesión del sistema de back-office protegido" }
```

"Screenshot of the **login screen**". That is factually wrong — it is the
authenticated dashboard. A reviewer reading only the code would conclude a
harmless login page is published. This is the same class of plausible-sounding
justification that has repeatedly masked defects in this change set.

**Not a regression.** `main` published the same file, labelled "Blu Finances".
But PR 2b authored the `anonymised` classification and PR 2c wired
`toHeroProducts()` into the live page, so this is squarely inside delivered
scope, and the change set's own data now asserts a consent state its own output
contradicts.

**Remediation options** (all within PR 2b/2c files):

1. Flip `blu` to `evidence: { state: "no-visual", media: [] }`. Honest, already
   supported by the model, needs no new asset, and `toHeroProducts()` filters it
   out automatically. **Coupling to check:** this drops the hero to 3 entries and
   `checkHeroFloor` throws below 4 in production — so it needs a paired decision
   (land a capture, or lower the floor with a recorded reason).
2. Replace the asset with a genuinely de-branded, sanitized capture once 3.H2
   lands.
3. Drop `blu` from `featured` until 3.H2 lands — same hero-floor coupling as (1).

Correct the `alt` text either way.

### C2 — `atemporalarq.com` does not resolve; the hero ships a clickable external link to it, modelled as `evidence.state: "live"`

**Evidence gathered in this verification.**

```
https://www.atemporalarq.com/              curl: (6) Could not resolve host: www.atemporalarq.com
https://luang.com.pe/                      200
https://blucafe.vercel.app/                200
https://blucafefinance.vercel.app/         200
```

```
nslookup www.atemporalarq.com  ->  *** no encuentra www.atemporalarq.com: Non-existent domain
nslookup atemporalarq.com      ->  *** no encuentra atemporalarq.com: Non-existent domain
curl -L https://atemporalarq.com/   ->  curl: (6) Could not resolve host: atemporalarq.com
```

Both the apex and `www` return **NXDOMAIN**. The same resolver, in the same run,
resolved the other three project domains.

**This refutes the justification recorded in code.**
`lib/content/projects/index.ts` keeps `state: "live"` on the reasoning that
"`atemporalarq.com` returned no response (`curl` failed in ~1ms, which reads as a
local network/DNS restriction rather than a confirmed outage)". A local
restriction would not resolve `luang.com.pe` and `blucafe.vercel.app` from the
same resolver in the same second, and DNS filtering normally returns a sinkhole
address rather than NXDOMAIN.

**Confidence: HIGH, not absolute.** This is one resolver. Recommend one
independent check from a different network before the state is flipped
permanently. But the current `live` classification is **not supported by
evidence**, and the burden of proof sits on the claim, not on the doubt.

**Requirements violated.**

- `specs/project-portfolio/spec.md`, "External live link may open in a new tab",
  is scoped to "a project with `evidence: live` **and a working external URL**".
- `design.md` §5 ("Evidence state matches reality") and §8: `live` means
  confirmed reachability.
- The delivered output ships a portfolio card whose click produces a DNS error,
  on a site whose entire purpose is converting a prospect.

**No gate covers this.** `checkInternalLinksResolve` explicitly `continue`s on
`isExternalHref(product.link)`, and `typedRoutes` does not see external URLs.
`UNVERIFIED_LIVENESS` is exported from `lib/content/projects/index.ts` and **read
by nothing** — it is documentation wearing a data structure's clothes.

**Also not a regression** (`main` linked the same URL), but human task 1.H2 has
been carried open across four batches on the assumption the URL might be fine.
It is not.

**Remediation.** Flip `atemporal` to `evidence: { state: "not-deployed", media:
[MEDIA.atemporal] }` — the media exists so the state is representable, and
`publicLink()` already falls back to the portfolio anchor for non-`live`
evidence, so no dead link ships. Or drop it from `featured` (same hero-floor
coupling as C1). **Task 1.H2 can now be closed with a negative answer rather
than left open.**

---

## 3. WARNING

### W1 — Five of six `as Route` casts have no compensating control, and `hero-header.tsx` claims one that provably does not cover it

The hero-parallax cast **is** genuinely covered — see §5 item 8, where I proved
it by experiment. But one file over:

`components/sections/hero-header.tsx:41`

```
// See design.md D7 and `lib/content/invariants.ts`'s
// `checkNoSelfReferentialLinks`, which covers what this cast waives.
href={landingAnchor(locale, "proyectos") as Route}
```

`checkNoSelfReferentialLinks` does **not** cover it. That function iterates
`toHeroProducts(locale)` only, and tests only equality with `/` or `/{locale}`.
Neither it nor `checkInternalLinksResolve` ever sees the hero-header CTA's href.
This is the exact overstatement that commit `c44bf34` was written to fix in
`hero-parallax.tsx` — left uncorrected in the sibling file.

Full cast inventory and assessment:

| Location | Target | Covered? | Assessment |
|---|---|---|---|
| `components/ui/hero-parallax.tsx:191` | `product.link` | **Yes** — `checkInternalLinksResolve`, proven by experiment | Justified; comment accurate |
| `components/sections/hero-header.tsx:41` | `/es#proyectos` | **No** | Target resolves today, but comment falsely claims coverage |
| `components/layout/site-header.tsx:33` | `/es#proyectos` | **No** | Target resolves today; no comment claim |
| `components/layout/site-footer.tsx:19` | `/es#proyectos` | **No** | Target resolves today; no comment claim |
| `components/layout/site-header.tsx:27` | `` `/${locale}` `` | n/a | `Locale` is the literal `"es"`, so this template literal should already satisfy `Route` — cast looks **unnecessary** |
| `app/not-found.tsx:29` | `` `/${DEFAULT_LOCALE}` `` | n/a | Same — likely unnecessary |
| `app/[locale]/not-found.tsx:25` | `` `/${DEFAULT_LOCALE}` `` | n/a | Same — likely unnecessary |

Nothing is dead today. The risks are drift and, more seriously, a false comment,
which is worse than no comment because it stops the next reviewer from looking.

**Fix:** correct the `hero-header.tsx` comment to state plainly that the cast is
uncovered and why the target is nonetheless safe; test the three
template-literal casts by deletion.

### W2 — The hero CTA and both "Proyectos" nav items scroll to the element the visitor is already looking at

`app/[locale]/page.tsx` renders `<div id="proyectos">` **wrapping**
`<HeroParallax>`, and the CTA is rendered *inside* `HeroParallax` through the
`header` slot. Compiled output:

```html
<div id="proyectos"><div class="py-20 overflow-hidden ... perspective-[1000px] transform-3d">
  <div class="max-w-7xl relative mx-auto py-20 md:py-40 ...">
    ...
    <a href="/es#proyectos"><button class="relative flex border ...">
      <span>Explora nuestros proyectos</span>
```

So "Explora nuestros proyectos" scrolls **up**, to the top of the hero the
visitor is already reading. Same for the header and footer "Proyectos" links.

This is the identical failure mode commit `c44bf34` removed the "Precios" nav
item for, in its own words: *"A nav item labelled 'Precios' that does nothing
when clicked reads as broken."* The standard was applied to Precios and not to
Proyectos. This is the fifth instance of the defect family this change set has
been catching.

Not CRITICAL: the anchor exists, so `specs/site-shell/spec.md`'s "Header CTA no
longer targets a dead route" scenario literally passes ("resolves to an existing
internal anchor").

**Fix:** move `id="proyectos"` off the hero wrapper — onto the product track now,
or onto PR 3a's Proyectos section when it lands — or drop the CTA/nav items until
there is a distinct section to reach.

### W3 — `app/[locale]/not-found.tsx` is unreachable, and `apply-progress.md` asserts the opposite

Verified against a running production server (`npm start`):

| Path | Status | Boundary rendered |
|---|---|---|
| `/xx` | 404 | root `app/not-found.tsx` |
| `/es/precios` | 404 | root `app/not-found.tsx` |
| `/es/proyectos/blu` | 404 | root `app/not-found.tsx` |
| `/es/nope` | 404 | root `app/not-found.tsx` |

Proof of boundary: `/es/precios` returns **0** occurrences of `<header`/`<footer`
(vs. 1 on `/es`) and renders `<main class="flex min-h-screen flex-col items-center
justify-center gap-4 px-4 text-center">` — the root 404's exact class string. The
locale layout does not run, so `app/[locale]/not-found.tsx` never renders.

`apply-progress.md`'s "Honest gap in this PR's own delivery-order guarantee"
states: *"A visitor who follows one of these redirects today lands on a branded,
in-locale 404 (`app/[locale]/not-found.tsx`, since the redirect resolves `locale
= "es"` correctly and only the nested sub-route is missing)."* **That is false.**

Visitor outcome remains acceptable — the root 404 identifies ElectroCode Studio
and links to `/es`, satisfying `site-shell`'s "Not Found Handling". So this is a
documentation defect plus dead code, not a behavioural one. Task 2.20's
deliverable becomes reachable when PR 5 adds `[slug]`.

### W4 — Three `redirects()` entries send visitors to a 404 — acceptable, narrowly, but restate the reasoning

Verified live:

```
/precios      -> 307 -> /es/precios      -> 404
/gracias      -> 307 -> /es/gracias      -> 404
/proyectos/x  -> 307 -> /es/proyectos/x  -> 404
/portfolio    -> 307 -> /es#proyectos    -> 200
/es/proyectos -> 307 -> /es#proyectos    -> 200
/             -> 307 -> /es              -> 200
```

**Assessment: acceptable, and a designed gap rather than an oversight** — but the
reason it is acceptable is not the one recorded. It is *not* "less severe than a
rendered `<Link>`": it is that **those three source paths cannot have been
bookmarked**. `/precios` and `/gracias` have never been published, appear in no
rendered HTML and appear in no sitemap. A 307-to-404 for a URL nobody can hold is
strictly no worse than the 404 they would get without the redirect. `/portfolio`
is the one entry with a plausible history, and it correctly resolves to a live
target.

Design D2 mandated all six entries and task 2.23 required them in this batch, so
the apply agent had no discretion. The gap self-resolves at PR 4/PR 5.

**Fix only if PR 4/PR 5 slip:** deleting the `/precios` and `/gracias` entries
costs nothing today and removes a 307-to-404 from the delivered surface.

### W5 — Header and footer copy is hardcoded in components, and no task owns extracting it

`specs/content-model/spec.md`, "Locale Dictionary Structure": *"Site copy MUST be
sourced from per-locale dictionary modules, not hardcoded in components."*

`lib/dictionaries/types.ts` has exactly two keys: `hero`, `notFound`. Hardcoded
copy in the delivered output:

- `components/layout/site-header.tsx`: "ElectroCode Studio", "Proyectos",
  "WhatsApp"
- `components/layout/site-footer.tsx`: the same, plus "Desarrollo web a medida,
  desde Perú."

No task in `tasks.md` — not 1.7, 1.8, 2.13, nor any later slice — assigns
header/footer dictionary extraction. **This requirement currently has no owner.**

(The root `app/not-found.tsx` hardcoding Spanish is a *justified* deviation,
documented in design §3: it renders outside the locale layout and cannot use the
dictionary.)

### W6 — `site-shell`'s Header and Footer Navigation requirements are partially met, and "locale indication" has no owner

- **Header Navigation** requires links to "the pricing route, the landing's
  portfolio anchor, and the brief/WhatsApp conversion point". Delivered: portfolio
  anchor only. Pricing is assigned to PR 4 (fine). WhatsApp is blocked on 1.H1.
- **Footer Navigation** requires "navigation links, a contact/WhatsApp reference,
  and **locale indication**". Delivered: navigation only. **"Locale indication" is
  assigned to no task in any slice.**

The WhatsApp handling is correct and deserves saying so: `WHATSAPP` is
`{ status: "pending" }` and both components gate on `WHATSAPP.status === "set"`,
so nothing renders at all. That is better than a dead `wa.me` link and nothing
was invented.

### W7 — `apply-progress.md` documents a row-derivation algorithm that is not the one in the code

`apply-progress.md` task 1.5 records:

> `SINGLE_ROW_MAX = 4; splitAt = products.length <= 4 ? products.length : Math.ceil(products.length / 2)` … **Superseded in PR 2b** — see below.

PR 2b's section never mentions row derivation. The actual shipped code is:

```ts
const MIN_ROW_CARDS = 4;
const splitAt =
  products.length >= MIN_ROW_CARDS * 2
    ? Math.ceil(products.length / 2)
    : products.length;
```

introduced by commit `9809a2b` — the **tip of `feat/truth-pass`**, i.e. PR 1,
landing *after* PR 1's docs commit `6343019`. Three later docs commits
(`e6a6487`, `3fb8e2a`, `5e82f47`) never recorded it.

The code change is **correct** (see §5 item 9) and its in-file comment is
excellent. The defect is only that a reviewer trusting `apply-progress.md`
verifies the wrong algorithm — and this is a file `tasks.md` flags twice as
"hand-built component, extra review required".

### W8 — The `#precios` dead-anchor fix landed only at the PR 2c tip, so PR 1, PR 2a and PR 2b each ship it

`git show 9809a2b:components/layout/site-header.tsx`:

```
16:          <Link href="/#proyectos">Proyectos</Link>
17:          <Link href="/#precios">Precios</Link>
```

No `id="precios"` exists at that tip, nor at the PR 2a or PR 2b tips. The removal
landed in `c44bf34`, the **last** commit of PR 2c.

Under `chain_strategy: stacked-to-main` every PR reaches production, so merging
PR 1 alone — then 2a, then 2b — ships a nav item that scrolls nowhere in each of
three successive production states.

**Slice-coherence verdict for each shipped slice:**

| Slice | Merged alone to `main`, coherent? |
|---|---|
| PR 1 (`feat/truth-pass`) | Mostly. Hero has copy, `#proyectos` anchor exists (`app/page.tsx:34`), 4 real cards, external links fixed. **But** the `#precios` nav item scrolls nowhere (this W8). |
| PR 2a (`feat/content-model-core`) | Yes for the page (data-only slice; `app/page.tsx` untouched, the `lib/contact.ts` → `lib/content/contact.ts` migration is complete with imports updated). Inherits W8. |
| PR 2b (`feat/content-model-projections`) | Yes — the interim hero-copy regression it flagged was actively solved by adding `InterimHeader` in `fc80d83`, so the hero is not headless. Inherits W8. (Note: `InterimHeader`'s copy — "Desarrollo web / que hace crecer tu negocio" — was newly authored and never in a dictionary; transient and gone at the tip, recorded only for completeness.) |
| PR 2c (`feat/locale-routing`) | Yes for routing/links. Carries C1, C2, W2. |

Nothing has been pushed, so the cheap fix is to fold the `c44bf34` header/footer
nav change back into `feat/truth-pass`, or squash-merge the chain.

### W9 — The nested-interactive a11y defect is now the hero's primary CTA

Compiled output: `<a href="/es#proyectos"><button class="relative flex border ...">`.
`components/ui/hover-border-gradient.tsx:104` returns
`href ? <Link href={href}>{content}</Link> : content` while `as="button"` renders
a `<button>` inside it.

Genuinely **pre-existing** and unchanged from `main` (which rendered
`<Link href="/portfolio"><button>`), recorded as design risk 10 and explicitly
out of scope. Flagged because it is now the sole CTA on the sole shipped page, so
the follow-up design risk 10 asked for is more urgent than "someday". Not
introduced by this change set.

### W10 — Two spec requirements are contradicted by design decisions and were never reconciled

1. **`content-model` → "Pricing Module"** requires "placeholder tokens
   (`[PRICE:*]`, `[CURRENCY]`) for every undecided figure". **D8** states "There
   is no `[PRICE:*]` token in this design" and replaces it with a `pending`
   discriminant. The implementation follows D8. D8's reasoning is stronger and
   the spec's own *scenario* ("its value is … not a plausible-looking number") is
   satisfied. But an auditor reading the spec text scores this a violation.
2. **`project-portfolio` → "Portfolio Grid Consistency With Hero"** requires grid
   and hero to render "the same set of projects — no project appears in one but
   not the other". `design.md` §5 and `toHeroProducts()` deliberately exclude
   `no-visual` projects from the hero, so today grid = 6 and hero = 4
   (`fast-route` and `blu-biolink` are grid-only). Not yet observable (the grid
   ships PR 3a) but the divergence is already built into `projections.ts:130`.

**Fix:** amend the two spec requirements to match the design rather than leaving
three artifacts disagreeing. Item 2 will otherwise surface as a false CRITICAL
when PR 3a is verified.

### W11 — `tasks.md` does not reflect the verification work `apply-progress.md` records

In the committed `tasks.md` at `c44bf34`:

```
300:- [ ] 2.V1 `npm run build` passes ...
303:- [ ] 2.V2 `npm run lint` passes.
```

Both remain unchecked, while `apply-progress.md` marks them `[x]` and I confirmed
both genuinely pass. All 35 code tasks (1.1–1.9, 2.1–2.26) are correctly `[x]`
and every one maps to real code I verified. The gap is confined to PR 2's two
automated verification lines.

**Concurrency note:** during this verification,
`openspec/changes/dev-services-website/apply-progress.md` and `tasks.md` moved
from clean to modified in the working tree, and
`lib/brief/{schema,abuse,notify,submit}.ts` appeared untracked — the parallel PR
6a slice. I verified against the committed state at `c44bf34` as instructed. The
build and lint runs taken after that point had `lib/brief/**` on disk and inside
`tsconfig.json`'s `**/*.ts` include; both still passed, so nothing was masked.

---

## 4. SUGGESTION

**S1.** `assertContentInvariants()` is not called in `app/sitemap.ts`, which
`design.md` §6 lists alongside the layout ("at the top of
`app/[locale]/layout.tsx` (and in `app/sitemap.ts`)"). Harmless today — the
layout prerender covers it, proven in §5 item 7 — but the design's stated shape
is not met, and `app/sitemap.ts` will read `publishableProjects()` from PR 5 on.
No task required it, so this is drift from design, not from tasks.

**S2.** `rm -rf .next && npm run build` is **not deterministic**. One run failed
with:

```
Failed to compile.

Type error: File 'D:/Programming/Frontend/website-studio/.next/types/link.d.ts' not found.
  The file is in the program because:
    Root file specified for compilation
```

and a subsequent run against the damaged `.next` failed with
`ENOENT ... .next\build-manifest.json`. `tsconfig.json` includes
`.next/types/**/*.ts`, so the TS program depends on files `next build` generates
in the same run — with `typedRoutes: true` this is a live race.
`apply-progress.md` records a sibling symptom (a stale
`.next/dev/types/validator.ts`). Worth a `README`/`CLAUDE.md` note so the next
person does not read it as a code defect; a warm `.next` avoids it.

**S3.** `app/layout.tsx` sets `alternates.canonical: "/es"` at the **root**
layout, so the 404 page also declares `/es` as its canonical — `_not-found.html`
contains `href="http://localhost:3000/es"`. A 404 canonicalizing to the landing
is a soft-404 signal to crawlers. Move `alternates` down into
`app/[locale]/layout.tsx`, or override it in both not-found pages.

**S4.** `PROJECTS`' legacy `link`/`thumbnail` fields hold values that would be
defects the moment anything reads them:

- `link: "/es/proyectos/blu"`, `"/es/proyectos/fast-route"`,
  `"/es/proyectos/blu-biolink"`, `"/es/proyectos/wedding-invitation-piero"` —
  four routes that do not exist.
- `thumbnail: ""` on three entries — would throw in `next/image`.
- Both hardcode the `es` locale, which the rest of the model deliberately avoids.

Nothing reads them today (`projections.ts` derives both from `evidence`/`consent`),
and `checkInternalLinksResolve` only inspects `toHeroProducts()` output, so **no
gate would catch it**. The `content-model` spec mandates the fields exist, so
deleting them is not an option — either sweep them in `checkInternalLinksResolve`
or derive them instead of authoring them.

**S5.** `checkInternalLinksResolve`'s `liveTargets` is a hand-maintained
allowlist (`{ /es, /es#proyectos }`), not a read of the route manifest. It fails
**closed** (a link outside the set fails the build), which is the right
direction, and the file says so plainly. Two extensions to schedule: it currently
sweeps only `toHeroProducts()`, so PR 3a must add `toPortfolioCards()` (same
`publicLink()` source), and PR 3b must add the `#precios` anchor. Worth adding to
tasks 3.4/3.10 explicitly.

**S6.** `HeroParallax`'s `products` prop widened from `{...}[]` to
`readonly {...}[]`. Element shape is unchanged and a mutable array is still
assignable, so `project-portfolio`'s "Hero prop shape is unchanged" scenario
holds and no call site breaks. Recorded only because the type text differs from
the spec's literal wording.

---

## 5. Verified correct — stated plainly

Each item below was checked against code, compiled output, or a live server —
not against the apply reports.

1. **Zero dead internal links in the built output.** Every `href` in
   `.next/server/app/es.html`: `/es`, `/es#proyectos`, the three external URLs,
   `/favicon.ico`, the canonical absolute, and `_next` assets. `_not-found.html`:
   `/es` only. No `/es/precios`, no `/es/proyectos/*`, no bare `/`. Repo-wide,
   `/portfolio` survives only as a `redirects()` source and one code comment;
   `grep 'link: *"/"'` returns **zero** matches.

2. **`/` never breaks.** `.next/routes-manifest.json` contains
   `{ "source": "/", "destination": "/es", "statusCode": 307 }`, and a live
   request returns `307` with `location: /es`. All six D2 redirects are present at
   `statusCode: 307`, matching D2's table verbatim including
   `/:locale(es)/proyectos → /:locale#proyectos`.

3. **Phantom locale is dead, at the routing layer.** `generateStaticParams()`
   returns `[{ locale: "es" }]`, `export const dynamicParams = false`, and
   `assertLocale()` calls `notFound()` on a miss. Live: `/xx` → **404** with the
   branded root page, not a phantom-locale render. The build's route table lists
   no page outside `/[locale]`, `/_not-found`, `/robots.txt`, `/sitemap.xml`.

4. **No invented content anywhere.** Grepped, not assumed. The only `PEN`/`USD`
   occurrence is the `Currency` *type* union — no value. `status: "set"` and
   `state: "linked"` appear **only** in type declarations, never as an assigned
   constant. All eight `PRICES` entries are `pending`; all six
   `RETAINER_COMMITMENTS` fields are `pending`; `ACADEMY` is `no-link` with
   `media: []`, and the `Authority` type has no field capable of expressing a
   student, course or review count — a scale claim is inexpressible. All seven
   `approach` stubs and every `problem`/`role`/`outcome` field are `[PENDIENTE]`
   markers that state in-copy that they are placeholders ("Este texto es un
   marcador temporal, no contenido de producción"), not plausible filler.

5. **`blucafefinance.vercel.app` appears nowhere in the repository** — zero
   matches. The only external URLs in tracked source are the three
   exploration-sourced ones plus `localhost` fallbacks.

6. **All four static image imports resolve.** `luang.png`, `atemporal.png`,
   `blucafe.png`, `blucafefinance.png` are exactly the four files present in
   `public/projects/`, and the build emits all four hashed assets. A missing file
   would be a build error by design (D9/§8).

7. **`assertContentInvariants()` genuinely runs in a build and genuinely
   throws — proven by controlled experiment, not inferred.** I temporarily blanked
   one `Localized<string>` value and rebuilt:

   - `VERCEL_ENV` unset → warned and **exited 0**:
     ```
     Content integrity check failed:
       - Project "luang" has an empty "role" for locale "es".
       ...
     ```
   - `VERCEL_ENV=production` → **failed the build, real exit code 1**:
     ```
     Error occurred prerendering page "/es". ...
     Error: Content integrity check failed:
       - Project "luang" has an empty "role" for locale "es".
     ...
     Export encountered an error on /[locale]/page: /es, exiting the build.
     ⨯ Next.js build worker exited with code: 1 and signal: null
     ```

   This is a **working gate, not a decorative one**. It is invoked at
   `app/[locale]/layout.tsx:39` (`await assertContentInvariants()`), which
   prerenders because of `generateStaticParams`. The file was restored via
   `git checkout --`.

8. **`checkInternalLinksResolve` genuinely compensates for the
   `product.link as Route` cast** — also proven, because the brief was right to be
   sceptical. I temporarily reverted `publicLink()` to `design.md` §5's literal
   rule (`caseStudyPath(locale, slug)` for non-`live` evidence) and rebuilt with
   `VERCEL_ENV=production`:

   ```
   Error: Content integrity check failed:
     - Project "Alimentos y bebidas (back-office / punto de venta) — Tamaño no determinado" links to "/es/proyectos/blu", which is not a live target for locale "es". Either the route/anchor has not shipped yet, or LIVE_TARGETS in checkInternalLinksResolve needs updating.
   ⨯ Next.js build worker exited with code: 1
   ```

   The check reads the **same projection** that feeds `products` into
   `HeroParallax`, and branches on the **same** `isExternalHref` the card branches
   on, so there is no drift between what is checked and what is rendered.
   `hero-parallax.tsx`'s comment is accurate — including its explicit correction
   that `checkNoSelfReferentialLinks` is *not* what covers it. Scope limits are
   recorded as W1/S4/S5. File restored.

9. **Hero row derivation is correct for every count the invariant permits.**
   Card span is `560n − 80` px (`w-120` = 480px, `space-x-20` = 80px).
   `splitAt = n >= 8 ? ceil(n/2) : n`, and row 2 renders only when
   `secondRow.length > 0`, so **no count from 1 to 12 produces an empty row**.
   Row widths:

   | n | Rows | Widths (px) | Overflows 1920px? |
   |---|---|---|---|
   | 4 | 4 | 2160 | yes |
   | 5 | 5 | 2720 | yes |
   | 6 | 6 | 3280 | yes |
   | 7 | 7 | 3840 | yes |
   | 8 | 4+4 | 2160, 2160 | yes |
   | 9 | 5+4 | 2720, 2160 | yes |
   | 10 | 5+5 | 2720, 2720 | yes |
   | 11 | 6+5 | 3280, 2720 | yes |
   | 12 | 6+6 | 3280, 3280 | yes |

   Counts 1–3 (480/1040/1600px) do **not** overflow and would fail D4's
   criterion — but `checkHeroFloor` rejects any hero below 4 entries and throws in
   production, so they sit outside the reachable domain. The deviation from D4's
   illustrative "6 → 3+3" is deliberate and its arithmetic is right: 3+3 would
   give two 1600px rows, which D4's own stated criterion rejects. The measured
   rule beats the illustrative example. (Documentation of this change is W7.)

10. **Every `useSpring`/`useTransform` value and the perspective entrance are
    unchanged.** `git diff main..HEAD -- components/ui/hero-parallax.tsx` touches
    none of them: `springConfig { stiffness: 300, damping: 30, bounce: 100 }`,
    `translateX [0, 1000]`, `translateXReverse [0, -1000]`, `rotateX [15, 0]`,
    `opacity [0.2, 1]`, `rotateZ [20, 0]`, `translateY [-700, 50]`, `useScroll
    offset ["start start", "end start"]`, the `perspective-[1000px] transform-3d`
    container and `whileHover { y: -20 }` are byte-identical. The third motion
    track is removed and both remaining tracks keep their original class strings
    and translate bindings, exactly per D4.

11. **Consent defaults hold for the two entries the brief names besides `blu`.**
    `wedding-invitation-piero` is `withheld` + `featured: false`, filtered out by
    `publishableProjects()`, and absent from the compiled HTML. `blu-biolink` is
    `anonymised` with `evidence: { state: "no-visual", media: [] }`, so it is
    filtered out of the hero and publishes nothing client-identifying today.
    `publicTitle()` **throws** rather than leak a `withheld` project's
    `client`/`title` if a future caller skips the filter. The consent failure is
    `blu` alone (C1).

12. **Discoverability files are honest.** `sitemap.xml` emits only
    `<loc>http://localhost:3000/es</loc>` — no redirecting `/`, no
    not-yet-existing route, satisfying D2's "the sitemap lists only `/es/...`
    URLs. Never `/`." `robots.txt` allows crawling and references the sitemap.
    Both use the `localhost` fallback because 2.H2 is open, which is documented in
    code.

13. **Brand metadata is real.** `title: "ElectroCode Studio"`, non-empty Spanish
    description, matching `openGraph` title/description/type, `metadataBase: new
    URL(SITE_URL)`, and `alternates` with `canonical`/`languages`/`x-default`.
    `_not-found.html` renders `<title>ElectroCode Studio</title>`, names the brand
    in-page and links to `/es`.

14. **The site's Spanish copy is correct by design** (`<html lang="es">`,
    Peru/LatAm audience) and is not reported as a defect anywhere in this report.

---

## 6. Human tasks — status after this verification

| Task | Status |
|---|---|
| 1.H1 — WhatsApp business number | **Still open.** Handled honestly: `WHATSAPP = { status: "pending" }`, both chrome components gate on `status === "set"`, nothing renders, nothing invented. |
| 1.H2 — confirm `atemporalarq.com` is live | **Answerable now, negatively.** Apex and `www` both return NXDOMAIN while the three other project domains resolve from the same resolver. See C2. Recommend one independent cross-network check, then downgrade the evidence state. |
| 2.H1 — fragment redirects behave | **Partially closed.** `/portfolio → /es#proyectos` and `/es/proyectos → /es#proyectos` both verified live at 307 with the fragment intact in the `Location` header. Browser scroll behaviour on arrival is still unverified — and W2 means the anchor's *target* is the wrong element regardless. |
| 2.H2 — supply `NEXT_PUBLIC_SITE_URL` | **Still open.** Falls back to `http://localhost:3000`, which is visible in the compiled canonical/OG/sitemap/robots output. Must be set before any deploy. |
| 3.H1 — captures for outstanding entries | **Still open.** Correctly modelled as `no-visual` with `media: []`; no broken frames. |
| 3.H2 — consent for `wedding-invitation-piero`, `blu-biolink`, `blu` | **Still open, and now blocking.** See C1: the `blu` capture is published ahead of this confirmation. |
| 1.V3, 1.V4 (browser), 1.V5, 2.V3–2.V6 | Browser/visual items. 2.V3, 2.V4 and 2.V5 are now **closed by live HTTP probes** in this report (§5 items 2, 3 and §3 W3/W4). 1.V3, 1.V5 and 2.V6's rendered-`<head>` inspection still require a human with a browser. |

---

## 7. Blocking assessment for `sdd-archive`

**Do not archive.** Two CRITICAL findings must be resolved first, both in
`lib/content/projects/index.ts` and `lib/content/projects/media.ts`:

1. **C1** — stop publishing the unconsented, client-identifying `blu` back-office
   capture, and correct its `alt` text.
2. **C2** — downgrade `atemporal` from `evidence: "live"`, since the domain does
   not resolve.

Both fixes reduce the hero below `checkHeroFloor`'s floor of 4 if done by
exclusion, so they need a **single paired decision**, not two independent edits.
The cheapest coherent resolution is: flip `blu` to `no-visual` and `atemporal` to
`not-deployed`, then either land one new capture or record a deliberate, reasoned
lowering of the hero floor.

W7, W11 and W3's false claim should also be corrected in `apply-progress.md`
before archive, since an archived report that misdescribes the shipped algorithm
and the 404 boundary is worse than no report.

Recommended next phase: **`sdd-apply`** — a small remediation slice covering
C1 + C2 plus the W1/W2 corrections, which all sit in the same handful of files —
then re-verify before PR 4.

---

## 8. Verification method note

Nothing in this report was accepted on the strength of an apply report. The
following were established by execution rather than by reading:

- `npm run build` and `npm run lint`, run from a clean `.next` (§1).
- Compiled-HTML link inventory via `grep -oE '(href|src)="[^"]*"'` on
  `.next/server/app/*.html`.
- `.next/routes-manifest.json` parsed for the `redirects` array and status codes.
- A live production server (`npm start`) probed for 11 paths, with status codes,
  `Location` headers, and 404-boundary identification by rendered class string.
- Two controlled fault-injection builds, one per gate, each reverted with
  `git checkout --` (§5 items 7 and 8).
- DNS resolution and HTTP status for all four project domains.
- `git diff main..HEAD` on `components/ui/hero-parallax.tsx` for the motion-value
  preservation claim.
- Direct visual inspection of `public/projects/blucafefinance.png` (§2, C1).

---

## 9. Verification Report — contract tables

### 9.1 Testing-evidence reconciliation

The `sdd-verify` skill's default rule is that a spec scenario is compliant only
when a covering test passed at runtime, and that a scenario with no covering test
is `CRITICAL UNTESTED`. **That rule is explicitly overridden for this project**:
`strict_tdd: false`, no test runner exists, and proposal §2.2 / §11.1 record the
absence of one as an accepted, documented risk. Applying the default would produce
~50 identical false CRITICALs and bury the two real ones.

Runtime evidence was therefore obtained by other means, and each scenario below
carries the class of evidence that backs it:

| Status | Meaning |
|---|---|
| `VERIFIED-RUNTIME` | Proven against a running server, the compiled output, or a fault-injected build |
| `VERIFIED-STATIC` | Proven by source/type inspection; no runtime path exists yet to exercise |
| `VIOLATED` | Fails a spec requirement in the delivered output |
| `PARTIAL` | Some elements of the requirement are delivered, some are not |
| `DEFERRED` | Belongs to an unshipped slice (PR 3/4/5/6) — not a failure |
| `MANUAL` | Needs a human with a browser; no automated substitute exists |

### 9.2 Task completeness

| Group | Total | Complete | Incomplete | Assessment |
|---|---|---|---|---|
| PR 1 code (1.1-1.9) | 9 | 9 | 0 | All map to real code, verified individually |
| PR 2a code (2.1-2.7) | 7 | 7 | 0 | Verified |
| PR 2b code (2.8-2.16) | 9 | 9 | 0 | Verified |
| PR 2c code (2.17-2.26) | 10 | 10 | 0 | Verified |
| **Shipped code tasks** | **35** | **35** | **0** | **No incomplete implementation task** |
| PR 1 automated gates | 2 | 2 | 0 | Both re-run and confirmed |
| PR 2 automated gates | 2 | 2 in fact | 2 on paper | `tasks.md` still shows `[ ]` — W11 |
| Human/browser tasks | 13 | 4 closed here | 9 open | See §6 |

No unchecked implementation task exists, so task completeness does not block
archive. The two CRITICAL findings do.

### 9.3 Spec compliance matrix (shipped subset)

| Capability | Requirement / Scenario | Status | Evidence |
|---|---|---|---|
| site-shell | Locale Root Resolution — root serves Spanish landing | VERIFIED-RUNTIME | `/` -> 307 -> `/es` -> 200 |
| site-shell | Locale extensibility without route moves | VERIFIED-STATIC | `LOCALES`-driven; design §3 records the ~3 layout/404 file cost for `en` |
| site-shell | Brand Metadata | VERIFIED-RUNTIME | compiled `<title>ElectroCode Studio</title>`, non-empty description, OG |
| site-shell | Header CTA no longer targets a dead route | VERIFIED-RUNTIME | `/es#proyectos`; zero `/portfolio` in HTML |
| site-shell | Header Navigation (pricing + portfolio + brief/WhatsApp) | PARTIAL | portfolio anchor only — W6 |
| site-shell | Footer Navigation (links + contact + locale indication) | PARTIAL | links only — W6 |
| site-shell | Zero Dead Internal Links — bare projects index redirects | VERIFIED-RUNTIME | `/es/proyectos` -> 307 -> `/es#proyectos` |
| site-shell | Zero Dead Internal Links — build-time link audit | VERIFIED-RUNTIME | compiled HTML inventory + fault-injected gate |
| site-shell | Discoverability Files | VERIFIED-RUNTIME | `sitemap.xml` = `/es` only; `robots.txt` references sitemap |
| site-shell | Not Found Handling | VERIFIED-RUNTIME | 4 paths probed; branded, names brand, links `/es` |
| content-model | Project Entity Shape — legacy shape preserved | VERIFIED-STATIC | `Project` superset incl. `link`, `thumbnail` |
| content-model | Slug Uniqueness | VERIFIED-RUNTIME | `checkUniqueSlugs` inside a gate proven to throw |
| content-model | Consent — `wedding-invitation-piero` | VERIFIED-RUNTIME | `withheld`, `featured: false`, absent from HTML |
| content-model | Consent — `blu-biolink` | VERIFIED-RUNTIME | `anonymised` + `no-visual`, nothing identifying published |
| content-model | Consent — `blu` captures require sanitization | **VIOLATED** | **C1** |
| content-model | Evidence Field (four states) | VERIFIED-STATIC / value defect | union correct; `atemporal`'s value wrong — **C2** |
| content-model | Service Line Enumeration — every non-retainer line has proof | VERIFIED-RUNTIME | `checkServiceLineProof`; A/B/C covered, D exempt |
| content-model | Pricing Module (`[PRICE:*]` tokens) | OVERRIDDEN BY D8 | intent met, spec text stale — W10 |
| content-model | Locale Dictionary Structure — hero copy | VERIFIED-RUNTIME | dictionary copy present in compiled HTML |
| content-model | Locale Dictionary Structure — chrome copy | PARTIAL | header/footer hardcoded — W5 |
| project-portfolio | Curated Set Size (6-8) | VERIFIED-STATIC | 6 featured + publishable |
| project-portfolio | Hero Projection Preserves Prop Contract | VERIFIED-STATIC | `toHeroProducts()` is the source; shape preserved (S6) |
| project-portfolio | Row Derivation — 6 entries, no empty row | VERIFIED-STATIC | one row of 6; `secondRow.length > 0` guard |
| project-portfolio | Row Derivation — 8 entries, no empty row | VERIFIED-STATIC | 4+4 |
| project-portfolio | Row Derivation — motion values preserved | VERIFIED-RUNTIME | `git diff main..HEAD` byte-identical |
| project-portfolio | Conditional Card Link — internal stays same tab | VERIFIED-RUNTIME | `blu` renders `<Link>` to `/es#proyectos`, no `target` |
| project-portfolio | Conditional Card Link — external may open new tab | VERIFIED-RUNTIME / value defect | branch correct, `rel` added; `atemporal` URL dead — **C2** |
| project-portfolio | Evidence State Rendering — `gated` needs a login note | **VIOLATED** | **C1** — hero renders the capture with no note |
| project-portfolio | Evidence State Rendering — `no-visual` degrades honestly | VERIFIED-RUNTIME | filtered from hero; no broken frame in HTML |
| project-portfolio | Portfolio Grid Consistency With Hero | DEFERRED + conflict | grid ships PR 3a; design §5 diverges — W10 |
| project-portfolio | No Self-Referential Links | VERIFIED-RUNTIME | zero `link: "/"`; `checkNoSelfReferentialLinks` in a proven gate |
| landing-narrative | Hero Section Contract — derived, not a literal array | VERIFIED-RUNTIME | `toHeroProducts(locale)`; old inline array deleted |
| landing-narrative | Copy Voice Constraint (no headcount) | VERIFIED-STATIC | no team/employee assertion; inherited editorial "Diseñamos/nosotros" is brand voice, not a headcount claim |
| landing-narrative | Sections 2-9, fixed order | DEFERRED | PR 3/6 |
| service-catalog | Fixed Four-Line Catalog | VERIFIED-STATIC | `satisfies Record<ServiceLine, ...>`, exactly A-D |
| service-catalog | Line-to-Pricing Anchor Mapping | DEFERRED | PR 3a/4 |
| pricing | All requirements | DEFERRED | PR 4. Pre-satisfied: all 8 tokens `pending`, no numeric literal anywhere |
| case-study | All requirements | DEFERRED | PR 5 |
| case-study | No Invented Metric | VERIFIED-STATIC | `Outcome.metric` requires `source`; all data is `qualitative` `[PENDIENTE]` |
| trust-signals | Academy No-Link State While Undeployed | VERIFIED-STATIC | `ACADEMY` is `no-link`; `url` exists only on `linked` |
| trust-signals | Academy No-Scale-Claim Constraint | VERIFIED-STATIC | type has no student/course/review field — inexpressible |
| trust-signals | Academy Upgrade Condition (data-driven) | VERIFIED-STATIC | discriminant on `Authority.state` |
| trust-signals | Academy Block Placement | DEFERRED | PR 3b |
| trust-signals | Retainer Published Commitments | PARTIAL / DEFERRED | all 6 fields required and present, every value `pending`; renders PR 3b |
| trust-signals | Itemized Maintenance Scope | DEFERRED | PR 3b |
| trust-signals | Continuity Evidence Honesty | DEFERRED | no continuity statement shipped |
| trust-signals | No Retainer Testimonial Without Consent | VERIFIED-STATIC | no testimonial exists anywhere, fabricated or otherwise |
| lead-capture | WhatsApp Escape Hatch | PARTIAL | `pending` channel renders nothing; blocked on 1.H1 — honest |
| lead-capture | Brief form, validation, confirmation, pre-tagging | DEFERRED | PR 6 |

### 9.4 Design coherence (D1-D12)

| # | Decision | Coherence | Note |
|---|---|---|---|
| D1 | Email-only brief backend | DEFERRED | PR 6a in flight, excluded. No remote DB touched — fleet contract intact |
| D2 | `redirects()` in `next.config.ts` | COHERENT | all six entries verbatim, all 307, verified in manifest and live |
| D3 | Three-layer phantom-locale defence | COHERENT | `generateStaticParams` + `dynamicParams = false` + `assertLocale()`; `/xx` -> 404 live |
| D4 | Row derivation | **DEVIATION, JUSTIFIED** | `MIN_ROW_CARDS` (split from n>=8) supersedes D4's `<=4 -> one row` and its illustrative `6 -> 3+3`, which contradicts D4's own overflow criterion. Arithmetic verified; both spec scenarios still pass. Undocumented in apply-progress — W7 |
| D5 | Header becomes a `ReactNode` slot | COHERENT | `header?` prop; copy in `lib/dictionaries/es.ts`; `HeroHeader` is a Server Component |
| D6 | Conditional link target | COHERENT | `isExternalHref` branch; missing `rel="noopener noreferrer"` added |
| D7 | `typedRoutes: true` | COHERENT with a documentation defect | enabled; `HoverBorderGradient.href?: Route`; 7 casts, 1 genuinely covered, 5 uncovered, 1 comment false — W1 |
| D8 | Prices are a state, not a string | COHERENT | `PriceEntry` discriminant, all `pending`. Layer 4 (ESLint rule) correctly deferred to task 4.9. Conflicts with spec text — W10 |
| D9 | Content-model shape and placement | COHERENT | file tree matches §5 exactly; **zero React imports under `lib/content/` confirmed by grep**; static image imports; `async` approach loader |
| D10 | Exactly one new client component | COHERENT | **no new client component shipped at all** — `site-header`, `site-footer`, `hero-header` are all Server Components; `motion` still confined to `hero-parallax.tsx` |
| D11 | `cacheComponents` off, every route `force-static` | **DEVIATION, MINOR** | `cacheComponents` off, yes. But **no route sets `export const dynamic = 'force-static'`**. Design §6 leaned on it to guarantee no dynamic fallback could swallow the assertion. Empirically the assertion does throw (§5 item 7) and the build reports every route as static, so the guarantee holds by other means — but the stated mechanism is absent. See S7 |
| D12 | No `images` block | COHERENT | confirmed absent from `next.config.ts` |

**S7 (added here).** No route declares `export const dynamic = 'force-static'`,
which D11 requires and design §6 cites as the reason a throw during static
generation cannot be swallowed. Every route is in fact statically prerendered (the
build reports only static and SSG markers) and the assertion demonstrably throws,
so nothing is broken — but the explicit guard the design specified is missing, and
it becomes load-bearing the moment a later slice reads a dynamic API. Add it to the
locale layout; PR 4's task 4.6 already requires it on the pricing page.

### 9.5 Proposal §15 success criteria

| Criterion | Status |
|---|---|
| Zero dead internal links; `/portfolio` and `link: "/"` gone | **MET for internal links.** One dead *external* link outstanding — C2 |
| Metadata carries ElectroCode Studio + non-empty description | MET |
| Four service lines on the landing, in pricing, with proof each (retainer excepted) | NOT YET — PR 3/4. Data layer ready; `checkServiceLineProof` passes |
| From `/es` a prospect can do all five things in §1 | NOT YET — PR 3/4/5/6 |
| Every curated project renders completely with images disabled | NOT YET — grid ships PR 3a; the hero is image-only by design |
| No unresolved price placeholder, invented metric, or headcount claim reaches production | MET |
| Academy block presents no link and no scale claim while undeployed | MET at the data layer; the block renders in PR 3b |
| `npm run build` and `npm run lint` are clean | MET |
| Adding `en` requires adding a dictionary — no route files move | MET for pages. Design §3 records the ~3 layout/404 file cost; do not claim zero |
| Every case study states its evidence state and a truthful disclosure line | NOT YET — PR 5. C1 shows the hero cannot carry a disclosure, so PR 3a/PR 5 must supply the surface |

### 9.6 Final verdict

**FAIL** — 2 CRITICAL.

Both are content-honesty defects in `lib/content/projects/`, both inherited from
`main`, both fixable in a handful of lines, and both coupled through
`checkHeroFloor`'s floor of 4 — so they need one paired decision, not two edits.

Everything the four slices were actually built to prove verified correct, most of
it by execution rather than inspection: locale routing, the `/` redirect,
phantom-locale defence, zero dead *internal* links, the content model's
compile-time honesty guarantees, and a build-time integrity gate that genuinely
fails a production build.

The engineering in this change set is strong. The two failures are places where
the model was built to tell the truth and the data fed into it did not.
