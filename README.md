# Nextora

A single-user CV workbench. Your professional history is stored once as structured
data, then rendered through five faithful replicas of published résumé formats and
exported to a PDF that matches the preview exactly.

A Next.js app with a Postgres database behind it. Your CVs live in your account;
the browser keeps a copy so a reload still opens the board with no network.

---

## The ten formats

Each one reproduces a specific published template — its real typeface, margins and
metrics, taken from the original LaTeX source rather than approximated.

| Format | Author | ATS-safe | Typeface |
|---|---|---|---|
| **Jake's Resume** | Jake Gutierrez | yes | Computer Modern |
| **Awesome-CV** | Byungjin Park (posquit0) | yes | Roboto |
| **Classic Times** | standard career-office format | yes | Times New Roman (Tinos) |
| **Deedy** | Debarghya Das | no | Lato + Raleway |
| **Twenty Seconds** | Carmine Spagnuolo | no | Roboto |
| **Slate** | agency two-column design | no | Archivo + Roboto |
| **Marquee** | slab-header design | no | Archivo + Lato |
| **Greyboard** | editorial grey-card design | no | Raleway |
| **Ribbon** | blush-and-navy design | no | Archivo + Lato |
| **Cameo** | charcoal portrait design | no | Archivo + Lato |

*ATS-safe* means single column, no text inside graphics, no sidebar, selectable text
throughout, conventional section headings — the things an applicant tracking system
needs in order to parse the file.

The templates deliberately do **not** follow the application's own design system.
They are replicas; fidelity to the original beats internal consistency.

---

## Export

The rule the export pipeline exists to enforce: **there is one rendering path**.

The PDF is rasterised from the very DOM node the preview is showing — same width,
same stylesheet, same paginated layout. Nothing is re-laid-out for export and
nothing is styled differently for it. The only thing removed is the preview's own
trim guides, which are marked `data-export-hide` so they can be dropped without
touching content.

Pagination runs once, on the real rendered DOM (`src/components/Sheet.tsx`). A block
that would straddle a page boundary is pushed onto the next page, the way LaTeX's
`\needspace` works, so a heading never ends up orphaned at the foot of a page. The
exporter then slices the canvas at exactly the boundaries the preview drew.

Three ways out:

- **Export PDF** — rasterised at 3×, one PDF page per preview page, at true A4 or
  Letter size. Pixel-identical to the preview; the text is not selectable.
- **Print** — the same DOM through the browser's print path, so the text stays text.
  Use this when you need a selectable-text or smaller PDF.
- **PNG** — the whole document as one image.

---

## Data

### Where a CV lives

One row per CV in Postgres, keyed by `(user_id, id)`. The CV itself is a `jsonb`
document holding exactly the `CVData` the templates render — the same shape the JSON
export writes.

Normalising the eight repeating sections into their own tables would cost eight
joins to draw one sheet and a migration for every field a template grows, and would
buy nothing: nothing queries across CVs. The id is minted on the client and kept, so
a CV created offline keeps its identity when it reaches the server; the composite key
is what makes one account's ids incapable of colliding with another's.

`user_settings` holds the rest of the workbench — which CV was open, in which
template, at which page size, in which theme.

### Reads and writes

Everything goes through one interface, `CVStorageAdapter` in `src/lib/storage.ts`.
There are two implementations and the store cannot tell them apart:

- **`localStorage`** — before signing in, and as the offline cache afterwards.
- **the API** — the source of truth once signed in.

The store hands over the whole world on every keystroke, so the API adapter coalesces
writes on a 700 ms timer and sends only what moved: one `PATCH` for the CV being
typed into, not eight. Every write is mirrored into `localStorage` as it goes, and a
write that fails to reach Postgres stays out of the adapter's mirror so the next save
retries it rather than losing it.

The first time you sign in on a browser that already held CVs, the board offers to
pull them up into your account. It only ever adds: an incoming id that is already
taken is reminted rather than written over.

- **Export JSON** writes every profile to a file.
- **Import JSON** adds those profiles alongside the existing ones — it never
  overwrites what is already stored.
- Records are versioned and migrated forward on load.

---

## API

Every endpoint requires a session and is scoped to it. No route takes a user id from
the client, so an account can only ever address its own rows.

| Method | Path | |
|---|---|---|
| `GET` | `/api/profiles` | every CV plus the workbench settings — one round trip on open |
| `POST` | `/api/profiles` | create one; `409` if the id is taken |
| `GET` | `/api/profiles/:id` | one CV |
| `PATCH` | `/api/profiles/:id` | name, document, or both |
| `DELETE` | `/api/profiles/:id` | remove one, and clear it from settings if it was active |
| `POST` | `/api/profiles/import` | bulk add, keeping client ids where they are free |
| `GET` `PATCH` | `/api/settings` | active CV, template, page format, theme |
| — | `/api/auth/*` | Better Auth: `sign-up/email`, `sign-in/email`, `sign-out`, `get-session` |

Bodies are validated with zod (`src/lib/api-schema.ts`). The CV document is checked
structurally rather than field by field — the eight sections are the client's own
`CVData` and change whenever a template needs a new field — plus hard size limits,
because a base64 photo is the one field a user can make arbitrarily large.

Auth is Better Auth with email and password, sessions in Postgres, and its CSRF
origin check on every state-changing request.

---

## Getting started

```bash
npm install
cp .env.example .env.local          # then put a real secret in it:
#   BETTER_AUTH_SECRET=$(openssl rand -base64 32)

npm run db:up                       # Postgres 17 in Docker, on host port 5433
npm run db:migrate                  # apply the migrations in drizzle/

npm run dev                         # http://localhost:3000
```

The first run lands on `/sign-in`; create an account and the board opens.

```bash
npm run build       # production build
npm run typecheck
npm run start       # serve the build

npm run db:generate # write a migration after editing src/db/schema.ts
npm run db:studio   # browse the data
npm run db:down     # stop Postgres (the volume survives)
```

Postgres is published on **5433**, not 5432, so a locally installed Postgres is left
alone. `DATABASE_URL` in `.env.local` has to agree with it.

To run against a hosted database (Neon, Supabase, RDS) instead, put its URL in
`DATABASE_URL` and skip `db:up` — `db:migrate` reads the same `.env.local` the app
does, so both always talk to the same database. Nothing else changes.

---

## Using it

The application is a reference manual open at a tabbed division. The CV is the sheet
lying on the board; the editor is the hinged leaf beside it; the eight content
sections are the coloured divider tabs down the fore edge, each sized by how much it
holds.

**Keyboard**

| Key | Action |
|---|---|
| `1`–`8` | Jump to a section (the digit is printed on its tab) |
| `Ctrl/Cmd + E` | Export PDF |
| `Ctrl/Cmd + P` | Print |
| `Ctrl/Cmd + Z` | Undo |

There is no save button. Every edit is written through — to the browser at once,
and to Postgres a moment later.

**Bullets** are authored one per line in the Responsibilities, Achievements and
Description fields. Blank lines are ignored.

**Skill categories** group the skills on Jake's Resume, Awesome-CV and Deedy. Skill
*level* drives the 0–6 bars on Twenty Seconds and the meters on Slate and Cameo.

**Photos** are printed by Twenty Seconds, Slate, Marquee, Greyboard, Ribbon and Cameo,
cropped square at 600px. Ribbon falls back to a monogram of the initials when there
is no photo.

---

## Licences of the replicated templates

The formats reproduced here are the work of their authors, and their original
sources are MIT (Jake's Resume, Twenty Seconds CV), LPPL 1.3c (Awesome-CV) and
Apache 2.0 (Deedy). This project reimplements their layouts in HTML and CSS; if you
publish a CV made with one, credit is a decent thing to give.
