import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { PAGE } from "../templates/paper";
import type { PageFormat } from "../types/cv.types";

interface SheetProps {
    format: PageFormat;
    /** Ink-free strip at the top and bottom of every page, in px. Comes from
     *  the template, because each replicated format sets its own margins. */
    pagePadding: { top: number; bottom: number };
    /** Painted behind every page — a sidebar band that must run the full
     *  height of the document rather than stopping with the content. */
    background?: string;
    /** Bumped whenever content changes, so pagination re-runs. */
    revision: string;
    onPageCount?: (count: number) => void;
    children: ReactNode;
}

/**
 * The paper.
 *
 * Pagination happens here and only here, on the real rendered DOM, so the page
 * breaks drawn in the preview are the same pixel offsets the exporter slices
 * at. Any block tagged `data-block` that would straddle a page boundary is
 * pushed onto the next page — the same thing LaTeX does with `\needspace`, and
 * the reason a heading never ends up orphaned at the foot of a page.
 *
 * The push is written to the block's own `margin-top`, which the template may
 * also be setting inline. So the template's value is remembered per element
 * and re-read whenever React rewrites it; otherwise each pass would eat the
 * template's spacing and the layout would drift a little every time.
 */
/**
 * How many pages the document actually needs.
 *
 * Measured from where the ink stops, not from the container's height: a
 * container can be taller than its content (a stretched grid row, a trailing
 * margin), and trusting that adds a blank page to the PDF.
 */
function countPages(root: HTMLElement): number {
    // The preview draws the sheet inside a zoom transform, and
    // getBoundingClientRect reports transformed pixels. Every measurement here
    // is divided back into layout pixels, or the page maths would change with
    // the zoom level.
    const scale = root.getBoundingClientRect().width / root.offsetWidth || 1;
    const rootTop = root.getBoundingClientRect().top;
    let bottom = 0;

    // Only things that actually mark the page count: an element carrying its
    // own text, or a leaf box such as an image or a rule. Containers are
    // skipped, because a container can be taller than everything inside it.
    const marksInk = (element: Element): boolean => {
        if (element.tagName === "IMG") return true;
        const ownText = Array.from(element.childNodes).some(
            (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
        );
        return ownText || element.children.length === 0;
    };

    const walk = (element: Element) => {
        for (const child of Array.from(element.children)) {
            const rect = child.getBoundingClientRect();
            if (rect.height > 0 && marksInk(child)) {
                bottom = Math.max(bottom, (rect.bottom - rootTop) / scale);
            }
            walk(child);
        }
    };
    walk(root);

    const pageHeight = Number(root.parentElement?.dataset.pageHeight) || 1;
    // A hair of tolerance, so content that exactly fills a page does not spill
    // onto a second one through sub-pixel rounding.
    return Math.max(1, Math.ceil((bottom - 2) / pageHeight));
}

export function Sheet({ format, pagePadding, background, revision, onPageCount, children }: SheetProps) {
    const page = PAGE[format];
    const contentRef = useRef<HTMLDivElement>(null);
    const running = useRef(false);
    const [pageCount, setPageCount] = useState(1);

    /**
     * One measure-and-push pass. Returns true if it moved anything, so the
     * caller can run it again until the layout stops changing: a push changes
     * the positions of everything after it, and web fonts land mid-flight, so
     * a single pass is not guaranteed to be self-consistent.
     */
    const pass = useCallback((): boolean => {
        const root = contentRef.current;
        if (!root) return false;

        const blocks = Array.from(root.querySelectorAll<HTMLElement>("[data-block]"));
        let moved = false;

        // Undo the previous pass, restoring whatever the template asked for.
        // The template may set margin-top inline itself, so its value is
        // remembered per element and re-read whenever React rewrites it.
        for (const block of blocks) {
            if (block.dataset.pbLast === undefined || block.style.marginTop !== block.dataset.pbLast) {
                block.dataset.pbBase = block.style.marginTop;
            }
            block.style.marginTop = block.dataset.pbBase ?? "";
        }

        const usableHeight = page.h - pagePadding.top - pagePadding.bottom;
        // Layout pixels, not transformed ones: the preview zooms the sheet.
        const scale = root.getBoundingClientRect().width / root.offsetWidth || 1;
        const rootTop = root.getBoundingClientRect().top;

        for (const block of blocks) {
            const base = parseFloat(getComputedStyle(block).marginTop) || 0;
            const rect = block.getBoundingClientRect();
            const top = (rect.top - rootTop) / scale;
            const height = rect.height / scale;
            if (height <= 0) continue;

            // Taller than a whole page: it has to break internally, so moving
            // it would only waste a page.
            if (height > usableHeight) continue;

            const pageIndex = Math.floor(top / page.h);
            const bottomLimit = pageIndex * page.h + (page.h - pagePadding.bottom);

            if (top + height > bottomLimit) {
                const target = (pageIndex + 1) * page.h + pagePadding.top;
                const push = target - top;
                if (push > 0.5) {
                    block.style.marginTop = `${base + push}px`;

                    // Adjacent margins collapse, so the element does not
                    // necessarily move by the amount just written. Measure
                    // where it actually landed and correct the difference,
                    // rather than trusting the arithmetic.
                    const landed = (block.getBoundingClientRect().top - rootTop) / scale;
                    const residual = target - landed;
                    if (Math.abs(residual) > 0.5) {
                        block.style.marginTop = `${base + push + residual}px`;
                    }

                    block.dataset.pbLast = block.style.marginTop;
                    moved = true;
                }
            }
        }

        return moved;
    }, [page.h, pagePadding.top, pagePadding.bottom]);

    const paginate = useCallback(() => {
        const root = contentRef.current;
        if (!root || running.current) return;
        running.current = true;
        try {
            // Converges quickly; the cap only stops a pathological oscillation.
            for (let attempt = 0; attempt < 4; attempt += 1) {
                if (!pass()) break;
            }
            setPageCount(countPages(root));
            onPageCount?.(countPages(root));
        } finally {
            running.current = false;
        }
    }, [pass, page.h, onPageCount]);

    useLayoutEffect(() => {
        paginate();
    }, [paginate, revision, format]);

    // Web fonts land after first paint and change every measurement.
    useEffect(() => {
        let cancelled = false;
        void document.fonts.ready.then(() => {
            if (!cancelled) requestAnimationFrame(paginate);
        });
        return () => {
            cancelled = true;
        };
    }, [paginate]);

    useEffect(() => {
        const root = contentRef.current;
        if (!root || typeof ResizeObserver === "undefined") return;
        const observer = new ResizeObserver(() => {
            if (running.current) return;
            requestAnimationFrame(paginate);
        });
        observer.observe(root);
        return () => observer.disconnect();
    }, [paginate, revision]);

    const height = pageCount * page.h;

    return (
        <div
            id="cv-sheet"
            className="cv-sheet"
            data-page-count={pageCount}
            data-page-height={page.h}
            data-page-width={page.w}
            style={{ width: page.w, height, position: "relative", background: background ?? "#ffffff" }}
        >
            <div ref={contentRef} style={{ position: "relative", zIndex: 1 }}>
                {children}
            </div>

            {/* Trim guides. Preview-only: stripped before the sheet is captured,
                which is why they can never end up in the PDF. */}
            <div data-export-hide="true" aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
                {Array.from({ length: pageCount - 1 }, (_, index) => (
                    <div
                        key={index}
                        style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: (index + 1) * page.h,
                            borderTop: "1px dashed rgba(22,23,26,0.28)",
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
