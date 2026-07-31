import type { Metadata } from "next";
import "./globals.css";

const SITE_TITLE = "ElectroCode Studio";
const SITE_DESCRIPTION =
  "ElectroCode Studio diseña y desarrolla sitios web y aplicaciones a medida para negocios que quieren destacar en línea.";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
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
