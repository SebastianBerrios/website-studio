import Link from "next/link";
import type { Metadata } from "next";
import { DEFAULT_LOCALE } from "@/lib/content/locales";

/**
 * Root 404 — renders inside the root layout's `<html>`/`<body>`
 * (`app/layout.tsx`), so it must not render its own and cannot use the
 * locale dictionary or assume header/footer chrome (design.md §3, "Layout
 * and 404 boundaries"). This is what `dynamicParams = false` in
 * `app/[locale]/layout.tsx` triggers for any first segment outside
 * `LOCALES` (design.md D3, layer 1) — e.g. `/xx`. It is ALSO what Next
 * serves for an unknown `proyectos/[slug]` — verified live: `dynamicParams
 * = false` on that route rejects at the routing layer, before
 * `app/[locale]/layout.tsx`'s own chrome ever renders, so this root boundary
 * handles that case too, not a locale-scoped one (see `app/[locale]/
 * not-found.tsx`'s removal, finding W4).
 *
 * Default Spanish copy: today `LOCALES = ['es']`, so this is correct for
 * 100% of visitors. Adding a second locale would need this page to become
 * locale-aware some other way (design.md §3 documents this as accepted
 * future cost, not solved here).
 *
 * **`metadata`, added 2026-08-01 (remediation of `verify-report-final.md`
 * finding W14)**: this file previously exported none, so it inherited the
 * root layout's brand-level title — identical to every other route. Static
 * (not `generateMetadata`) because this page takes no params and reads no
 * locale. `noindex` because a 404 has nothing for a search engine to rank,
 * matching `/[locale]/gracias`'s existing `robots` value.
 */
export const metadata: Metadata = {
  title: "Página no encontrada — ElectroCode Studio",
  description: "La página que buscas no existe o fue movida.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        ElectroCode Studio
      </p>
      <h1 className="text-3xl font-medium tracking-tight">Página no encontrada</h1>
      <p className="max-w-md text-muted-foreground">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        href={`/${DEFAULT_LOCALE}`}
        className="underline underline-offset-4"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
