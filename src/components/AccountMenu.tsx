"use client";

import { createContext, useContext, useState } from "react";
import { LogOut, User } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { storage } from "@/lib/storage";

export interface Account {
    name: string;
    email: string;
}

const AccountContext = createContext<Account | null>(null);

export function AccountProvider({ account, children }: { account: Account; children: React.ReactNode }) {
    return <AccountContext.Provider value={account}>{children}</AccountContext.Provider>;
}

export const useAccount = () => useContext(AccountContext);

/**
 * Who is signed in, and the way out. It sits at the end of the rail's action
 * cluster because signing out is the one action that is not about the CV.
 */
export function AccountMenu() {
    const account = useAccount();
    const [busy, setBusy] = useState(false);

    if (!account) return null;

    const leave = async () => {
        setBusy(true);
        // Anything a debounce is still holding belongs to this account, so it
        // has to reach Postgres before the session that can write it is gone.
        try {
            await storage.flush?.();
        } catch {
            /* a failed write must not trap the user in the session */
        }
        await signOut();
        window.location.href = "/sign-in";
    };

    return (
        <span className="flex shrink-0 items-center gap-1.5">
            <span className="hidden items-center gap-1.5 xl:flex" title={account.email}>
                <User size={13} strokeWidth={1.9} className="text-ink-3" />
                <span className="max-w-[9rem] truncate font-mono text-[11px] uppercase tracking-[0.1em] text-ink-2">
                    {account.name || account.email}
                </span>
            </span>
            <button type="button" className="btn btn-icon" onClick={() => void leave()} disabled={busy} title={`Sign out (${account.email})`}>
                <LogOut size={14} strokeWidth={1.9} />
            </button>
        </span>
    );
}
