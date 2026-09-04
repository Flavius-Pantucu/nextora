import type { ComponentType } from "react";
import type { PageFormat, TemplateMeta, TemplateType } from "../types/cv.types";
import type { TemplateProps } from "./paper";
import { JakeTemplate, jakePagePadding } from "./JakeTemplate";
import { AwesomeTemplate, awesomePagePadding } from "./AwesomeTemplate";
import { ClassicTemplate, classicPagePadding } from "./ClassicTemplate";
import { DeedyTemplate, deedyPagePadding } from "./DeedyTemplate";
import { TwentySecondsTemplate, twentySecondsPagePadding, twentySecondsSheetBackground } from "./TwentySecondsTemplate";
import { SlateTemplate, slatePagePadding, slateSheetBackground } from "./SlateTemplate";
import { MarqueeTemplate, marqueePagePadding, marqueeSheetBackground } from "./MarqueeTemplate";
import { GreyboardTemplate, greyboardPagePadding, greyboardSheetBackground } from "./GreyboardTemplate";
import { RibbonTemplate, ribbonPagePadding } from "./RibbonTemplate";
import { CameoTemplate, cameoPagePadding, cameoSheetBackground } from "./CameoTemplate";

export interface TemplateEntry extends TemplateMeta {
    Component: ComponentType<TemplateProps>;
    pagePadding: { top: number; bottom: number };
    /** Painted behind every page by the sheet, for full-height sidebars. */
    sheetBackground?: string;
}

export const TEMPLATES: Record<TemplateType, TemplateEntry> = {
    jake: {
        id: "jake",
        name: "Jake's Resume",
        author: "Jake Gutierrez",
        atsSafe: true,
        typeface: "Computer Modern",
        nativeFormat: "letter",
        note: "The LaTeX one-pager everyone in software recognises. Small-caps heads over rules, tight bullets.",
        Component: JakeTemplate,
        pagePadding: jakePagePadding,
    },
    awesome: {
        id: "awesome",
        name: "Awesome-CV",
        author: "Byungjin Park",
        atsSafe: true,
        typeface: "Roboto",
        nativeFormat: "a4",
        note: "Split-weight name, red-tipped section titles, right-aligned dates. Still single column.",
        Component: AwesomeTemplate,
        pagePadding: awesomePagePadding,
    },
    classic: {
        id: "classic",
        name: "Classic Times",
        author: "Standard career-office format",
        atsSafe: true,
        typeface: "Times New Roman",
        nativeFormat: "letter",
        note: "The conventional format. Nothing to trip a parser and nothing to argue with.",
        Component: ClassicTemplate,
        pagePadding: classicPagePadding,
    },
    deedy: {
        id: "deedy",
        name: "Deedy",
        author: "Debarghya Das",
        atsSafe: false,
        typeface: "Lato + Raleway",
        nativeFormat: "letter",
        note: "Two columns under a 40pt name. Dense, confident, built to fit a career on one page.",
        Component: DeedyTemplate,
        pagePadding: deedyPagePadding,
    },
    twentyseconds: {
        id: "twentyseconds",
        name: "Twenty Seconds",
        author: "Carmine Spagnuolo",
        atsSafe: false,
        typeface: "Roboto",
        nativeFormat: "a4",
        note: "Tinted aside with a circular photo and skill bars. The only format here that uses your photo.",
        Component: TwentySecondsTemplate,
        pagePadding: twentySecondsPagePadding,
        sheetBackground: twentySecondsSheetBackground,
    },
    slate: {
        id: "slate",
        name: "Slate",
        author: "Agency two-column design",
        atsSafe: false,
        typeface: "Archivo + Roboto",
        nativeFormat: "a4",
        note: "Charcoal aside carrying the portrait, a timeline down the entries, meters for the skills. The most designed of the six.",
        Component: SlateTemplate,
        pagePadding: slatePagePadding,
        sheetBackground: slateSheetBackground,
    },
    marquee: {
        id: "marquee",
        name: "Marquee",
        author: "Navy-aside design",
        atsSafe: false,
        typeface: "Archivo + Lato",
        nativeFormat: "a4",
        note: "A navy band down the full height of the page carrying the portrait and the standing facts, with the record threaded on a timeline beside it.",
        Component: MarqueeTemplate,
        pagePadding: marqueePagePadding,
        sheetBackground: marqueeSheetBackground,
    },
    greyboard: {
        id: "greyboard",
        name: "Greyboard",
        author: "Editorial grey-card design",
        atsSafe: false,
        typeface: "Raleway",
        nativeFormat: "a4",
        note: "Printed on board rather than paper: no white anywhere, a light given name over a heavy family name, a square portrait.",
        Component: GreyboardTemplate,
        pagePadding: greyboardPagePadding,
        sheetBackground: greyboardSheetBackground,
    },
    ribbon: {
        id: "ribbon",
        name: "Ribbon",
        author: "Blush-and-navy design",
        atsSafe: false,
        typeface: "Archivo + Lato",
        nativeFormat: "a4",
        note: "A blush column offset out of a ruled head, a monogram cut by a diagonal, navy ribbons opening every division, and the margin column set flush right.",
        Component: RibbonTemplate,
        pagePadding: ribbonPagePadding,
    },
    cameo: {
        id: "cameo",
        name: "Cameo",
        author: "Charcoal portrait design",
        atsSafe: false,
        typeface: "Archivo + Lato",
        nativeFormat: "a4",
        note: "A charcoal column stood off the left edge, broken once by a white band of contact facts. Both blocks close on a shallow dome, and the portrait sits in the upper one like a cameo in its setting.",
        Component: CameoTemplate,
        pagePadding: cameoPagePadding,
        sheetBackground: cameoSheetBackground,
    },
};

export const TEMPLATE_ORDER: TemplateType[] = [
    "jake",
    "awesome",
    "classic",
    "deedy",
    "twentyseconds",
    "slate",
    "marquee",
    "greyboard",
    "ribbon",
    "cameo",
];

export const templateFileSlug = (id: TemplateType, format: PageFormat) => `${id}-${format}`;
