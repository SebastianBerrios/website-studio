import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/content/locales";
import { publishedCaseStudyProjects } from "@/lib/content/projections";
import { caseStudyPath } from "@/lib/links";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Cross-product of `LOCALES` × published routes (design.md §3, "Surfaces"
 * table).
 *
 * **Deviation from design.md's literal table, now closed for the case-study
 * part too (task 5.6)**: the design lists `('', 'precios', 'proyectos/{slug}'
 * for each publishable project)` as the full cross-product. This file emits
 * the home entry, `precios` (PR 4), and now `proyectos/{slug}` for every
 * project whose case study is actually PUBLISHED
 * (`publishedCaseStudyProjects()` — `caseStudyPublished: true`), not every
 * `publishableProjects()` entry. Using the broader "publishable" set would
 * list `/[locale]/proyectos/atemporal`, `/blucafe`, `/fast-route` in
 * `sitemap.xml` today even though none of those has a route
 * `generateStaticParams` actually builds (`dynamicParams = false`) — a
 * crawler treats every sitemap URL as a real link, so that would be a
 * genuinely dead URL in the built output (specs/site-shell/spec.md, "Zero
 * Dead Internal Links": the built output must have zero dead internal links
 * at every point in the chain). `/gracias` stays excluded once it exists
 * (PR 6), per design.md D2.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((locale) => [
    { url: `${SITE_URL}/${locale}`, lastModified: new Date() },
    { url: `${SITE_URL}/${locale}/precios`, lastModified: new Date() },
    ...publishedCaseStudyProjects().map((project) => ({
      url: `${SITE_URL}${caseStudyPath(locale, project.slug)}`,
      lastModified: new Date(),
    })),
  ]);
}
