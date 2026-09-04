import { Plus } from "lucide-react";
import { useCVStore } from "../stores/useCVStore";
import { SECTIONS } from "../lib/sections";
import { PhotoUploader } from "./PhotoUploader";
import { Area, Card, Field, Rubric, TrashGlyph } from "./ui/Controls";
import type {
    CertificationItem,
    CVData,
    EducationItem,
    ExperienceItem,
    HobbyItem,
    LanguageItem,
    ProjectItem,
    SectionId,
    SkillItem,
    SkillLevel,
} from "../types/cv.types";

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const BULLET_HINT = "One bullet per line. Blank lines are ignored.";

interface EditorLeafProps {
    section: SectionId;
    data: CVData;
    profileId: string;
}

export function EditorLeaf({ section, data, profileId }: EditorLeafProps) {
    const updateProfileData = useCVStore((state) => state.updateProfileData);
    const definition = SECTIONS.find((entry) => entry.id === section)!;

    const patch = (part: Partial<CVData>) => updateProfileData(profileId, part);

    /** Generic list helpers, so each division below is only its own fields. */
    function list<T extends { id: string }>(key: keyof CVData, items: T[]) {
        return {
            add: (item: Omit<T, "id">) => patch({ [key]: [...items, { ...item, id: newId() }] } as unknown as Partial<CVData>),
            update: (id: string, part: Partial<T>) =>
                patch({ [key]: items.map((item) => (item.id === id ? { ...item, ...part } : item)) } as unknown as Partial<CVData>),
            remove: (id: string) => patch({ [key]: items.filter((item) => item.id !== id) } as unknown as Partial<CVData>),
        };
    }

    const experience = list<ExperienceItem>("experience", data.experience);
    const education = list<EducationItem>("education", data.education);
    const skills = list<SkillItem>("skills", data.skills);
    const projects = list<ProjectItem>("projects", data.projects);
    const certifications = list<CertificationItem>("certifications", data.certifications);
    const languages = list<LanguageItem>("languages", data.languages);
    const hobbies = list<HobbyItem>("hobbies", data.hobbies);

    const personal = (field: keyof CVData["personal"], value: string | undefined) =>
        patch({ personal: { ...data.personal, [field]: value } });

    return (
        <div className="flex h-full flex-col">
            {/* The division's own board colour crosses the head of the leaf, so
                the active tab and the content it opened read as one thing. */}
            <div className="shrink-0" style={{ height: 5, background: definition.hue }} />

            <header className="shrink-0 border-b border-rule px-5 pb-4 pt-5">
                <h2 className="head text-[26px]">{definition.label}</h2>
            </header>

            <div className="leaf-grid min-h-0 flex-1 overflow-y-auto px-5 py-5">
                {section === "personal" && (
                    <>
                        <Rubric>Identity</Rubric>
                        <Field label="Full name" value={data.personal.name} onChange={(e) => personal("name", e.target.value)} placeholder="Alex Marchetti" />
                        <Field label="Professional title" value={data.personal.title} onChange={(e) => personal("title", e.target.value)} placeholder="Senior Software Engineer" hint="Printed by Awesome-CV and Twenty Seconds." />
                        <Rubric>Contact</Rubric>
                        <Field label="Email" type="email" value={data.personal.email} onChange={(e) => personal("email", e.target.value)} placeholder="you@example.com" />
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Phone" value={data.personal.phone} onChange={(e) => personal("phone", e.target.value)} placeholder="+40 700 000 000" />
                            <Field label="Location" value={data.personal.location} onChange={(e) => personal("location", e.target.value)} placeholder="Bucharest, Romania" />
                        </div>
                        <Field label="LinkedIn" value={data.personal.linkedin} onChange={(e) => personal("linkedin", e.target.value)} placeholder="linkedin.com/in/you" />
                        <Field label="GitHub" value={data.personal.github} onChange={(e) => personal("github", e.target.value)} placeholder="github.com/you" />
                        <Field label="Website" value={data.personal.website} onChange={(e) => personal("website", e.target.value)} placeholder="you.dev" />
                        <Rubric>Summary</Rubric>
                        <Area label="Summary" rows={5} value={data.personal.summary} onChange={(e) => personal("summary", e.target.value)} placeholder="Two or three sentences on what you do and what you are good at." />
                        <Rubric>Photo</Rubric>
                        <PhotoUploader photoBase64={data.personal.photoBase64} onPhotoChange={(value) => personal("photoBase64", value)} />
                    </>
                )}

                {section === "experience" && (
                    <Division
                        label="Position"
                        count={data.experience.length}
                        onAdd={() =>
                            experience.add({ company: "", position: "", location: "", dates: { from: "", to: "" }, responsibilities: "", achievements: "" })
                        }
                        empty="No positions yet."
                    >
                        {data.experience.map((item, index) => (
                            <Card key={item.id} index={index} label="position" onRemove={() => experience.remove(item.id)}>
                                <Field label="Job title" value={item.position} onChange={(e) => experience.update(item.id, { position: e.target.value })} placeholder="Senior Software Engineer" />
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Company" value={item.company} onChange={(e) => experience.update(item.id, { company: e.target.value })} />
                                    <Field label="Location" value={item.location} onChange={(e) => experience.update(item.id, { location: e.target.value })} placeholder="Remote" />
                                </div>
                                <DatePair value={item.dates} onChange={(dates) => experience.update(item.id, { dates })} />
                                <Area label="Responsibilities" rows={4} value={item.responsibilities} onChange={(e) => experience.update(item.id, { responsibilities: e.target.value })} hint={BULLET_HINT} />
                                <Area label="Achievements" rows={3} value={item.achievements} onChange={(e) => experience.update(item.id, { achievements: e.target.value })} hint={BULLET_HINT} />
                            </Card>
                        ))}
                    </Division>
                )}

                {section === "education" && (
                    <Division
                        label="Qualification"
                        count={data.education.length}
                        onAdd={() => education.add({ school: "", degree: "", field: "", location: "", dates: { from: "", to: "" }, gpa: "" })}
                        empty="No qualifications yet."
                    >
                        {data.education.map((item, index) => (
                            <Card key={item.id} index={index} label="qualification" onRemove={() => education.remove(item.id)}>
                                <Field label="Institution" value={item.school} onChange={(e) => education.update(item.id, { school: e.target.value })} />
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Degree" value={item.degree} onChange={(e) => education.update(item.id, { degree: e.target.value })} placeholder="B.Sc." />
                                    <Field label="Field" value={item.field} onChange={(e) => education.update(item.id, { field: e.target.value })} placeholder="Computer Science" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Location" value={item.location} onChange={(e) => education.update(item.id, { location: e.target.value })} />
                                    <Field label="Grade" value={item.gpa ?? ""} onChange={(e) => education.update(item.id, { gpa: e.target.value })} placeholder="9.4 / 10" />
                                </div>
                                <DatePair value={item.dates} onChange={(dates) => education.update(item.id, { dates })} />
                            </Card>
                        ))}
                    </Division>
                )}

                {section === "skills" && (
                    <Division
                        label="Skill"
                        count={data.skills.length}
                        onAdd={() => skills.add({ name: "", category: "Languages", level: "advanced" })}
                        empty="No skills yet."
                        hint="Skills group by category on Jake's Resume, Awesome-CV and Deedy. Level drives the bars on Twenty Seconds."
                    >
                        <div className="space-y-3">
                            {data.skills.map((item) => (
                                /* Two lines per skill: the name gets the full column, then
                                   category and level share the one below. Squeezing all
                                   three onto one line left every field unreadable. */
                                <div key={item.id} className="flex items-start gap-2 border-b border-rule pb-3 last:border-b-0 last:pb-0">
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <Field label="Skill" value={item.name} onChange={(e) => skills.update(item.id, { name: e.target.value })} placeholder="TypeScript" />
                                        <div className="grid grid-cols-[minmax(0,1fr)_8.5rem] gap-2">
                                            <Field label="Category" value={item.category} onChange={(e) => skills.update(item.id, { category: e.target.value })} list="skill-categories" />
                                            <div>
                                                <label className="field-label">Level</label>
                                                <select className="field" value={item.level} onChange={(e) => skills.update(item.id, { level: e.target.value as SkillLevel })}>
                                                    <option value="beginner">Beginner</option>
                                                    <option value="intermediate">Intermediate</option>
                                                    <option value="advanced">Advanced</option>
                                                    <option value="expert">Expert</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="button" className="btn btn-icon mt-[19px]" onClick={() => skills.remove(item.id)} aria-label={`Delete skill ${item.name || "(unnamed)"}`} title="Delete skill">
                                        <TrashGlyph />
                                    </button>
                                </div>
                            ))}
                            <datalist id="skill-categories">
                                {["Languages", "Frameworks", "Developer Tools", "Infrastructure", "Libraries"].map((option) => (
                                    <option key={option} value={option} />
                                ))}
                            </datalist>
                        </div>
                    </Division>
                )}

                {section === "projects" && (
                    <Division
                        label="Project"
                        count={data.projects.length}
                        onAdd={() => projects.add({ name: "", description: "", technologies: "", dates: { from: "", to: "" }, url: "" })}
                        empty="No projects yet."
                    >
                        {data.projects.map((item, index) => (
                            <Card key={item.id} index={index} label="project" onRemove={() => projects.remove(item.id)}>
                                <Field label="Name" value={item.name} onChange={(e) => projects.update(item.id, { name: e.target.value })} />
                                <Field label="Technologies" value={item.technologies} onChange={(e) => projects.update(item.id, { technologies: e.target.value })} placeholder="Go, BadgerDB, Cobra" />
                                <DatePair value={item.dates} onChange={(dates) => projects.update(item.id, { dates })} />
                                <Field label="Link" value={item.url ?? ""} onChange={(e) => projects.update(item.id, { url: e.target.value })} placeholder="github.com/you/project" />
                                <Area label="Description" rows={4} value={item.description} onChange={(e) => projects.update(item.id, { description: e.target.value })} hint={BULLET_HINT} />
                            </Card>
                        ))}
                    </Division>
                )}

                {section === "certifications" && (
                    <Division
                        label="Certification"
                        count={data.certifications.length}
                        onAdd={() => certifications.add({ name: "", issuer: "", date: "", url: "" })}
                        empty="No certifications yet."
                    >
                        {data.certifications.map((item, index) => (
                            <Card key={item.id} index={index} label="certification" onRemove={() => certifications.remove(item.id)}>
                                <Field label="Name" value={item.name} onChange={(e) => certifications.update(item.id, { name: e.target.value })} />
                                <div className="grid grid-cols-[1fr_7rem] gap-3">
                                    <Field label="Issuer" value={item.issuer} onChange={(e) => certifications.update(item.id, { issuer: e.target.value })} />
                                    <Field label="Year" value={item.date} onChange={(e) => certifications.update(item.id, { date: e.target.value })} placeholder="2023" />
                                </div>
                            </Card>
                        ))}
                    </Division>
                )}

                {section === "languages" && (
                    <Division label="Language" count={data.languages.length} onAdd={() => languages.add({ name: "", level: "" })} empty="No languages yet.">
                        <div className="space-y-2">
                            {data.languages.map((item) => (
                                <div key={item.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                                    <Field label="Language" value={item.name} onChange={(e) => languages.update(item.id, { name: e.target.value })} />
                                    <Field label="Level" value={item.level ?? ""} onChange={(e) => languages.update(item.id, { level: e.target.value })} placeholder="C2 / Native" />
                                    <button type="button" className="btn btn-icon mb-0.5" onClick={() => languages.remove(item.id)} aria-label={`Delete language ${item.name || "(unnamed)"}`} title="Delete language">
                                        <TrashGlyph />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Division>
                )}

                {section === "hobbies" && (
                    <Division label="Interest" count={data.hobbies.length} onAdd={() => hobbies.add({ name: "", level: "" })} empty="No interests yet.">
                        <div className="space-y-2">
                            {data.hobbies.map((item) => (
                                <div key={item.id} className="grid grid-cols-[1fr_auto] items-end gap-2">
                                    <Field label="Interest" value={item.name} onChange={(e) => hobbies.update(item.id, { name: e.target.value })} />
                                    <button type="button" className="btn btn-icon mb-0.5" onClick={() => hobbies.remove(item.id)} aria-label={`Delete interest ${item.name || "(unnamed)"}`} title="Delete interest">
                                        <TrashGlyph />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Division>
                )}
            </div>
        </div>
    );
}

function Division({
    label,
    count,
    onAdd,
    empty,
    hint,
    children,
}: {
    label: string;
    count: number;
    onAdd: () => void;
    empty: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <>
            <Rubric
                right={
                    <button type="button" className="btn btn-sm" onClick={onAdd}>
                        <Plus size={12} strokeWidth={2.2} />
                        Add
                    </button>
                }
            >
                {count} {count === 1 ? label : `${label}s`}
            </Rubric>

            {hint && <p className="font-mono text-[10px] leading-relaxed text-ink-3">{hint}</p>}

            {count === 0 ? (
                <p className="border border-dashed border-rule px-4 py-8 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
                    {empty}
                </p>
            ) : (
                <div className="space-y-4">{children}</div>
            )}
        </>
    );
}

function DatePair({ value, onChange }: { value: { from: string; to: string }; onChange: (value: { from: string; to: string }) => void }) {
    return (
        <div className="grid grid-cols-2 gap-3">
            <Field label="From" value={value.from} onChange={(e) => onChange({ ...value, from: e.target.value })} placeholder="Mar 2022" />
            <Field label="To" value={value.to} onChange={(e) => onChange({ ...value, to: e.target.value })} placeholder="Present" />
        </div>
    );
}
