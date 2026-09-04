"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";

type Mode = "sign-in" | "sign-up";

const MIN_PASSWORD = 10;

/**
 * The gate.
 *
 * One card on the board, in the same voice as the rail: rubric labels, a mono
 * readout, one chrome-yellow commit. Sign in and sign up are one form with one
 * extra field, because they are the same act — this is a workbench with an
 * owner, not a product with a funnel.
 */
export function AuthForm() {
    const [mode, setMode] = useState<Mode>("sign-in");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (mode === "sign-up" && password.length < MIN_PASSWORD) {
            setError(`A password needs at least ${MIN_PASSWORD} characters.`);
            return;
        }

        setBusy(true);
        const result =
            mode === "sign-in"
                ? await signIn.email({ email, password })
                : await signUp.email({ email, password, name: name.trim() || email.split("@")[0] });

        if (result.error) {
            setError(result.error.message ?? "That did not work. Check the address and password.");
            setBusy(false);
            return;
        }

        // A full load, not a router push: the board is server-rendered from the
        // session, and it has to be built with the new one.
        window.location.href = "/";
    };

    return (
        <main className="board app-shell flex items-center justify-center px-4 py-10">
            <div className="leaf w-full max-w-[24rem] border border-rule-strong">
                <header className="border-b border-rule px-5 py-4">
                    <div className="head text-[19px] tracking-[0.16em]">NEXTORA</div>
                    <div className="rubric mt-1">CURRICULUM VITAE · {mode === "sign-in" ? "SIGN IN" : "NEW ACCOUNT"}</div>
                </header>

                <form className="flex flex-col gap-3 px-5 py-4" onSubmit={submit}>
                    {mode === "sign-up" && (
                        <label className="block">
                            <span className="rubric block">Name</span>
                            <input
                                className="field mt-1 w-full"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                autoComplete="name"
                                placeholder="Optional"
                            />
                        </label>
                    )}

                    <label className="block">
                        <span className="rubric block">Email</span>
                        <input
                            className="field mt-1 w-full"
                            type="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="email"
                            autoFocus
                        />
                    </label>

                    <label className="block">
                        <span className="rubric block">Password</span>
                        <input
                            className="field mt-1 w-full"
                            type="password"
                            required
                            minLength={mode === "sign-up" ? MIN_PASSWORD : undefined}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                        />
                        {mode === "sign-up" && <span className="rubric mt-1 block">AT LEAST {MIN_PASSWORD} CHARACTERS</span>}
                    </label>

                    {error && (
                        <p role="alert" className="errata">
                            {error}
                        </p>
                    )}

                    <button type="submit" className="btn btn-commit mt-1 w-full justify-center" disabled={busy}>
                        {busy ? "Working…" : mode === "sign-in" ? "Sign in" : "Create account"}
                    </button>
                </form>

                <footer className="border-t border-rule px-5 py-3">
                    <button
                        type="button"
                        className="rubric underline-offset-2 hover:underline"
                        onClick={() => {
                            setMode(mode === "sign-in" ? "sign-up" : "sign-in");
                            setError(null);
                        }}
                    >
                        {mode === "sign-in" ? "NO ACCOUNT YET — CREATE ONE" : "ALREADY HAVE AN ACCOUNT — SIGN IN"}
                    </button>
                </footer>
            </div>
        </main>
    );
}
