# Exploration — dev-services-website

Change: `dev-services-website`
Phase: `sdd-explore`
Artifact store: `openspec` (mirrored in Engram at `sdd/dev-services-website/explore`)
Date: 2026-07-31

> Authoring note: the `sdd-explore` agent has no write tool, so it persisted its
> findings to Engram only. This file was written by the orchestrator and includes
> orchestrator-verified corrections to the agent's report. Claims are labeled
> **VERIFIED** (checked with a command whose output is quoted) or **UNVERIFIED**.

---

## 1. Goal

Turn `website-studio` from a single-page hero demo into a complete site that sells
freelance development services: who the developer is, what work they have shipped,
what it costs, and how to start a conversation.

## 2. Product decisions already made by the user

These are settled inputs, not open questions:

| Decision | Choice |
| --- | --- |
| Audience | Peru/LatAm SMBs **first**, international clients later. Spanish is the base locale. |
| Pricing | Hybrid — published fixed-price packages for standard deliverables, quote-on-request for complex work. |
| Private/ungated work | Self-hosted case studies with screenshots and a problem/solution/stack/outcome narrative. No external link. |
| Conversion | Guided brief form as the primary path, visible WhatsApp escape hatch as secondary. |

## 3. Current state of the codebase

**VERIFIED** by reading the files.

- `app/page.tsx` — a Server Component rendering `HeroParallax` with a hardcoded
  9-entry `products` array. Only **4 entries are distinct**; the other 5 are exact
  duplicates padding the grid.
- `app/layout.tsx` — `title: "Website Studio"`, **`description: ""` (empty)**,
  `<html lang="es">`. No nav, no footer, no routes other than `/`.
- `components/ui/hero-parallax.tsx` — slices products as
  `slice(0,5)` / `slice(5,10)` / `slice(10,15)`. A full three-row grid therefore
  needs **15 entries**; ten fills two rows with an empty third. Today's nine leave
  row three empty.
- `components/ui/hero-parallax.tsx:119` — the embedded `Header()` ships a CTA to
  `href="/portfolio"`. **`app/portfolio/` does not exist, so this 404s in
  production today.** This is a shipped bug, not a hypothetical.
- `app/page.tsx:22` — the "Blu Finances" entry has `link: "/"`, a self-referential
  dead link. Also a shipped bug.
- `next.config.ts` — default/empty config. No `images.remotePatterns`, which would
  become necessary only if images move to an external host.
- `app/globals.css` — Tailwind v4 with an OKLCH CSS-variable theme. Light and dark
  variables are both defined, but **nothing toggles the `.dark` class** — no
  `next-themes` or equivalent is installed.
- `package.json` — Next 16.1.1, React 19.2.3, motion 12.23.26, Tailwind v4,
  lucide-react, cva, clsx, tailwind-merge. **No test runner, no i18n package, no
  CMS client.**
- `public/projects/` — exactly four files: `luang.png`, `atemporal.png`,
  `blucafe.png`, `blucafefinance.png`.

## 4. Portfolio inventory — corrected

The critical distinction is **not** whether a repository is public, but whether a
prospective client clicking a link sees something meaningful. Those are different
questions, and conflating them produces a portfolio full of login screens.

### 4.1 Repository visibility — VERIFIED

Checked with `gh repo view <slug> --json visibility,homepageUrl`:

| Local folder | GitHub slug | Visibility | `homepageUrl` on GitHub |
| --- | --- | --- | --- |
| `blu` | `SebastianBerrios/blu` | PUBLIC | `https://blucafefinance.vercel.app/` |
| `blu-biolinks` | `SebastianBerrios/blu-biolink` | PUBLIC | `https://blu-biolink.vercel.app` |
| `electrocode-academy` | `SebastianBerrios/electrocode-academy` | PRIVATE | `https://electrocode-academy.vercel.app` |
| `ez-finance` | `SebastianBerrios/ez-finance` | PUBLIC | *(none set)* |
| `fast-route` | `SebastianBerrios/fast-route` | PUBLIC | `https://fast-route-indol.vercel.app` |
| `oasis` | `SebastianBerrios/oasis` | PRIVATE | `https://oasis-kappa-seven.vercel.app` |
| `wedding-invitation-piero` | `SebastianBerrios/wedding-invitation-piero` | PUBLIC | `https://wedding-invitation-piero.vercel.app` |

Note the local folder `blu-biolinks` maps to a repo named `blu-biolink` (singular).

**`atemporal-biolinks` does not exist on disk.** VERIFIED — `ls -d` returns
"No such file or directory" and no `.git` was found. The user's candidate list has
a stale entry that needs correcting.

### 4.2 Live reachability — VERIFIED

Checked with `curl -s -o /dev/null -w '%{http_code}' -L`:

| URL | HTTP | What a visitor actually gets |
| --- | --- | --- |
| `https://luang.com.pe/` | 200 | Public site, `<title>Luang</title>`. Fully clickable. |
| `https://blucafe.vercel.app/` | 200 | Public site, `<title>Blu café</title>`. Fully clickable. |
| `https://blucafefinance.vercel.app/` | 200 | **Login wall.** Response contains `type="password"`, "Correo", "Iniciar sesión". Not showable as a link. |
| `https://www.atemporalarq.com/` | 000 | Could not connect from this environment (failed in ~1 ms, which suggests a local network/DNS restriction rather than a real outage). **UNVERIFIED — the user must confirm.** This URL is live on the site today. |
| `https://blu-biolink.vercel.app` | 404 | No deployment at that URL. |
| `https://electrocode-academy.vercel.app` | 404 | No deployment at that URL. |
| `https://fast-route-indol.vercel.app` | 404 | No deployment at that URL. |
| `https://oasis-kappa-seven.vercel.app` | 404 | No deployment at that URL. |

The `homepageUrl` fields on GitHub are therefore **stale for five of seven repos**.

### 4.3 The consequence

Of the ten portfolio entries under consideration, only **two are verified
clickable** (`luang.com.pe`, `blucafe.vercel.app`), one is verified but
login-walled (`blu`), one is unverified (`atemporalarq.com`), and the remaining
six have no reachable deployment at all.

This makes the user's chosen case-study approach not merely preferable but the
**only viable presentation** for most of the portfolio. It also surfaces a
separate, cheap opportunity: `fast-route`, `wedding-invitation-piero`, and
`blu-biolink` are PUBLIC repos that simply are not deployed. Redeploying them
would create genuinely clickable links. That work belongs to those repos, not to
`website-studio`, but it materially changes what the portfolio can show.

### 4.4 What each project is — from its own README/code

**VERIFIED** by the explore agent reading each repo read-only.

| Project | What it is | Stack | Gated? | Thumbnail seed assets |
| --- | --- | --- | --- | --- |
| `blu` | Back-office/POS and operations app: users, audits, stats, purchases, scheduling, inventory, orders, sales, recipes, finances. Almost certainly the real product behind the current "Blu Finances" entry. | Next 15.5.9, React 19.1.0, Tailwind v4, `@supabase/ssr`, Sentry, chart.js, Vitest 4.1.5 | Yes — login wall | None; repo has no `public/` directory |
| `blu-biolinks` | Bio-link landing page for "Blu Cafe TCQ" (TikTok, Instagram, menu, location, WhatsApp). README self-declares "private and proprietary to Blu Cafe TCQ". | Astro ^5.13.5, Tailwind v4 | Not deployed | `public/background.webp`, `public/logo.webp` |
| `electrocode-academy` | Online course platform — free programming and electronics courses, with `cursos/[curso]/[leccion]` and an `entrar` login route. | Next 16.2.12, React 19.2.4, `@supabase/ssr`, `velite` MDX pipeline | Yes — has login; repo PRIVATE | `public/brand/logo.png` (brand mark only) |
| `ez-finance` | Personal and shared 50/30/20 budgeting app. Part of the `mvp-lab` Supabase fleet. | Next ^15, React ^19, Tailwind v4, `@supabase/ssr`, Radix, next-themes, **Playwright + Vitest** | Auth'd app | Boilerplate SVGs and PWA icons only |
| `fast-route` | Real-time delivery route optimization (web + installable PWA): place stops on a map, get the optimal visiting order. Screaming architecture, documented. | Next 16.2.10, React 19.2.4, MapLibre GL + OpenFreeMap, OpenRouteService, `@supabase/ssr`, Vitest, React Compiler enabled | Not deployed | Boilerplate SVGs and PWA icons only |
| `oasis` | Private single-property hospitality/reception access-control system. Admin-only staff provisioning, no self-service signup, `/sin-acceso` dead end. | Next 16.2.11, React 19.2.4, Tailwind v4, `@base-ui/react`, `@supabase/ssr`, next-themes | Yes by design; repo PRIVATE | Boilerplate SVGs only |
| `wedding-invitation-piero` | One-off wedding invitation microsite for a specific couple: envelope-opening animation, background music, floral imagery. | Next 16.2.12, React 19.2.4, Tailwind v4, Vitest 4.1.10 + coverage, `sharp` image pipeline | Not deployed | Richest set: `background-main.png`, `flowers.png`, `heart.png`, `letter.png`, `letter-open.png`, `sheet.png`, `separator.png`, plus optimized `opt/*.webp` |

Four of seven repos (`blu`, `ez-finance`, `fast-route`, `oasis`) have **no usable
product screenshot** in their own assets. Thumbnails for those require fresh
captures, not a file copy.

## 5. Reference research

Sourced by the explore agent. General guidance unless marked verified.

- **Recurring route inventory** across developer-portfolio guides: home, about,
  work/case studies (the bulk of the site), pricing where published, contact.
  Recommended curated project count is **3–6, not exhaustive** —
  [Resumly 2026](https://www.resumly.ai/blog/freelance-portfolio-that-wins-for-software-engineers-in-2026),
  [WPZOOM](https://www.wpzoom.com/blog/portfolio-website-examples/).
- **VERIFIED from a real page** (`brittanychiang.com`): single-page structure —
  hero, about, experience, projects (4 shown with a "Full Project Archive" link
  for the rest), writing, footer. Project cards carry title, short description,
  tech tags, imagery, and a metric where available ("100k+ Installs"). Caveat
  worth respecting: this is an **employer-facing** engineering portfolio with no
  pricing and only an implicit CTA, so its structure does not transfer wholesale
  to a client-facing sales site.
- **Pricing tradeoffs**: two to three fixed packages standardize scope and let a
  seller quote with confidence, but cost flexibility — a client whose needs do not
  fit a tier ends up manually quoted anyway, which partly defeats the friction
  reduction packages are meant to deliver. Hourly/custom suits open-ended scope but
  reintroduces a negotiation step before the prospect sees any number. The chosen
  hybrid model is a direct response to this tension.
- **NDA / unlinkable work patterns**: ask the client for permission to show a
  sanitized version first; otherwise anonymize by industry and size with an
  explicit disclaimer; optionally password-protect the full case study and share
  the password on request; and center the write-up on process, role, and outcome
  rather than product visuals.
  ([Harlow](https://meetharlow.com/blog/how-to-build-a-portfolio-when-your-best-wins-are-locked-by-ndas/),
  [uxplaybook.org](https://uxplaybook.org/articles/ux-design-portfolio-nda-guide-2026))
- **Trust signals** that recur: an explicit process breakdown of how an engagement
  runs, testimonials, and a stated tech stack per project.

## 6. Content model — the fork

| Approach | Pros | Cons | Effort |
| --- | --- | --- | --- |
| **A. Typed TypeScript data module** (`lib/projects.ts`) | No new dependencies; compile-time type safety; content history is git history; trivially compatible with Server Components; zero infra cost | Every content edit is a code change plus redeploy; no editing UI; degrades past roughly a dozen entries | Low |
| **B. Local MDX/Markdown** (`content/projects/*.mdx`, e.g. `velite` — already used in `electrocode-academy`) | Separates long-form case-study prose from component code; rich embedded formatting; still git-only | Adds a parsing dependency plus a schema and loader to maintain; still commit-and-redeploy per edit | Medium |
| **C. Sanity CMS** (MCP and skills available in this environment) | Real editing UI decoupled from the repo; native asset pipeline with CDN and cropping, which structurally solves thumbnail sourcing; scales if a blog follows | External account and free-tier ceiling; schema definition plus token wiring plus ISR/revalidation; requires adding `images.remotePatterns`; a second place to keep in sync with frontend types | High |

**Recommendation: start with A.** It extends the existing `{ title, link, thumbnail }`
shape already documented in `openspec/config.yaml`, adds the fields case studies
need (slug, description, stack, role, outcome, and a flag for gated/unlinkable
work) with zero new dependencies, and matches the actual content volume and edit
frequency. Revisit C only if the catalog grows substantially or a non-technical
collaborator needs to edit content.

Note that case-study prose length may push toward B sooner than expected; the data
module should be structured so that swapping the prose field for MDX later does not
require reshaping the whole model.

## 7. i18n — decide before building routes

The user chose "Peru first, English later". In the Next.js App Router the locale
lives in the **route structure**. Building `app/servicios/`, `app/precios/`, and
`app/proyectos/[slug]/` without a locale segment means that adding English later
requires moving every route file and rewriting every link, `metadata` export, and
sitemap entry.

Recommendation: introduce the locale segment now and ship only `es`, keeping copy
in per-locale dictionaries separated from components. The cost today is near zero;
the cost later is a full routing refactor.

## 8. Backend for the brief form — a real fork for the design phase

| Option | Implication |
| --- | --- |
| Transactional email only (e.g. Resend) | No schema, no RLS, no database. The brief arrives in the inbox. Sufficient for launch; leads are not queryable and can be lost in a mailbox. |
| Persist leads in the shared `mvp-lab` Supabase project | Leads are durable and trackable, but this activates the fleet contract in `D:\Programming\Frontend\CLAUDE.md`: new schema, migrations only (never ad-hoc SQL, never `db pull`), RLS mandatory on every table, and the rule that authentication is not membership. |

Leaning toward email for the first slice. A public portfolio form with no login
does not yet justify a database, and "leads buried in a mailbox" is a problem worth
solving once leads actually exist. To be settled in `sdd-design`.

## 9. Must-fix regardless of architecture

1. `hero-parallax.tsx:119` — CTA to `/portfolio` returns 404.
2. `app/page.tsx:22` — "Blu Finances" links to `/`. Its real deployment is
   `https://blucafefinance.vercel.app/`, but that is login-walled, so the correct
   fix is a case study, not a link swap.
3. Five of nine `HeroParallax` entries are duplicates — today's live site
   misrepresents portfolio breadth.
4. `app/layout.tsx` — empty `description`, no nav, no footer.

## 10. Risks

- **No test runner.** `strict_tdd: false`. Every structural change here ships with
  no regression safety net. Growing from one route to a multi-route site with a
  form and a content model is exactly when this starts to hurt.
- **Content is the bottleneck, not code.** Seven of ten entries need screenshots
  that do not exist yet, and four of those repos have no usable imagery at all.
  Several are not even deployed, so capturing screenshots means running them
  locally.
- `https://www.atemporalarq.com/` could not be verified from this environment and
  is currently linked live on the site.
- `atemporal-biolinks` is a stale entry in the candidate list.
- `wedding-invitation-piero` showcases a specific couple's personal event. Consent
  is a distinct question from ordinary NDA concerns and only the user can resolve it.
- `blu-biolinks`' README declares the work "private and proprietary to Blu Cafe
  TCQ" even though the repo is public — showing it may need the client's sign-off.

## 11. Next phase

`sdd-propose`. The blocking input the explore agent flagged (repository visibility)
is now resolved. Two questions remain open for the user but neither blocks a
proposal, because both affect content rather than structure: confirming
`atemporalarq.com` is live, and deciding which projects earn a case study.
