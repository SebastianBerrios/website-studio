import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { assertLocale } from "@/lib/content/locales";
import { publishedCaseStudyProjects } from "@/lib/content/projections";
import { PROJECTS, type ProjectSlug } from "@/lib/content/projects";
import { getProjectApproach } from "@/lib/content/projects/approach/loader";
import { canonicalFor } from "@/lib/seo";
import { CaseStudyLayout } from "@/components/case-study/case-study-layout";

/**
 * Task 5.2. Statically enumerates only PUBLISHED case studies
 * (`publishedCaseStudyProjects()`, `luang` and `blu` today) —
 * **documented deviation from the task's literal `publishableProjects()`
 * wording**: enumerating every publishable project would statically
 * generate a page full of `[PENDIENTE]` stub prose for every curated project
 * that has not received a write-up yet (`atemporal`, `blucafe`,
 * `fast-route`), which is exactly the class of "shipped as if real" defect
 * this change set exists to avoid. `publishedCaseStudyProjects()` is the same
 * function `app/sitemap.ts` and `lib/content/invariants.ts`'s
 * `checkInternalLinksResolve` read from, so all three cannot drift apart.
 *
 * Ignores its `{ params }` argument on purpose: per design.md's `params`
 * asymmetry note this function receives the parent layout's already-resolved
 * `locale` as a plain object, but the published-slug set is locale-invariant
 * (`LOCALES = ['es']` only), so there is nothing to read from it here.
 */
export function generateStaticParams() {
  return publishedCaseStudyProjects().map((project) => ({ slug: project.slug }));
}

/** Unknown/unpublished slugs must 404, not render dynamically on request. */
export const dynamicParams = false;

/**
 * No request-time data on this page (design.md D11) — every project fact is
 * build-time content, same discipline as `app/[locale]/precios/page.tsx`.
 */
export const dynamic = "force-static";

function findPublishedProject(slug: string) {
  return PROJECTS.find((project) => project.slug === slug && project.caseStudyPublished);
}

/**
 * This page's own canonical (hard constraint 1). Without it the page would
 * inherit the root layout's — which sets none precisely so no route
 * silently inherits the wrong one, see `lib/seo.ts` and `app/layout.tsx`.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const validLocale = assertLocale(locale);
  const project = findPublishedProject(slug);
  if (!project) return {};

  return {
    alternates: { canonical: canonicalFor(validLocale, "proyectos", project.slug) },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const validLocale = assertLocale(locale);
  const project = findPublishedProject(slug);

  if (!project) notFound();

  // `PROJECTS` is typed `readonly Project[]` (task 2.8), so `slug` widens to
  // plain `string` at this boundary even though every entry is authored
  // alongside `PROJECT_SLUGS` in the same file — same cast and rationale as
  // `lib/content/invariants.ts`'s `checkNonEmptyApproach`.
  const { approach } = await getProjectApproach(project.slug as ProjectSlug);

  return (
    <CaseStudyLayout project={project} approach={approach} locale={validLocale} />
  );
}
