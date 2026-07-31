# Proposal: dev-services-website

Change: `dev-services-website`
Phase: `sdd-propose`
Artifact store: `openspec` (mirrored in Engram at `sdd/dev-services-website/proposal`)
Date: 2026-07-31

> Size note: `sdd-propose` normally caps the proposal at 450 words. This one is
> deliberately longer because the orchestrator required concrete specification of
> the route inventory, landing narrative order, pricing structure, case-study
> template, trust blocks, and slicing. Density is managed with tables, not prose.

---

## 1. Intent

**The problem.** `website-studio` ships a single page that shows four distinct
projects padded to nine entries with duplicates, links one of them to `/`, and
points its only call to action at `/portfolio` — a route that does not exist and
404s in production today. Metadata says `"Website Studio"` with an empty
description. There is no statement of what is sold, no prices, no case studies,
no way to start a conversation, and no navigation.

**Why now.** The studio sells four service lines and has ten candidate projects,
but the site cannot carry a sales conversation. Every prospect must be handled
manually over WhatsApp because the site answers none of their questions.

**Outcome — what a prospect can do after this change that they cannot do today:**

| # | New capability for the prospect |
|---|---|
| 1 | Learn what ElectroCode Studio sells, in four named service lines |
| 2 | See what it costs — a published figure, or a floor plus how a quote works |
| 3 | Read a case study for their own category, with problem, process, stack, outcome |
| 4 | Start a conversation from the site: a qualifying brief, or WhatsApp in one tap |
| 5 | Reach a shareable URL for pricing or a single project (today only `/` exists) |

Secondary outcome for the studio: adding English later requires adding a
dictionary, not moving every route.

---

## 2. Scope

### 2.1 In scope

1. **Brand.** Replace the `"Website Studio"` placeholder with **ElectroCode Studio**
   across metadata, header, footer, and OG tags. Write the missing description.
2. **Shipped-bug fixes** (see §9, slice 1) — dead `/portfolio` CTA, `link: "/"`,
   duplicate hero entries, missing nav/footer.
3. **Locale route segment** shipped with `es` only, copy in per-locale dictionaries.
4. **Typed content model** in `lib/` for projects, service lines, and pricing.
5. **Landing page narrative** — nine sections, specified order (§5).
6. **Pricing page** for the hybrid model across all four lines, with clearly
   marked figure placeholders (§6).
7. **Case-study route and template** — `6–8` curated projects (§7).
8. **Trust blocks** — the ElectroCode Academy authority block (§8.1) and the
   retainer trust signal (§8.2).
9. **Conversion** — brief form with qualifying questions, WhatsApp escape hatch,
   confirmation route.
10. **`HeroParallax` rework** for the curated count instead of padding to 15.
11. **Discoverability** — `sitemap`, `robots`, `not-found`.

### 2.2 Out of scope

| Deferred | Why |
|---|---|
| English (`en`) copy | Structure ships now, translation is a later content change |
| Deploying `electrocode-academy`, `fast-route`, `blu-biolink`, `wedding-invitation-piero` | Work belongs to those repos; it changes what this site can link to, but is not this change |
| Capturing screenshots | Human content work (§10). This change makes the site render correctly with or without them |
| Deciding actual prices | Placeholders only; figures are the user's decision |
| Choosing the brief-form backend | Real fork, belongs to `sdd-design` (§4.3) |
| Persisting leads in the `mvp-lab` Supabase project | Consequence of the §4.3 fork; would activate the fleet contract in `D:\Programming\Frontend\CLAUDE.md` |
| Installing a test runner | Risk stated in §11; separate change, needs user consent |
| CMS (Sanity), MDX pipeline, blog | Content volume does not justify it; model is shaped so MDX can be swapped in later |
| Dark-mode toggle | Both themes exist in `globals.css` but nothing toggles `.dark`; unrelated |
| Analytics / conversion measurement | Real follow-up gap, deliberately not bundled |

---

## 3. Capabilities

> Contract with `sdd-spec`. `openspec/specs/` currently contains only `.gitkeep`,
> so there is no existing spec to modify.

### New capabilities

- `site-shell`: locale route segment, root layout, brand metadata, header, footer, sitemap, robots, 404.
- `content-model`: typed data modules for projects/services/pricing plus per-locale copy dictionaries.
- `landing-narrative`: the landing page's section inventory, order, and per-section content contract.
- `service-catalog`: the four service lines as data, and how each surfaces on landing, pricing, and case studies.
- `pricing`: hybrid pricing page structure, package anatomy, placeholder discipline.
- `project-portfolio`: curated project set, hero projection, portfolio grid, evidence states.
- `case-study`: `/[locale]/proyectos/[slug]` route and the mandatory case-study template.
- `trust-signals`: ElectroCode Academy authority block and retainer commitments.
- `lead-capture`: brief form, qualifying questions, WhatsApp escape hatch, confirmation route.

### Modified capabilities

None.

---

## 4. Approach

### 4.1 Content model — typed TypeScript, not a CMS

Extend the existing `{ title, link, thumbnail }` shape (preserved per
`openspec/config.yaml`) into a `Project` entity carrying `slug`, `client`,
`serviceLine`, `summary`, `problem`, `role`, `approach` (long prose),
`stack[]`, `outcome`, `evidence`, `media[]`, `externalUrl?`, `consent`,
`featured`, `order`. Two invariants:

- The long prose field is **isolated** so swapping it for MDX later does not
  reshape the model.
- `HeroParallax` keeps receiving `{ title, link, thumbnail }` — the hero consumes
  a *projection* of `Project[]`, not the entity. The prop contract is preserved;
  only the data source changes.

Non-obvious consequence: for gated and undeployed projects, `link` becomes an
**internal** case-study route. `ProductCard` currently hardcodes
`target="_blank"` (`components/ui/hero-parallax.tsx:151`), which is wrong for
internal navigation and must become conditional.

### 4.2 `HeroParallax` rework

The component slices `0-5 / 5-10 / 10-15`, so three full rows need 15 entries.
Derive row count and row size from the array length instead — 6 entries render
`3+3`, 8 render `4+4` — and drop the third motion track. Preserve every
`useSpring` / `useTransform` value and the perspective entrance; the user built
this component by hand and its visual intent is not in question, only its data
requirement. Move the hardcoded Spanish `Header()` copy into the locale
dictionary and accept it as a slot rather than embedding strings in the component.

### 4.3 Brief-form backend — an OPEN fork, not decided here

| Option | Implication |
|---|---|
| Transactional email only (e.g. Resend) | No schema, no RLS, no database. Fast. Leads live in an inbox and can be lost. |
| Persist leads in the shared `mvp-lab` Supabase project | Durable and queryable, but activates the fleet contract: new schema, migrations only, never `db pull`, RLS mandatory on every table, authentication is not membership. |

Current leaning is **email first**. `sdd-design` decides. The WhatsApp escape
hatch has no backend at all and can ship in slice 1, so the site can convert
before either option is built.

### 4.4 Copy voice — a hard constraint, not a style note

The studio is a **solo operator selling as a studio**. Copy MUST project
structure — defined process, stated response times, clear deliverables — and MUST
NEVER fabricate headcount. Studio voice ("Diseñamos webs únicas", as in the
current hero) is acceptable. "Nuestro equipo de desarrolladores" and equivalents
are banned: being caught inventing a team destroys credibility on the first call.
This belongs in a copy review checklist, not in someone's memory.

---

## 5. Route inventory

Locale segment sits **directly under `app/`**, wrapping every content route.

| Route | Purpose | Why it earns a URL |
|---|---|---|
| `/` | Resolves to the default locale | The only URL currently in the wild; must never break |
| `/[locale]` → `/es` | Landing — the full narrative | Primary sales page |
| `/[locale]/precios` | Pricing across four lines | Shareable, sent directly in DMs, SEO target |
| `/[locale]/proyectos/[slug]` | One case study per curated project | Shareable proof, SEO, the depth the landing cannot hold |
| `/[locale]/gracias` | Post-brief confirmation | Gives the conversion a measurable endpoint |
| `/sitemap.xml`, `/robots.txt` | Discoverability | Required once more than one page exists |

Deliberately **not** routes:

- `/[locale]/proyectos` (index) — the landing's portfolio section *is* the index.
  A bare `/es/proyectos` must redirect to the landing anchor, not 404.
- `/[locale]/contacto` — the brief form is a landing section (`#brief`).
- `/portfolio` — the current 404 target. Fixed by repointing the hero CTA at the
  landing portfolio anchor, not by creating the route.

Mechanism for `/` → `/es` (middleware rewrite vs. redirect) is a `sdd-design`
decision, not a proposal one.

---

## 6. Landing narrative — order and job per section

The order follows the **prospect's question sequence**, not the seller's org
chart. Read top to bottom it is one continuous argument: *can you build → do you
build my thing → how does this work → prove it → why you specifically → what does
it cost → what happens after launch → let's talk.*

| # | Section | Job it does | Why here |
|---|---|---|---|
| 1 | Hero (`HeroParallax`) | Prove competence in three seconds with real shipped work, and say what is sold | Visual proof disarms the biggest doubt — "can this person actually build?" — before a single claim is read. The existing hero already does this; reuse it |
| 2 | Servicios (4 lines) | Let the visitor self-identify: "I need a landing" vs "I need a system" | Once "can they build?" is answered, the next question is "do they build MY thing?" Each card routes to its pricing block and its proof |
| 3 | Proceso | Replace fear of the unknown with a defined sequence: discovery → proposal → build → handover, with a stated response time | This is where a solo operator earns the studio positioning — structure, not headcount. An explicit process breakdown is a recurring trust signal in the reference research (`exploration.md` §5) |
| 4 | Proyectos (curated 6–8) | Detailed proof; hand off to case studies | After the process is explained, a project card reads as "this is what that process produced" rather than a decontextualized gallery |
| 5 | Autoridad — ElectroCode Academy | Differentiate (§8.1) | Lands hardest right after the portfolio: it converts "good developer" into "the person who teaches this". Placed **before** pricing so credibility is priced in |
| 6 | Precios (summary + link to `/precios`) | Qualify and remove friction | Numbers before proof invite comparison shopping; numbers after proof read as justified. Still on the landing, because hiding prices entirely re-adds the friction the hybrid model exists to remove |
| 7 | Mantenimiento / retainer (§8.2) | Sell the one line with no possible case study | Answers "what happens after launch?" — the question sections 3–6 just raised — and sits next to pricing because it is a recurring commitment |
| 8 | Brief form (`#brief`) + WhatsApp | Convert, at two speeds: qualified brief for serious buyers, WhatsApp for the impatient | Last, because the entire page above it is the argument |
| 9 | Footer | Navigation, contact, locale, secondary links | Site-wide chrome |

---

## 7. Pricing page structure

Hybrid model, all four lines, on `/[locale]/precios`.

| Block | Content | Figures |
|---|---|---|
| 1. How pricing works | Fixed for standard deliverables, quote for custom, monthly for care. Sets expectations before any number | — |
| 2. Line A — landings & corporate sites | 3 fixed tiers | `[PRICE:landing-*]` |
| 3. Line C — biolinks & event microsites | 1–2 fixed tiers | `[PRICE:microsite-*]` |
| 4. Line B — web apps & dashboards | Quote-on-request. MUST state typical project shapes, the variables that move the price (integrations, roles/permissions, data volume, auth), the quote process and its turnaround, **and a starting-from floor** so a prospect can self-disqualify — that is the entire point of publishing a floor | `[PRICE:app-from]` |
| 5. Line D — maintenance retainer | Recurring monthly plans. MUST state the response-time commitment, what the hours cover, exclusions, cancellation terms | `[PRICE:care-*]` |
| 6. Cross-cutting terms | Always included vs. always extra (domain, paid hosting, licensed assets, copywriting, photography); payment schedule; currency | `[CURRENCY]` — PEN/USD is OPEN |
| 7. FAQ | Objection handling: why not cheaper, later changes, who owns the code, how to leave | — |
| 8. CTA | Into the brief form, pre-tagged with the selected line | — |

**Every fixed tier MUST communicate the same anatomy**: who it is for,
deliverables (page/section count), what is included, turnaround, revision rounds,
price, and **what is not included**. Omitting exclusions is what turns a fixed
price into a dispute.

**Placeholder discipline.** No figure is decided. All figures render from one
typed pricing module using tokens like `[PRICE:landing-basic]`. Placeholders MUST
be visually unmistakable in dev and preview, and shipping an unresolved
placeholder to production is a launch-blocking failure, not a cosmetic one. No
invented number may appear anywhere in copy.

---

## 8. Case-study template

Grounded in the NDA-pattern research in `exploration.md` §5: seek permission for
a sanitized version first; otherwise anonymize by industry and size with an
explicit disclaimer; optionally gate the full write-up behind a shared password;
and center the narrative on **process, role, and outcome rather than product
visuals**. That last point is what makes an unlinkable project persuasive, and it
is the part an NDA cannot take away.

Every case study MUST contain:

| # | Element | Requirement |
|---|---|---|
| 1 | Title + context | Client name **with permission**; otherwise industry + size |
| 2 | Service-line badge | Ties the proof to something that is for sale |
| 3 | Problem | The client's operational pain, in their language, before any technology |
| 4 | Role | Exactly what the studio did — stated honestly for solo work |
| 5 | Approach / process | The decisions and their rationale. **Load-bearing when there are no visuals** |
| 6 | Stack | Verified technology list (source: `exploration.md` §4.4) |
| 7 | Outcome | What changed. If no metric exists, a qualitative verifiable outcome. **Never invent a metric** |
| 8 | Visual evidence | Explicit `evidence` state — see below |
| 9 | Disclosure line | Truthful and required for gated or client-owned work ("shown with the client's permission", "sanitized at the client's request") |
| 10 | Next step | The matching pricing block plus the brief form |

Evidence states, and what each renders:

| State | Renders | Projects |
|---|---|---|
| `live` | Screenshot + external link | Luang Asociados, Blu Café; Atemporal Studio **pending URL confirmation** |
| `gated` | Authorized sanitized screenshot + an explicit note that the product sits behind a login | `blu` (login wall VERIFIED) |
| `not-deployed` | Locally captured screenshot + a note that no public deployment exists | `fast-route`, `blu-biolink`, `wedding-invitation-piero` |
| `no-visual` | A text-only card that still reads as complete — **no broken image frame, no gray box passed off as a screenshot** | Any project whose capture has not happened yet |

**Acceptance test for the whole template:** a case study must be persuasive when
read with images disabled. That is the concrete, checkable standard for the
unlinkable majority of this portfolio.

### 8.1 Authority block — ElectroCode Academy

- Lives in landing section 5, and MUST NOT appear as a card in the 6–8 grid.
- Says: ElectroCode Academy is a platform of **free** programming and electronics
  courses, built and maintained by the same studio, under the same brand.
- Carries three signals at once: domain depth (the studio teaches what it sells),
  sustained long-term product maintenance (which partially covers the retainer
  line's missing proof), and shared-brand credibility.
- **Honesty constraints.** The repo is PRIVATE and its deployment returns 404
  (VERIFIED), so the block ships in state `no-link` today: describe the platform,
  show the brand mark or a locally captured screenshot, and offer no clickable
  link and no "visitar" button. It upgrades to `linked` only once the academy is
  actually deployed. Claim **no** student counts, course counts, or reviews —
  nothing about the academy's scale is verified.
- Not scope, but worth stating: deploying the academy converts this block from a
  claim into evidence. That work belongs to `electrocode-academy`.

### 8.2 Retainer trust signal

The retainer has no possible case study. It needs a different signal, in this
order of strength:

1. **Published service commitments** — response-time window, channels, monthly
   hours, what counts as maintenance versus new work, cancellation terms. A
   published commitment is checkable; a promise is not. This is the primary
   signal and it costs decisions, not content.
2. **Itemized scope of maintenance** — dependency and security updates, uptime
   checks, backups, content edits, small features. The SMB objection here is
   precisely "what am I paying for in a month when nothing breaks".
3. **Continuity evidence** — the studio already carries multi-product, multi-year
   relationships (Blu Café's public site plus the `blu` back-office are the same
   client; ElectroCode Academy is a continuously maintained product). State only
   what is true and confirmable with the client.
4. **Deferred:** a testimonial from a retainer client. Highest-value signal,
   requires asking a client, OPEN, not in the first scope.

---

## 9. Slicing into deliverable increments

Each slice is independently deployable and leaves the site coherent.

| Slice | Deliverable | Why in this position |
|---|---|---|
| **1. Truth pass** | Brand rename + real description; hero CTA repointed off the dead `/portfolio`; the five duplicate entries and the `link: "/"` removed; `HeroParallax` row derivation reworked; minimal header/footer; **WhatsApp link** | **Fixes every shipped bug** and is the cheapest slice. Adds no routes — the site stays one page but stops misrepresenting itself. The WhatsApp link means the site can convert from day one, before any form exists |
| **2. Locale skeleton + content model** | Move to `app/[locale]/`; copy dictionaries; typed `lib/` modules; sitemap, robots, 404; `/` resolves to `/es` | Structural, visually neutral. Must land **before** copy is written, or every string gets written twice. Also the last safe moment: only `/` exists in the wild today, so URL churn costs nothing now and costs SEO later |
| **3. Landing narrative** | Sections 2–7: servicios, proceso, proyectos grid, autoridad, retainer, pricing summary | Where the page becomes a sales page. Needs copy but **not** every screenshot — the grid renders whatever evidence exists |
| **4. Pricing page** | `/[locale]/precios`, full structure, placeholders | Fully buildable now, blocked only on the user's figures before it can go live. Independent of slices 3 and 5 |
| **5. Case studies** | `/[locale]/proyectos/[slug]` + the 6–8 write-ups | Content-heavy and **internally divisible**: publish two, add the rest as captures and consent arrive. No single case study blocks another |
| **6. Conversion** | Brief form, qualifying questions, validation, `/gracias` | Last because it is the only slice with a server dependency (§4.3), and WhatsApp already covers conversion from slice 1 |

Ordering rationale: bug fixes first and cheapest; the one structural move before
any content exists; content-heavy work last and subdivided so the content
bottleneck (§10) never blocks a code slice.

---

## 10. The content dependency — the real bottleneck

**Code is not the constraint here. Imagery is.** `public/projects/` contains
exactly four files (VERIFIED): `luang.png`, `atemporal.png`, `blucafe.png`,
`blucafefinance.png`.

| Project | Usable imagery today | What capturing actually requires |
|---|---|---|
| Luang Asociados | `luang.png` | Nothing — live at `luang.com.pe` (200, VERIFIED) |
| Blu Café | `blucafe.png` | Nothing — live at `blucafe.vercel.app` (200, VERIFIED) |
| Atemporal Studio | `atemporal.png` | Confirm the URL is live — `atemporalarq.com` returned 000 from the exploration environment, UNVERIFIED |
| `blu` (POS/back-office) | `blucafefinance.png` | Repo has **no** `public/` directory. Deployment is login-walled, so real product captures need an **authorized login and sanitized data** |
| `fast-route` | None (boilerplate SVGs only) | **Run it locally** — not deployed (404). Map UI needs live tiles |
| `electrocode-academy` | Brand mark only (`public/brand/logo.png`) | **Run it locally** — private repo, deployment 404s |
| `blu-biolink` | Brand assets (`background.webp`, `logo.webp`), not screenshots | **Run it locally** — not deployed (404) |
| `wedding-invitation-piero` | Richest set, but they are design assets (`letter.png`, `flowers.png`, `opt/*.webp`), not product screenshots | **Run it locally** — not deployed. **Plus consent from the couple** |

Honest count: **four assets exist, covering three or four entries. Four to five
entries need fresh captures, and four repos must be run locally — one of them
behind an authorized login — before any capture is possible.** This is human
work that no code slice can absorb.

Consequence, stated plainly: slices 3 and 5 ship structurally regardless, because
the `no-visual` evidence state degrades honestly. But the site does not reach its
persuasive ceiling until captures exist, and that work should start in parallel
with slice 1 rather than being discovered at slice 5.

---

## 11. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Screenshot bottleneck (§10) caps persuasion | High | `evidence` states with honest `no-visual` degradation; slices 3/5 ship structurally; a per-project capture checklist started at slice 1 |
| Scope is large: 4 lines × 6–8 case studies × pricing × form | High | Six independently deployable slices; case studies land one at a time; each slice has its own verification |
| **No test runner** for a change of this size | High | See §11.1 |
| Prices never decided → pricing page cannot launch | Med | Typed placeholder tokens plus a launch gate that treats an unresolved placeholder as a failure; slice 4 is independent of the rest |
| `atemporalarq.com` unverified yet linked live today | Med | User confirms before slice 1 ships; if unreachable, downgrade that entry from `live` to a case study |
| Consent unresolved for `wedding-invitation-piero`, `blu-biolink`, `blu` | Med | `consent` field on the entity; default to excluded or anonymized until an explicit yes; never publish client-identifying detail without one |
| Solo operator's copy drifts into fabricated headcount | Med | Explicit copy rule (§4.4) plus a copy review checklist item; studio voice allowed, headcount claims banned |
| `HeroParallax` rework damages a hand-built visual | Med | Change only row derivation and the copy source; preserve every spring/transform value; visually check both 6- and 8-entry cases |
| Academy authority block over-claims | Low | No metrics, no live link until the academy is actually deployed |
| Internal case-study links inherit `target="_blank"` | Low | Make the hero card's target conditional on link kind (§4.1) |
| Locale segment adds indirection for a single shipped locale | Low | Accepted tradeoff — settled decision. One dynamic segment now versus a full routing refactor later |

### 11.1 The test-runner gap

**VERIFIED:** no test runner exists — `package.json` has no `test` script and no
`vitest`/`jest`/`playwright`/`@testing-library/*` dependency. `strict_tdd: false`.
The only verification available today is `npm run build` and `npm run lint`.

The concrete option, already recorded in `openspec/config.yaml` under
`testing.candidates`, is **Vitest + React Testing Library** (with Playwright for
E2E). **Nothing is installed and the user has not agreed to install anything** —
this is a flagged option, not a plan, and it is explicitly out of scope (§2.2).

Worth noting *why* it would pay for itself here: the failures that actually
shipped on this site are data-integrity failures, not rendering failures — a dead
internal link, a duplicated entry, a padded array. Those are pure-function
assertions over the content model (unique slugs, no internal link resolving to
`/`, every service line has at least one proof, no unresolved price placeholder in
a production build) and need no DOM at all. That is the cheapest possible
starting point if the user ever wants a net. Their decision, separate change.

---

## 12. Affected areas

| Area | Impact | Description |
|---|---|---|
| `app/layout.tsx` | Modified | Brand metadata, real description, header/footer, OG tags |
| `app/page.tsx` | Modified/Moved | Hardcoded `products` array removed; becomes the locale landing under `app/[locale]/` |
| `app/[locale]/` | New | Locale segment wrapping every content route |
| `app/[locale]/precios/page.tsx` | New | Pricing page |
| `app/[locale]/proyectos/[slug]/page.tsx` | New | Case-study route |
| `app/[locale]/gracias/page.tsx` | New | Brief confirmation |
| `app/sitemap.ts`, `app/robots.ts`, `app/not-found.tsx` | New | Discoverability and error handling |
| `components/ui/hero-parallax.tsx` | Modified | Row derivation, CTA target, conditional link target, copy moved out to dictionary |
| `components/` (sections) | New | Landing sections, portfolio grid, pricing blocks, trust blocks, brief form |
| `lib/` (content modules) | New | Typed project / service-line / pricing data plus locale dictionaries |
| `public/projects/` | Modified | New captures as they become available (§10) |
| `next.config.ts` | Possibly modified | Only if imagery moves to an external host (`images.remotePatterns`) |
| `package.json` | Possibly modified | Only if the §4.3 fork resolves to a mail provider SDK |

---

## 13. Rollback plan

Each slice is its own branch and PR, so the default rollback is reverting one
merge commit. Slice-specific notes:

| Slice | Rollback |
|---|---|
| 1 | Pure content and prop edits under `app/` and `hero-parallax.tsx`. Reverting restores today's page — including its bugs. Zero data, zero infra. |
| 2 | **The risky one.** Moving routes under `[locale]` changes every URL. Mitigated by timing: only `/` exists in the wild today, so `/` is the single URL that must keep working through the whole change. Do slice 2 **before** any new URL is shared externally, and reverting then costs nothing. |
| 3, 4, 5 | Additive routes and sections. Revert removes the section; earlier slices keep working. |
| 6 | Do **not** revert the slice if delivery fails — disable the form section behind a flag and let the WhatsApp path (live since slice 1) carry conversion. If the §4.3 fork resolved to Supabase, rollback also means a down migration; that is a design-phase obligation, not a proposal one. |

---

## 14. Dependencies

**Blocking on the user (content, not code):**

1. Confirm `https://www.atemporalarq.com/` is live (UNVERIFIED).
2. Actual price figures for lines A, C, D and a floor for B, plus currency.
3. Consent for `wedding-invitation-piero` (a specific couple's private event),
   `blu-biolink` (README declares the work proprietary to Blu Cafe TCQ), and
   authorized sanitized captures of `blu`.
4. Retainer commitments — response-time window, monthly hours, exclusions,
   cancellation terms (§8.2).
5. Screenshot captures for four to five entries (§10).
6. WhatsApp number and business contact details.

**Blocking on `sdd-design`:** the brief-form backend fork (§4.3).

**Not blocking, but changes the ceiling:** deploying `electrocode-academy`,
`fast-route`, `blu-biolink`, and `wedding-invitation-piero` would turn four
case-study-only entries into clickable links and upgrade the authority block from
`no-link` to `linked`.

---

## 15. Success criteria

- [ ] Zero dead internal links in the built output — `/portfolio` and `link: "/"` are gone.
- [ ] Metadata carries **ElectroCode Studio** and a non-empty description.
- [ ] All four service lines appear on the landing, in pricing, and with at least one proof each — except the retainer, which instead shows published commitments (§8.2).
- [ ] From `/es`, a prospect can do all five things listed in §1.
- [ ] Every curated project renders completely **with images disabled**.
- [ ] No unresolved price placeholder, no invented metric, and no headcount claim reaches production.
- [ ] The ElectroCode Academy block presents no link and no scale claim while the academy is undeployed.
- [ ] `npm run build` and `npm run lint` are clean.
- [ ] Adding `en` requires adding a dictionary — no route files move.
- [ ] Every case study states its evidence state and, where required, a truthful disclosure line.

---

## 16. Proposal question round

The nine settled product decisions are **not** reopened here. These are the gaps
that remain genuinely open, and the user's answers would sharpen the proposal
without changing its structure. The proposal proceeds on the stated assumption
in each case.

| # | Question | Assumption used if unanswered |
|---|---|---|
| 1 | Is `atemporalarq.com` live? | Assumed live; entry keeps `evidence: live` but is flagged for confirmation before slice 1 ships |
| 2 | Which of `wedding-invitation-piero`, `blu-biolink`, and `blu` do you have consent to show, and under what naming? | Assumed **no** consent yet: anonymized or withheld until an explicit yes |
| 3 | For line B, do you want to publish a starting-from floor, or no number at all? | Assumed a floor is published, because it lets unqualified prospects self-disqualify |
| 4 | What response-time commitment can you actually honor as a solo operator on the retainer? | Assumed a stated business-hours window exists; the figure is a placeholder |
| 5 | Should the first launch wait for all 6–8 case studies, or go live with two and add the rest? | Assumed **go live with two** — slice 5 is internally divisible for exactly this reason |
| 6 | Do you want conversion measurement (analytics) in this change or as a follow-up? | Assumed follow-up; currently out of scope (§2.2) |

The user may answer, skip, correct the framing, or request a second round.

---

## 17. Next phase

`sdd-spec` and `sdd-design` can run in parallel. `sdd-design` owns the §4.3
backend fork, the `/` → `/es` mechanism, and the `HeroParallax` row-derivation
design.
