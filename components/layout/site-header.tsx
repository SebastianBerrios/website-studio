import Link from "next/link";
import { WHATSAPP } from "@/lib/contact";

// Server Component: no interactivity, so it stays out of the client bundle.
// Nav targets `#proyectos` and `#precios` are same-page anchors until the
// dedicated routes ship (`/es/precios` in PR 4, `/es/proyectos/[slug]` in
// PR 5) — see design.md D2/D5 and tasks.md task 1.7.
export function SiteHeader() {
  return (
    <header className="w-full border-b border-border/60">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          ElectroCode Studio
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/#proyectos">Proyectos</Link>
          <Link href="/#precios">Precios</Link>
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
