import { HeroParallax } from "@/components/ui/hero-parallax";
import { HeroHeader } from "@/components/sections/hero-header";
import { Services } from "@/components/sections/services";
import { Portfolio } from "@/components/sections/portfolio";
import { assertLocale } from "@/lib/content/locales";
import { toHeroProducts } from "@/lib/content/projections";

/**
 * The locale landing page. Sections rendered so far: 1 (Hero, PR 2), 2
 * (Servicios, PR 3a task 3.1), 4 (Proyectos, PR 3a task 3.4). Sections 3
 * (Proceso), 5-7 (Autoridad/Precios summary/Retainer, PR 3b), and 8-9
 * (Brief/WhatsApp + Footer wiring, PR 6) are NOT composed here yet — this is
 * a partial slice of PR 3, not the full landing-narrative order. What IS
 * rendered keeps the relative order `specs/landing-narrative/spec.md`'s
 * "Fixed Section Order" requires (Hero < Servicios < Proyectos); the gaps
 * are filled by later slices, not reordered around.
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
      <Portfolio locale={validLocale} />
    </>
  );
}
