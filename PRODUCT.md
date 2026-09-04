# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Single user: the repository owner, a software engineer maintaining several versions of
their own CV. Not a multi-tenant product and not a public sign-up product. The user is
technical, uses the app repeatedly rather than once, and already knows what every field
means — so first-run hand-holding, marketing copy, and explanatory onboarding are cost,
not value.

Situation: sitting down before a job application, opening a stored profile, adjusting
wording or reordering entries for a specific role, switching template, exporting a PDF,
and attaching it to an application. Sessions are short and repeated.

## Product Purpose

Maintain a structured record of one person's professional history once, then render it
through several fixed, high-fidelity resume templates and export a PDF that is identical
to what the on-screen preview showed.

Success is: the exported PDF matches the preview exactly, the templates look like the
real published resume formats they replicate rather than approximations of them, and
producing a tailored CV for a new application takes minutes.

## Positioning

Structured CV data is authored once and is independent of presentation; templates are
faithful reproductions of specific, recognized resume formats (Jake's Resume first among
them) rather than generic "modern/creative" themes. The user picks a format they already
trust by name, not a mood.

## Operating Context

- Next.js app over Postgres. CVs belong to an account, so they follow their owner
  between browsers; the browser keeps a copy, so a reload works with no network.
- Output target is A4 (and Letter) PDF, submitted to job applications and applicant
  tracking systems.
- The user maintains multiple named profiles (variants of their CV for different roles)
  and switches between them.
- Work is iterative: edit a field, look at the preview, edit again. The preview is the
  primary object on screen, not a secondary panel.

## Capabilities and Constraints

Confirmed capabilities to preserve:

- Multiple named CV profiles: create, rename, duplicate, delete, switch.
- Eight content sections: personal details, experience, education, skills, projects,
  certifications, languages, hobbies. Personal details include an optional photo.
- Live preview of the active profile in the active template.
- Export to PDF; PNG and print also exist today.
- Dark mode for the application shell. The CV document itself is always light —
  it is paper, and never inherits the app theme.
- Data persists across reloads with no explicit save step.

Constraints:

- Existing stack is fixed: React 18 + TypeScript + Vite + Tailwind CSS 3 + Zustand.
- Persistence stays in localStorage for now, but every read and write goes through a
  single storage layer so a database can replace it later without touching UI code.
  JSON import/export exists so data is never trapped in one browser profile.
- **Export fidelity is a hard requirement**: the PDF must match the preview. Any
  divergence between preview rendering and export rendering is a defect, not a
  tolerance. This forbids preview-only styling and export-only styling paths.
- Templates are replicas. Where a template reproduces a published format, its metrics
  (fonts, rules, margins, spacing, capitalization) follow that format rather than the
  app's own design system.

Template set (five, fixed):

1. **Jake's Resume** — required by the user. The Jake Gutierrez LaTeX template.
2, 3. Two further single-column, ATS-safe formats.
4, 5. Two expressive, visually designed formats for human readers.

ATS-safe means: single column, no text in graphics, no sidebars, selectable text,
conventional section headings.

## Brand Commitments

None. The product has no existing name, logo, voice, or identity the user has made
binding. "CV Builder Pro" in the current README and docs is scaffolding text, not a
committed brand.

## Evidence on Hand

- Existing implementation at `src/` — treated as product-truth evidence for features
  and data model only; its visual layer is anti-reference.
- `src/utils/sample-data.ts` — placeholder sample CV content, not the user's real CV.
- `public/images/` — placeholder avatar images.
- No real user CV content, testimonials, customers, metrics, or copy exist in the
  repository. None must be invented.

## Product Principles

1. **The document is the product.** The preview is the largest, most stable thing on
   screen; the editor serves it.
2. **What you see is what exports.** One rendering path for preview and export. No
   second styling truth.
3. **Templates are replicas, not themes.** Fidelity to a named published format beats
   internal visual consistency.
4. **Built for repeat use by one expert.** Density, keyboard access, and fast switching
   over guidance and decoration.
5. **Data outlives this app.** Content is structured, portable, and storage-agnostic.

## Accessibility & Inclusion

No product-specific standard was established by the user. Baseline applies: keyboard
operability for every editor action, visible focus, and text contrast that holds in both
app themes.
