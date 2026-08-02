# Pricing Specification

## Purpose

The hybrid pricing page (`/[locale]/precios`) covering all four service lines, with strict placeholder discipline for undecided figures.

## Requirements

### Requirement: Page Block Order

The pricing page MUST render, in order: (1) how pricing works, (2) Line A fixed tiers, (3) Line C fixed tiers, (4) Line B quote-on-request, (5) Line D retainer plans, (6) cross-cutting terms, (7) FAQ, (8) CTA into the brief form.

#### Scenario: Blocks appear in the specified order

- GIVEN the rendered pricing page
- WHEN blocks are enumerated top to bottom
- THEN they match the eight-block order above

### Requirement: Fixed Tier Anatomy

Every published fixed-price tier (Lines A and C) MUST communicate: who it is for, deliverables, what is included, turnaround, revision rounds, price, and what is NOT included.

#### Scenario: A tier missing exclusions is incomplete

- GIVEN a Line A or Line C tier definition lacking a "not included" list
- WHEN validated against this requirement
- THEN it fails — omitting exclusions is a spec violation, not a style choice

#### Scenario: Line A has three tiers, Line C has one or two

- GIVEN the pricing data for Lines A and C
- WHEN tier counts are checked
- THEN Line A has exactly 3 tiers and Line C has 1 or 2

### Requirement: Line B Quote-on-Request Contract

Line B MUST NOT publish fixed tiers. It MUST state typical project shapes, the variables that move price (integrations, roles/permissions, data volume, auth), the quoting process and its turnaround, and a starting-from floor figure.

#### Scenario: Floor figure lets a prospect self-disqualify

- GIVEN Line B's published floor
- WHEN a prospect's budget is below it
- THEN the page has already communicated this without requiring a conversation

### Requirement: Line D Retainer Plan Contract

Line D MUST state its response-time commitment, what the monthly hours cover, exclusions, and cancellation terms as part of the pricing block (in addition to the `trust-signals` capability's commitments block).

#### Scenario: Retainer plan states cancellation terms

- GIVEN the Line D pricing block
- WHEN reviewed
- THEN cancellation terms are present, not left to a support conversation

### Requirement: Placeholder Discipline

> Amended 2026-08-01, remediation of `verify-report-final.md` finding W22.
> This requirement originally described an undecided figure as a `[PRICE:*]`/
> `[CURRENCY]` placeholder STRING that a production build must catch if
> unresolved. `design.md`'s D8 ("`[PRICE:*]` is a state, not a string")
> explicitly rejected that shape: no such string ever exists in this design,
> resolved or not. The actually-implemented mechanism is the `pending`/`set`
> discriminant on every price/commitment value (`lib/content/pricing.ts`),
> enforced by a build-time gate (`checkPendingPricesInProduction` in
> `lib/content/invariants.ts`) — plus a separate ESLint rule
> (`no-restricted-syntax` in `eslint.config.mjs`) that independently bans
> anyone from ever hardcoding the literal strings `[PRICE:` / `[CURRENCY]` as
> copy in the first place. This amendment describes that mechanism instead of
> the string-token one that was never built.

Every undecided figure MUST be modeled as a `pending` state in the typed pricing module, never as a hardcoded placeholder string in copy. A price whose status is still `pending` reaching a production build MUST be treated as a launch-blocking failure.

#### Scenario: An unresolved price blocks production

- GIVEN a price token whose `Commitment`/`PriceEntry` status is still `"pending"`
- WHEN a production build is produced
- THEN this state is a failure condition, not a cosmetic gap

#### Scenario: No invented number appears anywhere

- GIVEN any pricing copy
- WHEN reviewed
- THEN no numeric price figure exists outside the typed pricing module's resolved values, and no `[PRICE:*]`/`[CURRENCY]` placeholder string is ever hardcoded in source

### Requirement: Pre-Tagged CTA

The pricing page's CTA MUST pass the visitor's selected service line into the brief form.

#### Scenario: CTA carries line selection forward

- GIVEN a visitor viewing Line C's block and activating its CTA
- WHEN the brief form opens
- THEN Line C is pre-selected

### Requirement: FAQ Objection Coverage

The FAQ block MUST address: why the price isn't lower, how later changes are handled, who owns the code, and how a client can leave.

#### Scenario: FAQ answers the ownership question

- GIVEN the FAQ block
- WHEN searched for a code-ownership answer
- THEN one exists
