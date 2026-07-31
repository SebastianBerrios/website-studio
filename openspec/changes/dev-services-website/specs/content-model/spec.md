# Content Model Specification

## Purpose

Typed TypeScript data modules under `lib/` for projects, service lines, and pricing, plus per-locale copy dictionaries. No CMS; the long-prose field is isolated so it can move to MDX later without reshaping the model.

## Requirements

### Requirement: Project Entity Shape

Each project MUST be represented by a typed entity carrying at least: `slug`, `title`, `client`, `serviceLine`, `summary`, `problem`, `role`, `approach` (long prose, isolated from other fields), `stack[]`, `outcome`, `evidence`, `media[]`, `externalUrl?`, `consent`, `featured`, `order`, plus the legacy `link` and `thumbnail` fields.

#### Scenario: Legacy shape is preserved, not replaced

- GIVEN the existing `{ title, link, thumbnail }` shape documented in `openspec/config.yaml`
- WHEN the `Project` entity is defined
- THEN it is a superset that still contains `title`, `link`, and `thumbnail`

### Requirement: Slug Uniqueness

No two published projects MUST share a `slug`.

#### Scenario: Duplicate slug is a data-integrity violation

- GIVEN two project entries with the same `slug`
- WHEN the content module is loaded
- THEN this state is treated as an invalid content set, not a valid duplicate

### Requirement: Consent Field Semantics

Each project MUST carry a `consent` field controlling whether client-identifying detail (name, brand assets, screenshots of their product) may render. Absent or unresolved consent MUST default to excluded or anonymized — never to publishing identifying detail by default.

#### Scenario: wedding-invitation-piero without recorded consent

- GIVEN the `wedding-invitation-piero` project has no recorded consent from the couple
- WHEN its case study renders
- THEN it does not name the couple or show identifying imagery

#### Scenario: blu-biolink without recorded consent

- GIVEN `blu-biolink`'s README declares the work proprietary to Blu Cafe TCQ and no consent is recorded
- WHEN its case study renders
- THEN client-identifying naming and imagery are withheld or anonymized

#### Scenario: blu captures require sanitization

- GIVEN `blu` is a login-walled back-office product
- WHEN any screenshot of `blu` is used
- THEN it MUST be an authorized, sanitized capture — no raw client data

### Requirement: Evidence Field

Each project MUST carry an `evidence` field with exactly one value: `live`, `gated`, `not-deployed`, or `no-visual`.

#### Scenario: Evidence value is always one of the four states

- GIVEN any project entity
- WHEN its `evidence` field is read
- THEN it is one of `live | gated | not-deployed | no-visual`, never undefined for a published project

### Requirement: Service Line Enumeration

The system MUST define exactly four service lines with stable identifiers, used to link projects, pricing blocks, and landing cards.

#### Scenario: Every non-retainer line has proof

- GIVEN the four service lines
- WHEN projects are filtered by `serviceLine`
- THEN each line except the maintenance retainer has at least one associated project

### Requirement: Pricing Module

> Amended after `sdd-verify` finding W10. This requirement originally demanded
> `[PRICE:*]` / `[CURRENCY]` **string tokens**. Design decision D8 rejected
> string tokens outright and the implementation followed D8, leaving three
> artifacts disagreeing. D8's reasoning wins: a string token can only ever be
> caught by scanning text, the weakest available enforcement, whereas a
> discriminated union is caught by the type checker before anything runs. The
> requirement is restated to demand the stronger guarantee, not the weaker one.

Pricing data MUST be a typed module in which every undecided figure is an
explicit `pending` state in the type system — never a string token, and never
an invented numeric literal or currency.

The module MUST give three compile-time guarantees: no price key may be
missing, no unknown key may be added, and no entry may be malformed. An
unresolved figure reaching a production build MUST be a build failure, not a
cosmetic artifact.

#### Scenario: An undecided figure is a designed state, not a plausible number

- GIVEN a pricing entry with no decided figure
- WHEN it is read
- THEN it carries a `pending` discriminant, and no numeric amount or currency value exists on it

#### Scenario: A missing price key cannot compile

- GIVEN the exhaustive map of price keys to entries
- WHEN a key is removed or an unknown key is added
- THEN the type checker rejects it before the build runs

#### Scenario: An unresolved figure cannot silently ship

- GIVEN at least one entry still `pending`
- WHEN a production build runs with the price integrity check active
- THEN the build fails and names the unresolved keys

> Implementation note: the production check is currently gated behind
> `PRICE_INTEGRITY_CHECK_ACTIVE` in `lib/content/invariants.ts` and is `false`,
> because every figure is legitimately `pending` until real prices are supplied
> and intermediate slices must still ship. Task 4.10 flips it. Until then the
> third scenario is satisfied structurally but not enforced at runtime — stated
> here so nobody mistakes a written gate for an active one.

### Requirement: Locale Dictionary Structure

Site copy MUST be sourced from per-locale dictionary modules, not hardcoded in components — including the hero's embedded `Header()` copy.

#### Scenario: Hero copy is a dictionary slot, not a literal

- GIVEN the hero section's heading and CTA text
- WHEN the component renders
- THEN the strings are read from the active locale's dictionary, not embedded as string literals in the component
