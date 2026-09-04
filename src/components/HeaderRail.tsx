import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
    Check,
    ChevronDown,
    Copy,
    Download,
    FileJson,
    Image as ImageIcon,
    MoreHorizontal,
    Moon,
    Pencil,
    Printer,
    Sun,
    Trash2,
    Undo2,
    Upload,
} from "lucide-react";
import { useCVStore } from "../stores/useCVStore";
import { AccountMenu } from "./AccountMenu";
import { TEMPLATES, TEMPLATE_ORDER } from "../templates/registry";
import type { CVProfile, PageFormat, TemplateType } from "../types/cv.types";

interface HeaderRailProps {
    profile: CVProfile;
    pageCount: number;
    exporting: string | null;
    onExportPDF: () => void;
    onExportPNG: () => void;
    onPrint: () => void;
    onExportJSON: () => void;
    onImportJSON: (file: File) => void;
}

/**
 * The header rail.
 *
 * One rail on a wide board: wordmark, the three machine-voice readouts, and the
 * action cluster ending in the one chrome-yellow commit.
 *
 * A phone cannot hold that in a line, so the rail breaks into two: the wordmark
 * and the commit on top — the two things that must always be reachable — and the
 * readouts below. The secondary actions fold into one overflow menu rather than
 * being dropped, because a rail that hides what it cannot fit is exactly how the
 * small board became unusable in the first place.
 */
export function HeaderRail({
    profile,
    pageCount,
    exporting,
    onExportPDF,
    onExportPNG,
    onPrint,
    onExportJSON,
    onImportJSON,
}: HeaderRailProps) {
    const { profiles, activeTemplate, pageFormat, darkMode, setActiveTemplate, setPageFormat, toggleDarkMode, undo, past } =
        useCVStore();
    const importRef = useRef<HTMLInputElement>(null);

    return (
        /* One rail, reflowed rather than rebuilt: the wordmark, the readouts and
           the action cluster are the same three groups at every width, and only
           their order and their wrapping change. Every control is in the document
           exactly once, so nothing is duplicated into the accessibility tree and
           there is only ever one EXPORT button to address. */
        <header className="relative z-30 flex shrink-0 flex-wrap items-center gap-x-4 border-b border-rule px-4 py-2 lg:flex-nowrap lg:gap-5 lg:px-5 lg:py-3">
            {/* The wordmark is a plate the full depth of the rail: it breaks out
                of the header's padding on both axes, and its right rule runs the
                whole height rather than a short divider. */}
            <div className="order-1 flex shrink-0 items-center gap-3 self-stretch lg:order-none lg:-my-3 lg:-ml-5 lg:border-r lg:border-rule lg:px-5">
                <span className="head text-[19px] tracking-[0.16em]">NEXTORA</span>
                <span className="rubric hidden leading-tight xl:block">
                    CURRICULUM
                    <br />
                    VITAE
                </span>
            </div>

            {/* The readouts. On the small board they take a rule and a line of
                their own under the wordmark rather than running off the edge; on a
                wide one they dissolve into the rail itself. */}
            <div className="order-3 -mx-4 mt-2 flex w-[calc(100%+2rem)] flex-wrap items-center gap-x-4 gap-y-2 border-t border-rule px-4 pt-2 lg:order-none lg:contents">
                <ProfileMenu profile={profile} profiles={profiles} />

                <Menu
                    label="Format"
                    value={TEMPLATES[activeTemplate].name}
                    width={340}
                    render={(close) => (
                        <ul className="max-h-[60vh] overflow-y-auto">
                            {TEMPLATE_ORDER.map((id) => {
                                const entry = TEMPLATES[id];
                                const selected = id === activeTemplate;
                                return (
                                    <li key={id}>
                                        <button
                                            type="button"
                                            className="flex w-full items-start gap-3 border-b border-rule px-3 py-2.5 text-left transition-colors duration-hinge ease-step hover:bg-board-sunk"
                                            onClick={() => {
                                                setActiveTemplate(id as TemplateType);
                                                close();
                                            }}
                                        >
                                            <Check size={13} className={selected ? "mt-1 opacity-100" : "mt-1 opacity-0"} />
                                            <span className="min-w-0">
                                                <span className="flex flex-wrap items-baseline gap-2">
                                                    <span className="head text-[13px]">{entry.name}</span>
                                                    <span className="rubric">{entry.atsSafe ? "ATS-SAFE" : "DESIGNED"}</span>
                                                </span>
                                                <span className="mt-0.5 block text-[12px] leading-snug text-ink-2">{entry.note}</span>
                                                <span className="rubric mt-1 block">
                                                    {entry.author} · {entry.typeface} · set for{" "}
                                                    {entry.nativeFormat === "a4" ? "A4" : "Letter"}
                                                </span>
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                />

                <Menu
                    label="Paper"
                    value={pageFormat === "a4" ? "A4" : "Letter"}
                    width={150}
                    render={(close) => (
                        <ul>
                            {(["a4", "letter"] as PageFormat[]).map((option) => (
                                <li key={option}>
                                    <button
                                        type="button"
                                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left font-mono text-[11px] uppercase tracking-[0.1em] transition-colors duration-hinge ease-step hover:bg-board-sunk"
                                        onClick={() => {
                                            setPageFormat(option);
                                            close();
                                        }}
                                    >
                                        <Check size={12} className={option === pageFormat ? "opacity-100" : "opacity-0"} />
                                        {option === "a4" ? "A4" : "US Letter"}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                />

                {/* The small board reads its page count off the foot switch, so
                    here the readout would only cost the rail another line. */}
                <span className="hidden lg:contents">
                    <Readout label="Pages" value={String(pageCount)} />
                </span>
            </div>

            {/* The action cluster, ending in the one chrome-yellow commit. On the
                small board the four secondary actions fold into a single overflow
                menu — a rail that silently drops what it cannot fit is exactly how
                this app became unusable on a phone. */}
            <div className="order-2 ml-auto flex shrink-0 items-center gap-1.5 lg:order-none">
                <button type="button" className="btn btn-icon" onClick={undo} disabled={past.length === 0} title="Undo (Ctrl+Z)">
                    <Undo2 size={14} strokeWidth={1.9} />
                </button>

                <button
                    type="button"
                    className="btn btn-icon hidden lg:inline-flex"
                    onClick={onExportJSON}
                    title="Download all profiles as JSON"
                >
                    <FileJson size={14} strokeWidth={1.9} />
                </button>
                <button
                    type="button"
                    className="btn btn-icon hidden lg:inline-flex"
                    onClick={() => importRef.current?.click()}
                    title="Import profiles from JSON"
                >
                    <Upload size={14} strokeWidth={1.9} />
                </button>

                <button type="button" className="btn btn-icon" onClick={toggleDarkMode} title={darkMode ? "Light board" : "Dark board"}>
                    {darkMode ? <Sun size={14} strokeWidth={1.9} /> : <Moon size={14} strokeWidth={1.9} />}
                </button>

                {/* Small boards only: on a wide rail these four are already inline. */}
                <OverflowMenu
                    exporting={exporting}
                    onPrint={onPrint}
                    onExportPNG={onExportPNG}
                    onExportJSON={onExportJSON}
                    onImport={() => importRef.current?.click()}
                />

                <span className="mx-1 hidden h-7 w-px bg-rule lg:block" />

                {/* Who this board belongs to, and the way out. */}
                <AccountMenu />

                <span className="mx-1 hidden h-7 w-px bg-rule lg:block" />

                <button
                    type="button"
                    className="btn hidden lg:inline-flex"
                    onClick={onPrint}
                    disabled={Boolean(exporting)}
                    title="Print, or save as a PDF with selectable text"
                >
                    <Printer size={13} strokeWidth={1.9} />
                    {/* At the width the spread first opens, the rail is already
                        full: the two secondary exports keep their glyph and drop
                        their word until there is room for it. */}
                    <span className="hidden xl:inline">Print</span>
                </button>
                <button
                    type="button"
                    className="btn hidden lg:inline-flex"
                    onClick={onExportPNG}
                    disabled={Boolean(exporting)}
                    title="Export a PNG image"
                >
                    <ImageIcon size={13} strokeWidth={1.9} />
                    <span className="hidden xl:inline">{exporting === "png" ? "Rendering…" : "PNG"}</span>
                </button>

                <button
                    type="button"
                    className="btn btn-commit"
                    onClick={onExportPDF}
                    disabled={Boolean(exporting)}
                    data-action="export-pdf"
                    title="Export a PDF (Ctrl+E)"
                >
                    <Download size={13} strokeWidth={2.2} />
                    <span className="hidden lg:inline">{exporting === "pdf" ? "Rendering…" : "Export PDF"}</span>
                    <span className="lg:hidden">{exporting === "pdf" ? "…" : "PDF"}</span>
                </button>
            </div>

            <input
                ref={importRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onImportJSON(file);
                    event.target.value = "";
                }}
            />
        </header>
    );
}

function Readout({ label, value }: { label: string; value: string }) {
    return (
        <div className="shrink-0 leading-tight">
            <div className="rubric">{label}</div>
            <div className="font-mono text-[13px] tabular-nums">{value}</div>
        </div>
    );
}

/**
 * Shared open/close plumbing for every drop-down on the rail.
 *
 * The panel is anchored to the left edge of its trigger, which on a wide board
 * always leaves it room. On a narrow one a 340px panel opened from a trigger
 * halfway across the rail would hang off the edge with no way to scroll to it,
 * so once open the panel measures itself and slides back inside the board.
 */
function useDropdown() {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [shift, setShift] = useState(0);

    useEffect(() => {
        if (!open) return;
        const onPointer = (event: MouseEvent) => {
            if (!ref.current?.contains(event.target as Node)) setOpen(false);
        };
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onPointer);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onPointer);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    useLayoutEffect(() => {
        if (!open) {
            setShift(0);
            return;
        }
        const panel = panelRef.current;
        if (!panel) return;
        // Measure unshifted, then correct — otherwise the previous correction
        // is baked into the reading and the panel walks across the board.
        const rect = panel.getBoundingClientRect();
        const margin = 8;
        const left = rect.left - shift;
        const right = rect.right - shift;
        let next = 0;
        if (right > window.innerWidth - margin) next = window.innerWidth - margin - right;
        if (left + next < margin) next = margin - left;
        if (next !== shift) setShift(next);
    }, [open, shift]);

    return { open, setOpen, ref, panelRef, shift };
}

function Menu({
    label,
    value,
    width,
    render,
}: {
    label: string;
    value: string;
    width: number;
    render: (close: () => void) => React.ReactNode;
}) {
    const { open, setOpen, ref, panelRef, shift } = useDropdown();

    return (
        <div ref={ref} className="relative shrink-0">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                className="flex items-center gap-2 border border-transparent px-2 py-1 text-left leading-tight transition-colors duration-hinge ease-step hover:border-rule-strong"
            >
                <span>
                    <span className="rubric block">{label}</span>
                    <span className="block max-w-[6.5rem] truncate font-mono text-[13px] 2xl:max-w-[12rem]">{value}</span>
                </span>
                <ChevronDown size={13} className="mt-2 shrink-0 text-ink-3" />
            </button>

            {open && (
                <div
                    ref={panelRef}
                    className="leaf absolute left-0 top-[calc(100%+6px)] z-40 border border-rule-strong"
                    style={{ width: `min(${width}px, calc(100vw - 16px))`, marginLeft: shift }}
                >
                    {render(() => setOpen(false))}
                </div>
            )}
        </div>
    );
}

/** The actions that do not fit the small board's rail, folded into one tap. */
function OverflowMenu({
    exporting,
    onPrint,
    onExportPNG,
    onExportJSON,
    onImport,
}: {
    exporting: string | null;
    onPrint: () => void;
    onExportPNG: () => void;
    onExportJSON: () => void;
    onImport: () => void;
}) {
    const { open, setOpen, ref, panelRef, shift } = useDropdown();

    const items: Array<{ icon: React.ReactNode; label: string; run: () => void; disabled?: boolean }> = [
        { icon: <Printer size={13} strokeWidth={1.9} />, label: "Print", run: onPrint, disabled: Boolean(exporting) },
        {
            icon: <ImageIcon size={13} strokeWidth={1.9} />,
            label: exporting === "png" ? "Rendering…" : "Export PNG",
            run: onExportPNG,
            disabled: Boolean(exporting),
        },
        { icon: <FileJson size={13} strokeWidth={1.9} />, label: "Download JSON", run: onExportJSON },
        { icon: <Upload size={13} strokeWidth={1.9} />, label: "Import JSON", run: onImport },
    ];

    return (
        <div ref={ref} className="relative lg:hidden">
            <button
                type="button"
                className="btn btn-icon"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-label="More actions"
                title="More actions"
            >
                <MoreHorizontal size={14} strokeWidth={1.9} />
            </button>

            {open && (
                <div
                    ref={panelRef}
                    className="leaf absolute left-0 top-[calc(100%+6px)] z-40 border border-rule-strong"
                    style={{ width: `min(220px, calc(100vw - 16px))`, marginLeft: shift }}
                >
                    <ul>
                        {items.map((item) => (
                            <li key={item.label}>
                                <button
                                    type="button"
                                    disabled={item.disabled}
                                    className="flex w-full items-center gap-2.5 border-b border-rule px-3 py-3 text-left font-mono text-[11px] uppercase tracking-[0.1em] transition-colors duration-hinge ease-step last:border-b-0 hover:bg-board-sunk disabled:opacity-40"
                                    onClick={() => {
                                        item.run();
                                        setOpen(false);
                                    }}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function ProfileMenu({ profile, profiles }: { profile: CVProfile; profiles: Record<string, CVProfile> }) {
    const { setActiveProfile, createProfile, duplicateProfile, deleteProfile, updateProfileName } = useCVStore();
    const [renaming, setRenaming] = useState(false);
    const [draft, setDraft] = useState(profile.name);
    const list = Object.values(profiles);

    if (renaming) {
        return (
            <form
                className="flex min-w-0 shrink items-center gap-1"
                onSubmit={(event) => {
                    event.preventDefault();
                    if (draft.trim()) updateProfileName(profile.id, draft.trim());
                    setRenaming(false);
                }}
            >
                <input
                    className="field h-[30px] w-full min-w-0 lg:w-52"
                    value={draft}
                    autoFocus
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Escape") setRenaming(false);
                    }}
                    aria-label="Profile name"
                />
                <button type="submit" className="btn btn-icon" title="Save name">
                    <Check size={14} />
                </button>
            </form>
        );
    }

    return (
        <Menu
            label="Profile"
            value={profile.name}
            width={280}
            render={(close) => (
                <>
                    <ul className="max-h-64 overflow-y-auto border-b border-rule">
                        {list.map((entry) => (
                            <li key={entry.id}>
                                <button
                                    type="button"
                                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors duration-hinge ease-step hover:bg-board-sunk"
                                    onClick={() => {
                                        setActiveProfile(entry.id);
                                        close();
                                    }}
                                >
                                    <Check size={12} className={entry.id === profile.id ? "opacity-100" : "opacity-0"} />
                                    <span className="truncate text-[13px]">{entry.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="flex flex-wrap gap-1 p-2">
                        <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => {
                                createProfile("Untitled CV");
                                close();
                            }}
                        >
                            New
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => {
                                duplicateProfile(profile.id);
                                close();
                            }}
                        >
                            <Copy size={11} /> Duplicate
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => {
                                setDraft(profile.name);
                                setRenaming(true);
                                close();
                            }}
                        >
                            <Pencil size={11} /> Rename
                        </button>
                        {list.length > 1 && (
                            <button
                                type="button"
                                className="btn btn-sm"
                                onClick={() => {
                                    if (window.confirm(`Delete "${profile.name}"? This cannot be undone from here.`)) {
                                        deleteProfile(profile.id);
                                        close();
                                    }
                                }}
                            >
                                <Trash2 size={11} /> Delete
                            </button>
                        )}
                    </div>
                </>
            )}
        />
    );
}
