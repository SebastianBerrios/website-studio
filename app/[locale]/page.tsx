import { HeroParallax } from "@/components/ui/hero-parallax";
import { HeroHeader } from "@/components/sections/hero-header";
import { Services } from "@/components/sections/services";
import { Process } from "@/components/sections/process";
import { Portfolio } from "@/components/sections/portfolio";
import { Authority } from "@/components/sections/authority";
import { PricingSummary } from "@/components/sections/pricing-summary";
import { Retainer } from "@/components/sections/retainer";
import { Brief } from "@/components/sections/brief";
import { assertLocale } from "@/lib/content/locales";
import { toHeroProducts } from "@/lib/content/projections";
import { canonicalFor } from "@/lib/seo";
import type { Metadata } from "next";

/**
 * Each route owns its canonical. The root layout deliberately declares none,
 * because a canonical in a shared shell is inherited by every page — see the
 * note in `app/layout.tsx` and `lib/seo.ts`.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: { canonical: canonicalFor(assertLocale(locale)) } };
}

/**
 * The locale landing page. All eight numbered sections `specs/
 * landing-narrative/spec.md`'s "Fixed Section Order" requires are now
 * composed: 1 (Hero, PR 2), 2 (Servicios, PR 3a), 3 (Proceso, PR 3a), 4
 * (Proyectos, PR 3a), 5 (Autoridad, PR 3b), 6 (Precios summary, PR 3b/4), 7
 * (Retainer, PR 3b), 8 (Brief/WhatsApp conversion, task 6.7, this batch).
 * The footer (site chrome, not a numbered landing section) is rendered by
 * `app/[locale]/layout.tsx`, unchanged.
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
      <Brief locale={validLocale} />
    </>
  );
}
