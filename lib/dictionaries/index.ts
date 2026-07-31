/**
 * Dictionary lookup by locale. See task 2.13.
 */

import type { Locale } from "@/lib/content/locales";
import type { Dictionary } from "./types";
import { es } from "./es";

const DICTIONARIES: Record<Locale, Dictionary> = { es };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
