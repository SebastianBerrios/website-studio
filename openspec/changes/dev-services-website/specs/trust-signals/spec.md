# Trust Signals Specification

## Purpose

Two trust blocks that carry credibility where a normal case study cannot: the ElectroCode Academy authority block, and the maintenance retainer's published commitments.

## Requirements

### Requirement: Academy Block Placement

The ElectroCode Academy block MUST render only in landing section 5 (Autoridad) and MUST NOT appear as a card in the Proyectos grid.

#### Scenario: Academy is absent from the project grid

- GIVEN the Proyectos grid's card set
- WHEN checked for an academy entry
- THEN none exists

### Requirement: Academy No-Link State While Undeployed

While the academy's deployment is unreachable, the block MUST present no clickable link and no "visitar"/visit button — describing the platform and showing the brand mark or a locally captured screenshot only.

#### Scenario: No link renders while undeployed

- GIVEN the academy has no live, reachable deployment
- WHEN the block renders
- THEN it contains no clickable link or CTA button pointing at the academy

### Requirement: Academy No-Scale-Claim Constraint

The academy block MUST NOT claim any student count, course count, or review figure, regardless of deployment state, unless a verified source for that figure exists.

#### Scenario: No fabricated scale numbers

- GIVEN the academy block's copy
- WHEN reviewed
- THEN it contains no unverified count of students, courses, or reviews

### Requirement: Academy Upgrade Condition

The block MUST upgrade from `no-link` to `linked` (showing a real link) only when the academy's deployment is confirmed reachable, driven by a content data flag rather than a hardcoded conditional in the component.

#### Scenario: Upgrade is data-driven

- GIVEN the academy becomes reachable
- WHEN the corresponding content flag is updated
- THEN the block renders `linked` state without a code change to the block component

### Requirement: Retainer Published Commitments

The retainer trust block MUST publish, as structured checkable values (not prose promises): a response-time window, supported channels, monthly hours, a definition of what counts as maintenance versus new work, exclusions, and cancellation terms.

#### Scenario: Commitment values are structured, not vague

- GIVEN the retainer commitments block
- WHEN its response-time value is read
- THEN it is a concrete window (e.g. a stated business-hours range), not a phrase like "we respond quickly"

### Requirement: Itemized Maintenance Scope

The retainer block MUST itemize what monthly maintenance covers: dependency and security updates, uptime checks, backups, content edits, and small features.

#### Scenario: Itemized list answers "what am I paying for"

- GIVEN a prospect asking what a maintenance month includes when nothing breaks
- WHEN the itemized scope list is read
- THEN it names concrete recurring activities, not just "support"

### Requirement: Continuity Evidence Honesty

Continuity evidence (e.g. the Blu Café public site plus the `blu` back-office being the same multi-product client relationship) MUST state only confirmable, true facts — no invented duration or scale.

#### Scenario: Continuity claim matches verified facts

- GIVEN the continuity evidence statement
- WHEN compared to the verified client relationship
- THEN every fact stated is confirmable, with no added embellishment

### Requirement: No Retainer Testimonial Without Consent

The retainer block MUST NOT include a client testimonial until the user has supplied one with explicit consent.

#### Scenario: Testimonial section is absent, not placeholder-faked

- GIVEN no retainer testimonial has been collected
- WHEN the block renders
- THEN no testimonial quote appears, fabricated or otherwise
