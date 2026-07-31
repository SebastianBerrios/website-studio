import type { Metadata } from "next";
import "./globals.css";
import { DEFAULT_LOCALE } from "@/lib/content/locales";

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
  alternates: {
    canonical: `/${DEFAULT_LOCALE}`,
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
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
