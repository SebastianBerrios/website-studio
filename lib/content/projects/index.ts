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
 * `problem`, `role`, and every `outcome` are honestly `[PENDIENTE]` —
 * no real-case-study narrative has been supplied by the user for ANY
 * project yet (not even Luang or Blu Café, PR 5's first two case studies).
 * These are visibly-unresolved stubs, not plausible-sounding filler.
 */

import type { Project } from "@/lib/content/types";
import { MEDIA } from "./media";

export const PROJECT_SLUGS = [
  "luang",
  "atemporal",
  "blucafe",
  "blu",
  "fast-route",
  "blu-biolink",
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
    link: "https://luang.com.pe/",
    thumbnail: "/projects/luang.png",
  },
  {
    slug: "atemporal",
    title: "Atemporal Studio",
    client: "Atemporal Studio",
    serviceLine: "A",
    // `evidence.state` is `not-deployed`, not `live`: `atemporalarq.com`
    // returns NXDOMAIN on both the apex and `www`, verified with `nslookup`
    // and `curl` from the same resolver that, in the same run, correctly
    // resolved the other three project domains — so this is a confirmed
    // non-resolving domain, not a local network/DNS restriction (the
    // explanation this comment previously — and wrongly — recorded). Task
    // 1.H2 is now answerable negatively; a single independent cross-network
    // check is still recommended before treating this as permanent. See
    // `sdd/dev-services-website/verify-report.md` finding C2. The captured
    // screenshot is kept: it is a marketing homepage capture, not a private
    // system, so it stays as visual evidence even though the link does not.
    summary: {
      es: "Sitio de Atemporal Studio. El dominio atemporalarq.com no resuelve (NXDOMAIN confirmado en el apex y en www) — no hay despliegue público accesible hoy. Ver la tarea 1.H2.",
    },
    problem: PENDING_PROBLEM,
    role: PENDING_ROLE,
    stack: [],
    outcome: PENDING_OUTCOME,
    evidence: {
      state: "not-deployed",
      media: [MEDIA.atemporal],
    },
    consent: { status: "granted", namedClient: true },
    featured: true,
    order: 2,
    link: "/es/proyectos/atemporal",
    thumbnail: "/projects/atemporal.png",
  },
  {
    slug: "blucafe",
    title: "Blu Café",
    client: "Blu Café",
    serviceLine: "A",
    summary: {
      es: "Sitio público en producción para Blu Café — verificado accesible en blucafe.vercel.app.",
    },
    problem: PENDING_PROBLEM,
    role: PENDING_ROLE,
    stack: [],
    outcome: PENDING_OUTCOME,
    evidence: {
      state: "live",
      externalUrl: "https://blucafe.vercel.app/",
      media: [MEDIA.blucafe],
    },
    consent: { status: "granted", namedClient: true },
    featured: true,
    order: 3,
    link: "https://blucafe.vercel.app/",
    thumbnail: "/projects/blucafe.png",
  },
  {
    slug: "blu",
    // Anonymised per consent below: no client name is used anywhere,
    // including this internal `title`/`client` pair.
    title: "Sistema de back-office para negocio de alimentos y bebidas",
    client: "Cliente no identificado (back-office con acceso restringido)",
    serviceLine: "B",
    summary: {
      es: "Sistema de back-office y operaciones: usuarios, auditorías, estadísticas, compras, programación, inventario, pedidos, ventas, recetas y finanzas — protegido por inicio de sesión.",
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
    // `evidence.state` is `no-visual`, not `gated`: the only capture ever on
    // file for this project was not a login screen — it was the
    // AUTHENTICATED dashboard, naming the client repeatedly
    // (sidebar logo, "Bienvenido a Blu Café" heading, full nav tree). It has
    // been removed from `public/projects/` and from `lib/content/projects/
    // media.ts`. Consent to publish any capture of this back-office is
    // still open (task 3.H2), so no image ships until a genuinely
    // sanitized, authorized capture lands. See
    // `sdd/dev-services-website/verify-report.md` finding C1.
    evidence: { state: "no-visual", media: [] },
    // Not granted: no recorded consent to name the client behind this
    // login-walled back-office product. Industry is a factual read of the
    // repo's own domain (recipes, orders, sales -> food & beverage); size
    // is honestly unknown rather than guessed.
    consent: {
      status: "anonymised",
      industry: "Alimentos y bebidas (back-office / punto de venta)",
      size: "Tamaño no determinado",
    },
    featured: true,
    order: 4,
    link: "/es/proyectos/blu",
    thumbnail: "",
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
    link: "/es/proyectos/fast-route",
    thumbnail: "",
  },
  {
    slug: "blu-biolink",
    title: "Página de enlaces para redes sociales",
    // Not granted: this repo's own README declares the work "private and
    // proprietary to Blu Cafe TCQ" (exploration.md §4.4) even though the
    // repository itself is public. Anonymised per instructions — no client
    // name anywhere in this entry.
    client: "Cliente no identificado (uso restringido según el README del repositorio)",
    serviceLine: "C",
    summary: {
      es: "Página de enlaces (bio-link) para redes sociales: enlaces a TikTok, Instagram, menú y ubicación.",
    },
    problem: PENDING_PROBLEM,
    role: PENDING_ROLE,
    stack: ["Astro 5.13", "Tailwind CSS v4"],
    outcome: PENDING_OUTCOME,
    evidence: { state: "no-visual", media: [] },
    consent: {
      status: "anonymised",
      industry: "Alimentos y bebidas (bio-link de redes sociales)",
      size: "Tamaño no determinado",
    },
    featured: true,
    order: 6,
    link: "/es/proyectos/blu-biolink",
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
    order: 7,
    link: "/es/proyectos/wedding-invitation-piero",
    thumbnail: "",
  },
];
