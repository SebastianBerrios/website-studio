import { HeroParallax } from "@/components/ui/hero-parallax";
import { HeroHeader } from "@/components/sections/hero-header";
import { assertLocale } from "@/lib/content/locales";
import { toHeroProducts } from "@/lib/content/projections";

/**
 * The locale landing page. Only section 1 (hero) exists in this slice —
 * sections 2-9 land in PR 3/PR 4/PR 5/PR 6 (design.md §7 "Landing
 * composition").
 *
 * Replaces the former `app/page.tsx` (task 2.18). `toHeroProducts(locale)`
 * is now the single source of truth for the hero's product grid, replacing
 * the hardcoded 4-entry array that page used to define inline.
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
    <HeroParallax
      products={products}
      header={<HeroHeader locale={validLocale} />}
      // Anchors the products track, not the header/CTA above it — see
      // `productsId`'s doc comment in `hero-parallax.tsx` (verify-report.md
      // finding W2).
      productsId="proyectos"
    />
  );
}
