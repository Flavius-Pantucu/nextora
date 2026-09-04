import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("CV generator crashed", error, info);
    }

    render() {
        const { error } = this.state;
        if (!error) return this.props.children;

        return (
            <div className="board flex h-screen items-center justify-center p-8">
                <div className="leaf max-w-lg border border-rule p-8">
                    <h1 className="head text-2xl">The page stopped rendering</h1>
                    <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
                        Your CV data is stored separately and has not been touched. Reloading usually clears this.
                    </p>
                    <p className="errata mt-4 break-words">{error.message}</p>
                    <button type="button" className="btn btn-commit mt-6" onClick={() => window.location.reload()}>
                        Reload
                    </button>
                </div>
            </div>
        );
    }
}
