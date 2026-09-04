import { useEffect, useRef } from "react";
import type { CVData, SectionId } from "../types/cv.types";
import { SECTIONS, sectionCount, sectionExtent } from "../lib/sections";

interface TabRailProps {
    data: CVData;
    active: SectionId;
    onSelect: (id: SectionId) => void;
}

/** Enough for the rotated 9px label plus the digit above and the count below. */
const MIN_TAB = 64;
const LABEL_GUTTER = 19;

/**
 * The stepped tab rail down the fore edge.
 *
 * Every division gets one tab in its own hue, and tab height is proportional to
 * how much that division holds — so the rail is a picture of where the weight
 * of the CV sits. The proportion is done with flex-grow against a floor rather
 * than a computed pixel height, so the rail always fills exactly the space it
 * has: a long section name can never outweigh a full section, and the rail can
 * never overflow the window. The active tab extends out over the leaf and
 * becomes the board its content is lying on.
 *
 * There is no fore edge on a phone, so `TabHead` below steps the same divider
 * tabs across the head of the leaf instead. Both are the same law — a tab is as
 * large as its division is deep — read along the axis that has room for it.
 */
export function TabRail({ data, active, onSelect }: TabRailProps) {
    const extents = SECTIONS.map((section) => sectionExtent(data, section.id));
    const largest = Math.max(1, ...extents);

    return (
        <nav
            aria-label="CV sections"
            className="on-division relative z-20 hidden h-full shrink-0 flex-col gap-[3px] py-3 lg:flex"
            style={{ width: 46 }}
        >
            {SECTIONS.map((section, index) => {
                const isActive = section.id === active;
                const count = sectionCount(data, section.id);

                return (
                    <button
                        key={section.id}
                        type="button"
                        onClick={() => onSelect(section.id)}
                        aria-current={isActive ? "page" : undefined}
                        title={`${section.label} — press ${section.key}`}
                        /* The label hangs from the top of the tab, under the digit —
                           centring it left the name floating mid-rail on the tall tabs. */
                        className="relative flex items-start justify-center border-y border-r border-black/25 transition-[width,margin] duration-hinge ease-step"
                        style={{
                            background: section.hue,
                            color: "var(--tab-ink)",
                            flexBasis: 0,
                            flexGrow: 1 + (extents[index] / largest) * 4,
                            minHeight: MIN_TAB,
                            paddingTop: LABEL_GUTTER,
                            paddingBottom: LABEL_GUTTER,
                            width: isActive ? 46 : 38,
                            marginLeft: isActive ? 0 : 8,
                            marginRight: isActive ? -1 : 0,
                            boxShadow: isActive ? "none" : "inset -6px 0 10px -8px rgba(0,0,0,0.55)",
                        }}
                    >
                        <span aria-hidden className="absolute left-0 right-0 top-1.5 text-center font-mono text-[9px] leading-none">
                            {section.key}
                        </span>

                        <span
                            className="select-none whitespace-nowrap font-mono text-[9px] font-medium uppercase tracking-[0.08em]"
                            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                        >
                            {section.label}
                        </span>

                        <span aria-hidden className="absolute bottom-1.5 left-0 right-0 text-center font-mono text-[9px] leading-none">
                            {count > 0 ? count : "–"}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}

/**
 * The same divider tabs, stepped across the head of the leaf.
 *
 * Used on the small board, where there is no fore edge to run a rail down. Tab
 * *width* now carries what tab height carries on the rail, and because grow only
 * ever spends free space, eight tabs that no longer fit the head scroll rather
 * than being crushed to unreadable slivers. The digit is dropped: it addresses a
 * keyboard the small board does not have.
 */
export function TabHead({ data, active, onSelect }: TabRailProps) {
    const extents = SECTIONS.map((section) => sectionExtent(data, section.id));
    const largest = Math.max(1, ...extents);
    const stripRef = useRef<HTMLElement>(null);

    // A tab opened from anywhere else — a digit key on a tablet keyboard, or a
    // division that was open before the board narrowed — must not stay parked
    // off the end of the strip.
    useEffect(() => {
        const open = stripRef.current?.querySelector<HTMLElement>('[data-open="true"]');
        open?.scrollIntoView({ block: "nearest", inline: "center" });
    }, [active]);

    return (
        <nav ref={stripRef} aria-label="CV sections" className="tab-strip on-division relative z-20 shrink-0 lg:hidden">
            {SECTIONS.map((section, index) => {
                const isActive = section.id === active;
                const count = sectionCount(data, section.id);

                return (
                    <button
                        key={section.id}
                        type="button"
                        onClick={() => onSelect(section.id)}
                        aria-current={isActive ? "page" : undefined}
                        className="tab-head"
                        data-open={isActive}
                        style={{
                            background: section.hue,
                            flexGrow: 1 + (extents[index] / largest) * 4,
                        }}
                    >
                        <span className="select-none whitespace-nowrap font-mono text-[10px] font-medium uppercase tracking-[0.1em]">
                            {section.label}
                        </span>
                        <span aria-hidden className="font-mono text-[9px] leading-none opacity-80">
                            {count > 0 ? count : "–"}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}
