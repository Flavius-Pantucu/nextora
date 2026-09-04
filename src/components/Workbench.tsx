"use client";

import { useCallback, useEffect, useState } from "react";
import { DatabaseZap, X } from "lucide-react";
import App from "@/App";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AccountProvider, type Account } from "@/components/AccountMenu";
import { useCVStore } from "@/stores/useCVStore";
import { importLocalProfiles, readLocalProfiles, setStorageMode, storage } from "@/lib/storage";

interface WorkbenchProps {
    account: Account;
    localImported: boolean;
}

/**
 * The signed-in shell.
 *
 * Its whole job is to point the store at Postgres before the store opens
 * anything, and to make the one offer that only makes sense once: this browser
 * still holds CVs from before there was an account — pull them up?
 */
export function Workbench({ account, localImported }: WorkbenchProps) {
    // Set during render, not in an effect: a child's effects run before its
    // parent's, and App hydrates from an effect. By the time it does, the
    // adapter it reaches for has to already be the API one.
    useState(() => {
        setStorageMode("api");
        return null;
    });

    const [orphans, setOrphans] = useState<number>(0);
    const [importing, setImporting] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const hydrated = useCVStore((state) => state.hydrated);

    useEffect(() => {
        if (localImported) return;
        setOrphans(readLocalProfiles().length);
    }, [localImported]);

    // A debounced save must not be lost to a closing tab.
    useEffect(() => {
        // A write that cannot reach Postgres has already been cached in
        // localStorage; on the way out there is nothing further to do with it.
        const flush = () => void storage.flush?.().catch(() => {});
        window.addEventListener("pagehide", flush);
        return () => {
            window.removeEventListener("pagehide", flush);
            flush();
        };
    }, []);

    const pullUp = useCallback(async () => {
        setImporting(true);
        setImportError(null);
        try {
            await importLocalProfiles(readLocalProfiles(), true);
            // Re-open the board on what the server now holds, rather than
            // merging two half-states in the client.
            window.location.reload();
        } catch (error) {
            setImportError(error instanceof Error ? error.message : "Those CVs could not be pulled up.");
            setImporting(false);
        }
    }, []);

    const dismiss = useCallback(() => {
        setOrphans(0);
        // Recorded server-side so the offer does not come back on every load.
        void fetch("/api/settings", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ localImported: true }),
        });
    }, []);

    return (
        <AccountProvider account={account}>
            {orphans > 0 && hydrated && (
                <div
                    role="status"
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b px-4 py-2 lg:px-5"
                    style={{ borderColor: "var(--commit)", background: "color-mix(in srgb, var(--commit) 14%, transparent)" }}
                >
                    <span className="flex items-center gap-2 text-[13px]">
                        <DatabaseZap size={14} strokeWidth={1.9} />
                        {importError ?? (
                            <>
                                This browser still holds {orphans} CV{orphans === 1 ? "" : "s"} saved before you had an account.
                            </>
                        )}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <button type="button" className="btn btn-sm btn-commit" onClick={() => void pullUp()} disabled={importing}>
                            {importing ? "Pulling up…" : "Add them to my account"}
                        </button>
                        <button type="button" className="btn btn-sm" onClick={dismiss} aria-label="Dismiss">
                            <X size={12} />
                        </button>
                    </span>
                </div>
            )}

            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </AccountProvider>
    );
}
