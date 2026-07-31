import { HeroParallax } from "@/components/ui/hero-parallax";
import { HeroHeader } from "@/components/sections/hero-header";
import { Services } from "@/components/sections/services";
import { Process } from "@/components/sections/process";
import { Portfolio } from "@/components/sections/portfolio";
import { Authority } from "@/components/sections/authority";
import { Retainer } from "@/components/sections/retainer";
import { assertLocale } from "@/lib/content/locales";
import { toHeroProducts } from "@/lib/content/projections";

/**
 * The locale landing page. Sections rendered so far: 1 (Hero, PR 2), 2
 * (Servicios, PR 3a task 3.1), 3 (Proceso, PR 3a task 3.2), 4 (Proyectos,
 * PR 3a task 3.4), 5 (Autoridad, PR 3b task 3.5), 7 (Retainer, PR 3b task
 * 3.6). Section 6 (Precios summary, PR 3b task 3.8) is DELIBERATELY absent:
 * it depends on `Price`/`PricePending` (task 4.0, moved into PR 4) and on
 * `/[locale]/precios` existing (PR 4), neither of which has shipped — no
 * price figure has been supplied for any of the 8 tokens in
 * `lib/content/pricing.ts`. Sections 8-9 (Brief/WhatsApp + Footer wiring,
 * PR 6) are also NOT composed here yet.
 *
 * What IS rendered keeps the relative order
 * `specs/landing-narrative/spec.md`'s "Fixed Section Order" requires (Hero <
 * Servicios < Proceso < Proyectos < Autoridad < Retainer); the section-6 gap
 * is filled by PR 4/PR 3b's remaining task once pricing figures exist, not
 * reordered around.
 *
 * Replaces the former `app/page.tsx` (task 2.18). `toHeroProducts(locale)`
 * is now the single source of truth for the hero's product grid, replacing
 * the hardcoded 4-entry array that page used to define inline.
 *
 * `HeroParallax` no longer receives `productsId="proyectos"`: that id now
 * belongs to `components/sections/portfolio.tsx` — its real, intended
 * destination now that the Proyectos section exists — see that
 * component's doc comment.
 */
export default async function LocalePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = assertLocale(locale);
  const products = toHeroProducts(validLocale);

  return (
    <>
      <HeroParallax
        products={products}
        header={<HeroHeader locale={validLocale} />}
      />
      <Services locale={validLocale} />
      <Process locale={validLocale} />
      <Portfolio locale={validLocale} />
      <Authority locale={validLocale} />
      <Retainer locale={validLocale} />
    </>
  );
}
