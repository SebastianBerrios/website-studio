"use client";

/**
 * The brief form. The ONE Client Component this entire change set permits
 * (design.md D10, task 6.5) — every other component either has no
 * interactivity or gets it for free from a native HTML element
 * (`<details>`, or `<form action={serverAction}>` below).
 *
 * `useActionState` is an ENHANCEMENT, not the mechanism: the `<form
 * action={formAction}>` below posts directly to `submitBrief` (a Server
 * Action) whether or not JavaScript ever loads — design.md §9's whole
 * argument for choosing a Server Action over a route handler. Every input
 * carries its real `name`, its native `required`/`type` attribute, and no
 * client-side gate blocks the POST. With JS, `useActionState` additionally
 * gives inline errors and a pending state without a full navigation.
 *
 * Copy, service-line labels, and budget-band labels all arrive as
 * already-locale-resolved plain strings from `components/sections/
 * brief.tsx` (a Server Component) rather than this file calling
 * `getDictionary()` / importing `lib/content/**` itself. Same discipline
 * `components/sections/hero-header.tsx`'s doc comment states for design D5
 * ("keeps Spanish copy on the server and out of the client bundle"),
 * extended here to the largest dictionary section on the site — pulling the
 * whole `Dictionary` (pricing, case-study, retainer copy, none of it needed
 * here) into this one client boundary would be pure bundle waste
 * (`server-serialization`, Vercel React best practices).
 *
 * Service-line pre-tagging (`specs/lead-capture/spec.md`, "Service Line
 * Pre-Tagging") reads `?line=` from `window.location.search` via
 * `useSyncExternalStore`, deliberately NOT via `next/navigation`'s
 * `useSearchParams()`. That hook requires the component using it to sit
 * under a `<Suspense>` boundary on a statically rendered route, or `npm run
 * build` fails outright — a real cost for a nice-to-have pre-fill on a
 * landing page that is otherwise unconditionally static.
 * `useSyncExternalStore`'s `getServerSnapshot` gives the server-rendered/
 * prerendered markup an empty string (no query param applied yet, matching
 * the client's first hydration pass exactly — no mismatch), and
 * `getSnapshot` reads the real `window.location.search` once mounted on the
 * client. This is the sanctioned API for exactly this shape of problem
 * (`react-hooks/set-state-in-effect` — this project's lint config —
 * otherwise flags the equivalent `useEffect` + `setState` pattern). The
 * `key` trick on the service-line `<select>` forces a remount so its
 * `defaultValue` (an uncontrolled input) actually picks up the late-arriving
 * value.
 *
 * The honeypot field (`name="company"`, matching `lib/brief/submit.ts`'s
 * `readFormString(formData, "company")`) is hidden from BOTH sighted users
 * (off-screen positioning) and assistive technology (`aria-hidden`,
 * removed from the tab order, `autoComplete="off"` so a browser/password
 * manager never pre-fills it and fails a real visitor closed).
 */

import { useActionState, useMemo, useSyncExternalStore } from "react";
import { Field } from "./field";
import { submitBrief } from "@/lib/brief/submit";
import { initialBriefSubmissionState } from "@/lib/brief/submission-state";
import type { ServiceLine } from "@/lib/content/service-lines";
import type { BudgetBand, BriefFieldName } from "@/lib/brief/schema";
import type { Locale } from "@/lib/content/locales";
import type { FormToken } from "@/lib/brief/abuse";

export type BriefFormOption<Id extends string> = {
  readonly id: Id;
  readonly label: string;
};

export type BriefFormCopy = {
  readonly serviceLineLabel: string;
  readonly serviceLinePlaceholder: string;
  readonly budgetBandLabel: string;
  readonly budgetBandPlaceholder: string;
  readonly nameLabel: string;
  readonly emailLabel: string;
  readonly phoneLabel: string;
  readonly phoneOptionalNote: string;
  readonly projectDescriptionLabel: string;
  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly errorSummaryHeading: string;
  readonly sendFailedHeading: string;
  readonly sendFailedBody: string;
  readonly whatsappFallbackLabel: string;
};

const FIELD_ORDER: readonly BriefFieldName[] = [
  "serviceLine",
  "budgetBand",
  "name",
  "email",
  "phone",
  "projectDescription",
];

function fieldId(field: BriefFieldName): string {
  return `brief-${field}`;
}

function subscribeToNothing(): () => void {
  // The URL query string never changes without a full navigation/remount
  // of this component, so there is nothing to actually subscribe to —
  // `useSyncExternalStore` still requires a subscribe function, and a no-op
  // unsubscribe satisfies its contract without pretending to observe an
  // event that cannot fire here.
  return () => {};
}

function getQuerySnapshot(): string {
  return window.location.search;
}

function getServerQuerySnapshot(): string {
  return "";
}

export function BriefForm({
  locale,
  token,
  serviceLines,
  budgetBands,
  copy,
  whatsappUrl,
}: {
  readonly locale: Locale;
  readonly token: FormToken | null;
  readonly serviceLines: readonly BriefFormOption<ServiceLine>[];
  readonly budgetBands: readonly BriefFormOption<BudgetBand>[];
  readonly copy: BriefFormCopy;
  readonly whatsappUrl: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    submitBrief,
    initialBriefSubmissionState,
  );

  const querySearch = useSyncExternalStore(
    subscribeToNothing,
    getQuerySnapshot,
    getServerQuerySnapshot,
  );
  const queryServiceLine = useMemo<ServiceLine | "">(() => {
    const line = new URLSearchParams(querySearch).get("line");
    return line && serviceLines.some((option) => option.id === line)
      ? (line as ServiceLine)
      : "";
  }, [querySearch, serviceLines]);

  const defaultServiceLine = state.values.serviceLine ?? queryServiceLine ?? "";

  const errorEntries = FIELD_ORDER.filter((field) => state.errors[field]).map(
    (field) => [field, state.errors[field] as string] as const,
  );

  return (
    <form key={JSON.stringify(state)} action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />
      {token ? (
        <>
          <input type="hidden" name="issuedAt" value={token.issuedAt} />
          <input type="hidden" name="signature" value={token.signature} />
        </>
      ) : null}

      {/* Honeypot. See this file's doc comment: hidden from sighted users
          AND from assistive technology, never merely `display: none` alone,
          so it traps neither a real screen-reader user nor a naive bot. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
      >
        <label htmlFor="brief-company">Company</label>
        <input
          id="brief-company"
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {errorEntries.length > 0 ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <p className="font-medium">{copy.errorSummaryHeading}</p>
          <ul className="mt-2 list-disc pl-5">
            {errorEntries.map(([field, message]) => (
              <li key={field}>
                <a href={`#${fieldId(field)}`} className="underline underline-offset-2">
                  {message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {state.status === "send-failed" ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm">
          <p className="font-medium text-destructive">{copy.sendFailedHeading}</p>
          <p className="mt-1 text-muted-foreground">{copy.sendFailedBody}</p>
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center underline underline-offset-2"
            >
              {copy.whatsappFallbackLabel}
            </a>
          ) : null}
        </div>
      ) : null}

      <Field
        id={fieldId("serviceLine")}
        label={copy.serviceLineLabel}
        error={state.errors.serviceLine}
        required
      >
        <select
          key={`service-line-${defaultServiceLine}`}
          name="serviceLine"
          defaultValue={defaultServiceLine}
          required
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="" disabled>
            {copy.serviceLinePlaceholder}
          </option>
          {serviceLines.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        id={fieldId("budgetBand")}
        label={copy.budgetBandLabel}
        error={state.errors.budgetBand}
        required
      >
        <select
          name="budgetBand"
          defaultValue={state.values.budgetBand ?? ""}
          required
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="" disabled>
            {copy.budgetBandPlaceholder}
          </option>
          {budgetBands.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <Field id={fieldId("name")} label={copy.nameLabel} error={state.errors.name} required>
        <input
          type="text"
          name="name"
          defaultValue={state.values.name ?? ""}
          required
          maxLength={100}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </Field>

      <Field id={fieldId("email")} label={copy.emailLabel} error={state.errors.email} required>
        <input
          type="email"
          name="email"
          defaultValue={state.values.email ?? ""}
          required
          maxLength={254}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </Field>

      <Field
        id={fieldId("phone")}
        label={`${copy.phoneLabel} (${copy.phoneOptionalNote})`}
        error={state.errors.phone}
      >
        <input
          type="tel"
          name="phone"
          defaultValue={state.values.phone ?? ""}
          maxLength={30}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </Field>

      <Field
        id={fieldId("projectDescription")}
        label={copy.projectDescriptionLabel}
        error={state.errors.projectDescription}
        required
      >
        <textarea
          name="projectDescription"
          defaultValue={state.values.projectDescription ?? ""}
          required
          maxLength={2000}
          rows={5}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </Field>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-full border border-border bg-foreground px-6 py-3 text-sm font-medium text-background disabled:opacity-60"
      >
        {isPending ? copy.submittingLabel : copy.submitLabel}
      </button>
    </form>
  );
}
