import type { CVData, SectionId } from "../types/cv.types";

export interface SectionDef {
    id: SectionId;
    label: string;
    /** The divider board's hue. One per division, at full strength. */
    hue: string;
    /** Hard keyboard address. Pressing the digit opens the division. */
    key: string;
}

export const SECTIONS: SectionDef[] = [
    { id: "personal", label: "Personal", hue: "var(--div-personal)", key: "1" },
    { id: "experience", label: "Experience", hue: "var(--div-experience)", key: "2" },
    { id: "education", label: "Education", hue: "var(--div-education)", key: "3" },
    { id: "skills", label: "Skills", hue: "var(--div-skills)", key: "4" },
    { id: "projects", label: "Projects", hue: "var(--div-projects)", key: "5" },
    { id: "certifications", label: "Certs", hue: "var(--div-certifications)", key: "6" },
    { id: "languages", label: "Languages", hue: "var(--div-languages)", key: "7" },
    { id: "hobbies", label: "Interests", hue: "var(--div-hobbies)", key: "8" },
];

/**
 * How much each division actually holds. The tab rail sizes every tab by this,
 * the way a divider tab's height in a real manual tracks the extent of its
 * division — so the rail is a picture of where the weight of the CV sits.
 */
export function sectionExtent(data: CVData, id: SectionId): number {
    switch (id) {
        case "personal": {
            const { personal } = data;
            const filled = [
                personal.name,
                personal.title,
                personal.email,
                personal.phone,
                personal.location,
                personal.linkedin,
                personal.github,
                personal.website,
            ].filter((value) => value?.trim()).length;
            return filled + (personal.summary?.trim() ? 3 : 0) + (personal.photoBase64 ? 1 : 0);
        }
        case "experience":
            return data.experience.reduce(
                (total, item) => total + 2 + item.responsibilities.split("\n").filter(Boolean).length + item.achievements.split("\n").filter(Boolean).length,
                0,
            );
        case "education":
            return data.education.length * 2;
        case "projects":
            return data.projects.reduce((total, item) => total + 2 + item.description.split("\n").filter(Boolean).length, 0);
        case "skills":
            return data.skills.length;
        case "certifications":
            return data.certifications.length * 2;
        case "languages":
            return data.languages.length;
        case "hobbies":
            return data.hobbies.length;
    }
}

export const sectionCount = (data: CVData, id: SectionId): number => {
    switch (id) {
        case "personal":
            return data.personal.name?.trim() ? 1 : 0;
        case "experience":
            return data.experience.length;
        case "education":
            return data.education.length;
        case "skills":
            return data.skills.length;
        case "projects":
            return data.projects.length;
        case "certifications":
            return data.certifications.length;
        case "languages":
            return data.languages.length;
        case "hobbies":
            return data.hobbies.length;
    }
};
