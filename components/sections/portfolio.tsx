import { toPortfolioCards } from "@/lib/content/projections";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/content/locales";
import { ProjectCard } from "@/components/portfolio/project-card";

/**
 * Server Component: landing section 4, "Proyectos" — the curated 6-8 project
 * grid. Task 3.4.
 *
 * **Owns the `#proyectos` anchor.** Until this section existed, `#proyectos`
 * targeted `HeroParallax`'s products track (`app/[locale]/page.tsx`'s
 * `productsId` prop, the `fix/restore-consented-content` remediation's W2
 * fix) — a stand-in, because the real Proyectos section did not exist yet.
 * Now that it does, the anchor moves HERE, its actual intended destination
 * per `specs/landing-narrative/spec.md`'s "Fixed Section Order". This
 * section is the only element on the page carrying `id="proyectos"` —
 * `app/[locale]/page.tsx` no longer passes `productsId` to `HeroParallax`,
 * so no duplicate id exists in the compiled output.
 *
 * **Grid consistency with the hero is enforced at build time, not just
 * documented**: `lib/content/invariants.ts`'s `checkHeroIsSubsetOfGrid` fails
 * the production build if the hero shows anything this grid does not, or if
 * a project with real media is missing from the hero — see
 * `specs/project-portfolio/spec.md`, "Portfolio Grid Consistency With Hero".
 *
 * **Link honesty**: `toPortfolioCards(locale)` already resolves whether each
 * card should be a link at all (`lib/content/projections.ts`'s
 * `portfolioLink()`) — this section renders whatever it receives without
 * second-guessing it. See `components/portfolio/project-card.tsx` for the
 * link-vs-non-link rendering itself.
 */
export function Portfolio({ locale }: { locale: Locale }) {
  const { portfolio } = getDictionary(locale);
  const cards = toPortfolioCards(locale);

  return (
    <section id="proyectos" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-4xl font-bold">
          {portfolio.heading}
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <ProjectCard key={card.slug} card={card} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
