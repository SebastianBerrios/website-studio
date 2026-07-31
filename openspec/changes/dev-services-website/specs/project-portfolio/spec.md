# Project Portfolio Specification

## Purpose

The curated project set (6–8 entries), how it projects into `HeroParallax`, how it renders as the landing's portfolio grid, and the honest degradation rules for missing visual evidence.

## Requirements

### Requirement: Curated Set Size

The published, `featured` project set MUST contain between 6 and 8 distinct entries — no padding with duplicates.

#### Scenario: No duplicate entries

- GIVEN the featured project set
- WHEN entries are compared by `slug`
- THEN no two entries are duplicates of the same project

### Requirement: Hero Projection Preserves Prop Contract

`HeroParallax` MUST keep receiving `{ title, link, thumbnail }[]`. The hero consumes a projection of `Project[]` computed from the content model — it MUST NOT receive the full `Project` entity, and the projection function (not hand-duplicated literals) MUST be the data source.

#### Scenario: Hero prop shape is unchanged

- GIVEN `HeroParallax`'s prop type
- WHEN compared before and after this change
- THEN it is still `{ title: string; link: string; thumbnail: string }[]`

### Requirement: Row Derivation From Array Length

`HeroParallax` MUST derive its row count and row size from the length of the received array rather than fixed `0-5/5-10/10-15` slices, so a curated 6–8 entry set renders without empty rows. The exact derivation algorithm is a `sdd-design` decision; this requirement constrains only the observable outcome.

#### Scenario: Six entries render without an empty row

- GIVEN 6 curated entries
- WHEN the hero renders
- THEN no row is empty

#### Scenario: Eight entries render without an empty row

- GIVEN 8 curated entries
- WHEN the hero renders
- THEN no row is empty

#### Scenario: Motion values are preserved

- GIVEN the existing `useSpring`/`useTransform` values and perspective entrance
- WHEN the row derivation changes
- THEN those motion values remain functionally equivalent (same inputs produce the same visual behavior)

### Requirement: Conditional Card Link Target

Each `ProductCard`'s link target MUST depend on whether the link is internal (a case-study route) or external (a live client URL). Internal links MUST NOT open in a new tab; external links MAY.

#### Scenario: Internal case-study link stays in the same tab

- GIVEN a project with `evidence` of `gated`, `not-deployed`, or `no-visual`
- WHEN its hero card link is inspected
- THEN it does not carry `target="_blank"` and navigates to the internal case-study route

#### Scenario: External live link may open in a new tab

- GIVEN a project with `evidence: live` and a working external URL
- WHEN its hero card link is inspected
- THEN it points at the external URL

### Requirement: Evidence State Rendering

Each project MUST render according to exactly one of four evidence states.

| State | Renders |
|---|---|
| `live` | Screenshot + external link |
| `gated` | Authorized sanitized screenshot + explicit note that the product sits behind a login |
| `not-deployed` | Locally captured screenshot + note that no public deployment exists |
| `no-visual` | Text-only card that still reads as complete |

#### Scenario: `no-visual` degrades honestly

- GIVEN a project with `evidence: no-visual`
- WHEN its card renders
- THEN it shows no broken image frame and no gray box passed off as a screenshot

### Requirement: Portfolio Grid Consistency With Hero

> Amended after `sdd-verify` finding W10. This requirement originally demanded
> the grid and hero render "the same set of projects — no project appears in one
> but not the other". That is not achievable and was never intended to be: the
> hero is an image-driven parallax, so a project with no visual evidence cannot
> appear there without rendering a broken or fake image frame — exactly what the
> `no-visual` evidence state exists to prevent. Design §5 and `toHeroProducts()`
> therefore exclude those projects from the hero. Left unamended this would have
> surfaced as a false CRITICAL when PR 3a ships the grid.
>
> The real intent — that the hero never shows something the grid hides, and that
> any divergence has exactly one honest cause — is restated below as a checkable
> subset rule.

The hero's entries MUST be a **subset** of the grid's entries, both drawn from
the same curated (`featured: true`) set.

Every project the hero shows MUST also appear in the grid. A project MAY appear
in the grid but not the hero, and the ONLY permitted reason is that it has no
visual evidence (`evidence.state: "no-visual"`), because the hero cannot render
a card without a thumbnail honestly.

Any other divergence is a defect: it means the two surfaces disagree about what
the studio has done.

#### Scenario: Hero is a subset of the grid

- GIVEN the featured project set
- WHEN the hero's entries and the grid's entries are compared
- THEN every hero entry appears in the grid

#### Scenario: A grid-only project is grid-only because it has no image

- GIVEN a project present in the grid but absent from the hero
- WHEN its evidence state is inspected
- THEN it is `no-visual`

#### Scenario: A project with imagery cannot be dropped from the hero

- GIVEN a featured project whose evidence carries media
- WHEN the hero projection is built
- THEN that project is present in the hero, and its absence fails the build

### Requirement: No Self-Referential Links

No project entry MUST have `link` resolve to `/`.

#### Scenario: The former "Blu Finances" self-link is gone

- GIVEN any project entry
- WHEN its `link` value is checked
- THEN it never equals `/`
