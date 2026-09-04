import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { useId } from "react";

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
    label: string;
    hint?: string;
}

export function Field({ label, hint, ...props }: FieldProps) {
    const id = useId();
    return (
        <div>
            <label className="field-label" htmlFor={id}>
                {label}
            </label>
            <input id={id} className="field" {...props} />
            {hint && <p className="rubric mt-1 normal-case tracking-normal">{hint}</p>}
        </div>
    );
}

interface AreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
    label: string;
    hint?: string;
}

export function Area({ label, hint, ...props }: AreaProps) {
    const id = useId();
    return (
        <div>
            <label className="field-label" htmlFor={id}>
                {label}
            </label>
            <textarea id={id} className="field" {...props} />
            {hint && <p className="mt-1 font-mono text-[10px] leading-relaxed text-ink-3">{hint}</p>}
        </div>
    );
}

/** A rubric set flush with the field column, its rule running out to the edge. */
export function Rubric({ children, right }: { children: ReactNode; right?: ReactNode }) {
    return (
        <div className="flex items-center gap-3">
            <span className="rubric shrink-0">{children}</span>
            <span className="h-px flex-1 bg-rule" />
            {right}
        </div>
    );
}

/** One repeatable record inside a division. */
export function Card({ index, label, onRemove, children }: { index: number; label: string; onRemove: () => void; children: ReactNode }) {
    return (
        <div className="relative border border-rule bg-board p-4 pt-8">
            <span className="absolute left-3 top-2.5 font-mono text-[10px] tracking-[0.14em] text-ink-3">
                {String(index + 1).padStart(2, "0")}
            </span>
            <button
                type="button"
                onClick={onRemove}
                className="btn btn-icon absolute right-2 top-2"
                aria-label={`Delete ${label} ${index + 1}`}
                title={`Delete ${label} ${index + 1}`}
            >
                <TrashGlyph />
            </button>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

export function TrashGlyph() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
            <path d="M4 6h16M9 6V4h6v2M7 6l1 14h8l1-14" />
        </svg>
    );
}
