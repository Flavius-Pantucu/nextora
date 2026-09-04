import type { CSSProperties, ReactNode } from "react";
import type { TemplateProps } from "./paper";
import { PAGE, dateRange, entryBullets, groupSkills, pt, toLines } from "./paper";

/* =============================================================================
   The classic single-column resume — the Times-set format that university
   career offices have handed out for thirty years and that every applicant
   tracking system parses without complaint.

   Times New Roman throughout. Tinos is metric-compatible with it, so the line
   breaks are identical whether or not the reader has Times installed, which is
   what keeps the export identical to the preview.

   0.75in margins. Name 16pt bold caps, tracked. Section heads 11pt bold caps
   over a rule. Body 10.5pt.
   ========================================================================== */

const MARGIN_X = 0.75 * 96;
const MARGIN_Y = 0.7 * 96;

export const classicPagePadding = { top: MARGIN_Y, bottom: MARGIN_Y };

const serif = '"Tinos", "Times New Roman", Times, serif';

const body: CSSProperties = { fontSize: pt(10.5), lineHeight: 1.28 };

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section data-block style={{ marginTop: 13 }}>
            <h2
                style={{
                    fontSize: pt(11),
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    margin: 0,
                    paddingBottom: 2,
                    borderBottom: "1px solid #000",
                }}
            >
                {title}
            </h2>
            <div style={{ marginTop: 6 }}>{children}</div>
        </section>
    );
}

function Entry({
    left,
    right,
    subLeft,
    subRight,
    bullets,
}: {
    left: string;
    right: string;
    subLeft: string;
    subRight: string;
    bullets: string[];
}) {
    const row: CSSProperties = { display: "flex", justifyContent: "space-between", gap: 18, ...body };
    return (
        <div data-block style={{ marginBottom: 9 }}>
            <div style={row}>
                <span style={{ fontWeight: 700 }}>{left}</span>
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{right}</span>
            </div>
            {(subLeft || subRight) && (
                <div style={{ ...row, fontStyle: "italic" }}>
                    <span>{subLeft}</span>
                    <span style={{ whiteSpace: "nowrap" }}>{subRight}</span>
                </div>
            )}
            {bullets.length > 0 && (
                <ul style={{ margin: "3px 0 0", paddingLeft: 18, listStyleType: "disc", ...body }}>
                    {bullets.map((bullet, index) => (
                        <li key={index} style={{ marginBottom: 1 }}>
                            {bullet}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export function ClassicTemplate({ data, format }: TemplateProps) {
    const { personal, education, experience, skills, projects, certifications, languages, hobbies } = data;
    const contact = [personal.location, personal.phone, personal.email, personal.linkedin, personal.github].filter(Boolean);

    return (
        <div
            style={{
                width: PAGE[format].w,
                padding: `${MARGIN_Y}px ${MARGIN_X}px`,
                fontFamily: serif,
                color: "#000",
                background: "#fff",
                ...body,
            }}
        >
            <header data-block style={{ textAlign: "center" }}>
                <h1
                    style={{
                        fontSize: pt(16),
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        margin: 0,
                        lineHeight: 1.2,
                    }}
                >
                    {personal.name || "Your Name"}
                </h1>
                {personal.title && <div style={{ ...body, marginTop: 2 }}>{personal.title}</div>}
                {contact.length > 0 && <div style={{ ...body, marginTop: 3 }}>{contact.join("  •  ")}</div>}
            </header>

            {personal.summary && (
                <Section title="Summary">
                    <p style={{ margin: 0, textAlign: "justify", ...body }}>{personal.summary}</p>
                </Section>
            )}

            {experience.length > 0 && (
                <Section title="Professional Experience">
                    {experience.map((item) => (
                        <Entry
                            key={item.id}
                            left={item.company}
                            right={item.location}
                            subLeft={item.position}
                            subRight={dateRange(item.dates)}
                            bullets={entryBullets(item)}
                        />
                    ))}
                </Section>
            )}

            {education.length > 0 && (
                <Section title="Education">
                    {education.map((item) => (
                        <Entry
                            key={item.id}
                            left={item.school}
                            right={item.location}
                            subLeft={[item.degree, item.field].filter(Boolean).join(" in ")}
                            subRight={dateRange(item.dates)}
                            bullets={item.gpa ? [`GPA: ${item.gpa}`] : []}
                        />
                    ))}
                </Section>
            )}

            {projects.length > 0 && (
                <Section title="Projects">
                    {projects.map((item) => (
                        <Entry
                            key={item.id}
                            left={item.name}
                            right={item.url ?? ""}
                            subLeft={item.technologies}
                            subRight={dateRange(item.dates)}
                            bullets={toLines(item.description)}
                        />
                    ))}
                </Section>
            )}

            {skills.length > 0 && (
                <Section title="Skills">
                    {groupSkills(skills).map(({ category, items }) => (
                        <div key={category} data-block style={{ ...body, marginBottom: 2 }}>
                            <strong style={{ fontWeight: 700 }}>{category}:</strong>{" "}
                            {items.map((skill) => skill.name).join(", ")}
                        </div>
                    ))}
                </Section>
            )}

            {certifications.length > 0 && (
                <Section title="Certifications">
                    {certifications.map((item) => (
                        <div
                            key={item.id}
                            data-block
                            style={{ display: "flex", justifyContent: "space-between", gap: 18, ...body, marginBottom: 2 }}
                        >
                            <span>
                                <strong style={{ fontWeight: 700 }}>{item.name}</strong>
                                {item.issuer && `, ${item.issuer}`}
                            </span>
                            <span style={{ whiteSpace: "nowrap" }}>{item.date}</span>
                        </div>
                    ))}
                </Section>
            )}

            {languages.length > 0 && (
                <Section title="Languages">
                    <div style={body}>
                        {languages.map((item) => `${item.name}${item.level ? ` (${item.level})` : ""}`).join(", ")}
                    </div>
                </Section>
            )}

            {hobbies.length > 0 && (
                <Section title="Interests">
                    <div style={body}>{hobbies.map((item) => item.name).join(", ")}</div>
                </Section>
            )}
        </div>
    );
}
