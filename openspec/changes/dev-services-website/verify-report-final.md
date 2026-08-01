# Final Verify Report: dev-services-website

Change: `dev-services-website`
Phase: `sdd-verify` (final, pre-push)
Artifact store: `openspec` (mirrored in Engram at `sdd/dev-services-website/verify-report-final`)
Branch verified: `feat/editorial-design` @ `6af2fd8` (tip), working tree clean
Date: 2026-07-31

Scope: the **entire delivered site** — PR 1 through the editorial design pass.
The prior `verify-report.md` covered only PR 1–2c; everything after it (the
landing, `/es/precios`, both case studies, the brief form, and the whole
visual layer) is reviewed independently here for the first time.

`strict_tdd: false`. No test runner exists; its absence is a documented,
accepted risk (proposal §2.2, §11.1) and is **not** reported as a violation.
Automated gates are `npm run build`, `npm run lint`, and the 16 checks in
`lib/content/invariants.ts`. Everything else was established by executing
commands, probing a live production server, reading compiled HTML, fetching
third-party URLs, viewing a published image asset, and computing WCAG
contrast ratios — never by trusting an apply report.

**Verdict: FAIL — 7 CRITICAL, 25 WARNING, 8 SUGGESTION.**

The engineering substrate is genuinely strong and most of it verified correct
by execution. The failures cluster in exactly the two places nobody
independently checked: **content that was written rather than derived**, and
**the visual layer added last**.

---

## 1. Automated gate results (verbatim)

### Production build

`VERCEL_ENV=production NEXT_PUBLIC_SITE_URL=https://x.test npx next build`

```
▲ Next.js 16.1.1 (Turbopack)
✓ Compiled successfully in 2.8s
✓ Generating static pages using 11 workers (10/10) in 1093.3ms

Route (app)
┌ ○ /_not-found
├ ● /[locale]                    └ /es
├ ● /[locale]/gracias            └ /es/gracias
├ ● /[locale]/precios            └ /es/precios
├ ● /[locale]/proyectos/[slug]   ├ /es/proyectos/luang
│                                └ /es/proyectos/blu
├ ○ /robots.txt
└ ○ /sitemap.xml
```

Exit code **0**, from a removed `.next`.

### Lint

```
components/ui/hover-border-gradient.tsx
  73:6   warning  React Hook useEffect has missing dependencies: 'duration' and 'rotateDirection'
  77:22  warning  'event' is defined but never used
✖ 2 problems (0 errors, 2 warnings)
```

Exit code **0**. Both pre-existing on `main`, unchanged in kind and count.

### Integrity gates — fault-injected, not assumed

Five injections, each producing a **real non-zero exit**, each reverted with
`git checkout --`, `git status --porcelain` empty afterwards (verified).

| # | Injection | Result |
|---|---|---|
| 1 | omit `NEXT_PUBLIC_SITE_URL` in a production build | exit 1 — `checkSiteUrlConfigured` |
| 2 | blank `luang.summary.es` | exit 1 — `checkNoEmptyLocalizedValues`: *"Project "luang" has an empty "summary" for locale "es"."* |
| 3 | duplicate `blu`'s title onto `blucafe` | exit 1 — `checkUniqueHeroTitles`, with the React-key rationale in the message |
| 4 | make `portfolioLink()` ignore `caseStudyPublished` | exit 1 — `checkPortfolioLinksOnlyToPublishedCaseStudies`: *"Portfolio card "fast-route" links to "/es/proyectos/fast-route" but its case study is not published"* |
| 5 | set `app-from` (then `care-basic`) back to `pending` | exit 1 — but via **`tsc`** at `lib/brief/schema.ts:60`, not via `checkPendingPricesInProduction`. See S1. |

The gates bite. They are working controls, not decoration.

### Live production server (`next start`, 16 paths)

```
/                    307 -> /es                /es                  200
/precios             307 -> /es/precios        /es/precios          200
/gracias             307 -> /es/gracias        /es/gracias          200
/proyectos/x         307 -> /es/proyectos/x    (-> 404; prior report's W4, unchanged, still acceptable)
/portfolio           307 -> /es#proyectos      /es/proyectos        307 -> /es#proyectos
/xx                  404                       /es/nope             404
/es/proyectos/nope   404                       /es/proyectos/luang  200
/es/proyectos/blu    200                       /sitemap.xml         200
/robots.txt          200
```

---

## 2. CRITICAL

### C1 - The Luang case study fabricates the client's industry

`/es/proyectos/luang` is published, names the client, self-canonicalises and
sits in `sitemap.xml`. It states:

> "Necesitaban un canal propio para mostrar sus **proyectos de arquitectura** y
> darse a conocer ante nuevos clientes." - `lib/content/projects/index.ts:91`

> "Construir un sitio para **un estudio de arquitectura** que no tenia ninguna
> presencia web previa..." - `lib/content/projects/approach/luang.ts:15`

**Verified this session** by fetching `https://luang.com.pe/` (HTTP 200) and by
viewing `public/projects/luang.png` directly. Luang Asociados SAC is a
**mining-sector engineering and construction firm**. Its own meta description:
"Somos una empresa especialista en el desarrollo de Ingenieria Basica,
Ingenieria de Detalle, Gestion de Proyectos y Construccion en el sector Minero
Metalurgico"; its H1: "Ofrecemos ingenieria basica y de detalle, gestion de
proyectos y construccion en el sector minero." The screenshot the case study
itself publishes shows heavy earth-moving equipment on a mine site.

"arquitectura" appears nowhere in the user's supplied facts ("no tenia una web,
se la hicimos desde cero, lo querian para mostrar sus proyectos y darse a
conocer"), nowhere in `exploration.md` (which records only the page title
"Luang"), and nowhere on the live site. It was invented. `index.ts`'s own
comment claims the copy was "built strictly from the user's own words" - a
plausible-sounding justification wrapped around a fabrication, the exact
pattern this change set has repeatedly caught.

**Violates** `specs/case-study/spec.md` "Title and Context Honesty" and
proposal 4.4's honesty constraint. **The most damaging defect in the change
set**: a named client's public case study asserting the wrong industry. Task
5.H1 (human sign-off on the write-up copy) is exactly the gate that would have
caught it, and it is still open.

**Fix**: use the user's own word ("proyectos" - the live site does have a
"Proyectos Destacados" section) and either source the sector description from
the live site or drop it.

### C2 - The brief form is broken by construction: a build-time dwell token on a static page

`components/sections/brief.tsx:59` calls `issueFormToken()` from a Server
Component on a statically prerendered route (`/[locale]`, SSG). So
`issuedAt = Date.now()` is evaluated **once, at build time**, and baked into
the HTML every visitor receives. Verified by building with the four brief env
vars set:

```
NOW_MS   = 1785552699058
compiled = <input type="hidden" name="issuedAt" value="1785552698312"/>
```

`lib/brief/abuse.ts` rejects `dwellMs > MAX_DWELL_MS` (2 hours). Therefore
**every submission more than two hours after the deploy is rejected**.
`submit.ts` returns `{ status: "rejected" }`, and `components/brief/brief-form.tsx`
renders **nothing** for that status - no error, no message, no redirect. The
visitor believes they submitted; the studio receives nothing. That is precisely
the failure `lib/brief/config.ts`'s own doc comment says the fail-closed gate
exists to prevent, reintroduced one layer down.

Symmetrically, `MIN_DWELL_MS` (3s) can never fire against a build-time
timestamp, so layer 1 also provides **zero** bot protection. Both halves are
inoperative, in opposite directions.

Latent today only because the env vars are unset. Completing tasks 6.H1/6.H2 -
the documented go-live path - activates it.

**Fix**: issue the token at request time, or drop the timestamp check and rely
on platform rate limiting (task 6.10), or at minimum render an explicit error
for `status: "rejected"` so a lead is never lost silently.

### C3 - The landing's pricing summary strips the qualifiers that give three of its four figures their meaning

Compiled `/es`, section 6:

```
Landing pages y sitios corporativos      S/500
Aplicaciones web y dashboards a medida   S/1,500
Biolinks y microsites de evento          S/100
Mantenimiento y evolucion                S/80
```

Compiled `/es/precios`, the same tokens: `Care Basico S/80 / mes`,
`Desde S/1,500`, and Line A as `Landing S/500 / Corporativo S/650 /
Corporativo Plus S/800`.

- **S/80 is a monthly retainer**, rendered on the landing with no "/ mes".
  A one-off S/80 versus S/80 per month is a 12x misstatement of the offer.
- **S/1,500 is a floor**, rendered as a flat price for custom web apps.
- **S/500 is the cheapest of three Line A tiers**, rendered as the line price.

`components/sections/pricing-summary.tsx:60` renders `<Price token=.. />` bare;
`components/pricing/price.tsx` accepts only a token and has no suffix support.
The figures are real; their meaning is not. This is a price dispute waiting to
happen, on the landing page, above the conversion section.

### C4 - Five published fixed-price tiers ship a price with no exclusions and no turnaround

Compiled `/es/precios`, all five Line A and Line C tiers:

```
Que no incluye     -> "Exclusiones pendientes de definir."
Tiempo de entrega  -> "Tiempo de entrega pendiente de definir."
```

`specs/pricing/spec.md` "Fixed Tier Anatomy" requires turnaround and a
"not included" list, and its scenario is explicit: "a tier definition lacking a
'not included' list ... fails - omitting exclusions is a spec violation, not a
style choice."

Design section 5 encoded this as `notIncluded: readonly [string, ...string[]]`
- a non-empty tuple, so an empty list would be a **compile error**. Task 4.1's
documented deviation replaced it with `Commitment<T>`, removing the exact
guarantee the design chose to make this impossible. The deviation is honestly
recorded; the shipped result still violates the spec, and proposal section 7
states the cost: "Omitting exclusions is what turns a fixed price into a
dispute."

Same shape for Line B: the spec requires "the quoting process AND its
turnaround"; the quote block renders "Tiempo de entrega pendiente de definir."

### C5 - The hero H1 is invisible without JavaScript

`components/ui/text-generate-effect.tsx` renders every word as
`<span class="opacity-0" style="filter:blur(10px)">` and reveals it only via an
imperative `animate()` inside `useEffect`. Verified in the static HTML:

```html
<h1 class="font-display text-5xl ..">
  <div class=""><span class="opacity-0" style="filter:blur(10px)">Tu<!-- --> </span>
  <span class="opacity-0" style="filter:blur(10px)">proyecto<!-- --> </span>..
```

On a site that is otherwise 100% static and works without JS by design (the
no-JS form path is design section 9's deciding argument):

1. **No JS, or a failed chunk, and the site's primary headline never appears.**
   The D10 amendment's own justification cites an audience "largely on mobile
   with variable connections" - the audience most likely to hit this.
2. It is the LCP element, hidden until hydration.
3. The global `prefers-reduced-motion` override cannot reach it (inline style
   plus imperative animation); `useReducedMotion()` shortens the duration but
   does not make the initial state visible.

New in `feat/editorial-design`. **Fix**: start at `opacity: 1` and animate from
a hidden state via CSS keyframes (covered by the existing media query), or gate
the `opacity-0` class behind a mounted flag.

### C6 - The Luang case study is unreachable from anywhere on the site

`lib/content/projections.ts`'s `publicLink()` and `portfolioLink()` both return
`evidence.externalUrl` for any `live` project, **regardless of
`caseStudyPublished`**. Luang is `live`, so its hero card and its grid card
both link to `https://luang.com.pe/`.

I enumerated every `href` in all six compiled pages. `/es/proyectos/luang`
appears in **zero** of them; it exists only in `sitemap.xml`. Half of PR 5's
delivered content has no inbound link.

Two problems: a published page nobody can reach, and a portfolio grid that
sends a prospect to the CLIENT's site instead of the studio's own proof -
inverting the purpose of the case-study route (proposal section 5: "the depth
the landing cannot hold"). `specs/landing-narrative/spec.md` "Proyectos Section
Contract" requires the grid to "hand off to individual case studies"; for Luang
it does not.

### C7 - The curated set is 5; the spec floor is 6

`featured: true` and publishable: `luang`, `atemporal`, `blucafe`, `blu`,
`fast-route` = **5**. (`wedding-invitation-piero` is `featured: false` /
`withheld`.)

`specs/project-portfolio/spec.md` "Curated Set Size" requires 6-8. Design D4:
"Target 8 curated entries for visual fidelity; 6 is the floor."

The `fix/merge-duplicate-project` slice correctly merged `blu-biolink` into
`blucafe` - but that dropped the set from 6 to 5, and the slice's own
"Consequences checked" list covered service-line proof, hero floor, subset and
title uniqueness, and **not** this requirement. No invariant enforces it
(`checkHeroFloor` is 4 and counts the hero projection, not the curated set).

Content-blocked rather than a code defect (tasks 3.H1/5.5/5.H2), and not
embarrassing in itself - but it is an unmet spec requirement with no gate, in a
change set whose whole thesis is that data-integrity failures need gates.

---

## 3. WARNING

### W1 - The `?line=` pre-tag was silently dropped after PR 6b made it possible

Three components substitute the WhatsApp link for the brief form:
`app/[locale]/precios/page.tsx` block 8 (task 4.7),
`components/case-study/case-study-layout.tsx` next-step block (task 5.V6), and
`components/sections/services.tsx` (task 3.1).

Each carries the same note: "PR 6b must replace this with the real `?line=`
pre-tag into `#brief` once the form exists." PR 6b shipped `#brief` (the id
exists in the compiled landing). **No task in PR 6b reopened any of them**, and
4.7 / 5.V6 remain `[x]`. Verified: no compiled page links to `#brief`, and no
page emits `?line=` at all.

Consequence: `components/brief/brief-form.tsx`'s `useSyncExternalStore`
`?line=` pre-fill - a mechanism with its own 20-line justification - is dead
code nothing can ever exercise.

**Requirements unmet**: `specs/pricing/spec.md` "Pre-Tagged CTA";
`specs/lead-capture/spec.md` "Service Line Pre-Tagging";
`specs/case-study/spec.md` "Next-Step Block" (requires links to the pricing
block AND to the brief form).

### W2 - A false claim in a code comment, the exact class the last report caught

`app/[locale]/precios/page.tsx` states the CTA points at WhatsApp "with the
visitor's line of interest folded into the prefilled WhatsApp message text".
`lib/content/contact.ts` exports exactly one `WHATSAPP` URL with one fixed
prefill, and every compiled page carries that identical URL. No line is folded
into anything. A false comment is worse than no comment because it stops the
next reviewer looking.

### W3 - The code-ownership FAQ contradicts the cancellation FAQ

Compiled `/es/precios`: "Quien es dueno del codigo? - Pendiente de confirmar,
todavia no hemos definido esta politica publicamente." versus "Como puedo dejar
de trabajar con el estudio? - En un proyecto puntual no hay permanencia: LO
ENTREGADO ES TUYO AL FINALIZAR."

The second answer IS a code-ownership statement. The page simultaneously says
the policy is undefined and states it. Beyond leaving `specs/pricing/spec.md`
"FAQ Objection Coverage" unmet (task 4.V5, marked partial), publishing "we
haven't defined who owns the code" reads to a prospect as a studio that has not
settled its commercial basics.

### W4 - `app/[locale]/not-found.tsx` is still unreachable; the record says it would be reachable by now

Probed against a live production server:

| Path | Status | header count | footer count | Boundary |
|---|---|---|---|---|
| `/xx` | 404 | 0 | 0 | root `app/not-found.tsx` |
| `/es/nope` | 404 | 0 | 0 | root |
| `/es/proyectos/nope` | 404 | 0 | 0 | root |

`apply-progress.md` predicted: "`app/[locale]/not-found.tsx` itself becomes
reachable once PR 5 adds a dynamic segment (e.g. `[slug]`) whose page calls
`notFound()`." PR 5 shipped and it did **not** - `dynamicParams = false`
rejects at the routing layer before the segment tree renders, so Next serves
the global `_not-found`. Nobody re-verified after PR 5.

Visitor outcome remains acceptable (branded root 404 naming the brand and
linking `/es`), so `specs/site-shell/spec.md` "Not Found Handling" passes. But
task 2.20's deliverable plus its dictionary entry are dead code, and a false
prediction sits in a record about to be archived. The prior W3 was
documented-closed; the claim it left behind was not.

### W5 - a11y: four of five Proceso phases render body text at 2.29:1

`components/ui/sticky-scroll-reveal.tsx:75` applies
`data-[active=false]:opacity-50` to the whole phase block inside `bg-card/60`.
Computed by OKLCH -> sRGB -> relative luminance (the same method the palette
comment uses):

| Pair | Ratio | AA |
|---|---|---|
| `muted-foreground` at opacity-50 on `card/60` (phase body, `text-base`) | **2.29:1** | FAIL (needs 4.5) |
| `card-foreground` at opacity-50 on `card/60` (phase title, `text-2xl/3xl`) | **3.23:1** | passes as large text, only just |

Exactly one phase is active at any scroll position, so **most of the Proceso
section's copy is below AA at all times**. New in the editorial pass, never
reviewed.

For the record, the two ratios the palette comment does claim reproduce
exactly: `accent-signal` text on `background` = **4.77:1**, and
`accent-signal-foreground` on `accent-signal` = **5.07:1**. That claim is
honest and the token was genuinely tuned.

### W6 - a11y: the "Requiere tu aprobacion" badge is 4.08:1

`text-accent-signal` on `bg-accent-signal/10` over `bg-card/60`, at `text-xs`
= **4.08:1**. Fails AA (4.5:1). It is the section's stated selling point, so it
is not decorative.

### W7 - a11y: form inputs are delimited only by a 1.50:1 border

Every brief-form control is `border border-input bg-background` - the same
colour as the page background, bounded by a border measuring **1.50:1** against
it. WCAG 1.4.11 requires 3:1 for UI component boundaries. Only relevant once
the form renders, but it renders as soon as the env vars land.

### W8 - a11y: no `<main>` landmark on the landing, no skip link anywhere

`/es` compiles with `<header>`, eight `<section>` elements and `<footer>` - and
**no `<main>`**. `/es/precios`, both case studies and `_not-found` all have
one. No page has a skip link past the header nav.

### W9 - a11y: heading-level skips on both major pages

- `/es`: `h1` (hero) -> `h3` (hero product cards). No `h2` between.
- `/es/precios`: `h2 "Aplicaciones web..."` -> `h4`; `h2 "Mantenimiento..."` ->
  `h4`; `h2 "Condiciones generales"` -> `h4`; and the FAQ block heading is
  **`h3`** while every other block heading on the page is `h2`.

### W10 - a11y/UX: the Proceso phases sit in an unlabelled nested scroll region

`components/ui/sticky-scroll-reveal.tsx:69`: `h-[30rem] overflow-y-auto` with
no `tabindex`, no `role`, no accessible name. Keyboard reachability of a
scrollable region without focusable children depends on browser version. Below
`lg` the sticky panel is hidden, so a mobile visitor gets a nested scroll trap
inside the page scroll - on the audience the D10 amendment names as primary. At
`lg` and above the sticky panel also repeats the active phase's title and
description verbatim to assistive tech. Needs a browser to close fully;
UNVERIFIED beyond the markup.

### W11 - Hero card titles are invisible on touch devices

`components/ui/hero-parallax.tsx:200`: the card `<h3>` is
`opacity-0 ... group-hover/product:opacity-100`. There is no hover on touch, so
mobile visitors see four unlabelled images. The text is in the DOM (assistive
tech is fine) and `alt` carries the same label, but sighted mobile users get no
project names in the hero. New in the editorial pass.

### W12 - Design section 8's hero image directives were never implemented and no task owns them

Design section 8 requires `sizes="480px"` on hero cards and `priority` on
first-row cards, calling the current state "a live perf defect fixed in the
same rework." Verified in compiled `/es`: all four hero images are
`loading="lazy"` with **no `sizes`** and no `priority`. The hero is the
above-the-fold LCP surface. No task in `tasks.md` ever owned this. (The
portfolio grid and case-study images DO carry correct `sizes`, and the
case-study lead image carries `priority` - the omission is specific to the
hero.)

### W13 - `x-default`/`languages` land on the 404 page and nowhere else

`app/layout.tsx` sets `alternates.languages` plus `x-default`. Every route's
`generateMetadata` returns `alternates: { canonical }`, which REPLACES the
layout's `alternates` object wholesale. Verified in the compiled head:

| Page | canonical | hreflang / x-default |
|---|---|---|
| `/es`, `/es/precios`, `/es/gracias`, both case studies | present, self | **absent** |
| `_not-found` | absent | **present** |

Exactly inverted from design D2's SEO section, which calls `x-default` "what
makes adding `en` a one-entry change."

### W14 - Every page ships the same title and description

All five content pages emit `<title>ElectroCode Studio</title>` plus the
identical description and `og:title`/`og:description`. `/es/precios` and the
case studies are justified in proposal section 5 as "shareable, sent directly
in DMs, SEO target". A case-study link pasted into a DM previews as the generic
homepage card, and search engines see five near-identical titles.

### W15 - The brief section's intro promises a form the shipped configuration does not render

`components/sections/brief.tsx` renders `brief.intro` in BOTH branches.
Compiled `/es` in the default (no-env) configuration - the intended deploy
state until 6.H1 lands - reads:

> "Completa este breve formulario y te contactamos para conversar los detalles."
> "Nuestro formulario de brief no esta disponible por el momento."

Two consecutive sentences that contradict each other. The fail-closed mechanism
itself is correct and well argued; the copy above it was not moved into the
branch.

### W16 - The retainer service card links to a grid with no retainer proof

`components/sections/services.tsx` renders the same `proofCta` -> `#proyectos`
on all four cards, including line D. `specs/service-catalog/spec.md`'s
"Retainer line has no project-proof obligation" scenario says it "instead links
to the `trust-signals` commitments block" - `id="retainer"` exists on the
landing and is linked from nowhere.

### W17 - `RETAINER_COMMITMENTS.channels` is still `pending`, so no channels are published

`specs/trust-signals/spec.md` "Retainer Published Commitments" requires
supported channels as a published structured value. Nothing renders in the
compiled retainer section. Honestly tracked as open task 4.H2 - but it is an
unmet spec requirement at the point of deploy, on the one service line whose
entire credibility rests on published commitments (proposal 8.1's dated
correction removed the academy's contribution to it).

### W18 - `trust-signals` "Continuity Evidence Honesty" has no owner and no implementation

A case-insensitive grep for "continuity|continuidad" across `tasks.md`, `lib/`,
`components/` and `app/` returns **zero** matches. The requirement is neither
implemented nor assigned to any task. Proposal 8.2 lists it as signal 3 of 3
for the retainer, and the Blu Cafe / `blu` multi-product relationship it
describes is already true and already on the site - it is simply never stated.
Silently dropped.

### W19 - `trust-signals` "Itemized Maintenance Scope" and the delivered retainer disagree

The spec requires the itemised scope to cover "dependency and security updates,
uptime checks, backups, content edits, and SMALL FEATURES." The delivered
retainer explicitly puts "Funcionalidad nueva" under "Que no incluye". The
content is the studio's real, user-supplied policy and is the right thing to
publish; the spec was never reconciled to it. Third instance of the
artifact-disagreement pattern the prior W10 named.

### W20 - D11's `force-static` is still missing on the landing route

`app/[locale]/precios/page.tsx`, `.../gracias/page.tsx` and
`.../proyectos/[slug]/page.tsx` all declare
`export const dynamic = "force-static"`. `app/[locale]/page.tsx` and
`app/[locale]/layout.tsx` do **not**. D11 says every route is `force-static`,
and design section 6 cites it as the reason a throw during static generation
cannot be swallowed - the guarantee under `assertContentInvariants()`. Nothing
is broken today (the route builds as SSG and injections 1-4 all threw), but
this was the prior report's S7, no task ever owned it, and it becomes
load-bearing the moment a later slice reads a dynamic API. Now inconsistent
within the same route family, which is worse than uniformly absent.

### W21 - Task 1.H1 is still unchecked while its deliverable ships site-wide

`lib/content/contact.ts` states "Task 1.H1 is now closed - the user supplied
the number on 2026-07-31", `WHATSAPP.status === "set"`, and the real number
renders on every page. `tasks.md:143` still shows `- [ ] 1.H1`. Same
bookkeeping class as the prior W11, in a file about to be archived as the
record of what was done.

### W22 - `specs/pricing/spec.md` still references the `[PRICE:*]` string tokens D8 abolished

The prior W10 reconciliation amended `content-model` ("Pricing Module") and
`project-portfolio` ("Portfolio Grid Consistency With Hero"). It did not touch
`specs/pricing/spec.md`'s "Placeholder Discipline" scenario, which still reads
"GIVEN a `[PRICE:*]` or `[CURRENCY]` token still unresolved." No such token
exists anywhere in the design or the implementation. Behaviour is fine (task
4.9's ESLint rule bans those literals); only the spec text is stale.

### W23 - The hero CTA ignores the editorial palette it was restyled around

`components/ui/hover-border-gradient.tsx` hardcodes `bg-black`, `text-white`,
`bg-black/20`, and a `#3275F8` saturated blue hover highlight. `globals.css`
declares the direction as warm paper with "exactly ONE saturated accent"
(terracotta). The site's most prominent CTA is a pure-black pill that flashes
blue. Contrast is fine; design coherence is not, and this is a file the visual
pass explicitly touched (it added `useReducedMotion` to it).

### W24 - Form fields carry no `autocomplete` tokens

`name`, `email` and `phone` inputs have no `autoComplete` attribute. WCAG 2.1
AA 1.3.5 (Identify Input Purpose). One line each, and it also improves
completion rate.

### W25 - The form remounts on every action result, discarding focus

`components/brief/brief-form.tsx:154`: `<form key={JSON.stringify(state)}>`.
Any validation error tears down and rebuilds the whole form, so focus returns
to `<body>`. The `role="alert"` summary with in-page links mitigates it, but
this is a deliberate hack (needed because `defaultValue` is uncontrolled) with
an a11y cost recorded nowhere.

---

## 4. SUGGESTION

**S1.** `checkPendingPricesInProduction` is now **shadowed and effectively
unreachable**. `lib/brief/schema.ts:60,63` reads `PRICES[tier.token].value.amount`
and `PRICES["app-from"].value.amount` unconditionally, so any token flipped to
`pending` is a **type error** before the runtime gate runs - proven twice
(`app-from` and `care-basic`). Stronger enforcement, not weaker. Two notes:
task 4.V6's recorded evidence (real exit 1 citing `Price token "app-from" is
still "pending"`) is no longer reproducible at the tip, because PR 6a landed
that dependency afterwards; and D8's stated reason for rejecting a type-level
price assertion ("would fail EVERY build, including the intermediate ones slice
4 must ship") is now the de-facto behaviour anyway.

**S2.** `sitemap.xml` sets `lastmod` to build time for every URL, so every
deploy claims every page changed. Crawlers learn to ignore `lastmod` when it
behaves this way.

**S3.** No IGV statement anywhere on `/es/precios`. Publishing S/ figures to a
Peruvian audience without saying whether IGV is included is the second most
common source of price disputes after missing exclusions (C4).

**S4.** `PROJECTS`' legacy `link`/`thumbnail` fields still hold
`/es/proyectos/fast-route` and `/es/proyectos/wedding-invitation-piero` (routes
that do not exist) and `thumbnail: ""`. Nothing reads them and no gate sweeps
them - unchanged from the prior report's S4.

**S5.** `next.config.ts`'s redirect comments are stale: "Their destinations do
not exist yet in this PR (precios ships PR 4, gracias/proyectos ship PR 4/PR
5)." All of them exist now.

**S6.** "Precios de lanzamiento para los primeros 5 proyectos del estudio"
reads as "the studio's first 5 projects" on a page whose portfolio section
shows 5 delivered projects. Consider "los proximos 5 proyectos".

**S7.** `.reveal` fires on page load for every section at once, including
sections far below the fold, so the staggered entrance is invisible for most of
them. A scroll-triggered variant (`animation-timeline: view()`) costs nothing
extra and stays CSS-only.

**S8.** Focus-ring visibility is **UNVERIFIED**. `* { @apply outline-ring/50 }`
sets only `outline-color` (about 27% alpha terracotta) with no `outline-style`;
whether the UA focus ring survives that override differs by browser and cannot
be established without one.

---

## 5. Verified correct - stated plainly

Each established by execution, compiled output, a live server, a network fetch,
or direct image inspection.

1. **Both prior CRITICALs are genuinely closed.**
   - **C1 (`blu` capture)**: consent granted; `evidence.state: "gated"` with a
     disclosure. Both the generic login note AND the project's own disclosure
     render - in the landing grid and on the case study (confirmed in compiled
     markup). The `alt` text now accurately describes the authenticated
     dashboard.
   - **C2 (`atemporalarq.com`)**: fetched this session -
     `https://atemporalarq.vercel.app/` returns **200** with title "Atemporal".
     Zero occurrences of `atemporalarq.com` in the built output.
     `luang.com.pe`, `blucafe.vercel.app` and `blucafefinance.vercel.app` also
     all **200**; `electrocode-academy.vercel.app` still **404**, so the
     `no-link` authority state remains correct.

2. **The honest empty states survived the redesign - the highest-risk
   regression did not happen.** `fast-route` (`no-visual`) compiles to a plain
   `<div class=".. cursor-default">` with a service badge, title and summary,
   **zero `<img>` elements**, no frame, no gray box, no anchor, no hover
   affordance. `components/portfolio/evidence.tsx`'s `no-visual` branch returns
   `null` and `DirectionAwareHover` is structurally unreachable from it. The
   `gated` card carries both notes. Design section 8's rule held through the
   visual pass.

3. **The nested-interactive defect is gone.** `HoverBorderGradient` now does
   `const Tag = href ? "div" : as`. A regex scan for an anchor containing
   another anchor or a button across all five compiled pages returns **0** on
   every page.

4. **Zero dead links.** Every `href` in all six compiled pages enumerated and
   checked. Every anchor target exists (`#proyectos`, `#precios`, `#servicios`,
   `#proceso`, `#autoridad`, `#retainer`, `#brief` on the landing;
   `#linea-a/b/c/d` on pricing). All six D2 redirects verified live at 307.

5. **Canonicals are correct.** Root layout deliberately declares none. All five
   routes self-canonicalise. `/es/gracias` carries
   `<meta name="robots" content="noindex, nofollow">` and is absent from the
   sitemap. `_not-found` is `noindex` and no longer canonicalises to `/es` -
   the prior S3 is fixed.

6. **Section order matches `landing-narrative` exactly.** Compiled id sequence
   on `/es`: hero -> `servicios` -> `proceso` -> `proyectos` -> `autoridad` ->
   `precios` -> `retainer` -> `brief`, then `<footer>`. Pricing page matches
   the spec's eight blocks in order.

7. **Route inventory matches proposal section 5.** No `/es/proyectos` index, no
   `/es/contacto`, no `/portfolio` route (redirect only). Phantom locale dead:
   `/xx` -> 404.

8. **Hero is a genuine subset of the grid.** Hero = 4; grid = 5. Exactly the one
   permitted divergence (`no-visual`), enforced by `checkHeroIsSubsetOfGrid`.

9. **No invented number reaches production.** Full numeric scan of the compiled
   landing and both case studies: the landing carries only `01`-`05` (step
   numbers), `2` (revision rounds), `5` (approval days, launch slots), `30`
   (cancellation notice) and the eight user-supplied prices. `luang.html`
   contains **no digits at all**. `blu.html` contains only `15.5.9`, `19.1.0`,
   `4.1.5` - verified stack versions. No percentage, no metric, no testimonial,
   no client quote anywhere. Zero `[PENDIENTE]` markers in any compiled page.

10. **The `blu` case study is factually grounded.** I read the `blu`
    repository's own `src/app` tree: `actividades`, `auditoria`, `categories`,
    `compras`, `estadisticas`, `finanzas`, `horario`, `ingredients`,
    `inventario`, `pedidos`, `products`, `recipes`, `sales`, `users` - matching
    the module list the prose claims, including the audit module the approach
    section leans on. The two unverifiable database-constraint claims removed in
    `0b17f78` are genuinely gone.

11. **Fail-closed brief section works exactly as designed.** With the four env
    vars unset the landing renders the WhatsApp-only path and **no form markup
    at all**. With them set, a real form renders with Next's Server Action
    progressive-enhancement fields and every input correctly labelled (label
    `for` matched to control `id` on all six fields), `required` where required,
    honeypot `aria-hidden` plus `tabIndex={-1}` plus `autoComplete="off"`.
    `submit.ts` places `redirect()` outside any `try` as the last statement.
    `notify.ts` strips CR/LF before anything reaches an email header. Both
    modules are `import "server-only"`.

12. **`/es/gracias` never echoes input** - its component receives only `params`.
    Reads sensibly standalone; makes no claim that a submission was received.

13. **Motion values preserved.** `hero-parallax.tsx` still carries
    `springConfig { stiffness: 300, damping: 30, bounce: 100 }`,
    `translateX [0,1000]`, `translateXReverse [0,-1000]`, `rotateX [15,0]`,
    `opacity [0.2,1]`, `rotateZ [20,0]`, `translateY [-700,50]` and the
    `perspective-[1000px] transform-3d` container. The reduced-motion gate is
    purely additive.

14. **Reduced motion is handled for CSS and for all five motion components.**
    The global reduced-motion media query neutralises every CSS animation and
    transition site-wide; `hero-parallax`, `hover-border-gradient`,
    `text-generate-effect`, `sticky-scroll-reveal` and `direction-aware-hover`
    each call `useReducedMotion()`. The one gap is C5.

15. **W8 is documented honestly, not papered over.** `tasks.md`'s Cross-cutting
    note states the defect, names the three intermediate production states that
    would ship it, explains why history rewriting was rejected, and labels the
    mitigation "a process constraint on whoever performs the merges, not a
    guarantee the code provides on its own." Correct treatment of an accepted
    cost. Confirmed present and accurate; **not** reported as an unfixed defect.

---

## 6. Task classification - 25 unchecked + 1 partial (26 open, not 36)

Counts: 126 complete, 25 unchecked, 1 partial.

| Class | Count | Tasks |
|---|---|---|
| Blocked on user-supplied content or a human action | 11 | 1.H1 (**stale - W21**), 2.H1, 2.H2, 3.H1, 3.H2, 4.H2 (**open spec gap - W17**), 5.5 (**causes C7**), 5.H1 (**would have caught C1**), 5.H2, 6.H1, 6.H2 |
| Deferred by an explicit, documented decision | 3 | 2.27 (locale indication, with a stated trigger), 6.10 (Vercel Firewall - platform config), 6.H3 (BotID) |
| Human browser verification, never performed, honestly noted | 11 | 1.V3, 1.V4, 1.V5, 2.V3, 2.V4, 2.V5, 2.V6, 5.V3, 6.V4, 6.V5, 6.V6 |
| Partial, honestly marked | 1 | 4.V5 (**and now self-contradicting - W3**) |
| **Silently dropped** | 0 in the list | - |

**No task in `tasks.md` is silently dropped.** Every open line carries a
reason. Four items were dropped OUTSIDE the list, which is the more dangerous
shape:

- the `?line=` into `#brief` follow-up, marked `[x]` in three places and never
  reopened after PR 6b made it possible (**W1**);
- design section 8's hero `sizes`/`priority`, never assigned to any task (**W12**);
- D11's `force-static` on the landing route, never assigned (**W20**);
- `trust-signals` "Continuity Evidence Honesty", never assigned (**W18**).

Several closed items are stale rather than wrong: 2.V3/2.V4/2.V5 were closed by
the prior report's live probes and re-confirmed here; 2.V6 is closable now (the
head was inspected - `metadataBase`, canonical and OG all resolve absolute).

---

## 7. Deploy readiness - what breaks if this is pushed today

Assuming only `NEXT_PUBLIC_SITE_URL` is set, which is the stated plan.

**Would ship broken or wrong immediately**

| # | What | Impact |
|---|---|---|
| 1 | **The Luang case study misstates a named client's industry** (C1) | The most likely reader of that page is Luang. Reputational, and the honesty gates could not catch it because it is prose. |
| 2 | **S/80 published as a one-off instead of monthly**; S/1,500 as a fixed price instead of a floor (C3) | Direct commercial exposure, on the landing page. |
| 3 | **Five priced tiers with "exclusions to be defined" and "delivery time to be defined"** (C4) | A published price with no scope boundary is the dispute proposal section 7 warns about; it also reads as an unfinished business. |
| 4 | **The hero headline is blank without JavaScript** (C5) | First impression on the exact mobile audience the design pass cites. |
| 5 | **The Luang case study is unreachable from the site** (C6) | Half of PR 5's content is invisible; the grid sends prospects to the client instead. |
| 6 | **"Pendiente de confirmar" on code ownership** (W3), plus "Forma de pago pendiente de definir" | Three visible "we have not decided" statements on the page that has to close a sale. |

**Would silently do nothing - correctly, by design**

- The brief form does **not** render: `isBriefFormConfigured()` is false without
  `RESEND_API_KEY` / `BRIEF_TO_EMAIL` / `BRIEF_FROM_EMAIL` / `BRIEF_FORM_SECRET`.
  The landing shows the WhatsApp-only path. Verified in the compiled default
  build: zero form markup. This is the honest state and it works - except for
  the contradictory intro copy (W15).
- WhatsApp is live everywhere and is the only working conversion path.

**Would break the moment the remaining human tasks are completed**

| # | Prerequisite | What then breaks |
|---|---|---|
| 1 | Resend **DNS domain verification** (6.H1) - SPF/DKIM on a domain the studio does not own yet; it deploys to a `.vercel.app` subdomain. Until this is done every send fails at the provider. | Nothing yet - the form stays hidden. |
| 2 | Provisioning the four env vars (6.H2) | **C2 activates**: the form renders, and every submission more than 2 hours after each deploy is silently rejected with no message to the visitor. Leads lost with no trace except a `console.error`. |
| 3 | Vercel Firewall rate limit (6.10) - **not configured** | With C2 also disabling the dwell check in the other direction, the public unauthenticated form would have honeypot-only protection. |
| 4 | `notify.ts`'s Resend request shape is **hand-typed and never exercised against the live API** (its own comment says to verify it before the first real send) | UNVERIFIED. |

**Recommended order**: fix C1 and C3 before anything is pushed (both are small
content edits, both are client-facing). Fix C4 by obtaining exclusions and
turnarounds, or by removing the prices until they exist. Fix C5 and C6 (both
small code changes). Do **not** set the four brief env vars until C2 is
resolved - the fail-closed gate is currently the only thing preventing silent
lead loss.

---

## 8. Verification method note

Nothing here was accepted on the strength of an apply report or the prior
verify report. Established by execution:

- `npm run build` (production, with and without `NEXT_PUBLIC_SITE_URL`) and
  `npm run lint`, from a removed `.next`.
- Five fault-injection builds, one per gate, each producing a real non-zero
  exit, each reverted, `git status --porcelain` empty afterwards.
- A live `next start` server probed on 16 paths for status codes, `Location`
  headers, and 404-boundary identification by header/footer presence.
- Full `href` and `id` inventory of all six compiled HTML pages.
- Head inspection per page for title, canonical, hreflang, robots and OG tags.
- Heading outline, landmark inventory, `<img>` attribute inventory and a
  nested-interactive regex scan across all compiled pages.
- HTTP fetches of all five relevant third-party URLs, plus title, meta
  description and heading extraction from `luang.com.pe`.
- Direct visual inspection of `public/projects/luang.png`.
- Inspection of the sibling `blu` and `electrocode-academy` repositories' source
  trees to check stack and course claims.
- WCAG contrast ratios computed from the OKLCH tokens via OKLCH -> linear sRGB
  -> relative luminance, including alpha compositing for `opacity-50`, `/10` and
  `/60` layers.
- A build with the four brief env vars set, to inspect the rendered form and the
  value of the `issuedAt` token against the wall clock.
- `git status --porcelain` confirmed empty at the end of the session.

---

## 9. Contract tables

### 9.1 Testing-evidence reconciliation

Same override as the prior report: `strict_tdd: false`, no runner, absence is an
accepted risk (proposal 2.2 / 11.1). Applying the skill's default "no covering
test implies CRITICAL UNTESTED" rule would produce roughly 60 identical false
CRITICALs and bury the seven real ones. Evidence classes: `VERIFIED-RUNTIME`
(running server / compiled output / fault-injected build / network fetch),
`VERIFIED-STATIC` (source or type inspection), `VIOLATED`, `PARTIAL`,
`UNIMPLEMENTED`, `UNVERIFIED`.

### 9.2 Task completeness

| Group | Total | Complete | Open | Assessment |
|---|---|---|---|---|
| Code tasks, all PRs | 76 | 76 | 0 | Every one maps to real code verified here |
| Automated verification lines | 24 | 24 | 0 | Re-run and confirmed |
| Human/browser tasks | 11 | 0 | 11 | Honestly noted, none silently dropped |
| Human content/decision tasks | 14 | 3 | 11 | 1.H1 stale (W21) |
| Partial | 1 | - | 1 | 4.V5 |

No unchecked IMPLEMENTATION task exists. Task completeness does not block
archive; the seven CRITICAL findings do.

### 9.3 Spec compliance matrix

| Capability | Requirement | Status | Evidence |
|---|---|---|---|
| site-shell | Locale Root Resolution | VERIFIED-RUNTIME | `/` 307 to `/es` 200 |
| site-shell | Brand Metadata | VERIFIED-RUNTIME | compiled title/description/OG |
| site-shell | Header Navigation | VERIFIED-RUNTIME | pricing + `#proyectos` + WhatsApp present |
| site-shell | Footer Navigation (locale indication) | PARTIAL | owned by 2.27, deliberate deferral |
| site-shell | Zero Dead Internal Links | VERIFIED-RUNTIME | full href inventory + 4 fault-injected gates |
| site-shell | Discoverability Files | VERIFIED-RUNTIME | sitemap = 4 real URLs, no `/`, no `/gracias` |
| site-shell | Not Found Handling | VERIFIED-RUNTIME | branded root 404 on 3 paths; locale 404 dead code (W4) |
| content-model | Project Entity / Slug Uniqueness / Evidence Field | VERIFIED-RUNTIME | gates 2-4 |
| content-model | Consent Field Semantics | VERIFIED-RUNTIME | `blu` granted+gated+disclosure; `wedding-invitation-piero` withheld and absent |
| content-model | Service Line Enumeration (proof per line) | VERIFIED-RUNTIME | `checkServiceLineProof` |
| content-model | Pricing Module (`pending` discriminant, amended) | VERIFIED-RUNTIME | injection 5 |
| content-model | Locale Dictionary Structure | VERIFIED-RUNTIME | chrome copy now dictionary-sourced (prior W5 closed) |
| project-portfolio | Curated Set Size (6-8) | **VIOLATED** | **C7** - 5 |
| project-portfolio | Hero Projection / Row Derivation / Motion Values | VERIFIED-STATIC | unchanged spring set; n>=8 split |
| project-portfolio | Conditional Card Link Target | VERIFIED-RUNTIME | internal Link, external anchor with rel |
| project-portfolio | Evidence State Rendering | VERIFIED-RUNTIME | four states in compiled markup |
| project-portfolio | Hero subset of Grid (amended) | VERIFIED-RUNTIME | 4 within 5, sole divergence `no-visual` |
| project-portfolio | No Self-Referential Links | VERIFIED-RUNTIME | gate + inventory |
| landing-narrative | Fixed Section Order | VERIFIED-RUNTIME | compiled id sequence |
| landing-narrative | Hero / Servicios / Proceso / Autoridad / Retainer | VERIFIED-RUNTIME | compiled markup |
| landing-narrative | Proyectos - hands off to case studies | **VIOLATED** | **C6** |
| landing-narrative | Precios Summary Contract | **VIOLATED** | **C3** |
| landing-narrative | Conversion Section | PARTIAL | WhatsApp only in the shipped config (correct); intro copy contradicts it (W15) |
| landing-narrative | Copy Voice (no headcount) | VERIFIED-RUNTIME | no team/employee assertion anywhere |
| service-catalog | Four-Line Catalog / Cross-Surface Consistency | VERIFIED-RUNTIME | ids match across all three surfaces |
| service-catalog | Line-to-Pricing Anchor Mapping | VERIFIED-RUNTIME | `#linea-a/b/c/d` resolve |
| service-catalog | Retainer proof exemption | PARTIAL | links to `#proyectos`, not the commitments block (W16) |
| pricing | Page Block Order | VERIFIED-RUNTIME | 8 blocks in spec order |
| pricing | Fixed Tier Anatomy | **VIOLATED** | **C4** |
| pricing | Line B Contract (turnaround) | PARTIAL | floor/shapes/variables present; turnaround pending (C4) |
| pricing | Line D Contract | VERIFIED-RUNTIME | response tiers, scope, exclusions, cancellation |
| pricing | Placeholder Discipline | VERIFIED-RUNTIME | gate + ESLint rule; spec text stale (W22) |
| pricing | Pre-Tagged CTA | **VIOLATED** | **W1** |
| pricing | FAQ Objection Coverage | **VIOLATED** | **W3** - 3 of 4, and self-contradicting |
| case-study | Case Study Route / 404 | VERIFIED-RUNTIME | 2 pages 200, unknown slug 404 |
| case-study | Mandatory Template Elements | VERIFIED-RUNTIME | all 10 render |
| case-study | Title and Context Honesty | **VIOLATED** | **C1** |
| case-study | Truthful Disclosure Line | VERIFIED-RUNTIME | `blu` renders both notes; `luang` correctly none |
| case-study | No Invented Metric | VERIFIED-RUNTIME | numeric scan: zero metrics |
| case-study | Persuasive Without Images | VERIFIED-RUNTIME | text extraction with markup stripped |
| case-study | Next-Step Block | **VIOLATED** | **W1** - pricing link only, no brief form |
| trust-signals | Academy Placement / No-Link / No-Scale / Upgrade | VERIFIED-RUNTIME | 0 anchors in `#autoridad`; deployment still 404 |
| trust-signals | Retainer Published Commitments | PARTIAL | channels pending (W17) |
| trust-signals | Itemized Maintenance Scope | PARTIAL | spec/implementation disagree (W19) |
| trust-signals | Continuity Evidence Honesty | **UNIMPLEMENTED** | **W18** - no owner, no code |
| trust-signals | No Testimonial Without Consent | VERIFIED-RUNTIME | none exists |
| lead-capture | Brief Form Presence (`#brief`) | VERIFIED-RUNTIME | id present |
| lead-capture | Service Line Pre-Tagging | **VIOLATED** | **W1** - nothing emits `?line=` |
| lead-capture | WhatsApp Escape Hatch | VERIFIED-RUNTIME | real number, live in both branches |
| lead-capture | Submission Validation | VERIFIED-STATIC | pure validator + required attrs; **C2 defeats it in practice** |
| lead-capture | Confirmation Route | VERIFIED-RUNTIME | `/es/gracias` 200, noindex, no echo |
| lead-capture | Backend-Agnostic Contract | VERIFIED-STATIC | one `sendBriefNotification` seam, no DB |

### 9.4 Design coherence (D1-D12)

| # | Coherence | Note |
|---|---|---|
| D1 | COHERENT | Email only, no SDK, no remote DB. Fleet contract intact. |
| D2 | COHERENT | Six redirects verified live at 307. `x-default` inverted - W13. |
| D3 | COHERENT | `/xx` 404; `dynamicParams=false` plus `assertLocale()`. |
| D4 | DEVIATION, JUSTIFIED | `n>=8` split supersedes the illustrative 6 to 3+3; arithmetic verified in the prior report, unchanged. |
| D5 | COHERENT | Header slot; dictionary-sourced. |
| D6 | COHERENT | `isExternalHref` branch; `rel` present. |
| D7 | COHERENT | `typedRoutes: true`; six `as Route` casts, all with honest comments (prior W1 closed). |
| D8 | COHERENT, one corner weakened | `pending` discriminant + gate + ESLint rule. But `notIncluded`/`turnaround` were demoted from non-empty tuples to `Commitment<T>`, which is what allows C4. |
| D9 | COHERENT | File tree matches section 5; zero React imports under `lib/content/`; static image imports. |
| D10 (amended) | COHERENT in structure, **DEFECTIVE in one component** | Six client components as amended; all five motion components gate on `useReducedMotion()`. But `text-generate-effect.tsx` ships an unrecoverable no-JS state - **C5**. |
| D11 | **DEVIATION, unresolved** | `force-static` on 3 of 4 routes; landing and locale layout still lack it - W20 (prior S7). |
| D12 | COHERENT | No `images` block; all media local. |

### 9.5 Proposal section 15 success criteria

| Criterion | Status |
|---|---|
| Zero dead internal links; `/portfolio` and `link: "/"` gone | **MET** (inventory + 4 gates) |
| Metadata carries ElectroCode Studio + non-empty description | MET (per-page titles generic - W14) |
| Four lines on landing, in pricing, with proof each (retainer excepted) | MET |
| From `/es` a prospect can do all five things in section 1 | **PARTIAL** - #4 (start a conversation) is WhatsApp-only by design; #3 (read a case study for their category) fails for Line A, whose only published case study is unreachable (C6) |
| Every curated project renders completely with images disabled | **MET** - the highest-risk regression did not happen |
| No unresolved price placeholder, invented metric, or headcount claim in production | **PARTIAL** - no placeholder, no metric, no headcount; but C1 is an invented FACT, and C3 publishes figures stripped of their meaning |
| Academy presents no link and no scale claim while undeployed | MET (deployment re-confirmed 404) |
| `npm run build` and `npm run lint` clean | MET |
| Adding `en` requires adding a dictionary | MET for pages; design section 3's ~3-file layout cost stands; the `x-default` regression (W13) makes it slightly worse |
| Every case study states its evidence state and a truthful disclosure line | MET structurally - **but C1 makes one of the two case studies untruthful in substance** |

### 9.6 Final verdict

**FAIL - 7 CRITICAL, 25 WARNING, 8 SUGGESTION.**

The routing, redirect, phantom-locale, dead-link, content-model, integrity-gate
and consent work is genuinely excellent, and verified so by execution: five
fault injections, sixteen live route probes, a complete compiled-output
inventory. The honest empty states survived the visual redesign intact, which
was the single largest regression risk going in.

The seven CRITICALs cluster in exactly the two places nobody independently
reviewed. Three are content written rather than derived (C1, C3, C4) - the
class no type system reaches, which the design said itself. Two are the
brand-new visual layer (C5) and the newest server slice (C2). Two are
integration gaps that appeared only once the last slices landed (C6, C7).

C1, C3 and C5 are each a small edit. C2 is a design correction. None is
expensive. All seven are cheaper to fix now than after a prospect sees them.

**Do not archive. Do not push.** Recommended next phase: `sdd-apply`, a
remediation slice covering C1-C6 (C7 stays content-blocked), then re-verify.
