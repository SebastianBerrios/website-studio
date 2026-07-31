/**
 * Locale registry.
 *
 * See `openspec/changes/dev-services-website/design.md` D3 (layer 3) and
 * task 2.1. Only `es` ships today; adding a second locale is a one-line
 * change to `LOCALES` plus whatever the type system then demands.
 */

import { notFound } from "next/navigation";

export const LOCALES = ["es"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";

/** Type guard: narrows an arbitrary string to `Locale`. */
export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Narrows a route param's `string` to `Locale`, or calls `notFound()` on a
 * miss.
 *
 * This is layer 3 of design.md D3's three-layer defence against the
 * "phantom locale" gotcha: `params.locale` is typed plain `string` by
 * Next's own typegen (VERIFIED — no type-level union is possible), so this
 * runtime check is the only thing that can actually narrow it.
 */
export function assertLocale(value: string): Locale {
  if (!isLocale(value)) {
    notFound();
  }
  return value;
}
