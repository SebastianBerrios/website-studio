# Design: dev-services-website

Change: `dev-services-website`
Phase: `sdd-design`
Artifact store: `openspec` (mirrored in Engram at `sdd/dev-services-website/design`)
Date: 2026-07-31

Authoritative input: `openspec/changes/dev-services-website/proposal.md`.
Verified inventory: `openspec/changes/dev-services-website/exploration.md`.
Fleet contract: `D:\Programming\Frontend\CLAUDE.md`.

This document decides **how** the proposal is built. It writes no specs and no
tasks, and it modifies no source file.

---

## 1. Decision summary

| # | Decision | Core reason |
|---|---|---|
| **D1** | **Brief form = transactional email over the provider's HTTP API. No database, no SDK.** | Leads are third-party PII from real commercial prospects. `mvp-lab` is contractually "demos + localhost only" and graduates *before* the first real user with real data. Persisting leads there violates the fleet contract on day one. |
| **D2** | **`/` → `/es` via `redirects()` in `next.config.ts` (307), not middleware/proxy, not a re-export.** | Zero runtime cost on a 100% static site, no deprecated file convention, `/` never 404s, and `/es` becomes the single canonical landing while only one URL exists in the wild. |
| **D3** | **Unknown first segment 404s via `generateStaticParams` + `dynamicParams = false`, plus a runtime `assertLocale()` that also narrows the type.** | `params.locale` is typed `string` by Next's own typegen (VERIFIED), so types cannot stop `/precios` from rendering a phantom page. `dynamicParams = false` kills it at the routing layer for the whole subtree with zero runtime code. |
| **D4** | **`HeroParallax` derives rows from `products.length`: ≤4 → one row, else `ceil(n/2)` + rest. Third motion track removed. Every spring/transform value preserved.** | 6 → `3+3`, 8 → `4+4`, and today's 4 real assets → a single row of 4 that still overflows every viewport (2160px), so the parallax reads as motion instead of dragging a short row through empty space. |
| **D5** | **Header copy becomes a `header?: React.ReactNode` slot filled by a Server Component.** | Keeps Spanish copy on the server and out of the client bundle, and keeps `HeroParallax` ignorant of copy shape. |
| **D6** | **`ProductCard` branches on link kind: external → `<a target="_blank" rel="noopener noreferrer">`, internal → `<Link>`.** | Fixes the hardcoded `target="_blank"` at `hero-parallax.tsx:151` and adds the currently-missing `rel`, which is a live reverse-tabnabbing defect. |
| **D7** | **`typedRoutes: true`.** | Now a stable top-level config option (VERIFIED). It makes a dead literal internal link a **build failure** — exactly the `/portfolio` bug that shipped — and it is the cheapest net available with no test runner. |
| **D8** | **No `[PRICE:*]` token ever exists as a string. Prices are a discriminated union in an exhaustive `Record<PriceToken, PriceEntry>`; unresolved = a designed `pending` state; production is gated by a throwing build-time assertion.** | Turns "unresolved placeholder in production" from a cosmetic accident into a compile error, a lint error, or a failed build, depending on the failure mode. |
| **D9** | **Content model: locale-keyed prose (`Localized<T>`), locale-invariant facts, long prose behind an `async` loader, media as `StaticImageData` static imports.** | Adding `en` becomes a set of compile errors enumerating the translation debt. A missing image file becomes a build error instead of a silent 404. |
| **D10** | ~~Exactly one new client component (`BriefForm`). Header, footer, and FAQ stay Server Components. `motion` stays confined to the hero; section reveals are CSS-only.~~ **Amended 2026-07-31 (`feat/editorial-design`): six client components total (three new, all small and leaf-level), `motion` used in the hero, "Proceso", and "Proyectos", everything else still CSS-only. See the dated amendment in §7.** | Original reason unchanged for the components it still describes. The amendment's reason: the user asked for a site that impresses, which was the original goal (proposal's own north star) — a plain page with a serif bolted on does not read as "señal de oficio" for an audience that buys with their eyes. |
| **D11** | **`cacheComponents` stays off (default). Every route is `force-static`.** | There is no request-time data anywhere. PPR solves a problem this site does not have, and enabling it could move the integrity assertion out of build time. |
| **D12** | **No `images.remotePatterns`. `next.config.ts` needs no `images` block.** | All media is local under `public/`. Nothing is externally hosted in this change's scope. |

---

## 2. Fork 1 — Brief-form backend

### D1: Transactional email only, over the provider HTTP API, with no persistence

**Decided: email. Not Supabase.** This is not a preference — the fleet contract
forbids the alternative.

#### Why Supabase is rejected

Read against `D:\Programming\Frontend\CLAUDE.md`:

| Fleet rule | How lead persistence collides with it |
|---|---|
| **Graduation**: "`mvp-lab` is demos + localhost only. An app graduates before onboarding the first real user with real data (≈ first paying customer); a product for external clients is born graduated." | Prospect briefs are *real data from real external parties* — names, phone numbers, budgets, business descriptions. A commercial site collecting client PII is exactly what the graduation rule exists to keep out of `mvp-lab`. This alone is decisive. |
| **Rule 5 — authentication is NOT membership** | The form is anonymous. Persisting it requires an INSERT reachable by the anon role on a project whose `auth.users` pool is shared by every app in the fleet. That is precisely the dangerous shape the rule warns about, and it needs abuse controls the site does not have. |
| **Rules 2–4 — migrations only, never `db pull`, RLS on every table** | Honorable, but they buy a schema whose only reader would be the Supabase dashboard. |

**The structural argument, independent of the contract:** there is no read path
in scope. No admin UI, no auth, no lead list. A write-only table is strictly
worse than an inbox, which already has search, threading, and reply-in-place.
A database earns its place when someone needs to *query* leads — that is a later
change with its own graduation decision.

**Note a real conflict for whoever implements this:** the generic
`supabase/SKILL.md` recommends `execute_sql` for iterating on schema and
`supabase db pull` for generating migrations. The fleet contract **bans both**.
If lead persistence is ever revisited, the fleet contract wins.

#### Migration plan if this is ever revisited (PLAN ONLY — do not execute)

Recorded so the reversal is cheap, not because it is authorized.

1. Graduate `website-studio` to its **own** Supabase project first. Do not add a
   schema to `mvp-lab`. See `mvp-lab-infra/graduation/RUNBOOK.md`.
2. `supabase migration new create_leads` (never invent the filename).
3. One table `leads` in a **non-exposed** schema, so the Data API cannot reach it
   at all. RLS enabled anyway as defense in depth, with **no** policy for `anon`
   or `authenticated`.
4. Writes go through the Server Action using the secret key server-side only.
   Never `NEXT_PUBLIC_`.
5. `supabase db push`. Never the Supabase MCP, never raw `execute_sql`, never
   `db pull`.
6. Rollback = a paired down migration, written in the same PR.

#### Architecture of the chosen path

```
components/brief/brief-form.tsx      "use client"  — useActionState, inline errors
lib/brief/schema.ts                  pure         — field rules + validate()
lib/brief/submit.ts                  "use server" — the Server Action
lib/brief/notify.ts                  server-only  — the ONLY provider-aware module
lib/brief/abuse.ts                   server-only  — honeypot, timing, caps
```

`notify.ts` exports one function:

```ts
export async function sendBriefNotification(brief: Brief): Promise<
  { ok: true } | { ok: false; reason: 'provider' | 'config' }
>;
```

That signature is the **reversibility seam**. Adding persistence later means
adding a second adapter behind the same call site in `submit.ts`; the form, the
validator, and the confirmation route do not change.

**No SDK.** `notify.ts` uses `fetch` against the provider's REST endpoint.

- Rejected: `resend` npm package. It would add a dependency, a version surface,
  and a lockfile change to send one POST. `fetch` keeps `package.json` untouched
  and the provider swappable in one file.
- Cost: request/response shapes are hand-typed and can drift with the provider's
  API. Acceptable for a single endpoint.

Environment (all server-only, none `NEXT_PUBLIC_`):

| Var | Purpose |
|---|---|
| `RESEND_API_KEY` | Provider auth |
| `BRIEF_TO_EMAIL` | Destination inbox |
| `BRIEF_FROM_EMAIL` | Sender on a **verified domain** |

**Setup dependency to surface now:** the `from` address requires domain
verification (DNS records) with the provider. Until that is done, every send
fails. This is a human task, like the screenshots.

#### Spam and abuse on a public, unauthenticated form with no captcha

Four layers, cheapest first. Layers 1, 3, and 4 need no platform features.

| # | Layer | Catches | Does not catch |
|---|---|---|---|
| 1 | **Honeypot + minimum dwell time.** A visually-hidden field that must stay empty, plus a server-signed timestamp (HMAC over `issuedAt` with a server secret) in a hidden field; reject submissions faster than ~3s or older than ~2h. | Naive bots and form-fillers. | Anything that renders the page and waits. |
| 2 | **Platform rate limiting.** Vercel Firewall rate-limit rule on the action path, per IP. Optionally **Vercel BotID** (invisible, no user-facing challenge) if abuse actually appears. | Volume floods, scripted bursts. | A single motivated human. |
| 3 | **Hard input caps + strict allowlists.** Max length on every field; `serviceLine` and `budgetBand` validated against the same TypeScript unions the site renders from; reject a message containing more than N URLs. | Payload-stuffing, SEO spam, oversized bodies. | Plausible-looking junk. |
| 4 | **Output hardening.** Strip CR/LF from every field that reaches an email header (**header-injection defense** — the `Reply-To` carries user input). Send the body as plain text or an escaped template. `/es/gracias` **never echoes submitted input**. | Header injection, content injection, stored reflection. | — |

Do **not** rely on an in-memory rate-limit counter: serverless instances are not
shared, so it silently does nothing. Rate limiting belongs at the platform edge.

`server-auth-actions` from the Vercel guidance says authenticate Server Actions
like API routes. This one is intentionally public; the abuse layers above are its
substitute, and that is a deliberate exception, not an oversight.

#### The honest cost of choosing email

If the provider call fails, the lead is gone. Mitigations, both explicit:

1. The action does **not** redirect on failure. It returns an error state that
   re-renders the form with the submitted values preserved and shows the WhatsApp
   path as the fallback.
2. The action writes the payload to `stderr` on failure, so it lands in Vercel
   logs. That is the only durability this design has, and log retention is finite.

---

## 3. Fork 2 — `/` → `/es`, and the phantom-locale gotcha

### D2: `redirects()` in `next.config.ts`

```ts
async redirects() {
  return [
    { source: '/',                 destination: '/es',                 permanent: false },
    { source: '/precios',          destination: '/es/precios',         permanent: false },
    { source: '/gracias',          destination: '/es/gracias',         permanent: false },
    { source: '/proyectos/:slug',  destination: '/es/proyectos/:slug', permanent: false },
    { source: '/portfolio',        destination: '/es#proyectos',       permanent: false },
    { source: '/:locale(es)/proyectos', destination: '/:locale#proyectos', permanent: false },
  ];
}
```

Config redirects are evaluated **before** the filesystem, so `/precios` never
reaches `app/[locale]/page.tsx`.

Two notes for whoever applies this:

- `/portfolio` is included on purpose. It is the URL that has been 404ing in
  production; it may exist in a browser history or an index. Redirect it, do not
  leave it dead.
- A `#fragment` in a `destination` is a `Location`-header value. It should work,
  but it is **not verified here** — confirm the two anchor redirects behave
  before relying on them, and fall back to landing on `/es` without the anchor.

#### Alternatives rejected

| Option | Why rejected |
|---|---|
| **Middleware rewrite** | `middleware.ts` is **deprecated in Next 16.1.1 in favour of `proxy.ts`** — VERIFIED in `node_modules/next/dist/build/index.js:611`, which emits `warnOnce("The \"middleware\" file convention is deprecated. Please use \"proxy\" instead")`, and in `next/dist/server/web/types.d.ts` (`@deprecated Use ProxyConfig instead. Middleware has been renamed to Proxy.`). Beyond the naming churn, a rewrite makes `/` and `/es` both serve 200 with identical content — duplicate content requiring canonical cleanup — and puts an edge function invocation in front of a site that is otherwise 100% static CDN output. Rejected as cost without benefit. |
| **Root `app/page.tsx` calling `redirect('/es')`** | Functionally equivalent to D2 but pays for a React render to emit a `Location` header, and it reintroduces a root page whose existence must be reasoned about against `app/[locale]/page.tsx`. Config redirects are strictly cheaper. |
| **Root-level re-export of the locale landing** | Worst option. Two URLs serving byte-identical content, duplicate `metadata` to keep in sync, an ambiguous layout story, and a permanent canonical problem. |
| **`permanent: true` (308)** | Rejected for now. Browsers cache 308 aggressively and it is effectively irreversible for returning visitors. With a future `en` locale and a possible default-locale change, `307` keeps the door open; search engines still consolidate signals onto `/es`. Revisit once the locale set is final. |

#### SEO consequences, stated

- `/` returns 307 and `/es` becomes the canonical landing. **`/` never breaks** —
  it always resolves to a live page. This is the right moment: `/` is the only
  URL in the wild, matching the proposal's slice-2 timing argument.
- `metadataBase` must be set in the root layout (`NEXT_PUBLIC_SITE_URL`), or
  canonical and OG URLs render relative and are useless to crawlers.
- Every page sets `alternates: { canonical: '/es/...', languages: { es: '/es/...', 'x-default': '/es' } }`.
  With one locale `hreflang` is optional; `x-default` is what makes adding `en`
  a one-entry change.
- **The sitemap lists only `/es/...` URLs.** Never `/`. A redirecting URL in a
  sitemap is a soft error.
- `/es/gracias` gets `robots: { index: false, follow: false }` and is **excluded
  from the sitemap**. A thank-you page in the index is a leak, not a landing page.
- OG image: reference `openGraph.images` from a content constant and **omit it
  entirely while no asset exists.** A 404ing OG image is worse than none — the
  same honesty rule as the `no-visual` evidence state.

### D3: The phantom-locale gotcha — `/precios` must not render `locale = "precios"`

This is real and the proposal missed it. `app/[locale]/` matches **any** single
first segment.

**Why types cannot save you here — VERIFIED.** Next 16 generates
`PageProps<'/[locale]'>` from a `ParamMap`, and
`node_modules/next/dist/server/lib/router-utils/typegen.js:97-126` types every
non-repeating dynamic param as plain `string`, never a literal union. There is no
type-level defence.

Three layers, and each does a different job:

| Layer | Mechanism | Job |
|---|---|---|
| **1. Routing** | `generateStaticParams()` in `app/[locale]/layout.tsx` returns `LOCALES.map(locale => ({ locale }))`, plus `export const dynamicParams = false` on that layout. | Any first segment not in `LOCALES` 404s for the **entire subtree**, with zero runtime code. `dynamicParams?: boolean` is confirmed supported in `next/dist/build/segment-config/app/app-segment-config.d.ts:59`. |
| **2. Helpfulness** | The `redirects()` entries in D2. | The *known* unprefixed paths a human might guess (`/precios`, `/gracias`, `/proyectos/x`) get sent to their locale-prefixed home instead of 404ing. |
| **3. Runtime + typing** | `assertLocale(value: string): Locale` in `lib/content/locales.ts`, called at the top of `app/[locale]/layout.tsx`; calls `notFound()` on a miss. | Two jobs: it defends dev mode and future config drift, **and** it is the boundary that narrows `string` → `Locale`. Every downstream function then takes `Locale`, not `string`. This is why both layer 1 and layer 3 exist and neither is redundant. |

Behaviour for an unknown first segment: **404**, not a redirect to `/es`. A
guessed-wrong URL should say so; silently rewriting it to the landing pollutes
analytics and lets typos accumulate in the index.

#### `generateStaticParams`, `metadata`, and the sitemap against the validated set

`LOCALES` is the single source of truth for all three.

| Surface | Shape |
|---|---|
| `app/[locale]/layout.tsx` | `generateStaticParams() => LOCALES.map(locale => ({ locale }))` + `dynamicParams = false` |
| `app/[locale]/proyectos/[slug]/page.tsx` | `generateStaticParams({ params }: { params: { locale: Locale } })` returns `publishableSlugs().map(slug => ({ slug }))`. It receives the parent's already-resolved params, so it does not re-enumerate locales. |
| `generateMetadata` | Reads the dictionary via `getDictionary(assertLocale(locale))`. Builds `canonical`/`languages` from `LOCALES`. |
| `app/sitemap.ts` | Cross-product of `LOCALES` × (`''`, `precios`, `proyectos/{slug}` for each publishable project). Excludes `gracias`. |

**Asymmetry to flag, VERIFIED** in
`node_modules/next/dist/build/webpack/plugins/next-types-plugin/index.js:121-129`:
`generateStaticParams` receives a **plain** `{ params }` object, while pages,
layouts, and `generateMetadata` receive `params` as a **`Promise`** that must be
awaited. Mixing these up is a silent bug: awaiting a non-promise works, and
forgetting to await a promise yields a `Promise` object where a string was
expected.

#### Layout and 404 boundaries

**Decision:** keep `app/layout.tsx` as the root layout, rendering
`<html lang={DEFAULT_LOCALE}>`. `app/[locale]/layout.tsx` nests inside it and
owns the header, footer, dictionary, and the locale assertion.

- Today `Locale = 'es'` and `DEFAULT_LOCALE = 'es'`, so `lang="es"` is correct
  for 100% of pages. No correctness debt is being taken on now.
- `app/not-found.tsx` (root) handles the `dynamicParams = false` 404s. It renders
  inside the **root** layout, so it cannot use the locale dictionary — it must be
  locale-neutral or default to Spanish, and must not assume header/footer chrome.
- `app/[locale]/not-found.tsx` handles in-locale 404s (a bad case-study slug),
  keeps the full chrome, and uses the dictionary. This covers every realistic
  404 with a good page.
- **Rejected alternative:** promoting `app/[locale]/layout.tsx` to *be* the root
  layout (owning `<html lang={locale}>`) with no `app/layout.tsx`. It is the
  cleaner end state for multi-locale, but which `not-found` boundary Next renders
  when the root-layout segment itself fails to match is **not verified here**, and
  betting the 404 story on unverified boundary resolution is a bad trade for a
  benefit that only materialises when `en` ships.
- **Documented future cost:** adding `en` requires moving `<html>`/`<body>` down
  into the locale layout — roughly three files, all layouts and 404s. **No route
  page moves and no URL changes**, so the proposal's success criterion ("adding
  `en` requires adding a dictionary — no route files move") holds for pages. Be
  precise about this rather than claiming zero cost.

---

## 4. Fork 3 — `HeroParallax` row derivation

Constraint honoured: **every `useSpring`/`useTransform` value and the perspective
entrance are unchanged.** Only row derivation, the copy source, and the card's
link/image handling change.

### D4: Row derivation

Replace the three fixed slices:

```ts
// before: needs 15 entries
const firstRow  = products.slice(0, 5);
const secondRow = products.slice(5, 10);
const thirdRow  = products.slice(10, 15);
```

with a length-driven split:

```ts
const SINGLE_ROW_MAX = 4;
const splitAt = products.length <= SINGLE_ROW_MAX
  ? products.length
  : Math.ceil(products.length / 2);
const firstRow  = products.slice(0, splitAt);
const secondRow = products.slice(splitAt);
```

The third `motion.div` track is deleted. `translateX` drives row 1 (it drove rows
1 and 3 before), `translateXReverse` drives row 2. Both variables remain
referenced, so no unused-binding lint error. Row 2 renders only when
`secondRow.length > 0`.

| Curated count | Rows | Widest row |
|---|---|---|
| 4 (today's real assets) | `4` | 2160px |
| 5 | `3 + 2` | 1600px |
| 6 | `3 + 3` | 1600px |
| 7 | `4 + 3` | 2160px |
| 8 | `4 + 4` | 2160px |

**Why the `≤4 → one row` threshold is not arbitrary.** Card width is `w-120` =
480px with `space-x-20` = 80px gaps (Tailwind v4, `--spacing: 0.25rem`). The
`translateX` range is `[0, 1000]px`, tuned for the original 5-card row
(≈2720px), which overflows every viewport — so the slide reads as *parallax*.
A 2-card row is 1040px, which does **not** overflow a 1440px viewport; sliding it
1000px would visibly drag a short row across empty space. 4 cards = 2160px still
overflows comfortably. The threshold is the point where the preserved spring
values stop reading correctly.

**Honest visual consequence the user must know:** removing the five duplicate
entries drops the hero from a 9-slot illusion to **4 real entries in one row**
until captures land. It will look lighter. That is the cost of the curation
decision they already made, and it is the correct trade — but it should not be a
surprise at review time. The hero reaches its intended `4+4` density once four to
five captures exist (proposal §10). **Target 8 curated entries for visual
fidelity; 6 is the floor.** Row layout is centered so a short row slides
symmetrically rather than pulling away from one edge; the container is already
`overflow-hidden`, so the failure mode is empty gutters, not a broken layout.

No `useMemo` around the slices — 8 items is trivial work and memoising simple
expressions costs more than it saves.

### D5: Header becomes a slot

`HeroParallax` gains `header?: React.ReactNode`. The hardcoded Spanish strings at
`hero-parallax.tsx:104-127` move to `lib/dictionaries/es.ts` under a `hero` key,
and a new **Server Component** `components/sections/hero-header.tsx` reads the
dictionary and renders the title, subtitle, and CTA.

- Passing a server-rendered subtree as a prop into a client component is the
  standard slot pattern and keeps the dictionary out of the browser bundle
  (`server-serialization`).
- The CTA `href` comes from the dictionary/props, not the component. Its value is
  the landing portfolio anchor, **not** `/portfolio`.
- `HoverBorderGradient` stays a client component (it owns `useState`/`useEffect`);
  a Server Component may render it.

### D6: Conditional link target

```ts
// lib/links.ts — pure
export function isExternalHref(href: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(href) || /^(?:mailto|tel):/i.test(href);
}
```

`ProductCard` branches:

| Kind | Rendered as |
|---|---|
| external | `<a href={link} target="_blank" rel="noopener noreferrer">` |
| internal | `<Link href={link as Route}>` — client-side navigation and prefetch |

Two live defects fixed in the same edit:

1. `target="_blank"` at `hero-parallax.tsx:151` is **unconditional**, which is
   wrong the moment `link` points at `/es/proyectos/...`.
2. That same anchor has **no `rel`**. `target="_blank"` without
   `rel="noopener noreferrer"` is a reverse-tabnabbing exposure that ships today.

The prop contract `{ title, link, thumbnail }` is preserved exactly — link kind is
**derived**, not added as a field, so no call site changes.

---

## 5. Content model

### D9: Shape and placement

```
lib/
  content/
    locales.ts        Locale union, LOCALES, DEFAULT_LOCALE, isLocale, assertLocale
    types.ts          Localized<T>, Project, Evidence, Consent, Outcome, MediaAsset
    service-lines.ts  ServiceLine union + SERVICE_LINES
    pricing.ts        Currency, PriceToken, Money, PriceEntry, PRICES, DISPLAY_CURRENCY
    retainer.ts       RETAINER_COMMITMENTS
    authority.ts      ACADEMY authority block (discriminated by link state)
    contact.ts        WHATSAPP, business contact details
    projects/
      index.ts        PROJECTS: readonly Project[]   — metadata only, no long prose
      media.ts        static imports -> StaticImageData, keyed by asset id
      approach/
        <slug>.ts     long prose, one module per project
        loader.ts     getProjectApproach(slug): Promise<ApproachContent>
    projections.ts    toHeroProducts(), toPortfolioCards(), publishableProjects()
    invariants.ts     assertContentInvariants()  — import "server-only"
  dictionaries/
    types.ts          Dictionary shape
    es.ts             the Spanish dictionary
    index.ts          getDictionary(locale: Locale): Dictionary
  brief/              schema.ts, submit.ts, notify.ts, abuse.ts
  links.ts            isExternalHref, caseStudyPath, pricingPath, landingAnchor
  utils.ts            existing cn()
```

**Hard constraint on `lib/content/**`: zero React imports.** These are data
modules. It keeps them importable from anywhere (including a build-time checker),
keeps them out of client bundles, and makes the invariant assertion trivially
runnable.

### Dictionary vs content — the dividing line

| Lives in the dictionary | Lives in a content module |
|---|---|
| Section headings, labels, button text, form labels, validation messages, nav items, footer copy, FAQ questions and answers, process step descriptions | Domain facts: project slugs, stacks, evidence states, consent, order, prices, service-line ids, retainer commitments |

Where a content module holds prose, that prose is **locale-keyed**, not moved to
the dictionary — because it belongs to the entity, not to the chrome.

```ts
export type Localized<T> = Record<Locale, T>;
```

Locale-keyed: `summary`, `problem`, `role`, `outcome.statement`, `disclosure`,
`media[].alt`. Locale-invariant: `slug`, `serviceLine`, `stack`, `order`,
`featured`, `evidence`, `consent`, `externalUrl`, `media[].asset`.

**Why this is the load-bearing i18n decision.** With `Locale = 'es'`,
`Localized<string>` is a one-key object — nearly free today. The day `en` is added
to the union, **every un-translated field becomes a compile error**, and the error
list *is* the translation backlog. That is a far stronger realisation of "adding
English requires adding a dictionary" than a convention someone has to remember.
Cost: `{ es: "..." }` noise at every prose site. Worth it.

### Prose isolation — the MDX seam

The invariant is that swapping prose for MDX must not reshape the model.
Therefore `Project` holds **no** long prose at all:

```ts
// resolved separately, never on the entity
export async function getProjectApproach(slug: ProjectSlug): Promise<ApproachContent>;
```

The signature is **`async` today even though the implementation is a static
module map.** That is the whole point: an MDX/`velite` implementation is also
async, so replacing the loader body later changes one file and no consumer.
Making it sync now would leak the storage choice into every call site.

`summary`, `problem`, and `outcome` stay as short strings on the entity. If they
grow long, they move behind the same loader — the seam already exists.

### The hero receives a projection

```ts
export function toHeroProducts(locale: Locale): HeroProduct[];
// HeroProduct = { title: string; link: string; thumbnail: string }
```

| Field | Derivation |
|---|---|
| `title` | `client` when consent is `granted` and named, else the anonymised label |
| `link` | `externalUrl` when `evidence === 'live'`, else `caseStudyPath(locale, slug)` |
| `thumbnail` | primary media's `.src` |

Filter: `featured` **and** publishable under `consent` **and** has at least one
media asset. **A `no-visual` project never enters the hero** — the hero is an
image grid, and a text card inside a parallax row is incoherent. Those projects
appear in the portfolio grid instead, where the text-only card is a designed
state.

`thumbnail` stays a `string` (`.src` off `StaticImageData`) to preserve the prop
contract. Cost: the hero loses intrinsic dimensions and a blur placeholder — but
`hero-parallax.tsx` already hardcodes `height={600} width={600}`, so nothing is
lost relative to today.

### Types that make dishonesty a compile error

This is where the copy rules from proposal §4.4, §7, §8 stop being checklist items.

| Rule from the proposal | Type that enforces it |
|---|---|
| "Never invent a metric" | `Outcome = { kind: 'metric'; value: string; source: string } \| { kind: 'qualitative'; statement: Localized<string> }`. **A metric without a `source` does not compile.** |
| "Omitting exclusions is what turns a fixed price into a dispute" | `PricingTier.notIncluded: readonly [string, ...string[]]` — a **non-empty tuple**. An empty exclusions list is a compile error. Same for `RETAINER_COMMITMENTS.excludedScope`. |
| Every fixed tier communicates the same anatomy | All seven anatomy fields (`audience`, `deliverables`, `included`, `turnaround`, `revisionRounds`, `price`, `notIncluded`) are **required**. A half-specified tier is a compile error. |
| Academy block claims no scale and shows no link while undeployed | `Authority = { state: 'no-link'; ... } \| { state: 'linked'; url: string; ... }`. The `url` field **only exists** in the `linked` variant, so the anchor can only be rendered in that branch. There is **no field** for student or course counts, so a scale claim is inexpressible. |
| Retainer commitments are published, not promised | Every field of `RetainerCommitments` is required: `responseWindow`, `channels`, `monthlyHours`, `includedScope`, `excludedScope`, `cancellationTerms`. A missing commitment is a compile error, not an empty section. |
| Consent gates client identification | `Consent = { status: 'granted'; namedClient: boolean } \| { status: 'anonymised'; industry: string; size: string } \| { status: 'withheld' }`. The anonymised variant **requires** industry and size, so an anonymised card cannot render blank. `withheld` projects are excluded from `publishableProjects()`. |
| Evidence state matches reality | `Evidence` is a discriminated union: `live` requires `externalUrl`; `gated` requires media **and** a `disclosure`; `not-deployed` requires media; `no-visual` requires `media: readonly []`. A half-filled state cannot be expressed. |

The one rule types cannot reach is the fabricated-headcount ban (§4.4) — it is a
property of free prose. That stays a copy-review checklist item, and the design
does not pretend otherwise.

---

## 6. Placeholder discipline and integrity gates

### D8: `[PRICE:*]` is a state, not a string

**There is no `[PRICE:*]` token in this design.** A string token in copy can only
ever be detected by scanning text, which is the weakest possible enforcement.
Instead, prices are data with an explicit unresolved state:

```ts
export type PriceToken =
  | 'landing-basic' | 'landing-standard' | 'landing-premium'
  | 'microsite-basic' | 'microsite-event'
  | 'app-from'
  | 'care-basic' | 'care-standard';

export type Money = { readonly amount: number; readonly currency: Currency };
export type PriceEntry =
  | { readonly status: 'set';     readonly value: Money }
  | { readonly status: 'pending'; readonly note?: string };

export const PRICES = {
  'landing-basic': { status: 'pending' },
  // ...
} as const satisfies Record<PriceToken, PriceEntry>;
```

`satisfies Record<PriceToken, PriceEntry>` gives three compile-time guarantees:
no token can be missing, no unknown token can be added, no entry can be
malformed. `as const` preserves the literal `status` types so pending tokens are
derivable at the type level.

Rendering goes through exactly one Server Component:

```tsx
<Price token="landing-basic" />
```

It switches exhaustively on `status`. The `pending` branch renders
`<PricePending token={token} />` — a **deliberately loud, designed** element
(dashed outline, `PRECIO PENDIENTE`, the token name), never bare text and never a
gray box passed off as a number. Because the appearance is designed, an
unresolved price is impossible to overlook in dev or preview. **No invented
number can appear anywhere**, because no component accepts a numeric literal.

### Four enforcement layers, and exactly what each cannot catch

With no test runner, honesty about coverage matters more than the number of gates.

| # | Mechanism | Runs on | Catches | **Cannot catch** |
|---|---|---|---|---|
| 1 | **Type level** — `satisfies Record<PriceToken, PriceEntry>`, exhaustive `switch` on `status`, non-empty tuples, discriminated unions (§5) | `tsc` during `npm run build` | Missing token, unknown token, malformed entry, unhandled `pending` branch, tier missing exclusions, metric without a source, link rendered in the `no-link` authority state | **That `status` is `'pending'` at deploy time.** A type-level assertion over `PendingTokens` would fail *every* build, including the intermediate ones slice 4 must ship before prices exist. Rejected for that reason. |
| 2 | **Build-time prerender assertion** — `await assertContentInvariants()` at the top of `app/[locale]/layout.tsx` (and in `app/sitemap.ts`), `import "server-only"`, throws in strict mode | `next build`, once per prerendered locale | Pending price or undecided currency reaching production; duplicate slugs; an internal link resolving to `/` or `/{locale}`; a service line with no proof; an evidence state whose media does not match; an empty `Localized` value; a published project with empty `approach`; hero projection below 4 entries | Anything in dev or preview — by design it **warns** there instead of failing, so intermediate slices stay shippable. Also nothing after build: this is a build gate, not a runtime one. |
| 3 | **`typedRoutes: true`** (D7) | `tsc` during `npm run build` | A `<Link href="...">` or `redirect()` to a **literal** internal path that does not exist — the exact `/portfolio` bug | Data-driven hrefs. `product.link` is `string`; typed routes accept literals, template literals, and `${string}:${string}` protocol URLs, but not a bare `string`. Covered instead by layer 2 invariant 4. |
| 4 | **ESLint `no-restricted-syntax`** banning the literals `[PRICE:` and `[CURRENCY]` in `app/**`, `components/**`, `lib/dictionaries/**` | `npm run lint` | Someone typing a price placeholder into copy instead of using `<Price>` | Strings assembled at runtime, and any wording that is not those two tokens. |

**Why the assertion lives in a prerendered Server Component and not in a script:**

- A standalone `node` checker cannot read TypeScript content modules without
  either `--experimental-strip-types` (Node-version dependent, breaks `@/` alias
  resolution) or a new build dependency. Both rejected.
- Putting it in `next.config.ts` **would** work today: `transpileConfig` runs the
  config through SWC with `paths`/`baseUrl` taken from `tsconfig.json` and
  registers a require hook so imported `.ts` files transpile too
  (`node_modules/next/dist/build/next-config-ts/transpile-config.js:18-45,137-162`).
  But the same file shows a second path — when Node's native TS loader is active
  it does a plain `import()` with **no tsconfig path mapping**
  (`transpile-config.js:96-118`). Depending on that fork is fragile. **Rejected,
  with evidence.**
- The chosen approach needs no dependency, no script, no config-loader
  assumptions. Every route is statically prerendered, so a throw during static
  generation fails `next build` deterministically. `export const dynamic = 'force-static'`
  on the pages guarantees there is no dynamic fallback that could swallow it.

**Strict-mode trigger:** strict when `process.env.VERCEL_ENV === 'production'`,
unless `SITE_CONTENT_GATE=warn` is set explicitly. That escape hatch exists for a
genuine emergency deploy and logs loudly when used. Naming it here is better than
pretending no one will ever need it.

**Free integrity check worth naming:** because media are **static imports**
(D9/§7), a missing image file is a **build error**. String paths like
`"/projects/luang.png"` fail silently as a runtime 404. Same class of bug as
`/portfolio`, same class of fix.

---

## 7. Component architecture

### D10: Client components — exactly one is new (superseded — see amendment below)

```
components/
  layout/     site-header.tsx        SERVER
              site-footer.tsx        SERVER
  sections/   hero-header.tsx        SERVER  (slot into HeroParallax)
              services.tsx           SERVER
              process.tsx            SERVER
              portfolio.tsx          SERVER
              authority.tsx          SERVER
              retainer.tsx           SERVER
              pricing-summary.tsx    SERVER
              brief.tsx              SERVER  (wraps the client form)
  portfolio/  project-card.tsx       SERVER
              evidence.tsx           SERVER  (switches on evidence state)
              service-badge.tsx      SERVER
  pricing/    price.tsx              SERVER
              price-pending.tsx      SERVER
              tier-card.tsx          SERVER
              quote-block.tsx        SERVER
              terms-table.tsx        SERVER
              faq.tsx                SERVER  (native <details>/<summary>)
  case-study/ case-study-layout.tsx  SERVER
              disclosure-note.tsx    SERVER
  brief/      brief-form.tsx         CLIENT
              field.tsx              SERVER
  ui/         hero-parallax.tsx      CLIENT  (existing)
              hover-border-gradient.tsx CLIENT (existing)
              text-generate-effect.tsx  CLIENT (new, D10 amendment below)
              sticky-scroll-reveal.tsx  CLIENT (new, D10 amendment below)
              direction-aware-hover.tsx CLIENT (new, D10 amendment below)
```

| Component | Client? | Why |
|---|---|---|
| `hero-parallax.tsx` | yes (existing) | `useScroll`, `useSpring`, `useTransform`, `useRef` — needs a scroll container in the browser. |
| `hover-border-gradient.tsx` | yes (existing) | `useState`, `useEffect`, `setInterval`. |
| `brief-form.tsx` | **yes (new)** | `useActionState` for pending/error state and eager field feedback. |
| `site-header.tsx` | **no** | Five links, no auth state, no theme toggle in scope. If a mobile menu is wanted, use a CSS-only disclosure (`<details>` or a peer checkbox) — not a JS toggle. Keeping the header on the server is the difference between zero and non-zero JS on the pricing page. |
| `faq.tsx` | **no** | Native `<details>/<summary>`. Accessible and keyboard-operable for free. **Rejected:** a Radix/shadcn accordion — it buys an animation and costs a client boundary plus a dependency. |

**Motion budget.** `motion` stays confined to `hero-parallax.tsx`. Section reveals
use CSS only via the already-installed `tw-animate-css` plus
`@starting-style`/scroll-driven animations. One orchestrated, staggered page-load
reveal per section beats scattered JS micro-interactions, and it keeps the
landing's JS essentially flat against today's while adding nine sections.

---

#### D10 amendment — 2026-07-31, `feat/editorial-design`

**What changed.** This slice is a deliberate visual-design pass ("Editorial
claro — señal de oficio") requested after the site was functionally complete
and verified. The user asked for a site that *impresses* — the original
proposal's own stated goal (a portfolio that wins architecture studios and
specialty cafés, who buy with their eyes) — and reviewed the plain,
system-font, un-typeset landing this design produced and judged it too timid
to serve that goal. D10 as written was correct for the functional slice: it
kept a page with no sales narrative yet from acquiring a JS budget it hadn't
earned. It is no longer the complete rule once the explicit deliverable is
the visual layer itself.

**Why the reversal is not a contradiction of D10's own reasoning.** D10's
core argument — that a client boundary must be earned, not defaulted to — is
kept, not abandoned. Every new client component below is small, leaf-level,
and justified by a specific animation need `next/font`/CSS alone cannot
satisfy (a staggered word-by-word reveal timed to mount, a scroll-linked
sticky panel, a pointer-direction read on hover). None of them fetch data,
own business logic, or grow beyond the one animation they exist for — the
dictionary/content-module boundary from §5 is unchanged: copy and domain
facts are still read on the server and passed down as plain props, per each
new component's own doc comment.

**The new rule.**

| Component | Client? | Why |
|---|---|---|
| `hero-parallax.tsx` | yes (existing) | Unchanged — scroll-linked transforms. |
| `hover-border-gradient.tsx` | yes (existing) | Unchanged — hover state + an auto-rotating interval, now gated behind `useReducedMotion()`. |
| `brief-form.tsx` | yes (existing) | Unchanged — `useActionState`. |
| `components/ui/text-generate-effect.tsx` | **yes (new)** | The hero's one orchestrated entrance: a staggered, blur-in word reveal timed to mount via `useAnimate`/`stagger`. Adapted from Aceternity UI's Text Generate Effect. No dictionary/content import — receives plain strings as props. |
| `components/ui/sticky-scroll-reveal.tsx` | **yes (new)** | "Proceso"'s five phases, read by scroll: `useScroll({ container })` + `useMotionValueEvent` drives which phase is "active" in a sticky panel. Adapted from Aceternity UI's Sticky Scroll Reveal, restyled onto this site's own paper/ink tokens. Receives a plain `StickyScrollItem[]` built server-side in `process.tsx` — no dictionary or content-module import. |
| `components/ui/direction-aware-hover.tsx` | **yes (new)** | "Proyectos" grid cards: a pointer-direction-aware image pan on hover. Adapted from Aceternity UI's Direction Aware Hover, retargeted from a plain `imageUrl: string` to this project's `StaticImageData` media contract (§8) so the "missing file is a build error" guarantee survives. Used only from `evidence.tsx`'s image-bearing branches (`live`/`gated`/`not-deployed`) — the `no-visual` state has no image and structurally never reaches this component. |
| `site-header.tsx`, `faq.tsx`, every `sections/*`/`pricing/*`/`portfolio/*`/`case-study/*` component | **no** | Unchanged — still Server Components. The visual pass restyles their markup and CSS-only `.reveal` animation, not their client/server boundary. |

Six client components total (three pre-existing and unchanged in kind, three
new). **Motion library usage** moves from "confined to the hero" to
"confined to the hero, Proceso, and Proyectos" — still three named places
out of nine landing sections, matching the change's own brief: "high impact
in few places," chosen deliberately over blanket animation because the
audience is largely on mobile with variable connections. Every other
section — Servicios, Autoridad, Retainer, Precios summary, Brief, the
pricing page, case studies, both not-found pages — remains CSS-only reveals
via the `.reveal` utility (`app/globals.css`), unchanged from the original
D10 intent.

**`prefers-reduced-motion` is non-negotiable for all six.** The three new
components each call `motion/react`'s `useReducedMotion()` directly (a
`MotionValue`/imperative animation is not reachable by a CSS media query);
`hero-parallax.tsx` and `hover-border-gradient.tsx` gained the same guard in
this slice, additively, without changing either component's preserved
values (hero-parallax.tsx's row-derivation logic and every
`useScroll`/`useTransform`/`useSpring` call are untouched — see that file's
own comment). A global `app/globals.css` media query separately neutralizes
every CSS animation/transition site-wide, covering `.reveal` and
`tw-animate-css` for free.

**Styling conventions, unchanged:** Tailwind v4 with the OKLCH CSS variables
already in `app/globals.css`; `cn()` from `lib/utils.ts` for every conditional
class; shadcn aliases from `components.json` (`@/components`, `@/components/ui`,
`@/lib`, `@/lib/utils`). PascalCase exports with typed props.

**New shadcn/Aceternity components: none required.** Per `openspec/config.yaml`,
additions must be documented and justified — this design deliberately adds none.
Every new section is composed from Tailwind primitives plus the two existing
Aceternity components. If a later slice wants one, that is its own decision.

### D7 consequence: `typedRoutes` is not free

Enabling `typedRoutes: true` narrows `LinkProps['href']` to the generated route
union. Two concrete impacts:

1. **`components/ui/hover-border-gradient.tsx:103`** does `<Link href={href}>`
   with `href?: string`. That becomes a **type error**. The prop must be retyped
   `href?: Route` (`import type { Route } from 'next'`). This edits a hand-built
   component, so it needs flagging even though the change is one line.
2. `ProductCard`'s internal branch needs a single, commented
   `link as Route` cast, because `HeroProduct.link` is `string` by contract. The
   cast is contained to one boundary, the value is produced by one helper
   (`caseStudyPath`), and invariant 4 in layer 2 covers what the cast waives.

Fallback if `typedRoutes` fights the codebase harder than expected: turn it off.
Layer 2 still covers data-driven links; only literal-href protection is lost.

**Pre-existing defect recorded, not fixed here:** `HoverBorderGradient` with
`as="button"` **and** `href` renders `<Link><button>…</button></Link>` — a
nested-interactive a11y violation. It ships today. Out of scope for this design;
worth a follow-up.

### Landing composition

`app/[locale]/page.tsx` (Server Component) composes the nine sections in the
proposal's §6 order, passing `dictionary` and content projections down. No
section fetches anything; all data is module-level and static.

---

## 8. Image strategy

### D12: no `images.remotePatterns`

All media lives under `public/`. Nothing is externally hosted in this change.
`next.config.ts` needs **no `images` block at all**. It would only become
necessary if media moved to a CMS or CDN (proposal §12), which is out of scope.

### Static imports, not string paths

```ts
// lib/content/projects/media.ts
import luang from '@/public/projects/luang.png';
export const MEDIA = { luang: { asset: luang, alt: { es: '…' } } } as const;
```

| Property | Consequence |
|---|---|
| Missing file | **Build error** instead of a silent runtime 404 |
| Intrinsic dimensions | Provided by `StaticImageData` — no CLS, no hand-maintained numbers |
| Blur placeholder | Available for case-study media |

The hero is the one exception: `HeroProduct.thumbnail` is `.src` (a `string`) to
preserve the prop contract, giving up dimensions and blur there. Acceptable —
`hero-parallax.tsx` already hardcodes `600×600`.

### Sizing and priority

| Surface | `sizes` | `priority` |
|---|---|---|
| Hero card | `sizes="480px"` — cards are fixed `w-120`/`max-w-120`, so an exact value avoids over-fetching. **Absent today**, so Next currently over-serves. | `priority` on **first-row cards only**, via a new `priority?: boolean` prop on `ProductCard`. Today **no** card sets it, so the hero LCP image is lazy-loaded — a live perf defect fixed in the same rework. Never set it on every card; that defeats the purpose. |
| Portfolio grid card | `sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"` | no |
| Case-study media | `sizes="(min-width: 768px) 720px, 100vw"`, dimensions from `StaticImageData` | first image only |

`alt` text comes from `media[].alt` in the content model, locale-keyed — **never
derived from the title.** The hero's current `alt={product.title}` is tolerable
for a thumbnail grid; a case study needs real descriptions.

### The `no-visual` state renders no image at all

This is the structural expression of the proposal's acceptance test ("persuasive
with images disabled"): **the visual is an enhancement layer, not a slot to
fill.**

| Evidence state | Renders |
|---|---|
| `live` | `<Image>` + external link + service badge |
| `gated` | `<Image>` (authorised, sanitised) + login-wall note + disclosure line |
| `not-deployed` | `<Image>` (local capture) + "no public deployment" note |
| `no-visual` | **No `<Image>` element exists.** A typographic card: service badge, problem, role, stack chips, outcome. No broken frame, no gray box. |

Because `Evidence` is a discriminated union requiring `media: readonly []` in the
`no-visual` variant, a half-filled state cannot be expressed.

**Today's reality:** four assets exist. The site is correct and complete-looking
in the `no-visual` state from slice 1, and improves as captures land — no code
changes needed to absorb them, only content edits.

---

## 9. Form validation and submission

### Server Action, not a route handler

```tsx
// components/brief/brief-form.tsx  — "use client"
const [state, action, pending] = useActionState(submitBrief, initialState);
return <form action={action}> … </form>;
```

| Criterion | Server Action | Route handler + `fetch` |
|---|---|---|
| Works with JavaScript disabled | **Yes** — `<form action={serverAction}>` posts to the action endpoint and the server re-renders | No — needs JS to send the request |
| Inline errors with JS on | `useActionState` returns the error state | Manual state plumbing |
| Redirect to `/es/gracias` | `redirect()` inside the action, works on both paths | Client-side navigation only |
| Extra route surface | None | A new public endpoint to secure separately |

Progressive enhancement is the deciding factor: the same action produces a
working no-JS form and a good JS experience.

### Validation

`lib/brief/schema.ts` exports a **pure** validator:

```ts
export function validateBrief(input: unknown): { ok: true; brief: Brief } | { ok: false; errors: BriefErrors };
```

- **No `zod`.** The proposal authorises a dependency only for the mail provider,
  and D1 removed even that. Eight fields of length/enum/regex checks are
  hand-writable, and the enum fields validate against the **same TypeScript
  unions the site renders from** (`ServiceLine`, `BudgetBand`), so the form and
  the catalog cannot drift.
- Purity matters: the same function runs in the action and, if desired, in the
  client for eager feedback — one rule set, no duplication.
- `BriefErrors` is keyed by field name. With JS it feeds `useActionState`; without
  JS the same errors render on the server re-render.

### Submission flow

```
BriefForm (client)
  └─ submitBrief  "use server"
       ├─ abuse.ts        honeypot + signed-timestamp dwell check   → reject silently
       ├─ schema.ts       validateBrief                             → return { errors }
       ├─ notify.ts       sendBriefNotification (fetch → provider)
       │                    ok:false → return { errors: form-level } + preserved values
       │                              + stderr log of the payload
       └─ redirect(`/${locale}/gracias`)      ← OUTSIDE the try/catch
```

**Gotcha to state explicitly:** `redirect()` works by throwing. If it sits inside
the `try` that wraps the provider call, the `catch` swallows it and the redirect
silently does nothing. It must be the last statement, outside the block.

**On failure the form does not redirect.** It re-renders with the submitted values
preserved (returned in the action state as `defaultValue`s, which is what makes
the no-JS path survive too) and surfaces the WhatsApp path as the fallback.

### `/es/gracias`

- Static page, no `searchParams`, **never echoes submitted input** (§2 layer 4).
- `robots: { index: false, follow: false }`, excluded from the sitemap.
- Reachable directly without having submitted — so its copy must read sensibly
  standalone, and it must not claim a submission was received. It states what
  happens next and restates the response-time commitment.

### Pricing CTA pre-tagging

Proposal §7 block 8 requires the pricing CTA to pre-tag the selected line. Done
with a plain query param on the anchor (`/es#brief?line=landing`) read as a
`defaultValue` on the select — **not** with client state, and validated against
the `ServiceLine` union server-side like every other field.

---

## 10. Next.js 16 facts verified for this design

Everything version-dependent below was checked against the installed
`next@16.1.1`, not recalled.

| Fact | Evidence | Design consequence |
|---|---|---|
| `middleware.ts` is **deprecated** in favour of `proxy.ts` | `dist/build/index.js:611` warns; `dist/server/web/types.d.ts:9,49` `@deprecated Use ProxyConfig instead` | Reinforces D2. If middleware were ever chosen, the file must be `proxy.ts`. |
| `cacheComponents` is a **top-level** option, default `false`; `experimental.cacheComponents` is deprecated | `dist/server/config-shared.d.ts:590-592, 1038, 1140` | D11: leave it off. Keeps the build-time assertion at build time. |
| `typedRoutes` is **stable and top-level**, default `false` | `dist/server/config-shared.d.ts:451-454, 752, 1098`; `dist/server/config.js:541` moves it out of `experimental` | D7. |
| Typed-route `href` accepts static routes, `?`/`#` suffixes, `${string}:${string}` protocol URLs, and matching template literals — but **not a bare `string`** | `dist/server/lib/router-utils/typegen.js:217-259` (`RouteImpl`) | Explains the `HoverBorderGradient` prop change and the one contained cast in `ProductCard`. |
| `params` values are typed **`string`** (or `string[]` for catch-alls), never a literal union | `dist/server/lib/router-utils/typegen.js:97-126` (`generateParamTypes`) | **The core justification for D3.** Types cannot stop `locale = "precios"`. |
| `params` on pages/layouts/`generateMetadata` is a **`Promise`**; `generateStaticParams` receives a **plain** object | `dist/build/webpack/plugins/next-types-plugin/index.js:121-133`; `dist/server/lib/router-utils/typegen.js:589-592` | Await in one place, do not in the other. |
| `dynamicParams?: boolean` is a supported segment config | `dist/build/segment-config/app/app-segment-config.d.ts:56-59` | D3 layer 1. |
| `next.config.ts` is SWC-transpiled with tsconfig `paths`/`baseUrl` and a require hook — **but** a second code path uses Node's native TS loader with no path mapping | `dist/build/next-config-ts/transpile-config.js:18-45, 96-118, 137-162` | Why the integrity gate is **not** in `next.config.ts`. |

---

## 11. Data flow

```
lib/content/**            (pure TS data, zero React, zero I/O)
        │
        ├── projections.ts ──► toHeroProducts(locale)   ──► HeroParallax  (client)
        │                      toPortfolioCards(locale) ──► PortfolioGrid (server)
        │                      publishableProjects()    ──► sitemap.ts, generateStaticParams
        │
        ├── invariants.ts ───► assertContentInvariants() ──► [locale]/layout.tsx  (throws at build)
        │
        └── approach/loader ─► getProjectApproach(slug)  ──► case-study page (async, MDX seam)

lib/dictionaries/es.ts ──► getDictionary(locale) ──► every section (server-rendered copy)

BriefForm (client) ──► submitBrief (server action) ──► notify.ts ──► provider HTTP API
                                                  └──► redirect('/es/gracias')
```

Every read path is build-time. The only request-time path is the Server Action
POST. Nothing on any page reads cookies, headers, or `searchParams` at request
time, which is what makes `force-static` everywhere achievable and D11 correct.

---

## 12. Integration points and configuration deltas

| File | Change |
|---|---|
| `next.config.ts` | `typedRoutes: true`; `redirects()` per D2. **No `images` block.** No `cacheComponents`. |
| `eslint.config.mjs` | Add `no-restricted-syntax` banning `[PRICE:` / `[CURRENCY]` literals under `app/**`, `components/**`, `lib/dictionaries/**`. |
| `package.json` | **Unchanged.** No SDK, no validator, no test runner. |
| Env (server-only) | `RESEND_API_KEY`, `BRIEF_TO_EMAIL`, `BRIEF_FROM_EMAIL`, `SITE_CONTENT_GATE` (optional escape hatch) |
| Env (public) | `NEXT_PUBLIC_SITE_URL` — required for `metadataBase`, canonicals, OG, and the sitemap |
| Vercel platform | Firewall rate-limit rule on the action path. `VERCEL_ENV` is read (already provided). BotID only if abuse appears. |

---

## 13. Risks, assumptions, and open items

| # | Item | Type | Handling |
|---|---|---|---|
| 1 | **The hero will look sparser at slice 1** — 4 real entries in one row versus today's 9-slot illusion. | Consequence | Correct and honest, but it must be shown at review, not discovered. Density returns at 8 entries. |
| 2 | **`typedRoutes: true` forces a change to a hand-built component** (`hover-border-gradient.tsx` `href?: string` → `href?: Route`). | Risk | One line. Fallback: disable `typedRoutes`; layer 2 still covers data-driven links. |
| 3 | **The WhatsApp number is a hard blocker for slice 1's stated capability.** `contact.ts` uses the same `pending` discriminant, and the pending state renders **nothing** — a dead `wa.me` link is worse than no button. | Blocker | Proposal §14 item 6 already lists it. Restated here because slice 1's conversion promise depends on it. |
| 4 | **Fragment redirects (`#proyectos`) are unverified.** | Unverified | Confirm at apply time; fall back to redirecting to `/es` without the anchor. |
| 5 | **Root-layout `lang` is hardcoded to `DEFAULT_LOCALE`.** Correct today (one locale), but adding `en` requires moving `<html>`/`<body>` into the locale layout — ~3 layout/404 files. | Accepted debt | Documented in §3. No route page moves and no URL changes, so the proposal's criterion holds for pages. Do not claim zero cost. |
| 6 | **Email-only means a provider failure loses a lead.** Only mitigations are a non-redirecting error state plus a `stderr` log with finite retention. | Accepted cost of D1 | Revisit only via graduation to a dedicated Supabase project (§2), never by adding a schema to `mvp-lab`. |
| 7 | **Provider domain verification (DNS) is a human prerequisite.** Until done, every send fails. | Dependency | Add to the §14 blocking list alongside the captures. |
| 8 | **No test runner.** The four gates in §6 cover data-integrity failures — the class that actually shipped here. They cover **no rendering or interaction behaviour at all**: the parallax at 4 vs 8 entries, the form's no-JS path, and every responsive breakpoint are verifiable only by a human looking at the page. | Known gap | Out of scope per proposal §2.2. Stated so the gap is not mistaken for coverage. |
| 9 | **`generic supabase/SKILL.md` conflicts with the fleet contract** (`execute_sql`, `db pull`). | Trap | The fleet contract wins. Recorded in §2. |
| 10 | **Nested-interactive a11y defect** in `HoverBorderGradient` (`as="button"` + `href` → `<Link><button>`), shipping today. | Pre-existing | Out of scope. Recorded for follow-up. |
| 11 | `Localized<T>` adds `{ es: … }` noise at every prose site. | Accepted tradeoff | Bought deliberately: it converts the `en` translation backlog into a compile-error list. |
| 12 | `atemporalarq.com` remains UNVERIFIED and is linked live today. | Inherited | Unchanged from proposal §14. The `Evidence` union makes the downgrade from `live` a one-field edit. |

**Settled product decisions are not reopened.** None of the nine appears wrong
from an architectural standpoint. The only one worth a note: selling four service
lines while the retainer has no possible case study means the type system is
carrying that asymmetry (`RETAINER_COMMITMENTS` required, invariant 5 exempts the
retainer line from the proof requirement). It works, but it is an asymmetry that
future readers will trip over, so it is encoded explicitly rather than implicitly.

---

## 14. What this design deliberately does not decide

| Not decided | Owner |
|---|---|
| Task breakdown, slice-to-PR mapping, review-budget forecast | `sdd-tasks` |
| Requirement scenarios in Given/When/Then | `sdd-spec` |
| Actual prices, currency, retainer figures, WhatsApp number, client names | The user (proposal §14) |
| Visual/aesthetic direction — typography, colour direction beyond the existing OKLCH variables, section layouts | Apply time, within the conventions in §7 |
| Whether to install a test runner | Out of scope, proposal §2.2 |
| Any remote database change | Forbidden. §2 is a plan, not an authorisation. |

---

## 15. Next phase

`sdd-tasks`, once `sdd-spec` is also complete. Tasks should consume §5–§9 as the
architectural contract and §13 as the risk register.
