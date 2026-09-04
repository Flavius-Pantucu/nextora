/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {
            colors: {
                board: "var(--board)",
                "board-sunk": "var(--board-sunk)",
                leaf: "var(--leaf)",
                "leaf-edge": "var(--leaf-edge)",
                ink: "var(--ink)",
                "ink-2": "var(--ink-2)",
                "ink-3": "var(--ink-3)",
                rule: "var(--rule)",
                "rule-strong": "var(--rule-strong)",
                commit: "var(--commit)",
                errata: "var(--errata)",
                division: "var(--division)",
            },
            fontFamily: {
                head: "var(--font-head)",
                body: "var(--font-body)",
                mono: "var(--font-mono)",
            },
            transitionTimingFunction: {
                step: "steps(2, end)",
            },
            transitionDuration: {
                hinge: "90ms",
            },
        },
    },
    plugins: [],
};
