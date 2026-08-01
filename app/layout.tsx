import type { Metadata } from "next";
import { Fraunces, Karla } from "next/font/google";
import "./globals.css";
import { DEFAULT_LOCALE } from "@/lib/content/locales";

/**
 * Editorial typography (design direction "Editorial claro — señal de
 * oficio", feat/editorial-design). Before this slice the site imported NO
 * font at all and rendered in the system default — see the change's own
 * design brief for why that alone explains much of the previous flatness.
 *
 * `Fraunces` is the display serif: a variable optical-size family with a
 * `WONK` axis for its characterful ink-trap detailing, genuinely uncommon in
 * developer portfolios. `opsz` is exposed so large display sizes (the hero
 * heading) pick up the family's more expressive high-contrast cut while body
 * copy at small sizes stays legible — the whole point of a variable optical
 * size axis. `Karla` is the body grotesque: enough personality to pair with
 * a warm serif, plain enough to stay legible at small sizes in dense pricing
 * tables and form copy.
 *
 * Both load via `next/font/google` with `display: "swap"` (no invisible-text
 * flash while the face downloads) and are exposed as CSS variables, wired to
 * Tailwind v4 `font-display`/`font-sans` utilities in `app/globals.css`'s
 * `@theme inline` block — never referenced as raw `--font-fraunces-variable`
 * anywhere outside this file and that one block.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "WONK"],
  display: "swap",
  variable: "--font-fraunces",
});

const karla = Karla({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-karla",
});

const SITE_TITLE = "ElectroCode Studio";
const SITE_DESCRIPTION =
  "ElectroCode Studio diseña y desarrolla sitios web y aplicaciones a medida para negocios que quieren destacar en línea.";

// `NEXT_PUBLIC_SITE_URL` is a human task (2.H2, still open) — falls back to
// localhost so `npm run build` never fails on its absence. Without
// `metadataBase`, canonical/OG URLs render relative and are useless to
// crawlers (design.md D2).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
  },
  // NO `alternates.canonical` here, deliberately.
  //
  // A canonical set in the root layout is inherited by every route, so while
  // `/es` was the only page it looked correct — and became wrong the moment
  // `/es/precios` shipped, which then declared the homepage as its canonical
  // version. That tells search engines not to index the pricing page as
  // itself, defeating the reason it earns a URL at all (proposal §5:
  // "shareable, sent directly in DMs, SEO target").
  //
  // Canonicals belong to routes, not to the shell. Each page sets its own via
  // `generateMetadata` using `canonicalFor()` in `lib/seo.ts`. A route that
  // forgets simply emits no canonical, which search engines resolve from the
  // URL — a strictly better failure than a confidently wrong one.
  alternates: {
    languages: {
      [DEFAULT_LOCALE]: `/${DEFAULT_LOCALE}`,
      "x-default": `/${DEFAULT_LOCALE}`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${fraunces.variable} ${karla.variable}`}>
      <body className="font-sans antialiased">
        {/*
          Paper atmosphere: a very low-opacity dot texture, fixed behind
          every route. Purely decorative (`aria-hidden`), static (no
          animation at all — nothing here needs a `prefers-reduced-motion`
          guard because nothing here ever moves), and `-z-10` so it never
          intercepts a click or a screen reader.
        */}
        <div aria-hidden="true" className="bg-paper-texture" />
        {children}
      </body>
    </html>
  );
}
