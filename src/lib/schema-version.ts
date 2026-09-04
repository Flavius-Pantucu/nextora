/**
 * The version stamped on every persisted CV record, client or server.
 *
 * It lives on its own so the server can import it without pulling in
 * `src/lib/storage.ts`, which touches `window`.
 *
 * v1 → v2: personal.title/github/website, per-entry location, skill category,
 * project date range; the five old template ids were remapped onto replicas.
 */
export const SCHEMA_VERSION = 2;
