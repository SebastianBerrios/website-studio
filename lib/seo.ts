/**
 * Canonical URL helpers.
 *
 * Why this exists: `app/layout.tsx` used to declare
 * `alternates.canonical: "/es"`. Every route inherits root-layout metadata, so
 * that was correct while `/es` was the only page and silently became wrong the
 * moment `/es/precios` shipped — the pricing page then told search engines its
 * canonical version was the homepage, which is an instruction not to index it
 * as itself. That defeats the reason a pricing route exists (proposal §5:
 * "shareable, sent directly in DMs, SEO target").
 *
 * A canonical describes ONE page. It cannot live in a shared shell.
 *
 * Every route under `app/[locale]/` must export `generateMetadata` and set
 * `alternates.canonical` with `canonicalFor()`. A route that forgets emits no
 * canonical at all, and a search engine falls back to the request URL — the
 * right failure mode, since a missing canonical is recoverable and a wrong one
 * actively misdirects.
 *
 * Paths returned here are root-relative on purpose: `metadataBase` in the root
 * layout resolves them against `NEXT_PUBLIC_SITE_URL`, and a production build
 * fails outright if that variable is unset (`checkSiteUrlConfigured` in
 * `lib/content/invariants.ts`), so a canonical can never silently resolve
 * against localhost.
 */

import type { Metadata } from "next";
import { DEFAULT_LOCALE, type Locale } from "@/lib/content/locales";

/**
 * The canonical path for a page.
 *
 * @param locale  the active locale segment
 * @param segments further path segments below the locale, already
 *                 URL-safe — e.g. `canonicalFor("es", "precios")` yields
 *                 `/es/precios`, and `canonicalFor("es")` yields `/es`.
 */
export function canonicalFor(locale: Locale, ...segments: string[]): string {
  return segments.length === 0
    ? `/${locale}`
    : `/${locale}/${segments.join("/")}`;
}

/**
 * `alternates` for one route: its canonical, plus `languages`/`x-default`.
 *
 * **Added 2026-08-01 (remediation of `verify-report-final.md` finding
 * W13)**: `app/layout.tsx` declares `alternates.languages`/`x-default` once,
 * meaning to cover every route. But Next.js metadata merging replaces
 * `alternates` **wholesale** per route rather than merging its sub-keys, so
 * every route that called `generateMetadata` and returned only
 * `{ canonical }` silently discarded the root layout's `languages`/
 * `x-default` — verified in the compiled `<head>`: they landed only on
 * `_not-found`, the one route with no `generateMetadata` of its own. Every
 * route's `generateMetadata` should return this function's result instead of
 * a bare `{ canonical }` object, so both survive together.
 *
 * With `LOCALES = ['es']` (`lib/content/locales.ts`), a page's own canonical
 * IS its default-locale version, so `x-default` and `languages[es]` both
 * point at the same path — exactly what the root layout's now-overridden
 * declaration meant for every route before a second route existed. Adding a
 * real second locale later is still design.md D2's "one-entry change": add
 * that locale's own path under `languages`, and reconsider what `x-default`
 * should point to once there is a real choice to make.
 */
export function canonicalAlternates(
  locale: Locale,
  ...segments: string[]
): NonNullable<Metadata["alternates"]> {
  const path = canonicalFor(locale, ...segments);
  return {
    canonical: path,
    languages: {
      [DEFAULT_LOCALE]: path,
      "x-default": path,
    },
  };
}
