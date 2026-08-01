/**
 * Pure validation for the brief form's submitted content.
 *
 * See `openspec/changes/dev-services-website/design.md` §9, "Validation",
 * and `specs/lead-capture/spec.md`, "Submission Validation". No `zod` — the
 * proposal authorizes a dependency only for the mail provider, and D1
 * removed even that. `serviceLine` and `budgetBand` validate against the
 * same TypeScript unions the rest of the site renders from, so the form and
 * the catalog cannot drift apart.
 *
 * Deliberately zero React imports and zero `"use server"`/`"server-only"` —
 * this function is pure so the same rule set can run in the Server Action
 * (`submit.ts`) and, if a later PR wants it, client-side for eager
 * feedback, per design.md §9's stated rationale.
 *
 * `BudgetBand` is defined here, not in `lib/content/**`, on purpose: this
 * PR's scope is `lib/brief/**` only (see tasks.md PR 6a), and no figure or
 * currency has been decided for any band (see the note on `BUDGET_BANDS`
 * below) — band identifiers are semantic, not numeric, so no money is
 * invented anywhere in this module.
 */

import { SERVICE_LINES, type ServiceLine } from "@/lib/content/service-lines";
import type { Localized } from "@/lib/content/types";
import {
  DISPLAY_CURRENCY,
  PRICES,
  PRICING_TIERS,
  formatMoney,
} from "@/lib/content/pricing";

/**
 * Semantic budget bands. The identifiers (`undecided`/`small`/`medium`/
 * `large`) predate real pricing (PR 6a) and stay stable so the form's shape
 * never needs to change again; only the LABELS below were updated once task
 * 4.H1 closed and `lib/content/pricing.ts` gained real figures.
 *
 * Every figure in the labels is DERIVED from `PRICES`/`PRICING_TIERS` below,
 * never re-typed — the exact "single exported constant, every consumer
 * reads through it" discipline `lib/content/process.ts`/`pricing.ts`
 * already established. Duplicating "S/800" or "S/1,500" as a literal string
 * here would drift the moment the studio's pricing changes; computing it
 * means it cannot.
 *
 * The two boundary values:
 * - `FIXED_TIER_CEILING` — the highest of the site's published FIXED tiers
 *   (Lines A and C only; Line B is quote-on-request and Line D is a
 *   recurring retainer, not a one-off project budget).
 * - `CUSTOM_APP_FLOOR` — `PRICES["app-from"]`, the starting point for
 *   custom web apps/dashboards (Line B).
 */
export type BudgetBand = "undecided" | "small" | "medium" | "large";

export type BudgetBandDefinition = {
  readonly id: BudgetBand;
  readonly label: Localized<string>;
};

const FIXED_TIER_AMOUNTS = PRICING_TIERS.map(
  (tier) => PRICES[tier.token].value.amount,
);
const FIXED_TIER_CEILING = Math.max(...FIXED_TIER_AMOUNTS);
const CUSTOM_APP_FLOOR = PRICES["app-from"].value.amount;

function money(amount: number): string {
  return formatMoney({ amount, currency: DISPLAY_CURRENCY });
}

export const BUDGET_BANDS = {
  undecided: {
    id: "undecided",
    label: { es: "Aún no lo tengo definido" },
  },
  small: {
    id: "small",
    label: { es: `Hasta ${money(FIXED_TIER_CEILING)}` },
  },
  medium: {
    id: "medium",
    label: {
      es: `Entre ${money(FIXED_TIER_CEILING)} y ${money(CUSTOM_APP_FLOOR)}`,
    },
  },
  large: {
    id: "large",
    label: { es: `Desde ${money(CUSTOM_APP_FLOOR)}` },
  },
} as const satisfies Record<BudgetBand, BudgetBandDefinition>;

/** The brief form's user-facing fields, validated and ready to notify. */
export type Brief = {
  readonly serviceLine: ServiceLine;
  readonly budgetBand: BudgetBand;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly projectDescription: string;
};

export type BriefFieldName =
  | "serviceLine"
  | "budgetBand"
  | "name"
  | "email"
  | "phone"
  | "projectDescription";

/** Keyed by field name, per task 6.1. Feeds `useActionState` in PR 6b. */
export type BriefErrors = Partial<Record<BriefFieldName, string>>;

export type BriefValidationResult =
  | { readonly ok: true; readonly brief: Brief }
  | { readonly ok: false; readonly errors: BriefErrors };

const MAX_LENGTHS = {
  name: 100,
  email: 254,
  phone: 30,
  projectDescription: 2000,
} as const;

/** Reject a message carrying more than this many URLs (design §2 layer 3). */
const MAX_URLS_IN_MESSAGE = 3;

const URL_PATTERN = /https?:\/\/\S+/gi;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** CR, LF, and TAB — control characters that have no place in a single-line
 * field and are the first sign of a header-injection attempt reaching this
 * far. `notify.ts` strips these unconditionally regardless of what this
 * check already caught (defense-in-depth, not redundancy elimination). */
const CONTROL_CHAR_PATTERN = /[\r\n\t]/;
const PHONE_PATTERN = /^[\d\s()+.-]*$/;

type BriefInputShape = Partial<Record<BriefFieldName, unknown>>;

function toTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isServiceLine(value: string): value is ServiceLine {
  return Object.prototype.hasOwnProperty.call(SERVICE_LINES, value);
}

function isBudgetBand(value: string): value is BudgetBand {
  return Object.prototype.hasOwnProperty.call(BUDGET_BANDS, value);
}

/**
 * Validates an arbitrary, untrusted input shape into a `Brief`. Accepts
 * `unknown` (not `FormData`) so the same function stays callable from a
 * plain object built out of `FormData` entries (`submit.ts`) or, later,
 * from client-side field state.
 */
export function validateBrief(input: unknown): BriefValidationResult {
  const record: BriefInputShape =
    typeof input === "object" && input !== null
      ? (input as BriefInputShape)
      : {};

  const errors: BriefErrors = {};

  const serviceLineRaw = toTrimmedString(record.serviceLine);
  const budgetBandRaw = toTrimmedString(record.budgetBand);
  const name = toTrimmedString(record.name);
  const email = toTrimmedString(record.email);
  const phone = toTrimmedString(record.phone);
  const projectDescription = toTrimmedString(record.projectDescription);

  if (!isServiceLine(serviceLineRaw)) {
    errors.serviceLine = "Selecciona una línea de servicio válida.";
  }

  if (!isBudgetBand(budgetBandRaw)) {
    errors.budgetBand = "Selecciona un rango de presupuesto válido.";
  }

  if (name.length === 0) {
    errors.name = "Ingresa tu nombre.";
  } else if (name.length > MAX_LENGTHS.name || CONTROL_CHAR_PATTERN.test(name)) {
    errors.name = "El nombre no es válido.";
  }

  if (email.length === 0 || email.length > MAX_LENGTHS.email) {
    errors.email = "Ingresa un correo electrónico válido.";
  } else if (!EMAIL_PATTERN.test(email) || CONTROL_CHAR_PATTERN.test(email)) {
    errors.email = "Ingresa un correo electrónico válido.";
  }

  if (phone.length > MAX_LENGTHS.phone || !PHONE_PATTERN.test(phone)) {
    errors.phone = "El teléfono no es válido.";
  }

  if (projectDescription.length === 0) {
    errors.projectDescription = "Cuéntanos brevemente tu proyecto.";
  } else if (projectDescription.length > MAX_LENGTHS.projectDescription) {
    errors.projectDescription = "La descripción es demasiado larga.";
  } else if (CONTROL_CHAR_PATTERN.test(projectDescription.replace(/\n/g, ""))) {
    // Newlines are fine inside the free-text description body (it is never
    // used as a header value); a raw CR or TAB outside of normal line
    // breaks is not.
    errors.projectDescription = "La descripción contiene caracteres no válidos.";
  } else {
    const urlMatches = projectDescription.match(URL_PATTERN);
    if (urlMatches && urlMatches.length > MAX_URLS_IN_MESSAGE) {
      errors.projectDescription = "El mensaje incluye demasiados enlaces.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    brief: {
      serviceLine: serviceLineRaw as ServiceLine,
      budgetBand: budgetBandRaw as BudgetBand,
      name,
      email,
      phone,
      projectDescription,
    },
  };
}
