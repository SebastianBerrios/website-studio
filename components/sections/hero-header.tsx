import type { Route } from "next";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { getDictionary } from "@/lib/dictionaries";
import { landingAnchor } from "@/lib/links";
import type { Locale } from "@/lib/content/locales";

/**
 * Server Component: renders the hero's title/subtitle/CTA from the active
 * locale's dictionary, passed into `HeroParallax`'s `header` slot
 * (design.md D5, task 2.15). Keeps Spanish copy on the server and out of
 * the client bundle — `HeroParallax` itself stays ignorant of copy shape.
 *
 * Not yet wired into any page: `app/[locale]/page.tsx` (PR 2c, task 2.18)
 * is what will pass `<HeroHeader locale={locale} />` as `HeroParallax`'s
 * `header` prop.
 */
export function HeroHeader({ locale }: { locale: Locale }) {
  const { hero } = getDictionary(locale);

  return (
    <div className="max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full left-0 top-0">
      <h1 className="text-2xl md:text-7xl font-bold dark:text-white">
        {hero.heading[0]}
        <br />
        {hero.heading[1]}
      </h1>
      <p className="max-w-2xl text-base md:text-xl mt-8 dark:text-neutral-200">
        {hero.subtitle}
      </p>
      <div className="mt-4">
        <HoverBorderGradient
          containerClassName="rounded-full"
          as="button"
          // `landingAnchor()` returns a plain `string` by contract (lib/links.ts),
          // so `typedRoutes` cannot verify it structurally. The cast is safe
          // here (unlike `caseStudyPath()`/`pricingPath()`): `/es` is a real
          // route created in this PR, and `#proyectos` is a real anchor
          // (`app/[locale]/page.tsx` renders `<div id="proyectos">`). See
          // design.md D7 and `lib/content/invariants.ts`'s
          // `checkNoSelfReferentialLinks`, which covers what this cast waives.
          href={landingAnchor(locale, "proyectos") as Route}
          className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
        >
          <span>{hero.cta}</span>
        </HoverBorderGradient>
      </div>
    </div>
  );
}
