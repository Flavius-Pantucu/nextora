import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { CVProfile, PageFormat, TemplateType } from "../types/cv.types";
import { PAGE } from "../templates/paper";
import { TEMPLATES } from "../templates/registry";
import { Sheet } from "./Sheet";

interface PreviewBoardProps {
    profile: CVProfile;
    template: TemplateType;
    format: PageFormat;
    onPageCount: (count: number) => void;
}

/* The ladder reaches below half scale because a phone is narrower than half an
   A4 sheet: without a 0.35 rung the board would open at a zoom the sheet does
   not fit at, and the page would have to be panned to be read at all. */
const ZOOM_STEPS = [0.35, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.25, 1.5];

export function PreviewBoard({ profile, template, format, onPageCount }: PreviewBoardProps) {
    const entry = TEMPLATES[template];
    const page = PAGE[format];
    const frameRef = useRef<HTMLDivElement>(null);

    const [zoom, setZoom] = useState(0.8);
    const [fitted, setFitted] = useState(false);
    const [pageCount, setPageCount] = useState(1);

    // Open at whatever fits the board, once, then leave the choice to the user.
    // The gutter is what the board keeps clear around the sheet: the margin
    // annotations plus padding on a wide board, padding alone on a small one,
    // where the annotations are not drawn and every pixel counts.
    useLayoutEffect(() => {
        if (fitted || !frameRef.current) return;
        const width = frameRef.current.clientWidth;
        if (width === 0) return;
        const best = ZOOM_STEPS.reduce(
            (chosen, step) => (page.w * step <= width - (width < 1024 ? 34 : 84) ? step : chosen),
            ZOOM_STEPS[0],
        );
        setZoom(best);
        setFitted(true);
    }, [fitted, page.w]);

    useEffect(() => {
        onPageCount(pageCount);
    }, [pageCount, onPageCount]);

    const stepZoom = (direction: 1 | -1) => {
        const index = ZOOM_STEPS.indexOf(zoom);
        const next = ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, Math.max(0, (index === -1 ? ZOOM_STEPS.indexOf(0.8) : index) + direction))];
        setZoom(next);
    };

    const revision = `${profile.id}:${template}:${format}:${profile.updatedAt}`;

    return (
        <div className="relative flex min-w-0 flex-1 flex-col">
            <div ref={frameRef} className="board min-h-0 flex-1 overflow-auto">
                <div className="flex min-h-full justify-center px-4 py-5 lg:px-10 lg:py-8">
                    <div
                        style={{
                            width: page.w * zoom,
                            height: page.h * pageCount * zoom,
                            flex: "none",
                        }}
                    >
                        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: page.w }}>
                            <div className="relative" style={{ boxShadow: "0 2px 18px -6px rgba(22,23,26,0.45)" }}>
                                <Sheet
                                    format={format}
                                    pagePadding={entry.pagePadding}
                                    background={entry.sheetBackground}
                                    revision={revision}
                                    onPageCount={setPageCount}
                                >
                                    <entry.Component data={profile.data} format={format} />
                                </Sheet>

                                {/* Measured annotations: the page number and the
                                    trim line hang in the margin beside the sheet,
                                    the way a proof is marked up. A small board has
                                    no margin to hang them in — they would push the
                                    sheet itself off-centre — so there they are
                                    dropped and the PAGES readout carries the count. */}
                                {Array.from({ length: pageCount }, (_, index) => (
                                    <span
                                        key={index}
                                        aria-hidden
                                        className="absolute hidden font-mono text-ink-3 lg:block"
                                        style={{
                                            top: index * page.h + 8,
                                            left: "100%",
                                            marginLeft: 10,
                                            fontSize: 11 / zoom,
                                            writingMode: "vertical-rl",
                                            letterSpacing: "0.14em",
                                        }}
                                    >
                                        {`PAGE ${index + 1} / ${pageCount}`}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex shrink-0 items-center justify-between border-t border-rule px-4 py-2">
                <span className="rubric">{page.label}</span>

                <div className="flex items-center gap-1">
                    <button type="button" className="btn btn-icon" onClick={() => stepZoom(-1)} disabled={zoom === ZOOM_STEPS[0]} title="Zoom out">
                        <Minus size={13} strokeWidth={2} />
                    </button>
                    <button
                        type="button"
                        className="btn btn-quiet btn-sm w-14 justify-center"
                        onClick={() => setZoom(1)}
                        title="Reset to true scale"
                    >
                        {Math.round(zoom * 100)}%
                    </button>
                    <button
                        type="button"
                        className="btn btn-icon"
                        onClick={() => stepZoom(1)}
                        disabled={zoom === ZOOM_STEPS[ZOOM_STEPS.length - 1]}
                        title="Zoom in"
                    >
                        <Plus size={13} strokeWidth={2} />
                    </button>
                </div>
            </div>
        </div>
    );
}
