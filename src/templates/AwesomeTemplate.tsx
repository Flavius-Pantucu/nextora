import type { CSSProperties, ReactNode } from "react";
import type { TemplateProps } from "./paper";
import { CM, PAGE, dateRange, entryBullets, groupSkills, href, pt, toLines } from "./paper";

/* =============================================================================
   Awesome-CV — Byungjin Park (posquit0). LPPL 1.3c.
   github.com/posquit0/Awesome-CV

   geometry: left 2.0cm, top 1.5cm, right 2.0cm, bottom 2.0cm. Roboto.
   Colours straight from the class: awesome-red DC3522, text 333333,
   graytext 5D5D5D, lighttext 999999, darktext 414141.
   The signature detail is \StrSplit{title}{3}: the first three characters of
   every section title are set in the accent colour and the rest in text.
   ========================================================================== */

const AWESOME = "#DC3522";
const TEXT = "#333333";
const GRAYTEXT = "#5D5D5D";
const LIGHTTEXT = "#999999";
const DARKTEXT = "#414141";

const MARGIN_X = 2.0 * CM;
const MARGIN_TOP = 1.5 * CM;
const MARGIN_BOTTOM = 2.0 * CM;
const DATE_COL = 4.5 * CM;

export const awesomePagePadding = { top: MARGIN_TOP, bottom: MARGIN_BOTTOM };

const sans = '"Roboto", "Helvetica Neue", Arial, sans-serif';

function SectionTitle({ title }: { title: string }) {
    const head = title.slice(0, 3);
    const tail = title.slice(3);
    return (
        <>
            <h2 style={{ fontSize: pt(16), fontWeight: 700, margin: 0, lineHeight: 1 }}>
                <span style={{ color: AWESOME }}>{head}</span>
                <span style={{ color: TEXT }}>{tail}</span>
            </h2>
            <div style={{ borderTop: `0.9pt solid ${GRAYTEXT}`, marginTop: 2 }} />
        </>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section data-block style={{ marginTop: 3 * (CM / 10) * 1 }}>
            <div style={{ marginTop: 0.3 * CM }}>
                <SectionTitle title={title} />
            </div>
            <div style={{ marginTop: 0.25 * CM }}>{children}</div>
        </section>
    );
}

/* \cventry{position}{title}{location}{date}{description} */
function Entry({
    title,
    location,
    position,
    date,
    bullets,
}: {
    title: string;
    location: string;
    position: string;
    date: string;
    bullets: string[];
}) {
    const row: CSSProperties = { display: "grid", gridTemplateColumns: `1fr ${DATE_COL}px`, columnGap: 8, alignItems: "baseline" };
    return (
        <div data-block style={{ marginBottom: 0.35 * CM }}>
            {(title || location) && (
                <div style={row}>
                    <span style={{ fontSize: pt(10), fontWeight: 700, color: DARKTEXT }}>{title}</span>
                    <span style={{ fontSize: pt(9), fontStyle: "oblique", fontWeight: 300, color: AWESOME, textAlign: "right" }}>
                        {location}
                    </span>
                </div>
            )}
            <div style={row}>
                <span
                    style={{
                        fontSize: pt(8),
                        fontVariant: "small-caps",
                        fontVariantCaps: "small-caps",
                        color: GRAYTEXT,
                    }}
                >
                    {position}
                </span>
                <span style={{ fontSize: pt(8), fontStyle: "oblique", fontWeight: 300, color: GRAYTEXT, textAlign: "right" }}>
                    {date}
                </span>
            </div>
            {bullets.length > 0 && (
                <ul
                    style={{
                        margin: "4px 0 0",
                        paddingLeft: 14,
                        listStyleType: "disc",
                        fontSize: pt(9),
                        fontWeight: 300,
                        color: TEXT,
                        lineHeight: 1.45,
                    }}
                >
                    {bullets.map((bullet, index) => (
                        <li key={index}>{bullet}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export function AwesomeTemplate({ data, format }: TemplateProps) {
    const { personal, education, experience, skills, projects, certifications, languages, hobbies } = data;

    const nameParts = (personal.name || "Your Name").trim().split(/\s+/);
    const firstName = nameParts.slice(0, -1).join(" ") || nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
    const social = [personal.phone, personal.email, personal.website, personal.github, personal.linkedin].filter(Boolean);

    return (
        <div
            style={{
                width: PAGE[format].w,
                padding: `${MARGIN_TOP}px ${MARGIN_X}px ${MARGIN_BOTTOM}px`,
                fontFamily: sans,
                color: TEXT,
                background: "#fff",
            }}
        >
            <header data-block style={{ textAlign: "center" }}>
                <div style={{ fontSize: pt(32), lineHeight: 1.1 }}>
                    <span style={{ fontWeight: 300, color: GRAYTEXT }}>{firstName}</span>
                    {lastName && <span style={{ fontWeight: 700, color: TEXT }}> {lastName}</span>}
                </div>

                {personal.title && (
                    <div
                        style={{
                            fontSize: pt(7.6),
                            fontVariant: "small-caps",
                            fontVariantCaps: "small-caps",
                            letterSpacing: "0.06em",
                            color: AWESOME,
                            marginTop: 0.4 * (CM / 10),
                        }}
                    >
                        {personal.title}
                    </div>
                )}

                {personal.location && (
                    <div style={{ fontSize: pt(8), fontStyle: "italic", fontWeight: 300, color: LIGHTTEXT, marginTop: 2 }}>
                        {personal.location}
                    </div>
                )}

                {social.length > 0 && (
                    <div style={{ fontSize: pt(6.8), fontWeight: 300, color: TEXT, marginTop: 4 }}>
                        {social.map((item, index) => (
                            <span key={item}>
                                {index > 0 && (
                                    <>
                                        <span style={{ margin: "0 6px" }}>|</span>
                                        {/* The row's only break opportunity — see the note in
                                            Jake's header. Entries themselves never split. */}
                                        <wbr />
                                    </>
                                )}
                                <a href={href(item)} style={{ color: TEXT, textDecoration: "none", whiteSpace: "nowrap" }}>
                                    {item}
                                </a>
                            </span>
                        ))}
                    </div>
                )}
            </header>

            <div style={{ marginTop: 0.6 * CM }}>
                {personal.summary && (
                    <Section title="Summary">
                        <p style={{ margin: 0, fontSize: pt(9), fontWeight: 300, color: TEXT, lineHeight: 1.5 }}>{personal.summary}</p>
                    </Section>
                )}

                {experience.length > 0 && (
                    <Section title="Experience">
                        {experience.map((item) => (
                            <Entry
                                key={item.id}
                                title={item.company}
                                location={item.location}
                                position={item.position}
                                date={dateRange(item.dates)}
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
                                title={item.school}
                                location={item.location}
                                position={[item.degree, item.field].filter(Boolean).join(" in ")}
                                date={dateRange(item.dates)}
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
                                title={item.name}
                                location={item.url ?? ""}
                                position={item.technologies}
                                date={dateRange(item.dates)}
                                bullets={toLines(item.description)}
                            />
                        ))}
                    </Section>
                )}

                {skills.length > 0 && (
                    <Section title="Skills">
                        {groupSkills(skills).map(({ category, items }) => (
                            <div
                                key={category}
                                data-block
                                style={{ display: "grid", gridTemplateColumns: "3.6cm 1fr", columnGap: 8, marginBottom: 4 }}
                            >
                                <span style={{ fontSize: pt(10), fontWeight: 700, color: DARKTEXT, textAlign: "right" }}>
                                    {category}
                                </span>
                                <span style={{ fontSize: pt(9), fontWeight: 300, color: TEXT }}>
                                    {items.map((skill) => skill.name).join(", ")}
                                </span>
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
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: `1fr ${DATE_COL}px`,
                                    columnGap: 8,
                                    marginBottom: 3,
                                    alignItems: "baseline",
                                }}
                            >
                                <span style={{ fontSize: pt(9), color: GRAYTEXT }}>
                                    <strong style={{ fontWeight: 700, color: DARKTEXT }}>{item.name}</strong>
                                    {item.issuer && ` · ${item.issuer}`}
                                </span>
                                <span style={{ fontSize: pt(9), color: GRAYTEXT, textAlign: "right" }}>{item.date}</span>
                            </div>
                        ))}
                    </Section>
                )}

                {languages.length > 0 && (
                    <Section title="Languages">
                        <p style={{ margin: 0, fontSize: pt(9), fontWeight: 300 }}>
                            {languages.map((item) => `${item.name}${item.level ? ` (${item.level})` : ""}`).join("  ·  ")}
                        </p>
                    </Section>
                )}

                {hobbies.length > 0 && (
                    <Section title="Interests">
                        <p style={{ margin: 0, fontSize: pt(9), fontWeight: 300 }}>
                            {hobbies.map((item) => item.name).join("  ·  ")}
                        </p>
                    </Section>
                )}
            </div>
        </div>
    );
}
