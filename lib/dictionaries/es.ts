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
    approvalDeadlinePrefix: "Tienes",
    approvalDeadlineSuffix:
      "días hábiles para aprobar una fase pendiente de tu revisión; pasado ese plazo, el proyecto se pausa y la fecha de entrega se recalcula.",
  },
  portfolio: {
    heading: "Proyectos",
    gatedNote: "Acceso restringido: este producto requiere inicio de sesión.",
    notDeployedNote:
      "Este proyecto no cuenta con un despliegue público disponible.",
  },
  authority: {
    heading: "Un producto propio, bajo la misma marca",
    intro:
      "Es la prueba de que este estudio mantiene sus propios productos en producción de forma sostenida, con la misma disciplina que aplica en el trabajo para sus clientes.",
    visitCta: "Visitar",
  },
  retainer: {
    heading: "Mantenimiento y evolución",
    responseHeading: "Tiempos de respuesta",
    includedHeading: "Qué incluye",
    excludedHeading: "Qué no incluye",
    cancellationLabel: "Cancelación:",
  },
  notFound: {
    heading: "Página no encontrada",
    message: "La página que buscas no existe o fue movida.",
    backLink: "Volver al inicio",
  },
};
