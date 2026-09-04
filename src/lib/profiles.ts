import type { CVProfileRow } from "@/db/schema";
import type { CVProfile } from "@/types/cv.types";

/**
 * A database row as the client's `CVProfile`.
 *
 * The client speaks ISO strings for timestamps (that is what localStorage held
 * and what the JSON export writes), so the conversion happens here, once,
 * rather than in each endpoint.
 */
export function toClientProfile(row: CVProfileRow): CVProfile {
    return {
        id: row.id,
        name: row.name,
        data: row.data,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
    };
}

/** The same id shape the store mints, for profiles that arrive without one. */
export const newProfileId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
