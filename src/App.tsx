"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useCVStore } from "./stores/useCVStore";
import { SECTIONS } from "./lib/sections";
import { TEMPLATES } from "./templates/registry";
import { ExportError, downloadJSON, exportPDF, exportPNG, printSheet, suggestFilename } from "./lib/export";
import { FileText, Pencil } from "lucide-react";
import { HeaderRail } from "./components/HeaderRail";
import { Spine } from "./components/Spine";
import { TabHead, TabRail } from "./components/TabRail";
import { EditorLeaf } from "./components/EditorLeaf";
import { PreviewBoard } from "./components/PreviewBoard";
import type { SectionId } from "./types/cv.types";

export default function App() {
    const { darkMode, hydrated, hydrate, activeTemplate, pageFormat, lastError, dismissError, undo, importJSON, exportJSON } =
        useCVStore();
    const profile = useCVStore((state) => (state.activeProfileId ? state.profiles[state.activeProfileId] : null));

    const [section, setSection] = useState<SectionId>("personal");
    const [pageCount, setPageCount] = useState(1);
    /**
     * Which face of the small board is up. The wide spread shows the sheet and
     * the leaf side by side and ignores this entirely; a phone has room for one
     * at a time, so the foot switch turns the board over.
     */
    const [face, setFace] = useState<"edit" | "sheet">("edit");
    const [exporting, setExporting] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        void hydrate();
    }, [hydrate]);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode);
    }, [darkMode]);

    // The active division's hue drives the caret, the focus underline and the
    // leaf's head rule, so the whole spread belongs to one board.
    const hue = useMemo(() => SECTIONS.find((entry) => entry.id === section)!.hue, [section]);

    // Opening a division is a request to edit it, so on the small board it also
    // turns the leaf face up — otherwise a digit key would silently change what
    // is under a sheet the reader is looking at.
    const openSection = useCallback((id: SectionId) => {
        setSection(id);
        setFace("edit");
    }, []);

    const run = useCallback(async (kind: string, task: () => Promise<void>) => {
        setExporting(kind);
        setNotice(null);
        try {
            await task();
        } catch (error) {
            setNotice(error instanceof ExportError ? error.message : "That export failed. Try again, or use Print instead.");
            console.error(error);
        } finally {
            setExporting(null);
        }
    }, []);

    const handleExportPDF = useCallback(() => {
        if (!profile) return;
        const filename = suggestFilename(profile.name, TEMPLATES[activeTemplate].name, "pdf");
        void run("pdf", () => exportPDF(pageFormat, filename));
    }, [profile, activeTemplate, pageFormat, run]);

    const handleExportPNG = useCallback(() => {
        if (!profile) return;
        const filename = suggestFilename(profile.name, TEMPLATES[activeTemplate].name, "png");
        void run("png", () => exportPNG(filename));
    }, [profile, activeTemplate, run]);

    const handlePrint = useCallback(() => {
        void run("print", () => printSheet(pageFormat));
    }, [pageFormat, run]);

    const handleExportJSON = useCallback(() => {
        downloadJSON(exportJSON(), "cv-profiles.json");
    }, [exportJSON]);

    const handleImportJSON = useCallback(
        (file: File) => {
            void file.text().then((text) => {
                const result = importJSON(text);
                setNotice(result.ok ? null : result.error);
            });
        },
        [importJSON],
    );

    // Keyboard addressing: every division is one keystroke away.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const typing = target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
            const meta = event.metaKey || event.ctrlKey;

            if (meta && event.key.toLowerCase() === "z" && !event.shiftKey) {
                event.preventDefault();
                undo();
                return;
            }
            if (meta && event.key.toLowerCase() === "e") {
                event.preventDefault();
                handleExportPDF();
                return;
            }
            if (meta && event.key.toLowerCase() === "p") {
                event.preventDefault();
                handlePrint();
                return;
            }
            if (meta && event.key.toLowerCase() === "s") {
                // Every edit is already written through; nothing to save.
                event.preventDefault();
                return;
            }
            if (!typing && !meta && !event.altKey) {
                const match = SECTIONS.find((entry) => entry.key === event.key);
                if (match) {
                    event.preventDefault();
                    openSection(match.id);
                }
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [undo, handleExportPDF, handlePrint, openSection]);

    if (!hydrated) {
        return (
            <div className="board app-shell flex items-center justify-center">
                <span className="rubric">Opening the manual…</span>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="board app-shell flex flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="head text-2xl">No CV on the board</p>
                <button type="button" className="btn btn-commit" onClick={() => useCVStore.getState().createProfile("Untitled CV")}>
                    Start one
                </button>
            </div>
        );
    }

    const message = lastError ?? notice;

    return (
        <div className="board app-shell flex flex-col" style={{ ["--division" as string]: hue }}>
            <HeaderRail
                profile={profile}
                pageCount={pageCount}
                exporting={exporting}
                onExportPDF={handleExportPDF}
                onExportPNG={handleExportPNG}
                onPrint={handlePrint}
                onExportJSON={handleExportJSON}
                onImportJSON={handleImportJSON}
            />

            {message && (
                <div
                    role="alert"
                    className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b px-4 py-2 lg:px-5"
                    style={{ borderColor: "var(--errata)", background: "color-mix(in srgb, var(--errata) 10%, transparent)" }}
                >
                    <span className="errata">{message}</span>
                    <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => {
                            dismissError();
                            setNotice(null);
                        }}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Small board only: the divider tabs step across the head of the
                leaf. They are only drawn over the leaf they open — with the sheet
                faced up there is nothing for them to be the head of. */}
            {face === "edit" && <TabHead data={profile.data} active={section} onSelect={openSection} />}

            {/* The spread. On a wide board this is one row of four: bound edge,
                sheet, leaf, fore-edge rail. On a small one the sheet and the leaf
                are stacked in the same box, both fully laid out, and the foot
                switch decides which is faced up — so the sheet goes on
                repaginating, and EXPORT goes on working, while you are editing. */}
            <div className="relative flex min-h-0 flex-1">
                <Spine profileName={profile.name} updatedAt={profile.updatedAt} />

                <div
                    className={`absolute inset-0 flex lg:static lg:inset-auto lg:min-w-0 lg:flex-1 ${face === "sheet" ? "" : "face-down"}`}
                >
                    <PreviewBoard profile={profile} template={activeTemplate} format={pageFormat} onPageCount={setPageCount} />
                </div>

                <aside
                    className={`leaf absolute inset-0 z-10 flex w-full flex-col lg:static lg:inset-auto lg:w-[22rem] lg:shrink-0 lg:border-l lg:border-rule xl:w-[27rem] ${
                        face === "edit" ? "" : "face-down"
                    }`}
                >
                    <EditorLeaf section={section} data={profile.data} profileId={profile.id} />
                </aside>

                <TabRail data={profile.data} active={section} onSelect={setSection} />
            </div>

            {/* The foot switch. Turns the small board over; the wide spread needs
                no switch, because both faces are already up. */}
            <nav aria-label="Board face" className="foot-switch shrink-0 lg:hidden">
                <button type="button" aria-pressed={face === "edit"} onClick={() => setFace("edit")}>
                    <Pencil size={13} strokeWidth={1.9} />
                    Edit
                </button>
                <button type="button" aria-pressed={face === "sheet"} onClick={() => setFace("sheet")}>
                    <FileText size={13} strokeWidth={1.9} />
                    Sheet
                    <span className="rubric" style={{ color: "inherit", opacity: 0.7 }}>
                        {pageCount}P
                    </span>
                </button>
            </nav>
        </div>
    );
}
