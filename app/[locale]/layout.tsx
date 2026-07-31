import type { ReactNode } from "react";
import { LOCALES, assertLocale } from "@/lib/content/locales";
import { assertContentInvariants } from "@/lib/content/invariants";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

/**
 * Locale segment layout. Owns the header, footer, and the two runtime layers
 * of design.md D3's three-layer defence against the "phantom locale" gotcha:
 *
 * - Layer 1 (routing): `generateStaticParams()` + `dynamicParams = false`
 *   below make any first segment not in `LOCALES` 404 for the entire
 *   subtree, with zero runtime code.
 * - Layer 3 (runtime + typing): `assertLocale()` defends dev mode/config
 *   drift and narrows `params.locale`'s `string` to `Locale` — `params` is
 *   typed plain `string` by Next's own typegen (VERIFIED, design.md D3), so
 *   this runtime check is the only thing that can actually narrow it.
 *
 * Also runs the build-time content-integrity assertion (design.md §6, layer
 * 2) once per prerendered locale.
 */

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = assertLocale(locale);

  await assertContentInvariants();

  return (
    <>
      <SiteHeader locale={validLocale} />
      {children}
      <SiteFooter locale={validLocale} />
    </>
  );
}
