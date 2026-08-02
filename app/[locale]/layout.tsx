import type { ReactNode } from "react";
import { LOCALES, assertLocale } from "@/lib/content/locales";
import { assertContentInvariants } from "@/lib/content/invariants";
import { getDictionary } from "@/lib/dictionaries";
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
 *
 * **Skip link, added 2026-08-01 (remediation of `verify-report-final.md`
 * finding W8)**: no route had a `<main>` landmark or a skip link, so a
 * keyboard/screen-reader visitor had to traverse the full header and hero on
 * every single page. The anchor below is the first focusable element on
 * every route under this layout, `sr-only` until focused and then rendered
 * as a visible, high-contrast pill (`bg-foreground`/`text-background`,
 * already-verified colours — see `app/globals.css`). It targets
 * `#main-content`, an id every page under this layout now sets on its own
 * `<main>` (`app/[locale]/page.tsx`, `.../precios/page.tsx`,
 * `.../gracias/page.tsx`, `components/case-study/case-study-layout.tsx`) —
 * this layout does not render `<main>` itself because several of those pages
 * already had their own before this fix, and nesting a second `<main>` would
 * be an invalid duplicate landmark.
 */

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const dynamicParams = false;
export const dynamic = "force-static";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = assertLocale(locale);
  const { header } = getDictionary(validLocale);

  await assertContentInvariants();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-full focus-visible:bg-foreground focus-visible:px-6 focus-visible:py-3 focus-visible:text-sm focus-visible:font-medium focus-visible:text-background"
      >
        {header.skipToContentLabel}
      </a>
      <SiteHeader locale={validLocale} />
      {children}
      <SiteFooter locale={validLocale} />
    </>
  );
}
