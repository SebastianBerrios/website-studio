/**
 * PLACEHOLDER — this project's `consent` is `withheld` (a private couple's
 * event, no recorded consent). This module exists only so
 * `getProjectApproach()` stays exhaustive over every `ProjectSlug`; the
 * project is excluded from `publishableProjects()`, so this content is
 * never reachable from any route. Do not populate real prose here without
 * first confirming consent (tasks.md 3.H2) and flipping `featured`/`consent`
 * in `lib/content/projects/index.ts`.
 */
import type { ApproachContent } from "./loader";

export const approach: ApproachContent["approach"] = {
  es: "[PENDIENTE] Este proyecto permanece retirado (`withheld`) hasta contar con consentimiento registrado. No existe contenido publicable.",
};
