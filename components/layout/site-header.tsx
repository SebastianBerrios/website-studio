import Link from "next/link";
import type { Route } from "next";
import { WHATSAPP } from "@/lib/content/contact";
import { getDictionary } from "@/lib/dictionaries";
import { landingAnchor, pricingPath } from "@/lib/links";
import type { Locale } from "@/lib/content/locales";

// Server Component: no interactivity, so it stays out of the client bundle.
//
// The brand link resolves to `/{locale}` directly, never bare `/` —
// specs/site-shell/spec.md's "Zero Dead Internal Links" requirement forbids
// an internal link resolving to `/` when a real destination (`/es`) exists,
// even though `/` itself redirects and never 404s (next.config.ts's
// `redirects()`, design.md D2).
//
// The "Precios" nav item is back as of PR 4, now pointing at the real
// `/[locale]/precios` route (`pricingPath()`, which returns a template
// literal type — no `as Route` cast needed, see that helper's doc comment).
export function SiteHeader({ locale }: { locale: Locale }) {
  const { header } = getDictionary(locale);

  return (
    <header className="w-full border-b border-border/60">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 py-4">
        <Link
          href={`/${locale}`}
          className="text-lg font-bold tracking-tight"
        >
          {header.brand}
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href={landingAnchor(locale, "proyectos") as Route}>
            {header.projectsLink}
          </Link>
          <Link href={pricingPath(locale)}>{header.pricingLink}</Link>
          {WHATSAPP.status === "set" && (
            <a
              href={WHATSAPP.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium"
            >
              {header.whatsappLink}
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
