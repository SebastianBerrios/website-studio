import Link from "next/link";
import { WHATSAPP } from "@/lib/contact";

// Server Component. Only `es` ships today, so no locale-switcher is
// rendered — see design.md §7 and tasks.md task 1.8.
export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border/60 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 px-4 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-foreground">ElectroCode Studio</p>
          <p>Desarrollo web a medida, desde Perú.</p>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/#proyectos">Proyectos</Link>
          <Link href="/#precios">Precios</Link>
          {WHATSAPP.status === "set" && (
            <a href={WHATSAPP.url} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          )}
        </nav>
      </div>
    </footer>
  );
}
