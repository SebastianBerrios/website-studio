import { HeroParallax } from "@/components/ui/hero-parallax";
import { HeroHeader } from "@/components/sections/hero-header";
import { Services } from "@/components/sections/services";
import { Process } from "@/components/sections/process";
import { Portfolio } from "@/components/sections/portfolio";
import { Authority } from "@/components/sections/authority";
import { PricingSummary } from "@/components/sections/pricing-summary";
import { Retainer } from "@/components/sections/retainer";
import { assertLocale } from "@/lib/content/locales";
import { toHeroProducts } from "@/lib/content/projections";

/**
 * The locale landing page. All nine sections `specs/landing-narrative/
 * spec.md`'s "Fixed Section Order" requires are now composed except 8-9
 * (Brief/WhatsApp + Footer wiring, PR 6b — the WhatsApp link itself is
 * already live via the header/footer, only the dedicated brief-form section
 * is still missing): 1 (Hero, PR 2), 2 (Servicios, PR 3a), 3 (Proceso,
 * PR 3a), 4 (Proyectos, PR 3a), 5 (Autoridad, PR 3b), 6 (Precios summary,
 * task 3.8, this batch — unblocked now that task 4.0's `Price`/`PricePending`
 * and `/[locale]/precios` both exist), 7 (Retainer, PR 3b).
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
      <PricingSummary locale={validLocale} />
      <Retainer locale={validLocale} />
    </>
  );
}
