import type { CVProfile, PersistedState } from "@/types/cv.types";
import { SCHEMA_VERSION } from "@/lib/schema-version";

/**
 * Every read and write of CV data goes through this interface. There are two
 * implementations — the browser's localStorage and the Postgres-backed API —
 * and the store cannot tell them apart.
 */
export interface CVStorageAdapter {
    readonly name: string;
    load(): Promise<PersistedState | null>;
    save(state: PersistedState): Promise<void>;
    clear(): Promise<void>;
    /** Writes anything a debounce is still holding. Called before unload. */
    flush?(): Promise<void>;
}

export const STORAGE_KEY = "cv-builder-storage";
export { SCHEMA_VERSION };

/* ===========================================================================
   localStorage — the offline cache, and the only store before signing in.
   =========================================================================== */

/** v1 kept a flat `state` object with no version and fewer personal fields. */
function migrate(raw: unknown): PersistedState | null {
    if (!raw || typeof raw !== "object") return null;
    const box = raw as Record<string, unknown>;

    // Zustand's persist middleware wrapped everything in { state, version }.
    const body = (box.state && typeof box.state === "object" ? box.state : box) as Record<string, unknown>;
    if (!body.profiles || typeof body.profiles !== "object") return null;

    const profiles = body.profiles as PersistedState["profiles"];
    for (const profile of Object.values(profiles)) {
        const data = profile?.data;
        if (!data) continue;

        // Fields added in v2. Absent on any record written by the old build.
        const p = data.personal as unknown as Record<string, unknown>;
        p.title ??= "";
        p.github ??= "";
        p.website ??= "";

        for (const item of data.experience ?? []) {
            (item as unknown as Record<string, unknown>).location ??= "";
        }
        for (const item of data.education ?? []) {
            (item as unknown as Record<string, unknown>).location ??= "";
        }
        for (const item of data.skills ?? []) {
            (item as unknown as Record<string, unknown>).category ??= "Skills";
        }
        for (const item of data.projects ?? []) {
            (item as unknown as Record<string, unknown>).dates ??= { from: "", to: "" };
        }
    }

    // v1 template ids no longer exist; every one of them maps onto a replica.
    const legacyTemplates: Record<string, PersistedState["activeTemplate"]> = {
        classic: "classic",
        modern: "awesome",
        creative: "twentyseconds",
        minimal: "jake",
        executive: "deedy",
    };
    const template = String(body.activeTemplate ?? "jake");

    return {
        version: SCHEMA_VERSION,
        profiles,
        activeProfileId: (body.activeProfileId as string | null) ?? null,
        activeTemplate: legacyTemplates[template] ?? (template as PersistedState["activeTemplate"]),
        pageFormat: (body.pageFormat as PersistedState["pageFormat"]) ?? "a4",
        darkMode: Boolean(body.darkMode),
    };
}

function readLocal(): PersistedState | null {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return migrate(JSON.parse(raw));
    } catch {
        // A private window, cleared site data, or a half-written record.
        return null;
    }
}

function writeLocal(state: PersistedState): void {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const localStorageAdapter: CVStorageAdapter = {
    name: "localStorage",

    async load() {
        return readLocal();
    },

    async save(state) {
        try {
            writeLocal(state);
        } catch (error) {
            // Quota is the realistic failure here: a few base64 photos fill it.
            console.error("Could not save to localStorage", error);
            throw new Error("Storage is full. Remove a profile photo or delete an unused profile.");
        }
    },

    async clear() {
        window.localStorage.removeItem(STORAGE_KEY);
    },
};

/** Whatever localStorage is holding, for the one-time pull-up after signing in. */
export function readLocalProfiles(): CVProfile[] {
    return Object.values(readLocal()?.profiles ?? {});
}

/* ===========================================================================
   The API — Postgres, and the source of truth once signed in.
   =========================================================================== */

/** How long an edit sits before it is written through. */
const SAVE_DEBOUNCE_MS = 700;

class ApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(path, {
        ...init,
        headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
        credentials: "same-origin",
    });

    if (response.status === 204) return undefined as T;
    if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new ApiError(body?.error ?? `The server answered ${response.status}.`);
    }
    return (await response.json()) as T;
}

/** Snapshot of what the server is known to hold, so a save can send the difference. */
interface Mirror {
    profiles: Record<string, CVProfile>;
    activeProfileId: string | null;
    activeTemplate: PersistedState["activeTemplate"];
    pageFormat: PersistedState["pageFormat"];
    darkMode: boolean;
}

/**
 * The API adapter.
 *
 * Two things make this more than a fetch wrapper. First, the store writes on
 * every keystroke, so writes are coalesced on a short timer and the last state
 * wins. Second, the store hands over the whole world on each save, so the
 * adapter diffs that against what the server is known to hold and sends only
 * what moved — one PATCH for the CV being typed into, not eight.
 *
 * Every write is mirrored into localStorage as it goes, so a reload with no
 * network still opens the board on the last thing that was on it.
 */
function createApiAdapter(): CVStorageAdapter {
    let mirror: Mirror | null = null;
    let pending: PersistedState | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let inFlight: Promise<void> = Promise.resolve();
    /**
     * Everyone waiting on the coalesced write. A keystroke supersedes the one
     * before it, but the promise it was already handed still has to settle —
     * otherwise every keystroke leaks a promise holding a whole state snapshot,
     * base64 photos and all.
     */
    let waiters: Array<{ resolve: () => void; reject: (error: unknown) => void }> = [];

    const snapshot = (state: PersistedState): Mirror => ({
        profiles: structuredClone(state.profiles),
        activeProfileId: state.activeProfileId,
        activeTemplate: state.activeTemplate,
        pageFormat: state.pageFormat,
        darkMode: state.darkMode,
    });

    /** Sends the difference between the mirror and `state`, then re-mirrors. */
    async function push(state: PersistedState): Promise<void> {
        const before = mirror ?? { profiles: {}, activeProfileId: null, activeTemplate: state.activeTemplate, pageFormat: state.pageFormat, darkMode: state.darkMode };
        // Anything that fails stays out of the new mirror, so the next save
        // retries it rather than losing it.
        const settled: Record<string, CVProfile> = structuredClone(before.profiles);
        const failures: string[] = [];

        for (const [id, profile] of Object.entries(state.profiles)) {
            const known = before.profiles[id];
            try {
                if (!known) {
                    await request<CVProfile>("/api/profiles", {
                        method: "POST",
                        body: JSON.stringify({ id, name: profile.name, data: profile.data, createdAt: profile.createdAt }),
                    });
                } else if (known.name !== profile.name || known.updatedAt !== profile.updatedAt) {
                    await request<CVProfile>(`/api/profiles/${encodeURIComponent(id)}`, {
                        method: "PATCH",
                        body: JSON.stringify({ name: profile.name, data: profile.data }),
                    });
                } else {
                    continue;
                }
                settled[id] = structuredClone(profile);
            } catch (error) {
                failures.push(error instanceof Error ? error.message : String(error));
            }
        }

        for (const id of Object.keys(before.profiles)) {
            if (state.profiles[id]) continue;
            try {
                await request<void>(`/api/profiles/${encodeURIComponent(id)}`, { method: "DELETE" });
                delete settled[id];
            } catch (error) {
                failures.push(error instanceof Error ? error.message : String(error));
            }
        }

        const settingsChanged =
            before.activeProfileId !== state.activeProfileId ||
            before.activeTemplate !== state.activeTemplate ||
            before.pageFormat !== state.pageFormat ||
            before.darkMode !== state.darkMode ||
            mirror === null;

        let settings = {
            activeProfileId: before.activeProfileId,
            activeTemplate: before.activeTemplate,
            pageFormat: before.pageFormat,
            darkMode: before.darkMode,
        };

        if (settingsChanged) {
            try {
                await request<void>("/api/settings", {
                    method: "PATCH",
                    body: JSON.stringify({
                        // Only point at a CV the server has actually accepted.
                        activeProfileId: state.activeProfileId && settled[state.activeProfileId] ? state.activeProfileId : null,
                        activeTemplate: state.activeTemplate,
                        pageFormat: state.pageFormat,
                        darkMode: state.darkMode,
                    }),
                });
                settings = {
                    activeProfileId: state.activeProfileId,
                    activeTemplate: state.activeTemplate,
                    pageFormat: state.pageFormat,
                    darkMode: state.darkMode,
                };
            } catch (error) {
                failures.push(error instanceof Error ? error.message : String(error));
            }
        }

        mirror = { profiles: settled, ...settings };

        // The cache is written whatever the network did: it is what an offline
        // reload opens, and it is the only copy of an edit that failed to send.
        try {
            writeLocal(state);
        } catch {
            // A full cache is not a reason to fail a save that reached Postgres.
        }

        if (failures.length) throw new Error(failures[0]);
    }

    async function flush(): Promise<void> {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        const state = pending;
        pending = null;

        const settling = waiters;
        waiters = [];

        if (!state) {
            // Nothing new to send, but a push may still be on the wire.
            inFlight.then(
                () => settling.forEach((waiter) => waiter.resolve()),
                (error) => settling.forEach((waiter) => waiter.reject(error)),
            );
            return inFlight;
        }

        // Serialised: two overlapping pushes would race on the same mirror.
        inFlight = inFlight.catch(() => {}).then(() => push(state));
        inFlight.then(
            () => settling.forEach((waiter) => waiter.resolve()),
            (error) => settling.forEach((waiter) => waiter.reject(error)),
        );
        return inFlight;
    }

    return {
        name: "api",

        async load() {
            const state = await request<PersistedState & { localImported: boolean }>("/api/profiles");
            mirror = snapshot(state);
            try {
                writeLocal(state);
            } catch {
                /* the cache is optional */
            }
            return state;
        },

        async save(state) {
            pending = state;
            if (timer) clearTimeout(timer);
            const settled = new Promise<void>((resolve, reject) => {
                waiters.push({ resolve, reject });
            });
            // The waiters carry the outcome; this call must not also surface
            // the rejection as an unhandled one.
            timer = setTimeout(() => void flush().catch(() => {}), SAVE_DEBOUNCE_MS);
            await settled;
        },

        flush,

        async clear() {
            const ids = Object.keys(mirror?.profiles ?? {});
            await Promise.all(ids.map((id) => request<void>(`/api/profiles/${encodeURIComponent(id)}`, { method: "DELETE" })));
            mirror = null;
            window.localStorage.removeItem(STORAGE_KEY);
        },
    };
}

export const apiStorageAdapter = createApiAdapter();

/* ===========================================================================
   Which one is in use.
   =========================================================================== */

export type StorageMode = "local" | "api";

let active: CVStorageAdapter = localStorageAdapter;

/** Called once the session is known, before the store hydrates. */
export function setStorageMode(mode: StorageMode): void {
    active = mode === "api" ? apiStorageAdapter : localStorageAdapter;
}

export const getStorageMode = (): StorageMode => (active === apiStorageAdapter ? "api" : "local");

/** The store holds this, not an adapter, so the mode can change under it. */
export const storage: CVStorageAdapter = {
    get name() {
        return active.name;
    },
    load: () => active.load(),
    save: (state) => active.save(state),
    clear: () => active.clear(),
    flush: () => active.flush?.() ?? Promise.resolve(),
};

/** Sends the CVs this browser was holding up to the signed-in account. */
export async function importLocalProfiles(profiles: CVProfile[], markImported: boolean): Promise<number> {
    if (!profiles.length) return 0;
    const result = await request<{ imported: number }>("/api/profiles/import", {
        method: "POST",
        body: JSON.stringify({ profiles: profiles.map(({ id, name, data, createdAt, updatedAt }) => ({ id, name, data, createdAt, updatedAt })), keepIds: true, markImported }),
    });
    return result.imported;
}
