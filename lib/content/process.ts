/**
 * The studio's engagement process: a fixed five-phase sequence with explicit
 * client-approval gates.
 *
 * See `openspec/changes/dev-services-website/specs/landing-narrative/spec.md`,
 * "Proceso Section Contract", and design.md D10 (Server Component, no
 * `motion`). Zero React imports — same `lib/content/**` discipline as every
 * other module here (design.md §5).
 *
 * The differentiator this data models is `requiresApproval`, not the phase
 * count or names. The studio is a solo operator selling as a studio (proposal
 * §4.4) — that positioning is earned through structure here, never through an
 * implied team. `requiresApproval` is what makes the sales pitch legible: the
 * client is never surprised at the end, because three of the five phases
 * cannot proceed without an explicit sign-off. `development` builds on an
 * already-approved design; `delivery` is the handover itself, not a new
 * decision point.
 *
 * `revisionRoundsIncluded` is the one quantifiable commitment already settled
 * for this process (2 rounds included, then quoted per round beyond that).
 * It lives here, not in `components/sections/process.tsx`, so the rendered
 * claim tracks this value without a component edit — the literal mechanism
 * `specs/landing-narrative/spec.md`'s "Proceso Section Contract" asks for
 * ("a response-time claim changes without a component code edit").
 *
 * **Deviation, documented rather than silently applied** (same discipline as
 * `lib/content/projections.ts`'s `portfolioLink()` comment and
 * `components/sections/services.tsx`'s CTA note): the spec's own wording
 * calls this a "response-time commitment". No such commitment exists yet for
 * mid-project client turns — see the open item below — so this module
 * satisfies the requirement's actual mechanism (a data-driven claim, not a
 * hardcoded string) using the one quantifiable process commitment the studio
 * has actually settled, rather than inventing a response-time figure to
 * match the literal noun. `RETAINER_COMMITMENTS.responseWindow` in
 * `lib/content/retainer.ts` is a different commitment for a different phase
 * of the relationship (post-launch maintenance requests) and does not belong
 * here — see task 3.2's own note in tasks.md.
 *
 * **Open item, not filled with an invented value**: how quickly the studio
 * commits to responding when a client's turn comes up in this phase-gated
 * process (e.g. reviewing a proposal or a design draft) is not decided. The
 * user was asked and has not supplied it. Nothing below renders a number,
 * a day count, or a deadline for it — see
 * `components/sections/process.tsx`'s doc comment for why. Adding it later
 * is one new optional field on `ProcessContent`, read by the same single
 * exported constant every consumer already imports — not a restructuring.
 *
 * **`clientApprovalDeadlineBusinessDays` closes a different, now-answered
 * question**: not "how fast does the studio respond", but "how long can a
 * client sit on a gated phase before it affects the timeline". The studio
 * supplied this directly: the client has 5 business days to approve a gated
 * phase; past that, the project pauses and the delivery date is
 * recalculated. This is stated up front in the rendered copy, not raised
 * later as a complaint — it closes the open item the previous batch (task
 * 3.2) recorded: a process gating 3 of 5 phases on client approval stalls
 * when the client goes quiet, with no stated consequence.
 */

import type { Localized } from "./types";

export type ProcessPhaseId =
  | "discovery"
  | "proposal"
  | "design"
  | "development"
  | "delivery";

export type ProcessPhase = {
  readonly id: ProcessPhaseId;
  readonly name: Localized<string>;
  readonly description: Localized<string>;
  /**
   * The differentiator, not decoration: `true` means the studio does not
   * proceed to the next phase without the client's explicit sign-off on this
   * one.
   */
  readonly requiresApproval: boolean;
};

export type ProcessContent = {
  /**
   * A 5-tuple, not `readonly ProcessPhase[]` — same "exactly N, guaranteed at
   * compile time" discipline as `SERVICE_LINES`'s
   * `Record<ServiceLine, ServiceLineDefinition>` (service-lines.ts). A sixth
   * phase, or only four, is a type error.
   */
  readonly phases: readonly [
    ProcessPhase,
    ProcessPhase,
    ProcessPhase,
    ProcessPhase,
    ProcessPhase,
  ];
  readonly revisionRoundsIncluded: number;
  /**
   * Business days a client has to approve a gated phase (one that has
   * `requiresApproval: true`) before the project pauses and the delivery
   * date is recalculated. Stated up front in the rendered copy — see this
   * module's top doc comment.
   */
  readonly clientApprovalDeadlineBusinessDays: number;
};

export const PROCESS: ProcessContent = {
  phases: [
    {
      id: "discovery",
      name: { es: "Descubrimiento" },
      description: {
        es: "Relevamos objetivos, referencias y el contenido disponible para el proyecto.",
      },
      requiresApproval: true,
    },
    {
      id: "proposal",
      name: { es: "Propuesta y alcance" },
      description: {
        es: "Definimos qué incluye el proyecto, qué queda fuera y su costo.",
      },
      requiresApproval: true,
    },
    {
      id: "design",
      name: { es: "Diseño" },
      description: {
        es: "Diseñamos la estructura y el aspecto visual del sitio.",
      },
      requiresApproval: true,
    },
    {
      id: "development",
      name: { es: "Desarrollo" },
      description: {
        es: "Construimos sobre el diseño ya aprobado.",
      },
      requiresApproval: false,
    },
    {
      id: "delivery",
      name: { es: "Entrega" },
      description: {
        es: "Publicamos el proyecto, capacitamos su uso y damos garantía.",
      },
      requiresApproval: false,
    },
  ],
  revisionRoundsIncluded: 2,
  clientApprovalDeadlineBusinessDays: 5,
};
