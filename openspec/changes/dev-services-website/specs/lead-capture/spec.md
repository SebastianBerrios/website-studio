# Lead Capture Specification

## Purpose

The conversion path: a qualifying brief form as the primary route, a WhatsApp escape hatch as the immediate-conversion secondary route, and a confirmation endpoint. The backend that stores brief submissions is an open `sdd-design` fork; these requirements MUST be satisfiable by any backend choice.

## Requirements

### Requirement: Brief Form Presence

The landing MUST include a brief form section (`#brief`) asking questions sufficient to identify the visitor's service line, project description, and contact method, without requiring a dedicated `/contacto` route.

#### Scenario: Form lives on the landing, not a separate route

- GIVEN the conversion section
- WHEN a visitor wants to start a brief
- THEN they submit it from `#brief` on the landing, not a `/[locale]/contacto` route

### Requirement: Service Line Pre-Tagging

When a visitor arrives at the brief form via a pricing CTA for a specific line, that line MUST be pre-selected in the form.

#### Scenario: Arriving from a pricing CTA pre-fills the line

- GIVEN a visitor activates Line B's pricing CTA
- WHEN the brief form opens
- THEN Line B is already selected

### Requirement: WhatsApp Escape Hatch

A WhatsApp link MUST be visible on the landing's conversion section and MUST function without depending on the brief form's backend.

#### Scenario: WhatsApp works before the form backend exists

- GIVEN the brief-form backend is not yet built
- WHEN a visitor uses the WhatsApp link
- THEN it opens a conversation with the studio's business number regardless

#### Scenario: WhatsApp number is not fabricated

- GIVEN the WhatsApp link's target number
- WHEN inspected
- THEN it is the studio's real business number, supplied as a content input, not a placeholder left in production

### Requirement: Submission Validation

The brief form MUST validate its required fields before treating a submission as successful. An invalid submission MUST NOT redirect to the confirmation route.

#### Scenario: Missing required field blocks confirmation

- GIVEN a submission missing a required field
- WHEN submitted
- THEN the visitor is not redirected to `/[locale]/gracias`

### Requirement: Confirmation Route

A successful brief submission MUST redirect to `/[locale]/gracias`, giving the conversion a measurable endpoint.

#### Scenario: Successful submission reaches the confirmation page

- GIVEN a valid brief submission
- WHEN it completes successfully
- THEN the visitor lands on `/[locale]/gracias`

### Requirement: Backend-Agnostic Contract

These requirements MUST hold regardless of whether the backend resolves to transactional email only or to persisted storage; no requirement here MUST assume a specific database or schema.

#### Scenario: Requirement set is satisfiable by email-only backend

- GIVEN the backend resolves to email-only delivery
- WHEN this spec's scenarios are checked
- THEN all of them still hold without requiring persisted storage
