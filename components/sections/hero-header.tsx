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
          // `landingAnchor()` returns a plain `string` by contract
          // (lib/links.ts), so `typedRoutes` cannot verify it structurally,
          // and this cast waives that check for the hero CTA's href.
          //
          // Unlike `product.link as Route` in `hero-parallax.tsx`, this cast
          // has NO compensating build-time control. `lib/content/
          // invariants.ts`'s `checkNoSelfReferentialLinks` does NOT cover
          // it: that function only inspects `toHeroProducts()` output, and
          // only tests equality with `/` or `/{locale}` — a different
          // property than "does this anchor target actually exist".
          // `checkInternalLinksResolve` has the same blind spot; neither
          // ever sees this component's href. The target is safe TODAY only
          // because `/es#proyectos` is a real anchor —
          // `components/sections/portfolio.tsx` (PR 3a, task 3.4) carries
          // `id="proyectos"` on its section element — verified by reading
          // the two files side by side, not by any gate. (Until PR 3a
          // shipped, this same anchor targeted `HeroParallax`'s products
          // track via its `productsId` prop, the `fix/restore-consented-
          // content` remediation's W2 fix; the anchor moved to the real
          // Proyectos section once it existed, and `HeroParallax` no longer
          // receives `productsId` from `app/[locale]/page.tsx`.) See
          // `sdd/dev-services-website/verify-report.md` finding W1.
          href={landingAnchor(locale, "proyectos") as Route}
          className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
        >
          <span>{hero.cta}</span>
        </HoverBorderGradient>
      </div>
    </div>
  );
}
