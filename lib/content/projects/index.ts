/**
 * The curated project catalog — metadata only, no long prose.
 *
 * See `openspec/changes/dev-services-website/design.md` D9/§5,
 * `specs/project-portfolio/spec.md` ("Curated Set Size"), and
 * `specs/content-model/spec.md` ("Consent Field Semantics", "Evidence
 * Field"). Sourced strictly from `exploration.md` §4.1-§4.4 (VERIFIED
 * facts) — nothing here is invented: no client name beyond what the current
 * production site already publishes, no metric, no URL, no stack entry not
 * read directly from a repo's own manifest.
 *
 * **Merge: `blucafe` and `blu-biolink` were the same project.**
 * `https://blucafe.vercel.app/` (this entry's `evidence.externalUrl`, live
 * since before this batch) IS the biolink page documented by the
 * `blu-biolinks` repository — verified this session by fetching the live URL
 * (logo, "Café de especialidad", links to Carta/Ubicación/WhatsApp/
 * TikTok/Instagram) and comparing against that repo's own README, which
 * describes exactly that page. The two entries were never two projects; they
 * were one project filed twice, once under the wrong service line (`A`,
 * corporate sites) instead of the right one (`C`, biolinks). Merged into this
 * single entry: service line corrected to `C`, the live evidence and named
 * client are kept (see the entry below for the open item this merge
 * surfaces), and `blu-biolink`'s verified stack facts (`Astro 5.13`,
 * `Tailwind CSS v4`, read directly from that repo's own `package.json`) move
 * here since they describe the actual deployed page. `blu-biolink` is
 * removed from `PROJECT_SLUGS` and from this list; see
 * `lib/content/projects/approach/loader.ts` and the deleted
 * `approach/blu-biolink.ts`.
 *
 * `problem`, `role`, and every `outcome` are honestly `[PENDIENTE]` —
 * no real-case-study narrative has been supplied by the user for ANY
 * project yet. These are visibly-unresolved stubs, not plausible-sounding
 * filler.
 *
 * `caseStudyPublished` is `false` on every entry below because
 * `/[locale]/proyectos/[slug]` does not exist as a route yet (PR 5). PR 5 (or
 * a task 5.5 follow-up) flips this to `true` per project once its write-up
 * and the route both ship — see `lib/content/types.ts`'s doc comment on the
 * field and task 3.4's critical constraint in tasks.md.
 */

import type { Project } from "@/lib/content/types";
import { MEDIA } from "./media";

export const PROJECT_SLUGS = [
  "luang",
  "atemporal",
  "blucafe",
  "blu",
  "fast-route",
  "wedding-invitation-piero",
] as const;

export type ProjectSlug = (typeof PROJECT_SLUGS)[number];

/**
 * A pending, honestly-unresolved narrative field shared by every project
 * below (no real problem/role/outcome copy has been supplied yet).
 */
const PENDING_PROBLEM = {
  es: "[PENDIENTE] El detalle del problema de negocio de este proyecto todavía no ha sido documentado.",
};
const PENDING_ROLE = {
  es: "[PENDIENTE] El rol específico del estudio en este proyecto todavía no ha sido documentado.",
};
const PENDING_OUTCOME = {
  kind: "qualitative",
  statement: {
    es: "[PENDIENTE] El resultado de este proyecto todavía no ha sido documentado — no existe una métrica ni una afirmación verificable registrada.",
  },
} as const;

export const PROJECTS: readonly Project[] = [
  {
    slug: "luang",
    title: "Luang Asociados SAC",
    client: "Luang Asociados SAC",
    serviceLine: "A",
    summary: {
      es: "Sitio público en producción para Luang Asociados SAC — verificado accesible en luang.com.pe.",
    },
    problem: PENDING_PROBLEM,
    role: PENDING_ROLE,
    stack: [],
    outcome: PENDING_OUTCOME,
    evidence: {
      state: "live",
      externalUrl: "https://luang.com.pe/",
      media: [MEDIA.luang],
    },
    consent: { status: "granted", namedClient: true },
    featured: true,
    order: 1,
    caseStudyPublished: false,
    link: "https://luang.com.pe/",
    thumbnail: "/projects/luang.png",
  },
  {
    slug: "atemporal",
    title: "Atemporal Studio",
    client: "Atemporal Studio",
    serviceLine: "A",
    // `evidence.state` is `live` again: the old `atemporalarq.com` domain
    // genuinely does not resolve (NXDOMAIN confirmed on the apex and `www`,
    // finding C2 — that part of the prior finding stands), but the site
    // simply moved. The orchestrator verified `https://atemporalarq.vercel.app/`
    // directly: HTTP 200, `<title>Atemporal</title>`, no login wall,
    // responds in ~0.36s. Task 1.H2 is closed positively with this new URL.
    // The existing `atemporal.png` thumbnail is kept — same marketing
    // homepage, just reachable at a new host.
    summary: {
      es: "Sitio público en producción para Atemporal Studio — verificado accesible en atemporalarq.vercel.app (el antiguo dominio atemporalarq.com ya no resuelve).",
    },
    problem: PENDING_PROBLEM,
    role: PENDING_ROLE,
    stack: [],
    outcome: PENDING_OUTCOME,
    evidence: {
      state: "live",
      externalUrl: "https://atemporalarq.vercel.app/",
      media: [MEDIA.atemporal],
    },
    consent: { status: "granted", namedClient: true },
    featured: true,
    order: 2,
    caseStudyPublished: false,
    link: "https://atemporalarq.vercel.app/",
    thumbnail: "/projects/atemporal.png",
  },
  {
    slug: "blucafe",
    // Describes the WORK, not just the client — `checkUniqueHeroTitles`
    // requires a distinct label per project, and `blu` (this same client's
    // internal system, below) already carries "Sistema de gestión interno de
    // Blu Café". This project is a biolink page, not a corporate site — see
    // this file's header comment for the merge that corrected its service
    // line from `A` to `C`.
    title: "Página de enlaces (bio-link) de Blu Café",
    // Named, granted consent — carried over from the pre-merge `blucafe`
    // entry: the user holds authorization from Blu Cafe TCQ, the page is
    // publicly branded by the client itself (own logo, own name, own social
    // handles), and it was already published named on the live production
    // site before this change set touched it.
    //
    // OPEN ITEM, not blocking, not silently resolved either way: the
    // `blu-biolinks` repository's own README states "This project is private
    // and proprietary to Blu Cafe TCQ." That statement is about the
    // REPOSITORY/codebase, not necessarily about naming the client on a
    // portfolio case study for a page the client already runs publicly under
    // its own branding — but it is a real tension worth the client's
    // explicit confirmation before this entry is used as the basis for a
    // future write-up. Flagged here rather than either ignored or used as a
    // reason to silently anonymise a project the user already publishes
    // named.
    client: "Blu Café",
    serviceLine: "C",
    summary: {
      es: "Página de enlaces (bio-link) para Blu Café — verificado accesible en blucafe.vercel.app, con enlaces a carta, ubicación, WhatsApp, TikTok e Instagram.",
    },
    problem: PENDING_PROBLEM,
    role: PENDING_ROLE,
    // Verified directly from the `blu-biolinks` repository's own
    // `package.json` this session (astro `^5.13.5`, tailwindcss `^4.1.13`) —
    // moved here from the now-removed `blu-biolink` entry because this IS
    // that same deployed page (see this file's header comment).
    stack: ["Astro 5.13", "Tailwind CSS v4"],
    outcome: PENDING_OUTCOME,
    evidence: {
      state: "live",
      externalUrl: "https://blucafe.vercel.app/",
      media: [MEDIA.blucafe],
    },
    consent: { status: "granted", namedClient: true },
    featured: true,
    order: 3,
    caseStudyPublished: false,
    link: "https://blucafe.vercel.app/",
    thumbnail: "/projects/blucafe.png",
  },
  {
    slug: "blu",
    // Named per consent: the client authorized use of this capture
    // (user-stated consent, dated the `fix/restore-consented-content`
    // session — not a signed agreement). The capture itself already names
    // the client repeatedly (sidebar logo, "Bienvenido a Blu Café" heading),
    // so anonymising the title/client fields on top of a named screenshot
    // would be incoherent.
    title: "Sistema de gestión interno de Blu Café",
    client: "Blu Café",
    serviceLine: "B",
    // Accurate description: this is the AUTHENTICATED back-office dashboard
    // (client logo, "Bienvenido a Blu Café" heading, sidebar nav —
    // Categorías, Productos, Ingredientes, Recetas, Ventas), never a login
    // screen. A prior version of this file called it "la pantalla de inicio
    // de sesión", which was false and is why the unconsented-capture issue
    // (finding C1) went unnoticed for a full slice — do not repeat that
    // mistake.
    summary: {
      es: "Panel administrativo interno de Blu Café: gestión de categorías, productos, ingredientes, recetas y ventas — protegido por inicio de sesión, mostrado con autorización del cliente.",
    },
    problem: PENDING_PROBLEM,
    role: PENDING_ROLE,
    stack: [
      "Next.js 15.5.9",
      "React 19.1.0",
      "Tailwind CSS v4",
      "@supabase/ssr",
      "Sentry",
      "chart.js",
      "Vitest 4.1.5",
    ],
    outcome: PENDING_OUTCOME,
    // `evidence.state` is `gated`, not `no-visual`: the client authorized
    // this capture (3.H2, granted), so it ships again — but the product
    // itself genuinely sits behind a login (`blucafefinance.vercel.app`
    // returns 200 with a password field, VERIFIED), so `gated` is the
    // honest state, not `live`. `disclosure` carries the required explicit
    // login note plus the permission line (specs/project-portfolio/spec.md,
    // "Evidence State Rendering"). See
    // `sdd/dev-services-website/verify-report.md` finding C1.
    evidence: {
      state: "gated",
      disclosure: {
        es: "Este panel se encuentra protegido por inicio de sesión (blucafefinance.vercel.app requiere credenciales). Captura mostrada con autorización del cliente.",
      },
      media: [MEDIA.blu],
    },
    // Granted: the client authorized use of this capture, so the client may
    // be named (see `title`/`client` above).
    consent: { status: "granted", namedClient: true },
    featured: true,
    order: 4,
    caseStudyPublished: false,
    link: "/es/proyectos/blu",
    thumbnail: "/projects/blucafefinance.png",
  },
  {
    slug: "fast-route",
    title: "Optimización de rutas de entrega en tiempo real",
    // No third-party client is named anywhere in this repo's own source
    // (exploration.md §4.4) — presented as the studio's own project, so
    // naming carries no third-party consent risk.
    client: "Proyecto propio de ElectroCode Studio",
    serviceLine: "B",
    summary: {
      es: "Optimización de rutas de entrega en tiempo real: ubicar paradas en un mapa y obtener el orden de visita óptimo, con arquitectura documentada (screaming architecture).",
    },
    problem: PENDING_PROBLEM,
    role: PENDING_ROLE,
    stack: [
      "Next.js 16.2.10",
      "React 19.2.4",
      "MapLibre GL",
      "OpenFreeMap",
      "OpenRouteService",
      "@supabase/ssr",
      "Vitest",
      "React Compiler",
    ],
    outcome: PENDING_OUTCOME,
    // No public deployment reachable (verified 404) and no local capture
    // exists yet under `public/` — honestly `no-visual`, not `not-deployed`,
    // because `not-deployed` requires a non-empty media tuple this project
    // does not have (task 3.H1 is still open).
    evidence: { state: "no-visual", media: [] },
    consent: { status: "granted", namedClient: true },
    featured: true,
    order: 5,
    caseStudyPublished: false,
    link: "/es/proyectos/fast-route",
    thumbnail: "",
  },
  {
    slug: "wedding-invitation-piero",
    title: "Microsite de invitación de evento privado",
    // Withheld, not merely anonymised: this is a specific couple's private
    // event, not a commercial client with an industry/size to describe.
    // No recorded consent exists to publish anything identifying — this
    // entry stays out of `publishableProjects()` entirely (see
    // `projections.ts`) rather than being awkwardly anonymised as a
    // "business".
    client: "Evento privado (sin consentimiento registrado)",
    serviceLine: "C",
    summary: {
      es: "Microsite de invitación para un evento privado, con animación de apertura de sobre.",
    },
    problem: PENDING_PROBLEM,
    role: PENDING_ROLE,
    stack: [
      "Next.js 16.2.12",
      "React 19.2.4",
      "Tailwind CSS v4",
      "Vitest 4.1.10",
      "sharp",
    ],
    outcome: PENDING_OUTCOME,
    evidence: { state: "no-visual", media: [] },
    consent: { status: "withheld" },
    featured: false,
    // Compacted from 7 to 6 after the `blu-biolink` entry (former order 6)
    // was merged into `blucafe` — see this file's header comment.
    order: 6,
    caseStudyPublished: false,
    link: "/es/proyectos/wedding-invitation-piero",
    thumbnail: "",
  },
];
