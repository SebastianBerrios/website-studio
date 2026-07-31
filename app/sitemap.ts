import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/content/locales";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Cross-product of `LOCALES` × published routes (design.md §3, "Surfaces"
 * table).
 *
 * **Deviation from design.md's literal table**, flagged rather than
 * silently applied: the design lists `('', 'precios', 'proyectos/{slug}' for
 * each publishable project)` as the full cross-product. This PR only emits
 * the home entry (`''`). `/[locale]/precios` (PR 4) and
 * `/[locale]/proyectos/[slug]` (PR 5) do not exist yet under
 * `stacked-to-main`'s ordering — listing them here would put a genuinely
 * dead URL in the built output's `sitemap.xml`, which a crawler treats as a
 * real link (specs/site-shell/spec.md, "Zero Dead Internal Links": the
 * built output must have zero dead internal links at every point in the
 * chain).
 *
 * PR 4 must add the `precios` entry when it ships; PR 5's task 5.6
 * ("confirm it now emits real `/[locale]/proyectos/<slug>` entries") must
 * add the `publishableProjects()`-driven case-study entries at that point —
 * this file does not pre-build that cross-product early. `/gracias` stays
 * excluded once it exists (PR 6), per design.md D2.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    lastModified: new Date(),
  }));
}
