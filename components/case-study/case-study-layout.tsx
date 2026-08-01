import Image from "next/image";
import Link from "next/link";
import type { Project, Localized } from "@/lib/content/types";
import type { Locale } from "@/lib/content/locales";
import { getDictionary } from "@/lib/dictionaries";
import { publicTitle } from "@/lib/content/projections";
import { pricingLineAnchor } from "@/lib/links";
import { WHATSAPP } from "@/lib/content/contact";
import { ServiceBadge } from "@/components/portfolio/service-badge";
import { DisclosureNote } from "./disclosure-note";

/**
 * Server Component: the full case-study template. Task 5.1. See
 * `specs/case-study/spec.md`, "Mandatory Template Elements" — every element
 * that requirement lists is rendered here: title + context, service-line
 * badge, problem, role, approach/process, stack, outcome, visual evidence in
 * its declared state, a disclosure line where required, and a next-step
 * block.
 *
 * **Persuasive without images**: `problem`, `role`, `approach`, and `outcome`
 * are each their own labelled section of real prose, never a caption
 * depending on a missing image — the "Persuasive Without Images" acceptance
 * test (`specs/case-study/spec.md`) is a property of the TEXT, so the layout
 * never makes a text element's meaning depend on the image rendering next to
 * it.
 *
 * **Title and Context Honesty**: `publicTitle(project)` is reused verbatim
 * from `lib/content/projections.ts` — the exact function that already gates
 * client naming on `consent` for the hero/grid — instead of a second
 * consent-`switch` that could drift out of sync with it.
 *
 * **Stack**: rendered only when `project.stack` is non-empty. A project with
 * no verified stack on record (e.g. `luang`, no repository in this
 * workspace) gets an honest "not available" note instead of a fabricated
 * technology list — never invented, matching this batch's hard constraint.
 *
 * **Next-step block, documented deviation**: `specs/case-study/spec.md`
 * requires a link "to the matching pricing block AND to the brief form".
 * `#brief`/`BriefForm` do not exist yet (PR 6b, explicitly out of scope this
 * batch), and this batch's hard constraints forbid linking to a target that
 * does not exist when the commit lands — the same reasoning
 * `components/sections/services.tsx` and `app/[locale]/precios/page.tsx`
 * already applied to this exact gap. The pricing-block link is real
 * (`pricingLineAnchor`); the brief-form link is substituted with the
 * already-live WhatsApp channel, same as those two components. PR 6b must
 * replace this with the real link once the form exists.
 */
export function CaseStudyLayout({
  project,
  approach,
  locale,
}: {
  project: Project;
  approach: Localized<string>;
  locale: Locale;
}) {
  const { caseStudy } = getDictionary(locale);
  const title = publicTitle(project);
  const { evidence } = project;

  return (
    <main className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4">
        <ServiceBadge serviceLine={project.serviceLine} locale={locale} />
        <h1 className="mt-4 text-3xl font-bold md:text-5xl">{title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {project.summary[locale]}
        </p>

        {evidence.state !== "no-visual" && (
          <div className="relative mt-10 aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
            <Image
              src={evidence.media[0].asset}
              alt={evidence.media[0].alt[locale]}
              fill
              sizes="(min-width: 1024px) 768px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        )}
        <div className="mt-3">
          <DisclosureNote evidence={evidence} locale={locale} />
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-semibold">
            {caseStudy.problemHeading}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {project.problem[locale]}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">{caseStudy.roleHeading}</h2>
          <p className="mt-3 text-muted-foreground">{project.role[locale]}</p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">
            {caseStudy.approachHeading}
          </h2>
          <p className="mt-3 whitespace-pre-line text-muted-foreground">
            {approach[locale]}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">{caseStudy.stackHeading}</h2>
          {project.stack.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {tech}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              {caseStudy.stackUnavailableNote}
            </p>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">{caseStudy.outcomeHeading}</h2>
          <p className="mt-3 text-muted-foreground">
            {project.outcome.kind === "metric"
              ? `${project.outcome.value} (${project.outcome.source})`
              : project.outcome.statement[locale]}
          </p>
        </section>

        <section className="mt-16 rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="text-2xl font-bold">{caseStudy.nextStepHeading}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {caseStudy.nextStepBody}
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={pricingLineAnchor(locale, project.serviceLine)}
              className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-medium"
            >
              {caseStudy.viewPricingCtaLabel}
            </Link>
            {WHATSAPP.status === "set" ? (
              <a
                href={WHATSAPP.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-medium"
              >
                {caseStudy.contactCtaLabel}
              </a>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
