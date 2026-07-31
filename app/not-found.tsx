import Link from "next/link";
import { DEFAULT_LOCALE } from "@/lib/content/locales";

/**
 * Root 404 — renders inside the root layout's `<html>`/`<body>`
 * (`app/layout.tsx`), so it must not render its own and cannot use the
 * locale dictionary or assume header/footer chrome (design.md §3, "Layout
 * and 404 boundaries"). This is what `dynamicParams = false` in
 * `app/[locale]/layout.tsx` triggers for any first segment outside
 * `LOCALES` (design.md D3, layer 1) — e.g. `/xx`.
 *
 * Default Spanish copy: today `LOCALES = ['es']`, so this is correct for
 * 100% of visitors. Adding a second locale would need this page to become
 * locale-aware some other way (design.md §3 documents this as accepted
 * future cost, not solved here).
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        ElectroCode Studio
      </p>
      <h1 className="text-3xl font-bold">Página no encontrada</h1>
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
