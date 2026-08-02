/**
 * Spanish dictionary. Extracted verbatim from `hero-parallax.tsx`'s
 * previously-hardcoded `Header()` (task 2.13/1.6) — no copy invented here,
 * only relocated.
 */

import type { Dictionary } from "./types";

export const es: Dictionary = {
  header: {
    brand: "ElectroCode Studio",
    projectsLink: "Proyectos",
    pricingLink: "Precios",
    whatsappLink: "WhatsApp",
    skipToContentLabel: "Saltar al contenido principal",
  },
  footer: {
    brand: "ElectroCode Studio",
    tagline: "Desarrollo web a medida, desde Perú.",
    projectsLink: "Proyectos",
    pricingLink: "Precios",
    whatsappLink: "WhatsApp",
  },
  hero: {
    heading: ["Tu proyecto es único,", "tu web también"],
    subtitle:
      "Tu negocio merece más que una plantilla aburrida. Diseñamos webs únicas, flexibles y listas para atraer clientes. Tú pones la idea, nosotros la magia.",
    cta: "Explora nuestros proyectos",
  },
  services: {
    heading: "Servicios",
    proofCta: "Ver proyectos",
    pricingCta: "Ver precios",
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
    // Claims here are deliberately narrow. Two earlier versions over-claimed:
    // "en producción" contradicted the very next sentence (the deployment
    // returns 404), and "de forma sostenida" implied longevity a repository
    // created 2026-07-28 cannot support. What IS verifiable is domain depth —
    // the studio builds, maintains and teaches in the same field — and that
    // stands with no deployment and no age. Do not reintroduce claims about
    // uptime, longevity, or scale.
    intro:
      "El mismo estudio que construye tu sitio desarrolla y enseña en el mismo terreno: una plataforma propia de cursos gratuitos de programación y electrónica, con la misma disciplina que aplica en el trabajo para sus clientes.",
    visitCta: "Visitar",
  },
  retainer: {
    heading: "Mantenimiento y evolución",
    responseHeading: "Tiempos de respuesta",
    includedHeading: "Qué incluye",
    excludedHeading: "Qué no incluye",
    cancellationLabel: "Cancelación:",
  },
  pricing: {
    heading: "Precios",
    introHeading: "Cómo funciona el precio",
    introBody:
      "Cada línea de servicio tiene un precio de referencia. Los planes fijos cubren un alcance definido; lo que no encaja en un plan fijo se cotiza a medida.",
    launchNotePrefix: "Precios de lanzamiento para los primeros",
    launchNoteSuffix:
      "proyectos del estudio. Pueden actualizarse más adelante para nuevos proyectos.",
    lineAHeading: "Landing pages y sitios corporativos",
    lineCHeading: "Biolinks y microsites de evento",
    lineBHeading: "Aplicaciones web y dashboards a medida",
    lineDHeading: "Mantenimiento y evolución",
    audienceLabel: "Para quién es",
    deliverablesLabel: "Qué incluye",
    notIncludedHeading: "Qué no incluye",
    turnaroundLabel: "Tiempo de entrega",
    turnaroundPendingNote: "Tiempo de entrega pendiente de definir.",
    revisionsPrefix: "Incluye",
    revisionsSuffix: "rondas de revisión.",
    quoteShapesHeading: "Tipos de proyecto habituales",
    quoteVariablesHeading: "Qué mueve el precio",
    quoteProcessHeading: "Cómo cotizamos",
    quoteFloorPrefix: "Desde",
    termsHeading: "Condiciones generales",
    alwaysIncludedHeading: "Siempre incluido",
    alwaysExtraHeading: "Siempre aparte",
    paymentScheduleLabel: "Forma de pago",
    paymentSchedulePendingNote: "Forma de pago pendiente de definir.",
    ctaHeading: "¿Conversamos sobre tu proyecto?",
    ctaBody:
      "Escríbenos por WhatsApp contándonos qué línea te interesa y te respondemos con los siguientes pasos.",
    ctaButtonLabel: "Escribir por WhatsApp",
    faq: {
      heading: "Preguntas frecuentes",
      priceReasonQuestion: "¿Por qué el precio no es más bajo?",
      priceReasonAnswer:
        "Estos ya son precios de lanzamiento, reducidos frente a lo que cobraremos una vez completados los primeros proyectos. Cada proyecto lo desarrolla directamente el estudio, sin intermediarios.",
      laterChangesQuestion: "¿Qué pasa si necesito cambios más adelante?",
      laterChangesAnswer:
        "Cada proyecto incluye rondas de revisión durante el desarrollo (ver \"Condiciones generales\"). Después de la entrega, los cambios se cubren con un plan de mantenimiento (línea Mantenimiento) o se cotizan aparte.",
      codeOwnershipQuestion: "¿Quién es dueño del código?",
      codeOwnershipPendingAnswer:
        "Pendiente de confirmar — todavía no hemos definido esta política públicamente.",
      howToLeaveQuestion: "¿Cómo puedo dejar de trabajar con el estudio?",
      // Remediation of `verify-report-final.md` finding W3 (2026-08-01): this
      // answer used to state "lo entregado es tuyo al finalizar" — a
      // code-ownership claim with no provenance anywhere in this batch's
      // supplied facts, directly contradicting `codeOwnershipPendingAnswer`
      // two questions above. Removed, not replaced with a different
      // ownership claim — the hard constraint forbids inventing that policy.
      // What remains (no permanencia in a one-off project; the retainer's
      // 30-day cancellation notice) is real and already sourced
      // (`lib/content/retainer.ts`'s `RETAINER_COMMITMENTS.cancellationTerms`).
      howToLeaveAnswer:
        "En un proyecto puntual no hay permanencia: el proyecto concluye al completarse la entrega acordada. Si estás en un plan de mantenimiento, la cancelación requiere 30 días de aviso, sin penalidad.",
    },
  },
  pricingSummary: {
    heading: "Precios",
    intro:
      "Un vistazo rápido a nuestras líneas de servicio. El detalle completo, con alcance y condiciones, está en la página de precios.",
    viewFullPricingLink: "Ver precios completos",
    fromPrefix: "Desde",
  },
  caseStudy: {
    problemHeading: "El problema",
    roleHeading: "Qué hizo el estudio",
    approachHeading: "Cómo lo abordamos",
    stackHeading: "Stack tecnológico",
    stackUnavailableNote:
      "Información de stack no disponible públicamente para este proyecto.",
    outcomeHeading: "Resultado",
    nextStepHeading: "¿Un proyecto parecido?",
    nextStepBody:
      "Conversemos sobre tu proyecto por WhatsApp o revisa el precio de referencia de esta línea de servicio.",
    viewPricingCtaLabel: "Ver precio de esta línea",
    contactCtaLabel: "Escribir por WhatsApp",
    backToProjectsLabel: "Ver más proyectos",
  },
  brief: {
    heading: "Cuéntanos tu proyecto",
    intro:
      "Completa este breve formulario y te contactamos para conversar los detalles. Si prefieres, escríbenos directo por WhatsApp.",
    serviceLineLabel: "Línea de servicio",
    serviceLinePlaceholder: "Selecciona una línea de servicio",
    budgetBandLabel: "Presupuesto estimado",
    budgetBandPlaceholder: "Selecciona un rango",
    nameLabel: "Nombre",
    emailLabel: "Correo electrónico",
    phoneLabel: "Teléfono",
    phoneOptionalNote: "opcional",
    projectDescriptionLabel: "Cuéntanos sobre tu proyecto",
    submitLabel: "Enviar",
    submittingLabel: "Enviando…",
    errorSummaryHeading: "Revisa los siguientes campos:",
    sendFailedHeading: "No pudimos enviar tu mensaje",
    sendFailedBody:
      "Ocurrió un problema al enviar tu información. Tus datos se mantienen en el formulario: puedes intentarlo de nuevo o escribirnos directo por WhatsApp.",
    rejectedHeading: "No pudimos procesar tu envío",
    rejectedBody:
      "Tu mensaje no pudo completarse. Puedes intentarlo de nuevo o escribirnos directo por WhatsApp contándonos tu línea de servicio y una breve descripción de tu proyecto.",
    whatsappFallbackLabel: "Escribir por WhatsApp",
    noscriptHeading: "Este formulario necesita JavaScript",
    noscriptBody:
      "Tu navegador tiene JavaScript desactivado, así que el formulario no puede enviarse. Escríbenos por WhatsApp contándonos qué línea de servicio te interesa y una breve descripción de tu proyecto.",
    whatsappAsideHeading: "¿Prefieres WhatsApp?",
    whatsappAsideBody:
      "Escríbenos directo contándonos tu línea de servicio y una breve descripción de tu proyecto.",
    whatsappCtaLabel: "Escribir por WhatsApp",
    whatsappOnlyBody:
      "Nuestro formulario de brief no está disponible por el momento. Escríbenos directamente por WhatsApp contándonos tu línea de servicio y una breve descripción de tu proyecto, y seguimos la conversación ahí.",
  },
  gracias: {
    heading: "Gracias por tu interés",
    body:
      "Si acabas de enviar un brief, lo revisaremos y te contactaremos. Si prefieres avanzar ahora mismo, escríbenos directo por WhatsApp.",
    whatsappCtaLabel: "Escribir por WhatsApp",
    backToHomeLabel: "Volver al inicio",
  },
};
