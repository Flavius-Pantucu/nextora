import type { CVData } from "../types/cv.types";

/**
 * Placeholder content, not anyone's real CV. It exists so every template has
 * something realistic to lay out on first run — replace it with your own.
 */
export const getSampleCVData = (): CVData => ({
    personal: {
        name: "Alex Marchetti",
        title: "Senior Software Engineer",
        email: "alex.marchetti@example.com",
        phone: "+40 721 000 000",
        linkedin: "linkedin.com/in/alexmarchetti",
        github: "github.com/alexmarchetti",
        website: "alexmarchetti.dev",
        location: "Bucharest, Romania",
        summary:
            "Backend-leaning full-stack engineer with eight years building payment and identity systems at scale. Comfortable owning a service from schema to on-call, and happiest when a gnarly latency problem turns out to be a data-modelling problem.",
    },
    experience: [
        {
            id: "exp-1",
            company: "Northbound Payments",
            position: "Senior Software Engineer",
            location: "Bucharest, RO",
            dates: { from: "Mar 2022", to: "Present" },
            responsibilities:
                "Own the ledger service that settles 2.4M transactions a day across nine markets\nLead the migration from a monolithic Rails billing engine to event-sourced Go services\nMentor three engineers and run the team's design-review rotation",
            achievements:
                "Cut p99 settlement latency from 840ms to 96ms by replacing per-row locking with batched writes\nReduced reconciliation incidents by 71% after introducing an idempotency layer",
        },
        {
            id: "exp-2",
            company: "Tessellate",
            position: "Software Engineer",
            location: "Remote",
            dates: { from: "Jul 2019", to: "Feb 2022" },
            responsibilities:
                "Built the multi-tenant authentication service backing 40+ customer deployments\nDesigned the audit-log pipeline on Kafka and ClickHouse",
            achievements: "Took SSO onboarding for enterprise customers from three weeks to two days",
        },
        {
            id: "exp-3",
            company: "Loop Interactive",
            position: "Junior Developer",
            location: "Cluj-Napoca, RO",
            dates: { from: "Sep 2017", to: "Jun 2019" },
            responsibilities:
                "Shipped features across a React front end and a Django API for retail clients\nAutomated the release pipeline, replacing a manual FTP deploy",
            achievements: "",
        },
    ],
    education: [
        {
            id: "edu-1",
            school: "Politehnica University of Bucharest",
            degree: "M.Sc.",
            field: "Computer Science",
            location: "Bucharest, RO",
            dates: { from: "Oct 2015", to: "Jun 2017" },
            gpa: "9.4 / 10",
        },
        {
            id: "edu-2",
            school: "Politehnica University of Bucharest",
            degree: "B.Sc.",
            field: "Computer Engineering",
            location: "Bucharest, RO",
            dates: { from: "Oct 2012", to: "Jun 2015" },
            gpa: "9.1 / 10",
        },
    ],
    skills: [
        { id: "sk-1", name: "Go", category: "Languages", level: "expert" },
        { id: "sk-2", name: "TypeScript", category: "Languages", level: "expert" },
        { id: "sk-3", name: "Python", category: "Languages", level: "advanced" },
        { id: "sk-4", name: "SQL (Postgres)", category: "Languages", level: "advanced" },
        { id: "sk-5", name: "Rust", category: "Languages", level: "intermediate" },
        { id: "sk-6", name: "React", category: "Frameworks", level: "advanced" },
        { id: "sk-7", name: "Node.js", category: "Frameworks", level: "advanced" },
        { id: "sk-8", name: "Django", category: "Frameworks", level: "intermediate" },
        { id: "sk-9", name: "Docker", category: "Developer Tools", level: "expert" },
        { id: "sk-10", name: "Kubernetes", category: "Developer Tools", level: "advanced" },
        { id: "sk-11", name: "Terraform", category: "Developer Tools", level: "advanced" },
        { id: "sk-12", name: "Kafka", category: "Infrastructure", level: "advanced" },
        { id: "sk-13", name: "ClickHouse", category: "Infrastructure", level: "intermediate" },
        { id: "sk-14", name: "Redis", category: "Infrastructure", level: "advanced" },
    ],
    projects: [
        {
            id: "prj-1",
            name: "Ledgerctl",
            description:
                "Command-line tool for replaying and diffing event-sourced ledgers against a snapshot, used in production incident response\nOpen sourced with 1.2k stars and eleven outside contributors",
            technologies: "Go, BadgerDB, Cobra",
            dates: { from: "Jan 2023", to: "Present" },
            url: "github.com/alexmarchetti/ledgerctl",
        },
        {
            id: "prj-2",
            name: "Vitrine",
            description:
                "Self-hosted photo archive that indexes RAW files and serves derivatives on demand\nBuilt the thumbnail pipeline to run entirely on a Raspberry Pi 4",
            technologies: "Rust, SQLite, SvelteKit",
            dates: { from: "Mar 2021", to: "Nov 2022" },
            url: "github.com/alexmarchetti/vitrine",
        },
    ],
    certifications: [
        {
            id: "cert-1",
            name: "Certified Kubernetes Administrator",
            issuer: "Cloud Native Computing Foundation",
            date: "2023",
            url: "",
        },
        { id: "cert-2", name: "AWS Solutions Architect – Associate", issuer: "Amazon Web Services", date: "2021", url: "" },
    ],
    languages: [
        { id: "lang-1", name: "Romanian", level: "Native" },
        { id: "lang-2", name: "English", level: "C2" },
        { id: "lang-3", name: "German", level: "B1" },
    ],
    hobbies: [
        { id: "hob-1", name: "Film photography", level: "" },
        { id: "hob-2", name: "Long-distance cycling", level: "" },
        { id: "hob-3", name: "Chess", level: "" },
    ],
});

export const getEmptyCVData = (): CVData => ({
    personal: {
        name: "",
        title: "",
        email: "",
        phone: "",
        linkedin: "",
        github: "",
        website: "",
        location: "",
        summary: "",
    },
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    hobbies: [],
});
