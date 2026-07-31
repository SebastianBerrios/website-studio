# Case Study Specification

## Purpose

The `/[locale]/proyectos/[slug]` route and the mandatory template every curated project's write-up must follow, so that unlinkable work (the majority of the portfolio) is still persuasive.

## Requirements

### Requirement: Case Study Route

Each curated project MUST be reachable at `/[locale]/proyectos/[slug]` using its unique `slug`. An unknown slug MUST resolve to the site's real 404, not a blank or partially-rendered page.

#### Scenario: Known slug renders a complete case study

- GIVEN a curated project's slug
- WHEN `/[locale]/proyectos/[slug]` is requested
- THEN the full case-study template renders

#### Scenario: Unknown slug 404s properly

- GIVEN a slug with no matching project
- WHEN the route is requested
- THEN the branded 404 page renders, not a blank page

### Requirement: Mandatory Template Elements

Every case study MUST contain: title + context, service-line badge, problem, role, approach/process, stack, outcome, visual evidence in its declared `evidence` state, a disclosure line where required, and a next-step block.

#### Scenario: A case study missing the approach section is incomplete

- GIVEN a case-study entry lacking the approach/process element
- WHEN validated against the template
- THEN it fails — approach is load-bearing, especially when no visuals exist

### Requirement: Title and Context Honesty

Title and context MUST show the client's name only with recorded consent; otherwise it MUST show industry and size instead of a name.

#### Scenario: No consent means no client name

- GIVEN a project whose `consent` is not granted
- WHEN its title/context renders
- THEN no client name appears — industry and size are shown instead

### Requirement: Truthful Disclosure Line

Any case study whose evidence is gated, sanitized, or shown with limited permission MUST carry a truthful, specific disclosure line (e.g. "shown with the client's permission", "sanitized at the client's request").

#### Scenario: Gated evidence carries its disclosure

- GIVEN a project with `evidence: gated`
- WHEN its case study renders
- THEN a disclosure line naming the gating reason is present

### Requirement: No Invented Metric

The outcome element MUST be either a verifiable metric or a qualitative, verifiable statement. It MUST NOT contain a fabricated number.

#### Scenario: No metric exists, so none is claimed

- GIVEN a project with no source for a quantitative outcome
- WHEN its outcome renders
- THEN it states a qualitative change instead of inventing a number

### Requirement: Persuasive Without Images

Every case study MUST remain persuasive when read with images disabled — text content alone (problem, role, approach, outcome, disclosure) MUST communicate the full argument.

#### Scenario: Images-disabled acceptance test

- GIVEN a case study rendered with all media hidden
- WHEN a reader reviews only the text
- THEN problem, role, approach, and outcome are each still fully legible and specific — not a caption dependent on a missing image

### Requirement: Next-Step Block

Every case study MUST end with a link to the matching pricing block and to the brief form.

#### Scenario: Next step routes to the right pricing block

- GIVEN a case study tagged with service line A
- WHEN its next-step block is activated
- THEN it links to Line A's pricing block, not a generic pricing landing
