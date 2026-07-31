# Site Shell Specification

## Purpose

The chrome and routing skeleton that wraps every content route: locale segment, root layout, brand metadata, header, footer, discoverability files, and error handling. This is what makes `dev-services-website`'s other capabilities addressable and crawlable.

## Requirements

### Requirement: Locale Root Resolution

The system MUST make `/` resolve to the `es` locale's landing content without requiring the visitor to know a locale segment exists. The resolution mechanism (rewrite, redirect, or default-segment convention) is a `sdd-design` decision; this requirement constrains only the observable outcome.

#### Scenario: Root path serves the Spanish landing

- GIVEN a visitor requests `/`
- WHEN the response is returned
- THEN the visitor sees the same content as `/es`
- AND the response is not a 404

#### Scenario: Locale extensibility without route moves

- GIVEN a future `en` dictionary is added under the locale segment
- WHEN the build runs
- THEN no existing route file under `app/[locale]/` needs to move or be renamed

### Requirement: Brand Metadata

The root layout MUST expose non-empty, ElectroCode Studio–branded metadata, replacing the current `"Website Studio"` / empty-description placeholder.

#### Scenario: Metadata carries the real brand

- GIVEN the root layout's generated `<head>`
- WHEN metadata is inspected
- THEN `title` contains "ElectroCode Studio"
- AND `description` is non-empty
- AND Open Graph tags reflect the same brand and description

### Requirement: Header Navigation

The system MUST render a header present on every locale route, linking to the pricing route, the landing's portfolio anchor, and the brief/WhatsApp conversion point.

#### Scenario: Header CTA no longer targets a dead route

- GIVEN the header or hero CTA labeled "Explora nuestros proyectos"
- WHEN a visitor activates it
- THEN it resolves to an existing internal anchor or route
- AND it never targets `/portfolio`

### Requirement: Footer Navigation

The system MUST render a footer present on every locale route with navigation links, a contact/WhatsApp reference, and locale indication.

#### Scenario: Footer renders without a locale switcher assumption

- GIVEN only `es` is shipped
- WHEN the footer renders
- THEN it does not imply other locales exist beyond what the dictionary supports

### Requirement: Zero Dead Internal Links

No internal link anywhere in the built output MUST resolve to a non-existent route, to `/` when a real destination exists, or to a route returning 404.

#### Scenario: Bare projects index redirects instead of 404s

- GIVEN a visitor requests `/[locale]/proyectos` with no slug
- WHEN the route is resolved
- THEN the visitor is redirected to the landing's portfolio anchor
- AND the response is not a 404

#### Scenario: Build-time link audit

- GIVEN the full set of internal links across header, footer, hero, portfolio grid, pricing CTAs, and case studies
- WHEN the site is built
- THEN every internal link target exists as a real route or anchor

### Requirement: Discoverability Files

The system MUST expose a `sitemap.xml` generated from the current route and content set, and a `robots.txt` that allows crawling and references the sitemap.

#### Scenario: Sitemap reflects published content

- GIVEN a project has a published case-study slug
- WHEN the sitemap is generated
- THEN that case-study route is included as an entry
- AND unpublished or draft projects are excluded

### Requirement: Not Found Handling

The system MUST render a branded 404 page for any unmatched route, distinct from the framework default, with a way back to the landing.

#### Scenario: Unknown route shows branded 404

- GIVEN a visitor requests a route that matches nothing
- WHEN the page renders
- THEN it identifies itself as ElectroCode Studio
- AND it offers a link back to `/[locale]`
