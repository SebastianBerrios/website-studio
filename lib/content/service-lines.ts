/**
 * The four service lines ElectroCode Studio sells.
 *
 * See `openspec/changes/dev-services-website/specs/service-catalog/spec.md`
 * (Fixed Four-Line Catalog) and design.md D9. `satisfies Record<ServiceLine,
 * ServiceLineDefinition>` guarantees at compile time that exactly these four
 * keys exist — no fifth line can be added, and none of A-D can go missing,
 * without a type error.
 */

import type { Localized } from "./types";

export type ServiceLine = "A" | "B" | "C" | "D";

export type ServiceLineDefinition = {
  readonly id: ServiceLine;
  readonly name: Localized<string>;
  readonly description: Localized<string>;
};

export const SERVICE_LINES = {
  A: {
    id: "A",
    name: { es: "Landing pages y sitios corporativos" },
    description: {
      es: "Sitios de una o varias páginas para presentar un negocio y convertir visitas en contacto.",
    },
  },
  B: {
    id: "B",
    name: { es: "Aplicaciones web y dashboards a medida" },
    description: {
      es: "Software a medida: paneles de control, herramientas internas y productos con lógica propia.",
    },
  },
  C: {
    id: "C",
    name: { es: "Biolinks y microsites de evento" },
    description: {
      es: "Páginas ligeras para un enlace único en redes sociales o para un evento puntual.",
    },
  },
  D: {
    id: "D",
    name: { es: "Mantenimiento y evolución" },
    description: {
      es: "Retainer mensual para mantener, actualizar y evolucionar un sitio o aplicación que ya está en producción.",
    },
  },
} as const satisfies Record<ServiceLine, ServiceLineDefinition>;
