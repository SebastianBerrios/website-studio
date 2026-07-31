/**
 * Retainer (Line D) commitments.
 *
 * See `openspec/changes/dev-services-website/specs/trust-signals/spec.md`,
 * "Retainer Published Commitments", and design.md §5 ("Every field of
 * `RetainerCommitments` is required: a missing commitment is a compile
 * error, not an empty section").
 *
 * None of the six commitment figures below has been supplied yet (blocked
 * on task 4.H2). Applying the same discriminated-`pending` pattern as
 * `PriceEntry` (design.md D8) to each field lets the type stay honest about
 * both halves of the requirement at once: every commitment is present as a
 * required key (so a missing commitment is still a compile error), while
 * its current value is a designed `pending` state rather than an invented
 * response window, hour count, or cancellation policy.
 */

export type Commitment<T> =
  | { readonly status: "pending" }
  | { readonly status: "set"; readonly value: T };

export type RetainerCommitments = {
  readonly responseWindow: Commitment<string>;
  readonly channels: Commitment<readonly string[]>;
  readonly monthlyHours: Commitment<number>;
  readonly includedScope: Commitment<readonly [string, ...string[]]>;
  readonly excludedScope: Commitment<readonly [string, ...string[]]>;
  readonly cancellationTerms: Commitment<string>;
};

export const RETAINER_COMMITMENTS: RetainerCommitments = {
  responseWindow: { status: "pending" },
  channels: { status: "pending" },
  monthlyHours: { status: "pending" },
  includedScope: { status: "pending" },
  excludedScope: { status: "pending" },
  cancellationTerms: { status: "pending" },
};
