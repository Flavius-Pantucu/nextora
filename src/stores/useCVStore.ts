import { create } from "zustand";
import type { AppState, CVData, CVProfile, PageFormat, PersistedState, TemplateType } from "../types/cv.types";
import { getEmptyCVData, getSampleCVData } from "../utils/sample-data";
import { SCHEMA_VERSION, storage } from "@/lib/storage";

interface Snapshot {
    profiles: Record<string, CVProfile>;
    activeProfileId: string | null;
}

interface CVStore extends AppState {
    hydrated: boolean;
    /** Bounded undo stack. Nothing an edit destroys is unrecoverable. */
    past: Snapshot[];
    lastError: string | null;

    createProfile: (name: string) => void;
    deleteProfile: (id: string) => void;
    duplicateProfile: (id: string) => void;
    setActiveProfile: (id: string) => void;
    updateProfileName: (id: string, name: string) => void;
    updateProfileData: (id: string, data: Partial<CVData>) => void;

    setActiveTemplate: (template: TemplateType) => void;
    setPageFormat: (format: PageFormat) => void;
    toggleDarkMode: () => void;

    undo: () => void;
    canUndo: () => boolean;
    dismissError: () => void;

    hydrate: () => Promise<void>;
    exportJSON: () => string;
    importJSON: (json: string) => { ok: true } | { ok: false; error: string };

    getActiveProfile: () => CVProfile | null;
}

const UNDO_LIMIT = 60;

const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const makeProfile = (name: string, data: CVData): CVProfile => ({
    id: generateId(),
    name,
    data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
});

const seedProfile = makeProfile("Sample CV", getSampleCVData());

/** One place decides what gets written; the adapter decides where. */
function persist(state: CVStore) {
    const snapshot: PersistedState = {
        version: SCHEMA_VERSION,
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        activeTemplate: state.activeTemplate,
        pageFormat: state.pageFormat,
        darkMode: state.darkMode,
    };
    void storage.save(snapshot).catch((error: Error) => {
        useCVStore.setState({ lastError: error.message });
    });
}

export const useCVStore = create<CVStore>()((set, get) => {
    /** Applies a change, records the undo point, and writes through. */
    const commit = (mutator: (state: CVStore) => Partial<CVStore>, { undoable = true } = {}) => {
        set((state) => {
            const patch = mutator(state);
            const past = undoable
                ? [...state.past, { profiles: state.profiles, activeProfileId: state.activeProfileId }].slice(-UNDO_LIMIT)
                : state.past;
            return { ...patch, past };
        });
        persist(get());
    };

    const touch = (profile: CVProfile): CVProfile => ({ ...profile, updatedAt: new Date().toISOString() });

    return {
        profiles: { [seedProfile.id]: seedProfile },
        activeProfileId: seedProfile.id,
        activeTemplate: "jake",
        pageFormat: "a4",
        darkMode: false,
        hydrated: false,
        past: [],
        lastError: null,

        hydrate: async () => {
            const saved = await storage.load();
            if (!saved || !Object.keys(saved.profiles).length) {
                set({ hydrated: true });
                return;
            }
            const ids = Object.keys(saved.profiles);
            set({
                profiles: saved.profiles,
                activeProfileId: saved.activeProfileId && saved.profiles[saved.activeProfileId] ? saved.activeProfileId : ids[0],
                activeTemplate: saved.activeTemplate,
                pageFormat: saved.pageFormat,
                darkMode: saved.darkMode,
                hydrated: true,
            });
        },

        createProfile: (name) => {
            const profile = makeProfile(name, getEmptyCVData());
            commit((state) => ({
                profiles: { ...state.profiles, [profile.id]: profile },
                activeProfileId: profile.id,
            }));
        },

        deleteProfile: (id) => {
            commit((state) => {
                const remaining = { ...state.profiles };
                delete remaining[id];
                const ids = Object.keys(remaining);
                return {
                    profiles: remaining,
                    activeProfileId: state.activeProfileId === id ? (ids[0] ?? null) : state.activeProfileId,
                };
            });
        },

        duplicateProfile: (id) => {
            const source = get().profiles[id];
            if (!source) return;
            const copy: CVProfile = {
                ...structuredClone(source),
                id: generateId(),
                name: `${source.name} (copy)`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            commit((state) => ({
                profiles: { ...state.profiles, [copy.id]: copy },
                activeProfileId: copy.id,
            }));
        },

        setActiveProfile: (id) => commit(() => ({ activeProfileId: id }), { undoable: false }),

        updateProfileName: (id, name) => {
            commit((state) => {
                const profile = state.profiles[id];
                if (!profile) return {};
                return { profiles: { ...state.profiles, [id]: touch({ ...profile, name }) } };
            });
        },

        updateProfileData: (id, data) => {
            commit((state) => {
                const profile = state.profiles[id];
                if (!profile) return {};
                return {
                    profiles: {
                        ...state.profiles,
                        [id]: touch({ ...profile, data: { ...profile.data, ...data } }),
                    },
                };
            });
        },

        setActiveTemplate: (activeTemplate) => commit(() => ({ activeTemplate }), { undoable: false }),
        setPageFormat: (pageFormat) => commit(() => ({ pageFormat }), { undoable: false }),
        toggleDarkMode: () => commit((state) => ({ darkMode: !state.darkMode }), { undoable: false }),

        undo: () => {
            const { past } = get();
            const previous = past[past.length - 1];
            if (!previous) return;
            set({ profiles: previous.profiles, activeProfileId: previous.activeProfileId, past: past.slice(0, -1) });
            persist(get());
        },

        canUndo: () => get().past.length > 0,
        dismissError: () => set({ lastError: null }),

        exportJSON: () => {
            const state = get();
            const payload: PersistedState = {
                version: SCHEMA_VERSION,
                profiles: state.profiles,
                activeProfileId: state.activeProfileId,
                activeTemplate: state.activeTemplate,
                pageFormat: state.pageFormat,
                darkMode: state.darkMode,
            };
            return JSON.stringify(payload, null, 2);
        },

        importJSON: (json) => {
            let parsed: unknown;
            try {
                parsed = JSON.parse(json);
            } catch {
                return { ok: false, error: "That file is not valid JSON." };
            }
            const box = parsed as Partial<PersistedState>;
            if (!box?.profiles || typeof box.profiles !== "object" || !Object.keys(box.profiles).length) {
                return { ok: false, error: "No CV profiles found in that file." };
            }
            // Imported profiles are added alongside the existing ones, never
            // over them: an import must not be able to destroy stored work.
            const incoming: Record<string, CVProfile> = {};
            for (const profile of Object.values(box.profiles)) {
                const id = generateId();
                incoming[id] = { ...profile, id };
            }
            const firstId = Object.keys(incoming)[0];
            commit((state) => ({
                profiles: { ...state.profiles, ...incoming },
                activeProfileId: firstId,
            }));
            return { ok: true };
        },

        getActiveProfile: () => {
            const { activeProfileId, profiles } = get();
            return activeProfileId ? (profiles[activeProfileId] ?? null) : null;
        },
    };
});
