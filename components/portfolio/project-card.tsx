import { cn } from "@/lib/utils";
import { isExternalHref } from "@/lib/links";
import type { Locale } from "@/lib/content/locales";
import type { PortfolioCard as PortfolioCardData } from "@/lib/content/projections";
import { ServiceBadge } from "./service-badge";
import { Evidence } from "./evidence";

/**
 * Server Component: one card in the landing's Proyectos grid. Task 3.3/3.4.
 *
 * **Link-vs-non-link, and why this never uses `next/link` for the internal
 * case.** `card.link` is `undefined` whenever the project's evidence is not
 * `live` and its case study is not yet published (`lib/content/
 * projections.ts`'s `portfolioLink()`) — today that is every non-`live`
 * project in the curated set, because `/[locale]/proyectos/[slug]` does not
 * exist as a route until PR 5. When `card.link` IS defined for a non-`live`
 * project, it targets that not-yet-existing route family, so this component
 * renders it with a plain `<a>`, never `<Link>`: `typedRoutes` cannot verify
 * a route that isn't generated yet, and adding an `as Route` cast here would
 * be a THIRD waiver of that guarantee in this codebase (the other two are
 * `hero-parallax.tsx`'s `product.link` — permanent, compensated by
 * `checkInternalLinksResolve` — and the temporary one at `lib/brief/
 * submit.ts`, removed by task 6.9b). `lib/content/invariants.ts`'s
 * `checkPortfolioLinksOnlyToPublishedCaseStudies` is this card's
 * compensating control instead: it fails the build if any card ever links to
 * an unpublished case study. Once PR 5 creates the route, upgrading this one
 * branch to `<Link>` for prefetching is a natural follow-up, not a defect.
 *
 * A `live` project's link is always its external URL — see `portfolioLink()`
 * — rendered with `target="_blank" rel="noopener noreferrer"`, matching the
 * hero's `ProductCard` convention (design.md D6).
 *
 * **Non-link cards must not look clickable** (tasks.md 3.V7): no hover
 * affordance, no pointer cursor, no wrapping interactive element at all.
 */
export function ProjectCard({
  card,
  locale,
}: {
  card: PortfolioCardData;
  locale: Locale;
}) {
  const cardClassName = cn(
    "flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-colors",
    card.link !== undefined
      ? "hover:border-foreground/40 cursor-pointer"
      : "cursor-default",
  );

  const content = (
    <>
      <ServiceBadge serviceLine={card.serviceLine} locale={locale} />
      <h3 className="font-display text-lg font-medium text-card-foreground">
        {card.title}
      </h3>
      <Evidence evidence={card.evidence} locale={locale} />
      <p className="text-sm text-muted-foreground">{card.summary[locale]}</p>
    </>
  );

  if (card.link === undefined) {
    return <div className={cardClassName}>{content}</div>;
  }

  return isExternalHref(card.link) ? (
    <a
      href={card.link}
      target="_blank"
      rel="noopener noreferrer"
      className={cardClassName}
    >
      {content}
    </a>
  ) : (
    <a href={card.link} className={cardClassName}>
      {content}
    </a>
  );
}
