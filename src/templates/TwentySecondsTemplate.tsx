import type { CSSProperties, ReactNode } from "react";
import type { TemplateProps } from "./paper";
import { CM, PAGE, SKILL_SCORE, dateRange, entryBullets, pt, toLines } from "./paper";

/* =============================================================================
   Twenty Seconds CV — Carmine Spagnuolo. MIT.
   github.com/spagnuolocarmine/TwentySecondsCurriculumVitae-LaTex

   geometry: left 7.3cm, top 0.1cm, right 0.5cm, bottom 0.2cm on A4 — the left
   7.3cm is the tinted aside, and the main column begins after it.
   Colours from the class: sidecolor E7E7E7, gray 4D4D4D, mainblue 0E5484,
   cerulean 007BA7, maingray B9B9B9.
   Profile picture is 5cm wide, clipped to a circle.
   Skill scale runs 0–6, "Fundamental Awareness" to "Expert".
   ========================================================================== */

const SIDECOLOR = "#E7E7E7";
const GRAY = "#4D4D4D";
const MAINBLUE = "#0E5484";
const CERULEAN = "#007BA7";
const MAINGRAY = "#B9B9B9";

const ASIDE_W = 7.3 * CM;
const MAIN_PAD_R = 0.5 * CM;
const PAD_TOP = 0.6 * CM;
const PAD_BOTTOM = 0.4 * CM;
const PHOTO_W = 5 * CM;

export const twentySecondsPagePadding = { top: PAD_TOP, bottom: PAD_BOTTOM };

/** The tinted aside is painted by the sheet, not by this component, so it
 *  runs the full height of every page exactly as the class geometry does.
 *
 *  Written as single-position stops rather than the shorter double-position
 *  `${SIDECOLOR} 0 ${ASIDE_W}px` form: the exporter's gradient parser reads
 *  only the first position of a stop, and would turn that into a fade across
 *  the aside. Chrome expands it in the computed value so it survives there
 *  either way; this costs nothing and does not rely on that. */
export const twentySecondsSheetBackground =
    `linear-gradient(to right, ${SIDECOLOR} 0px, ${SIDECOLOR} ${ASIDE_W}px, #ffffff ${ASIDE_W}px, #ffffff 100%)`;

const sans = '"Roboto", "Helvetica Neue", Arial, sans-serif';

const body: CSSProperties = { fontFamily: sans, fontSize: pt(10), lineHeight: 1.45, color: GRAY };

function MainSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section style={{ marginBottom: pt(11) }}>
            <h2 style={{ fontFamily: sans, fontSize: pt(17.28), fontWeight: 400, color: GRAY, margin: "0 0 6px", lineHeight: 1.1 }}>
                <span style={{ color: MAINBLUE }}>{title.slice(0, 1)}</span>
                {title.slice(1)}
            </h2>
            {children}
        </section>
    );
}

/** \profilesection: a rule-bounded label across the aside. */
function AsideSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section style={{ marginTop: 14 }}>
            <div
                style={{
                    fontFamily: sans,
                    fontSize: pt(12),
                    color: MAINBLUE,
                    borderBottom: `1px solid ${MAINGRAY}`,
                    paddingBottom: 3,
                    marginBottom: 7,
                }}
            >
                {title}
            </div>
            {children}
        </section>
    );
}

function SkillBar({ label, score }: { label: string; score: number }) {
    return (
        <div style={{ marginBottom: 5 }}>
            <div style={{ ...body, fontSize: pt(9), marginBottom: 2 }}>{label}</div>
            <div style={{ display: "flex", gap: 3 }}>
                {Array.from({ length: 6 }, (_, index) => (
                    <span
                        key={index}
                        style={{
                            height: 6,
                            flex: 1,
                            background: index < score ? MAINBLUE : MAINGRAY,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

export function TwentySecondsTemplate({ data, format }: TemplateProps) {
    const { personal, education, experience, skills, projects, certifications, languages, hobbies } = data;
    const page = PAGE[format];
    const contact = [
        personal.location && { label: personal.location, link: false },
        personal.phone && { label: personal.phone, link: false },
        personal.website && { label: personal.website, link: true },
        personal.email && { label: personal.email, link: true },
        personal.linkedin && { label: personal.linkedin, link: true },
    ].filter(Boolean) as { label: string; link: boolean }[];

    return (
        <div style={{ width: page.w, position: "relative" }}>
            <div style={{ display: "grid", gridTemplateColumns: `${ASIDE_W}px 1fr`, position: "relative" }}>
                {/* ---- aside --------------------------------------------------- */}
                <aside style={{ padding: `${PAD_TOP}px 18px ${PAD_BOTTOM}px 18px` }}>
                    {/* The portrait is a background rather than an <img>: the
                        exporter's rasteriser has no object-fit, so a non-square
                        photo went into the PDF stretched to the circle instead
                        of cropped to it. background-size: cover crops the same
                        way in both the preview and the export. */}
                    {personal.photoBase64 && (
                        <div
                            aria-hidden="true"
                            style={{
                                width: PHOTO_W,
                                height: PHOTO_W,
                                borderRadius: "50%",
                                backgroundImage: `url("${personal.photoBase64}")`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                                marginBottom: 12,
                            }}
                        />
                    )}

                    <div style={{ fontFamily: sans, fontSize: pt(24.88), lineHeight: 1.1, color: MAINBLUE }}>
                        {personal.name || "Your Name"}
                    </div>
                    {personal.title && (
                        <div style={{ fontFamily: sans, fontSize: pt(14.4), color: "rgba(0,0,0,0.8)", textAlign: "right", marginTop: 2 }}>
                            {personal.title}
                        </div>
                    )}

                    {contact.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                            {contact.map((item) => (
                                <div
                                    key={item.label}
                                    style={{ ...body, fontSize: pt(9), color: item.link ? CERULEAN : GRAY, marginBottom: 4, wordBreak: "break-word" }}
                                >
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    )}

                    {personal.summary && (
                        <AsideSection title="About me">
                            <p style={{ ...body, fontSize: pt(9), margin: 0 }}>{personal.summary}</p>
                        </AsideSection>
                    )}

                    {skills.length > 0 && (
                        <AsideSection title="Skill">
                            {skills.slice(0, 12).map((skill) => (
                                <SkillBar key={skill.id} label={skill.name} score={SKILL_SCORE[skill.level]} />
                            ))}
                            <p style={{ ...body, fontSize: pt(7), marginTop: 6, marginBottom: 0 }}>
                                (*) The skill scale is from 0 (Fundamental Awareness) to 6 (Expert).
                            </p>
                        </AsideSection>
                    )}

                    {languages.length > 0 && (
                        <AsideSection title="Languages">
                            {languages.map((item) => (
                                <div key={item.id} style={{ ...body, fontSize: pt(9), marginBottom: 3 }}>
                                    {item.name}
                                    {item.level && <span style={{ color: MAINGRAY }}> · {item.level}</span>}
                                </div>
                            ))}
                        </AsideSection>
                    )}

                    {hobbies.length > 0 && (
                        <AsideSection title="Interests">
                            <div style={{ ...body, fontSize: pt(9) }}>{hobbies.map((item) => item.name).join(", ")}</div>
                        </AsideSection>
                    )}
                </aside>

                {/* ---- main ---------------------------------------------------- */}
                <main style={{ padding: `${PAD_TOP}px ${MAIN_PAD_R}px ${PAD_BOTTOM}px 20px` }}>
                    {experience.length > 0 && (
                        <MainSection title="Experience">
                            {experience.map((item) => (
                                <div key={item.id} style={{ marginBottom: 10 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                                        <span style={{ ...body, color: MAINBLUE, fontWeight: 500 }}>{item.position}</span>
                                        <span style={{ ...body, fontSize: pt(8), whiteSpace: "nowrap" }}>{dateRange(item.dates)}</span>
                                    </div>
                                    <div style={{ ...body, fontSize: pt(9), fontStyle: "italic" }}>
                                        {[item.company, item.location].filter(Boolean).join(", ")}
                                    </div>
                                    {entryBullets(item).length > 0 && (
                                        <ul style={{ ...body, margin: "3px 0 0", paddingLeft: 16, listStyleType: "disc" }}>
                                            {entryBullets(item).map((bullet, index) => (
                                                <li key={index}>{bullet}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </MainSection>
                    )}

                    {education.length > 0 && (
                        <MainSection title="Education">
                            {education.map((item) => (
                                <div key={item.id} style={{ marginBottom: 9 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                                        <span style={{ ...body, color: MAINBLUE, fontWeight: 500 }}>
                                            {[item.degree, item.field].filter(Boolean).join(" in ")}
                                        </span>
                                        <span style={{ ...body, fontSize: pt(8), whiteSpace: "nowrap" }}>{dateRange(item.dates)}</span>
                                    </div>
                                    <div style={{ ...body, fontSize: pt(9), fontStyle: "italic" }}>
                                        {[item.school, item.location].filter(Boolean).join(", ")}
                                    </div>
                                    {item.gpa && <div style={{ ...body, fontSize: pt(9) }}>GPA: {item.gpa}</div>}
                                </div>
                            ))}
                        </MainSection>
                    )}

                    {projects.length > 0 && (
                        <MainSection title="Projects">
                            {projects.map((item) => (
                                <div key={item.id} style={{ marginBottom: 9 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                                        <span style={{ ...body, color: MAINBLUE, fontWeight: 500 }}>{item.name}</span>
                                        <span style={{ ...body, fontSize: pt(8), whiteSpace: "nowrap" }}>{dateRange(item.dates)}</span>
                                    </div>
                                    {item.technologies && (
                                        <div style={{ ...body, fontSize: pt(9), fontStyle: "italic" }}>{item.technologies}</div>
                                    )}
                                    {toLines(item.description).length > 0 && (
                                        <ul style={{ ...body, margin: "3px 0 0", paddingLeft: 16, listStyleType: "disc" }}>
                                            {toLines(item.description).map((line, index) => (
                                                <li key={index}>{line}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </MainSection>
                    )}

                    {certifications.length > 0 && (
                        <MainSection title="Certifications">
                            {certifications.map((item) => (
                                <div
                                    key={item.id}
                                   
                                    style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 4 }}
                                >
                                    <span style={{ ...body, fontSize: pt(9) }}>
                                        <span style={{ color: MAINBLUE }}>{item.name}</span>
                                        {item.issuer && ` · ${item.issuer}`}
                                    </span>
                                    <span style={{ ...body, fontSize: pt(8), whiteSpace: "nowrap" }}>{item.date}</span>
                                </div>
                            ))}
                        </MainSection>
                    )}
                </main>
            </div>
        </div>
    );
}
