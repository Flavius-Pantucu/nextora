export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

/** The five formats, each a replica of a named published resume template. */
export type TemplateType =
    | "jake"
    | "awesome"
    | "classic"
    | "deedy"
    | "twentyseconds"
    | "slate"
    | "marquee"
    | "greyboard"
    | "ribbon"
    | "cameo";

export type PageFormat = "a4" | "letter";

export type SectionId =
    | "personal"
    | "experience"
    | "education"
    | "skills"
    | "projects"
    | "certifications"
    | "languages"
    | "hobbies";

export interface PersonalData {
    name: string;
    /** Professional title. Awesome-CV and Twenty Seconds CV both set one. */
    title: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    website: string;
    location: string;
    summary: string;
    photoBase64?: string;
}

export interface DateRange {
    from: string;
    to: string;
}

export interface EducationItem {
    id: string;
    school: string;
    degree: string;
    field: string;
    location: string;
    dates: DateRange;
    gpa?: string;
}

export interface ExperienceItem {
    id: string;
    company: string;
    position: string;
    location: string;
    dates: DateRange;
    /** One bullet per line. Every template renders these as a bullet list. */
    responsibilities: string;
    achievements: string;
}

export interface SkillItem {
    id: string;
    name: string;
    /** Category label, e.g. "Languages" — Jake's Technical Skills block groups by it. */
    category: string;
    level: SkillLevel;
}

export interface ProjectItem {
    id: string;
    name: string;
    description: string;
    technologies: string;
    dates: DateRange;
    url?: string;
}

export interface CertificationItem {
    id: string;
    name: string;
    issuer: string;
    date: string;
    url?: string;
}

export interface LanguageItem {
    id: string;
    name: string;
    level?: string;
}

export interface HobbyItem {
    id: string;
    name: string;
    level?: string;
}

export interface CVData {
    personal: PersonalData;
    education: EducationItem[];
    experience: ExperienceItem[];
    skills: SkillItem[];
    projects: ProjectItem[];
    certifications: CertificationItem[];
    languages: LanguageItem[];
    hobbies: HobbyItem[];
}

export interface CVProfile {
    id: string;
    name: string;
    data: CVData;
    createdAt: string;
    updatedAt: string;
}

export interface AppState {
    profiles: Record<string, CVProfile>;
    activeProfileId: string | null;
    activeTemplate: TemplateType;
    pageFormat: PageFormat;
    darkMode: boolean;
}

/** The shape written to disk and to JSON export. Versioned so a future
 *  database migration knows what it is reading. */
export interface PersistedState {
    version: number;
    profiles: Record<string, CVProfile>;
    activeProfileId: string | null;
    activeTemplate: TemplateType;
    pageFormat: PageFormat;
    darkMode: boolean;
}

export interface TemplateMeta {
    id: TemplateType;
    /** The published template this replicates, named as its authors name it. */
    name: string;
    author: string;
    /** Single column, no sidebar, no text in graphics, selectable everywhere. */
    atsSafe: boolean;
    typeface: string;
    /** The page size the original template sets. */
    nativeFormat: PageFormat;
    note: string;
}
