/**
 * Retainer (Line D) commitments.
 *
 * See `openspec/changes/dev-services-website/specs/trust-signals/spec.md`,
 * "Retainer Published Commitments" / "Itemized Maintenance Scope", and
 * design.md §5 ("Every field of `RetainerCommitments` is required: a missing
 * commitment is a compile error, not an empty section").
 *
 * Applies the same discriminated-`pending` pattern as `PriceEntry`
 * (design.md D8) to each commitment: every commitment is a required key (so a
 * missing one is a compile error), while its current value is either a
 * designed `pending` state or a real `set` value — never an invented figure.
 *
 * Task 3.6 (sdd-apply, PR 3b) populated the fields the studio has actually
 * settled: tiered response window, scope model, itemized inclusions/
 * exclusions, and cancellation terms. `channels` remains `pending` — the
 * studio was not asked which support channels this batch, unlike the other
 * five fields.
 *
 * **Deviation, documented rather than silently applied** (same discipline as
 * `lib/content/process.ts`'s deviation note): the original stub shape had a
 * `monthlyHours: Commitment<number>` field. The studio explicitly rejected an
 * hour-bucket model — "no monthly hour allowance, scope is defined by task
 * type, not by hours" — so keeping that field and leaving it `pending`
 * forever would misrepresent a settled decision as an open one. It is
 * replaced here by `scopeModel: Commitment<Localized<string>>`, set to state
 * plainly that scope is task-type-bound, not hour-bound. There is no
 * consumer of the old field outside this module (verified: `monthlyHours`
 * had zero call sites before this change), so the rename costs nothing.
 *
 * **Two boundaries the studio has not fixed, modeled honestly rather than
 * invented or silently dropped**: `bugVsFeatureBoundary` (the line between an
 * included bug fix and an excluded new feature — the most-disputed boundary
 * in any retainer) and `contentChangeScope` (a size bound on "changes to
 * existing content", which otherwise becomes redesign-by-drip). Both are
 * `Commitment<Localized<string>>` fields set to the true, current answer —
 * that the boundary is resolved in conversation, case by case, because no
 * fixed rule exists yet — rather than a fabricated threshold. A future fixed
 * rule replaces the same field's `value` later; nothing about
 * `components/sections/retainer.tsx` needs to change for that.
 */

import type { Localized } from "./types";

export type Commitment<T> =
  | { readonly status: "pending" }
  | { readonly status: "set"; readonly value: T };

/**
 * One severity tier of the response-time commitment. The studio supplied
 * exactly two: an urgent tier ("the site is down") and a standard tier
 * ("everything else") — see `RETAINER_COMMITMENTS.responseWindow` below.
 */
export type ResponseTier = {
  readonly severity: Localized<string>;
  readonly window: Localized<string>;
};

export type RetainerCommitments = {
  readonly responseWindow: Commitment<
    readonly [ResponseTier, ...ResponseTier[]]
  >;
  readonly channels: Commitment<readonly string[]>;
  readonly scopeModel: Commitment<Localized<string>>;
  readonly includedScope: Commitment<
    readonly [Localized<string>, ...Localized<string>[]]
  >;
  readonly excludedScope: Commitment<
    readonly [Localized<string>, ...Localized<string>[]]
  >;
  readonly bugVsFeatureBoundary: Commitment<Localized<string>>;
  readonly contentChangeScope: Commitment<Localized<string>>;
  readonly cancellationTerms: Commitment<Localized<string>>;
};

export const RETAINER_COMMITMENTS: RetainerCommitments = {
  responseWindow: {
    status: "set",
    value: [
      {
        severity: { es: "Sitio caído" },
        window: { es: "Mismo día hábil" },
      },
      {
        severity: { es: "Cualquier otro caso" },
        window: { es: "2 días hábiles" },
      },
    ],
  },
  channels: { status: "pending" },
  scopeModel: {
    status: "set",
    value: {
      es: "El alcance se define por tipo de tarea, no por una bolsa de horas mensual.",
    },
  },
  includedScope: {
    status: "set",
    value: [
      { es: "Actualizaciones de seguridad y parches de dependencias" },
      { es: "Monitoreo de disponibilidad (uptime) y backups" },
      { es: "Cambios sobre contenido ya existente" },
      {
        es: "Corrección de errores: algo que funcionaba y dejó de funcionar",
      },
    ],
  },
  excludedScope: {
    status: "set",
    value: [
      { es: "Funcionalidad nueva" },
      { es: "Diseño visual o rediseño" },
      { es: "Creación de contenido (redacción, fotografía)" },
      {
        es: "Costos de terceros — dominio, hosting pago, licencias, servicios externos: se gestionan, no se absorben",
      },
    ],
  },
  bugVsFeatureBoundary: {
    status: "set",
    value: {
      es: "El límite entre una corrección de error y una funcionalidad nueva se conversa caso a caso al reportar el problema; todavía no existe una regla fija que lo defina.",
    },
  },
  contentChangeScope: {
    status: "set",
    value: {
      es: "El tamaño de un cambio de contenido que sigue siendo una 'edición' se conversa caso a caso; todavía no existe un límite fijo (de palabras, secciones o similar) que lo defina.",
    },
  },
  cancellationTerms: {
    status: "set",
    value: { es: "Cancelación con 30 días de aviso, sin penalidad." },
  },
};
