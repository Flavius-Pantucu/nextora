import type { CSSProperties, ReactNode } from "react";
import type { TemplateProps } from "./paper";
import { CM, PAGE, dateRange, entryBullets, groupSkills, pt, toLines } from "./paper";

/* =============================================================================
   Deedy Resume — Debarghya Das. Apache 2.0.
   github.com/deedy/Deedy-Resume (OpenFonts edition)

   geometry: hmargin 1.25cm, vmargin 0.75cm on letterpaper.
   Lato for body and headings, Raleway for descriptors and locations.
   Colours from the class: primary 2b2b2b, headings 6A6A6A,
   subheadings 333333, date 666666.

   The layout is two minipages, 0.33 and 0.66 of the text width, under a
   centred 40pt/60pt name split across a hairline weight and a light weight.
   ========================================================================== */

const PRIMARY = "#2b2b2b";
const HEADINGS = "#6A6A6A";
const SUBHEADINGS = "#333333";
const DATE = "#666666";

const MARGIN_X = 1.25 * CM;
const MARGIN_Y = 0.75 * CM;

export const deedyPagePadding = { top: MARGIN_Y, bottom: MARGIN_Y };

const lato = '"Lato", "Helvetica Neue", Arial, sans-serif';
const raleway = '"Raleway", "Helvetica Neue", Arial, sans-serif';

const body: CSSProperties = { fontFamily: lato, fontWeight: 300, fontSize: pt(9), lineHeight: 1.35, color: PRIMARY };

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section style={{ marginBottom: pt(8) }}>
            <h2
                style={{
                    fontFamily: lato,
                    fontWeight: 300,
                    fontSize: pt(16),
                    lineHeight: 1.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: HEADINGS,
                    margin: 0,
                }}
            >
                {title}
            </h2>
            <div>{children}</div>
        </section>
    );
}

const subHeading: CSSProperties = {
    fontFamily: lato,
    fontWeight: 700,
    fontSize: pt(12),
    lineHeight: 1.2,
    textTransform: "uppercase",
    color: SUBHEADINGS,
};

const descript: CSSProperties = {
    fontFamily: raleway,
    fontWeight: 500,
    fontSize: pt(11),
    lineHeight: 1.18,
    fontVariant: "small-caps",
    fontVariantCaps: "small-caps",
    color: SUBHEADINGS,
};

const location: CSSProperties = {
    fontFamily: raleway,
    fontWeight: 500,
    fontSize: pt(10),
    lineHeight: 1.2,
    color: HEADINGS,
};

function Tight({ items }: { items: string[] }) {
    if (!items.length) return null;
    return (
        <ul style={{ margin: "2px 0 0", paddingLeft: 14, listStyleType: "disc", ...body }}>
            {items.map((item, index) => (
                <li key={index} style={{ marginBottom: 1 }}>
                    {item}
                </li>
            ))}
        </ul>
    );
}

export function DeedyTemplate({ data, format }: TemplateProps) {
    const { personal, education, experience, skills, projects, certifications, languages, hobbies } = data;

    const nameParts = (personal.name || "Your Name").trim().split(/\s+/);
    const firstName = nameParts.slice(0, -1).join(" ") || nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
    const links = [personal.website, personal.github, personal.linkedin].filter(Boolean);
    const contact = [personal.email, personal.phone, personal.location].filter(Boolean);

    return (
        <div
            style={{
                width: PAGE[format].w,
                padding: `${MARGIN_Y}px ${MARGIN_X}px`,
                fontFamily: lato,
                background: "#fff",
                color: PRIMARY,
            }}
        >
            {/* \namesection: 40pt/60pt, hairline first name, light last name. */}
            <header style={{ textAlign: "center" }}>
                <div style={{ fontSize: pt(40), lineHeight: 1.35 }}>
                    <span style={{ fontWeight: 100 }}>{firstName} </span>
                    <span style={{ fontWeight: 300 }}>{lastName}</span>
                </div>
                <div
                    style={{
                        fontFamily: raleway,
                        fontWeight: 500,
                        fontSize: pt(11),
                        lineHeight: 1.27,
                        color: HEADINGS,
                        marginTop: 5,
                    }}
                >
                    {[...links, ...contact].join("  |  ")}
                </div>
                <div style={{ borderTop: `0.4pt solid ${HEADINGS}`, marginTop: 6 }} />
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "0.33fr 0.66fr", columnGap: pt(14), marginTop: pt(10) }}>
                {/* --- narrow column ------------------------------------------------ */}
                <div>
                    {education.length > 0 && (
                        <Section title="Education">
                            {education.map((item) => (
                                <div key={item.id} style={{ marginBottom: pt(7) }}>
                                    <div style={subHeading}>{item.school}</div>
                                    <div style={descript}>{[item.degree, item.field].filter(Boolean).join(" in ")}</div>
                                    <div style={location}>{dateRange(item.dates)}</div>
                                    {item.location && <div style={location}>{item.location}</div>}
                                    {item.gpa && <div style={{ ...body, color: DATE }}>GPA: {item.gpa}</div>}
                                </div>
                            ))}
                        </Section>
                    )}

                    {skills.length > 0 && (
                        <Section title="Skills">
                            {groupSkills(skills).map(({ category, items }) => (
                                <div key={category} style={{ marginBottom: pt(5) }}>
                                    <div style={descript}>{category}</div>
                                    <div style={{ ...body, marginTop: 1 }}>{items.map((skill) => skill.name).join(" · ")}</div>
                                </div>
                            ))}
                        </Section>
                    )}

                    {certifications.length > 0 && (
                        <Section title="Certifications">
                            {certifications.map((item) => (
                                <div key={item.id} style={{ marginBottom: pt(5) }}>
                                    <div style={descript}>{item.name}</div>
                                    <div style={{ ...body, color: DATE }}>
                                        {[item.issuer, item.date].filter(Boolean).join(" · ")}
                                    </div>
                                </div>
                            ))}
                        </Section>
                    )}

                    {languages.length > 0 && (
                        <Section title="Languages">
                            {languages.map((item) => (
                                <div key={item.id} style={{ ...body, marginBottom: 1 }}>
                                    {item.name}
                                    {item.level && <span style={{ color: DATE }}> — {item.level}</span>}
                                </div>
                            ))}
                        </Section>
                    )}

                    {hobbies.length > 0 && (
                        <Section title="Interests">
                            <div style={body}>{hobbies.map((item) => item.name).join(", ")}</div>
                        </Section>
                    )}
                </div>

                {/* --- wide column --------------------------------------------------- */}
                <div>
                    {personal.summary && (
                        <Section title="Profile">
                            <p style={{ ...body, margin: "2px 0 0" }}>{personal.summary}</p>
                        </Section>
                    )}

                    {experience.length > 0 && (
                        <Section title="Experience">
                            {experience.map((item) => (
                                <div key={item.id} style={{ marginBottom: pt(8) }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                                        <span style={subHeading}>{item.company}</span>
                                        <span style={{ ...location, whiteSpace: "nowrap" }}>{item.location}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                                        <span style={descript}>{item.position}</span>
                                        <span style={{ ...location, color: DATE, whiteSpace: "nowrap" }}>{dateRange(item.dates)}</span>
                                    </div>
                                    <Tight items={entryBullets(item)} />
                                </div>
                            ))}
                        </Section>
                    )}

                    {projects.length > 0 && (
                        <Section title="Projects">
                            {projects.map((item) => (
                                <div key={item.id} style={{ marginBottom: pt(8) }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                                        <span style={subHeading}>{item.name}</span>
                                        <span style={{ ...location, color: DATE, whiteSpace: "nowrap" }}>{dateRange(item.dates)}</span>
                                    </div>
                                    {item.technologies && <div style={descript}>{item.technologies}</div>}
                                    <Tight items={toLines(item.description)} />
                                </div>
                            ))}
                        </Section>
                    )}
                </div>
            </div>
        </div>
    );
}
