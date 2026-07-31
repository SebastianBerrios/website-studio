import Link from "next/link";
import type { Route } from "next";
import { WHATSAPP } from "@/lib/content/contact";
import { getDictionary } from "@/lib/dictionaries";
import { landingAnchor } from "@/lib/links";
import type { Locale } from "@/lib/content/locales";

// Server Component. Only `es` ships today, so no locale-switcher is
// rendered — see design.md §7 and tasks.md task 1.8. Link rationale matches
// `site-header.tsx`: never bare `/`, both anchors locale-prefixed.
export function SiteFooter({ locale }: { locale: Locale }) {
  const { footer } = getDictionary(locale);

  return (
    <footer className="w-full border-t border-border/60 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 px-4 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-foreground">{footer.brand}</p>
          <p>{footer.tagline}</p>
        </div>
        <nav className="flex items-center gap-6">
          <Link href={landingAnchor(locale, "proyectos") as Route}>
            {footer.projectsLink}
          </Link>
          {/* No "Precios" item yet — see the note in site-header.tsx. PR 4
              adds it back pointing at the real `/[locale]/precios` route. */}
          {WHATSAPP.status === "set" && (
            <a href={WHATSAPP.url} target="_blank" rel="noopener noreferrer">
              {footer.whatsappLink}
            </a>
          )}
        </nav>
      </div>
    </footer>
  );
}
