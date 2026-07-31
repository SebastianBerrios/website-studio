import Link from "next/link";
import type { Route } from "next";
import { WHATSAPP } from "@/lib/content/contact";
import { landingAnchor } from "@/lib/links";
import type { Locale } from "@/lib/content/locales";

// Server Component: no interactivity, so it stays out of the client bundle.
//
// The brand link resolves to `/{locale}` directly, never bare `/` —
// specs/site-shell/spec.md's "Zero Dead Internal Links" requirement forbids
// an internal link resolving to `/` when a real destination (`/es`) exists,
// even though `/` itself redirects and never 404s (next.config.ts's
// `redirects()`, design.md D2).
//
// The "Precios" nav target has no rendered section on the page yet (PR 3b
// ships it) — same accepted temporary state PR 1 introduced for this exact
// anchor, now correctly locale-prefixed. It resolves to a real page (`/es`);
// it just does not scroll anywhere yet. See tasks.md task 4.8, which is
// where the real `/[locale]/precios#<line>` anchors replace this.
export function SiteHeader({ locale }: { locale: Locale }) {
  return (
    <header className="w-full border-b border-border/60">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 py-4">
        <Link
          href={`/${locale}` as Route}
          className="text-lg font-bold tracking-tight"
        >
          ElectroCode Studio
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href={landingAnchor(locale, "proyectos") as Route}>
            Proyectos
          </Link>
          <Link href={landingAnchor(locale, "precios") as Route}>
            Precios
          </Link>
          {WHATSAPP.status === "set" && (
            <a
              href={WHATSAPP.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium"
            >
              WhatsApp
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
