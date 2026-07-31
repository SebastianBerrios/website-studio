# Service Catalog Specification

## Purpose

The four service lines ElectroCode Studio sells, as typed data, and how each surfaces consistently across landing, pricing, and case studies.

## Requirements

### Requirement: Fixed Four-Line Catalog

The system MUST define exactly four service lines: (A) landing pages & corporate sites, (B) custom web apps & dashboards, (C) biolinks & event microsites, (D) maintenance/evolution retainer. No fifth line MUST be introduced without a spec change.

#### Scenario: Catalog enumerates exactly four lines

- GIVEN the service catalog data
- WHEN its entries are counted
- THEN there are exactly four, matching A/B/C/D

### Requirement: Cross-Surface Consistency

Each service line MUST surface identically-identified (same id/name) on the landing Servicios section, on the pricing page, and on any case study tagged with that line.

#### Scenario: A project's service-line badge matches its pricing block

- GIVEN a project tagged with service line C
- WHEN its case-study badge is compared to the pricing page's line-C block
- THEN they reference the same service-line identifier

### Requirement: Proof Requirement Per Line

Every service line except the maintenance retainer MUST have at least one associated project usable as proof (a `live`, `gated`, `not-deployed`, or `no-visual` case study).

#### Scenario: Retainer line has no project-proof obligation

- GIVEN the maintenance retainer line
- WHEN checked for an associated project
- THEN none is required — it instead links to the `trust-signals` commitments block

### Requirement: Line-to-Pricing Anchor Mapping

Each service line card on the landing MUST link to its corresponding block on `/[locale]/precios`.

#### Scenario: Servicios card deep-links to its pricing block

- GIVEN the Servicios card for line B (web apps & dashboards)
- WHEN activated
- THEN it navigates to the quote-on-request block for line B on the pricing page
