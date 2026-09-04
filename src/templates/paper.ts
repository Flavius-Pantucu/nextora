import type { CVData, PageFormat, SkillItem } from "../types/cv.types";

/* Units. LaTeX measures type in TeX points (1/72.27in); CSS measures in px at
   96dpi. Getting this conversion right is the difference between a replica and
   something that merely resembles one. */
export const TEX_PT = 96 / 72.27;
export const CM = 96 / 2.54;
export const IN = 96;

export const pt = (n: number) => `${(n * TEX_PT).toFixed(2)}px`;
export const cm = (n: number) => `${(n * CM).toFixed(2)}px`;
export const inch = (n: number) => `${(n * IN).toFixed(2)}px`;

/** Page boxes at 96dpi. */
export const PAGE: Record<PageFormat, { w: number; h: number; label: string }> = {
    a4: { w: 794, h: 1123, label: "A4 · 210 × 297 mm" },
    letter: { w: 816, h: 1056, label: "US Letter · 8.5 × 11 in" },
};

export interface TemplateProps {
    data: CVData;
    format: PageFormat;
}

/** Bullets are authored one per line. Blank lines are dropped, not rendered. */
export const toLines = (text: string): string[] =>
    (text ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

/** Every bullet an experience entry contributes, responsibilities then wins. */
export const entryBullets = (item: { responsibilities: string; achievements: string }): string[] => [
    ...toLines(item.responsibilities),
    ...toLines(item.achievements),
];

/** Jake's "Technical Skills" block groups by category and keeps input order. */
export const groupSkills = (skills: SkillItem[]): { category: string; items: SkillItem[] }[] => {
    const order: string[] = [];
    const buckets = new Map<string, SkillItem[]>();
    for (const skill of skills) {
        const key = skill.category?.trim() || "Skills";
        if (!buckets.has(key)) {
            buckets.set(key, []);
            order.push(key);
        }
        buckets.get(key)!.push(skill);
    }
    return order.map((category) => ({ category, items: buckets.get(category)! }));
};

export const SKILL_SCORE: Record<SkillItem["level"], number> = {
    beginner: 2,
    intermediate: 3,
    advanced: 5,
    expert: 6,
};

export const joinNonEmpty = (parts: (string | undefined)[], separator: string): string =>
    parts.filter((part) => part && part.trim()).join(separator);

export const dateRange = (range: { from: string; to: string }): string => {
    const from = range?.from?.trim();
    const to = range?.to?.trim();
    if (from && to) return `${from} – ${to}`;
    return from || to || "";
};

/** Contact links are stored bare ("github.com/x"); templates print them bare
 *  and link them properly. */
export const href = (value: string): string => {
    const v = value.trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    if (v.includes("@")) return `mailto:${v}`;
    if (/^\+?[\d\s()-]{6,}$/.test(v)) return `tel:${v.replace(/[^\d+]/g, "")}`;
    return `https://${v}`;
};
