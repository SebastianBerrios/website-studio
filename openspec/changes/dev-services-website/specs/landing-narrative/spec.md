# Landing Narrative Specification

## Purpose

The landing page (`/[locale]`) as one continuous sales argument, told in a fixed section order that follows the prospect's question sequence rather than an org chart.

## Requirements

### Requirement: Fixed Section Order

The landing MUST render its sections in this order: (1) Hero, (2) Servicios, (3) Proceso, (4) Proyectos, (5) Autoridad, (6) Precios summary, (7) Retainer/Mantenimiento, (8) Brief form + WhatsApp, (9) Footer.

#### Scenario: Section order matches the specified sequence

- GIVEN the rendered landing page
- WHEN sections are enumerated top to bottom
- THEN they appear in the order Hero, Servicios, Proceso, Proyectos, Autoridad, Precios, Retainer, Brief/WhatsApp, Footer

### Requirement: Hero Section Contract

The hero MUST reuse `HeroParallax` and display real, curated shipped work, plus a statement of what is sold.

#### Scenario: Hero renders from curated data, not a hardcoded array

- GIVEN the curated project set in the content model
- WHEN the hero renders
- THEN its cards are derived from that data, not a literal array in `app/page.tsx`

### Requirement: Servicios Section Contract

The Servicios section MUST present all four service lines as self-identification cards, each linking to its pricing block and its available proof.

#### Scenario: Each service card routes to pricing and proof

- GIVEN a service line with at least one associated project
- WHEN its card is activated
- THEN it links to that line's pricing block
- AND to its available project proof

### Requirement: Proceso Section Contract

The Proceso section MUST describe a defined sequence (discovery, proposal, build, handover) and state a response-time commitment sourced from content data, not a hardcoded string.

#### Scenario: Response-time claim is data-driven

- GIVEN the Proceso section's stated response time
- WHEN the underlying content value changes
- THEN the rendered claim changes without a component code edit

### Requirement: Proyectos Section Contract

The Proyectos section MUST render the curated 6–8 project grid and hand off to individual case studies.

#### Scenario: Grid links to case studies, not external URLs for unlinkable work

- GIVEN a project with `evidence` of `gated`, `not-deployed`, or `no-visual`
- WHEN its grid card is activated
- THEN it opens the internal case-study route, not an external link

### Requirement: Autoridad Section Placement

The ElectroCode Academy authority block MUST render as landing section 5, positioned before pricing, and MUST NOT appear as a card inside the Proyectos grid.

#### Scenario: Academy is not counted among curated projects

- GIVEN the Proyectos grid's curated project count
- WHEN the academy block is checked
- THEN it is absent from that grid's card set

### Requirement: Precios Summary Section Contract

The Precios section MUST summarize pricing across the four lines and link to `/[locale]/precios` for full detail.

#### Scenario: Summary omits full package detail

- GIVEN the landing's pricing summary
- WHEN compared to `/[locale]/precios`
- THEN it shows only a subset, not the full tier anatomy, and a visible link to the full page

### Requirement: Retainer Section Contract

The Retainer section MUST present published commitments (per trust-signals capability) rather than a case study, since the retainer line has no possible project proof.

#### Scenario: Retainer section shows commitments, not a project card

- GIVEN the Retainer/Mantenimiento section
- WHEN it renders
- THEN it displays commitment values, not a portfolio-style project card

### Requirement: Conversion Section Contract

The Brief form + WhatsApp section MUST offer both a qualifying brief form and a one-tap WhatsApp link, per the `lead-capture` capability.

#### Scenario: Both conversion paths are present

- GIVEN the conversion section
- WHEN rendered
- THEN a brief form and a WhatsApp link are both visible

### Requirement: Copy Voice Constraint

Landing copy MUST NOT fabricate headcount (e.g. phrases implying a development team where the studio is solo-operated).

#### Scenario: No invented-team phrasing

- GIVEN any landing section's copy
- WHEN reviewed against the copy voice rule
- THEN it contains no phrase asserting a team of developers or employees
