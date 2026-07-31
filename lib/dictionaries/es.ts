/**
 * Spanish dictionary. Extracted verbatim from `hero-parallax.tsx`'s
 * previously-hardcoded `Header()` (task 2.13/1.6) — no copy invented here,
 * only relocated.
 */

import type { Dictionary } from "./types";

export const es: Dictionary = {
  hero: {
    heading: ["Tu proyecto es único,", "tu web también"],
    subtitle:
      "Tu negocio merece más que una plantilla aburrida. Diseñamos webs únicas, flexibles y listas para atraer clientes. Tú pones la idea, nosotros la magia.",
    cta: "Explora nuestros proyectos",
  },
  services: {
    heading: "Servicios",
    proofCta: "Ver proyectos",
  },
  process: {
    heading: "Proceso",
    approvalBadge: "Requiere tu aprobación para avanzar",
    revisionsLabel: "rondas de revisión incluidas.",
    revisionsExtra: "Rondas adicionales se cotizan aparte.",
  },
  portfolio: {
    heading: "Proyectos",
    gatedNote: "Acceso restringido: este producto requiere inicio de sesión.",
    notDeployedNote:
      "Este proyecto no cuenta con un despliegue público disponible.",
  },
  notFound: {
    heading: "Página no encontrada",
    message: "La página que buscas no existe o fue movida.",
    backLink: "Volver al inicio",
  },
};
