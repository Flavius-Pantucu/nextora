import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { PageFormat } from "../types/cv.types";

/**
 * Export.
 *
 * The rule this file exists to enforce: there is exactly one rendering path.
 * The PDF is produced from the very DOM node the preview is showing, at the
 * same width, with the same stylesheet and the same paginated layout. Nothing
 * is re-laid-out for export and nothing is styled differently for it. The only
 * thing removed is the preview's own trim guides, which are marked
 * `data-export-hide` precisely so they can be dropped without touching content.
 */

const SHEET_ID = "cv-sheet";
/** 3x gives 300dpi-class output at A4 without exhausting canvas limits. */
const RASTER_SCALE = 3;
/** No browser will allocate a canvas longer than this on either axis, and none
 *  of them say so: the call returns a blank canvas. A long CV therefore steps
 *  the raster down instead of exporting an empty document. */
const MAX_CANVAS_EDGE = 16384;

export class ExportError extends Error {}

interface SheetGeometry {
    node: HTMLElement;
    pageWidth: number;
    pageHeight: number;
    pageCount: number;
}

/**
 * The one set of capture options. Both exports read it, so the picture the PDF
 * slices and the picture the PNG saves can never be taken differently.
 */
function captureOptions(geometry: SheetGeometry) {
    const width = geometry.pageWidth;
    const height = geometry.pageHeight * geometry.pageCount;
    return {
        scale: Math.min(RASTER_SCALE, MAX_CANVAS_EDGE / Math.max(width, height)),
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width,
        height,
        windowWidth: width,
        windowHeight: height,
    };
}

function readSheet(): SheetGeometry {
    const node = document.getElementById(SHEET_ID);
    if (!node) throw new ExportError("The preview is not on screen, so there is nothing to export yet.");
    return {
        node,
        pageWidth: Number(node.dataset.pageWidth),
        pageHeight: Number(node.dataset.pageHeight),
        pageCount: Math.max(1, Number(node.dataset.pageCount) || 1),
    };
}

/**
 * Renders the sheet to a canvas off-screen at its natural size.
 *
 * The live node sits inside a zoom transform, and html2canvas is unreliable
 * about ancestor transforms, so the node is cloned into an untransformed
 * container at exactly its layout width. The clone keeps every inline style
 * the pagination pass wrote, which is what makes the captured page breaks land
 * on the same pixels the preview drew them at.
 */
async function withStagedClone<T>(geometry: SheetGeometry, work: (clone: HTMLElement) => Promise<T>): Promise<T> {
    const { node, pageWidth, pageHeight, pageCount } = geometry;

    // Web fonts change every measurement; staging before they resolve is the
    // single most common cause of a PDF that does not match its preview.
    await document.fonts.ready;

    const stage = document.createElement("div");
    stage.setAttribute("aria-hidden", "true");
    stage.style.cssText = `position:fixed;left:-20000px;top:0;width:${pageWidth}px;background:#ffffff;z-index:-1;`;

    const clone = node.cloneNode(true) as HTMLElement;
    clone.removeAttribute("id");
    clone.style.transform = "none";
    clone.style.width = `${pageWidth}px`;
    clone.style.height = `${pageHeight * pageCount}px`;
    for (const hidden of Array.from(clone.querySelectorAll("[data-export-hide]"))) hidden.remove();

    stage.appendChild(clone);
    document.body.appendChild(stage);

    try {
        return await work(clone);
    } finally {
        stage.remove();
    }
}

/** Renders the staged clone to one canvas covering the whole document. */
async function rasterise(geometry: SheetGeometry): Promise<HTMLCanvasElement> {
    return withStagedClone(geometry, (clone) => html2canvas(clone, captureOptions(geometry)));
}

interface TextRun {
    text: string;
    /** Layout px from the top-left of the whole document. */
    x: number;
    /** Baseline, in layout px from the top of the whole document. */
    y: number;
    size: number;
}

/**
 * Every word in the document, with the box it occupies.
 *
 * The page image is what makes the PDF match the preview exactly, but an image
 * alone has no text in it — and three of these templates are advertised as
 * ATS-safe, which means a parser has to be able to read the words back out.
 * So each word is also written into the PDF in invisible rendering mode, at
 * the position it occupies in the picture. The result looks like the preview,
 * and selects, searches and parses like a text document.
 */
function collectTextRuns(clone: HTMLElement): TextRun[] {
    const runs: TextRun[] = [];
    const origin = clone.getBoundingClientRect();

    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const style = getComputedStyle(parent);
            if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) {
                return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
        },
    });

    const range = document.createRange();

    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node.textContent ?? "";
        const size = parseFloat(getComputedStyle(node.parentElement!).fontSize) || 10;

        // Word by word, so wrapped lines and justified text keep their real
        // positions instead of being pinned to the start of the block.
        const pattern = /\S+/g;
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(text)) !== null) {
            range.setStart(node, match.index);
            range.setEnd(node, match.index + match[0].length);
            const rect = range.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) continue;
            runs.push({
                text: match[0],
                x: rect.left - origin.left,
                // Approximate the baseline; exact enough that extracted text
                // keeps its reading order and line grouping.
                y: rect.bottom - origin.top - rect.height * 0.18,
                size,
            });
        }
    }

    range.detach();
    return runs;
}

function triggerDownload(blobUrl: string, filename: string) {
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
}

/**
 * PDF. The full-length canvas is cut at exactly the page boundaries the
 * preview drew, and each slice becomes one page at its true physical size —
 * so page 2 of the PDF starts on the same line page 2 of the preview did.
 */
export async function exportPDF(format: PageFormat, filename: string): Promise<void> {
    const geometry = readSheet();
    const { pageHeight, pageCount } = geometry;

    const { canvas, runs } = await withStagedClone(geometry, async (clone) => ({
        canvas: await html2canvas(clone, captureOptions(geometry)),
        runs: collectTextRuns(clone),
    }));

    const sliceHeight = Math.round(canvas.height / pageCount);

    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: format === "a4" ? "a4" : "letter" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    // One factor converts layout px to PDF points for both the image and the text.
    const toPoints = pdfWidth / geometry.pageWidth;

    pdf.setFont("helvetica", "normal");

    for (let index = 0; index < pageCount; index += 1) {
        const top = index * sliceHeight;
        const height = Math.min(sliceHeight, canvas.height - top);
        if (height <= 0) break;

        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = sliceHeight;

        const context = slice.getContext("2d");
        if (!context) throw new ExportError("This browser would not give up a canvas to draw the PDF on.");
        // A short final page is padded with paper, not stretched.
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, slice.width, slice.height);
        context.drawImage(canvas, 0, top, canvas.width, height, 0, 0, canvas.width, height);

        if (index > 0) pdf.addPage();
        pdf.addImage(slice.toDataURL("image/jpeg", 0.96), "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");

        // The invisible text layer for this page: what a human selects and an
        // applicant tracking system reads.
        const pageTop = index * pageHeight;
        const pageBottom = pageTop + pageHeight;
        for (const run of runs) {
            if (run.y < pageTop || run.y >= pageBottom) continue;
            const size = run.size * toPoints;
            if (size <= 0) continue;
            pdf.setFontSize(size);
            pdf.text(run.text, run.x * toPoints, (run.y - pageTop) * toPoints, {
                renderingMode: "invisible",
                baseline: "alphabetic",
            });
        }
    }

    if (pdf.getNumberOfPages() > pageCount) {
        // jsPDF adds a page when text lands past the last one; never ship a blank.
        for (let extra = pdf.getNumberOfPages(); extra > pageCount; extra -= 1) pdf.deletePage(extra);
    }

    pdf.save(filename);
}

export async function exportPNG(filename: string): Promise<void> {
    const geometry = readSheet();
    const canvas = await rasterise(geometry);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new ExportError("The image could not be encoded. Try exporting a PDF instead.");

    const url = URL.createObjectURL(blob);
    triggerDownload(url, filename);
    URL.revokeObjectURL(url);
}

/**
 * Print, and the route to a vector PDF.
 *
 * Rasterising is what guarantees the PDF matches the preview pixel for pixel,
 * but it also means the text is not selectable. Printing the same DOM through
 * the browser keeps the text as text. Same node, same stylesheets, same page
 * box — so it matches too, and the user picks which trade they want.
 */
export async function printSheet(format: PageFormat): Promise<void> {
    const { node } = readSheet();
    await document.fonts.ready;

    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
    document.body.appendChild(frame);

    const doc = frame.contentDocument;
    if (!doc) {
        frame.remove();
        throw new ExportError("This browser would not open a print view.");
    }

    // Carry over the app's real stylesheets so the document is styled by the
    // same rules that styled the preview, rather than by a second copy.
    const head = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map((element) => element.outerHTML)
        .join("\n");

    const clone = node.cloneNode(true) as HTMLElement;
    clone.removeAttribute("id");
    clone.style.transform = "none";
    clone.style.boxShadow = "none";
    for (const hidden of Array.from(clone.querySelectorAll("[data-export-hide]"))) hidden.remove();

    doc.open();
    doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8">${head}
<style>
  @page { size: ${format === "a4" ? "A4" : "letter"}; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; }
  .cv-sheet { box-shadow: none !important; }
</style></head><body>${clone.outerHTML}</body></html>`);
    doc.close();

    const cleanup = () => {
        window.setTimeout(() => frame.remove(), 500);
    };

    frame.onload = () => {
        const view = frame.contentWindow;
        if (!view) {
            cleanup();
            return;
        }
        void (view.document.fonts?.ready ?? Promise.resolve()).then(() => {
            view.focus();
            view.print();
            cleanup();
        });
    };

    // A same-origin document written with document.write may already be loaded.
    if (doc.readyState === "complete") frame.onload?.(new Event("load"));
}

export function downloadJSON(json: string, filename: string): void {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, filename);
    URL.revokeObjectURL(url);
}

export const suggestFilename = (profileName: string, templateName: string, extension: string): string => {
    const slug = (value: string) =>
        value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || "cv";
    return `${slug(profileName)}-${slug(templateName)}.${extension}`;
};
