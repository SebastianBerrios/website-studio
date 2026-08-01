import Link from "next/link";
import { DEFAULT_LOCALE } from "@/lib/content/locales";
import { getDictionary } from "@/lib/dictionaries";

/**
 * In-locale 404 (e.g. a bad case-study slug once `[slug]` exists). Rendered
 * inside `app/[locale]/layout.tsx`, which already supplies `SiteHeader`/
 * `SiteFooter` chrome around it (design.md §3, "Layout and 404 boundaries").
 *
 * Uses `DEFAULT_LOCALE`'s dictionary rather than reading `params`: whether
 * Next passes `params` to a `not-found.tsx` file for this version is not
 * verified in this codebase's `node_modules` (unlike the facts design.md §10
 * confirms elsewhere), and `LOCALES = ['es']` today makes the default-locale
 * dictionary correct for 100% of visitors regardless.
 */
export default function LocaleNotFound() {
  const { notFound } = getDictionary(DEFAULT_LOCALE);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-medium tracking-tight">{notFound.heading}</h1>
      <p className="max-w-md text-muted-foreground">{notFound.message}</p>
      <Link
        href={`/${DEFAULT_LOCALE}`}
        className="underline underline-offset-4"
      >
        {notFound.backLink}
      </Link>
    </main>
  );
}
