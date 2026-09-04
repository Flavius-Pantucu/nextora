import type { CSSProperties, ReactNode } from "react";
import type { TemplateProps } from "./paper";
import { PAGE, dateRange, entryBullets, groupSkills, href, pt, toLines } from "./paper";

/* =============================================================================
   Jake's Resume — Jake Gutierrez, after sb2nov. MIT.
   github.com/jakegut/resume

   article, letterpaper, 11pt, no font package, so Computer Modern Roman.
   Margins: 0.5in each side (fullpage +1in textwidth, -0.5in oddsidemargin),
   0.5in top (topmargin -0.5in), 10in textheight.

   Sizes for the 11pt option: \normalsize 10.95pt, \small 10pt, \large 12pt,
   \Huge 24.88pt. Section heads are \scshape\large followed by \titlerule.
   ========================================================================== */

const MARGIN_X = 0.5 * 96;
const MARGIN_Y = 0.5 * 96;

export const jakePagePadding = { top: MARGIN_Y, bottom: MARGIN_Y };

const normal: CSSProperties = { fontSize: pt(10.95), lineHeight: 1.24 };
const small: CSSProperties = { fontSize: pt(10), lineHeight: 1.2 };

const sectionHead: CSSProperties = {
    fontSize: pt(12),
    fontVariant: "small-caps",
    fontVariantCaps: "small-caps",
    lineHeight: 1.15,
    marginBottom: 1,
};

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section data-block style={{ marginTop: pt(9) }}>
            <h2 style={sectionHead}>{title}</h2>
            <div style={{ borderTop: "0.8px solid #000", marginBottom: pt(3) }} />
            {children}
        </section>
    );
}

/* \resumeSubheading: bold left / roman right, then italic small left / right.
   \resumeSubHeadingListStart is itemize[leftmargin=0.15in, label={}]. */
function Subheading({ left, right, subLeft, subRight }: { left: string; right: string; subLeft: string; subRight: string }) {
    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, ...normal }}>
                <span style={{ fontWeight: 700 }}>{left}</span>
                <span style={{ whiteSpace: "nowrap" }}>{right}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, fontStyle: "italic", ...small }}>
                <span>{subLeft}</span>
                <span style={{ whiteSpace: "nowrap" }}>{subRight}</span>
            </div>
        </>
    );
}

/* \resumeItemListStart is a plain article itemize: \leftmargini is 2.5em. */
function Bullets({ items }: { items: string[] }) {
    if (!items.length) return null;
    return (
        <ul style={{ margin: `${pt(2)} 0 0`, paddingLeft: "2.5em", listStyleType: "disc", ...small }}>
            {items.map((item, index) => (
                <li key={index} style={{ marginBottom: pt(1.5) }}>
                    {item}
                </li>
            ))}
        </ul>
    );
}

const listStart: CSSProperties = { paddingLeft: 0.15 * 96, listStyle: "none", margin: 0 };

export function JakeTemplate({ data, format }: TemplateProps) {
    const { personal, education, experience, skills, projects, certifications, languages, hobbies } = data;
    const contact = [personal.phone, personal.email, personal.linkedin, personal.github, personal.website].filter(Boolean);

    return (
        <div
            style={{
                width: PAGE[format].w,
                padding: `${MARGIN_Y}px ${MARGIN_X}px`,
                fontFamily: '"CMU Serif", "Latin Modern Roman", Georgia, serif',
                color: "#000",
                background: "#fff",
                ...normal,
            }}
        >
            {/* \begin{center} \textbf{\Huge \scshape Name} \\ \small contact */}
            <header data-block style={{ textAlign: "center" }}>
                <h1
                    style={{
                        fontSize: pt(24.88),
                        fontWeight: 700,
                        fontVariant: "small-caps",
                        fontVariantCaps: "small-caps",
                        lineHeight: 1.05,
                        margin: 0,
                    }}
                >
                    {personal.name || "Your Name"}
                </h1>
                {contact.length > 0 && (
                    <div style={{ ...small, marginTop: pt(1) }}>
                        {contact.map((item, index) => (
                            <span key={item}>
                                {index > 0 && (
                                    <>
                                        <span style={{ margin: "0 4px" }}>|</span>
                                        {/* The only place the line may fold. Without it the row
                                            is one unbreakable run — nothing between the entries
                                            is a break opportunity — so a full set of contact
                                            details ran off the page instead of wrapping. The
                                            break falls after a separator, never inside an entry. */}
                                        <wbr />
                                    </>
                                )}
                                <a href={href(item)} style={{ color: "#000", textDecoration: "underline", whiteSpace: "nowrap" }}>
                                    {item}
                                </a>
                            </span>
                        ))}
                    </div>
                )}
            </header>

            {personal.summary && (
                <Section title="Summary">
                    <div style={{ ...listStart }}>
                        <p style={{ margin: 0, ...small }}>{personal.summary}</p>
                    </div>
                </Section>
            )}

            {education.length > 0 && (
                <Section title="Education">
                    <ul style={listStart}>
                        {education.map((item) => (
                            <li key={item.id} data-block style={{ marginBottom: pt(2) }}>
                                <Subheading
                                    left={item.school}
                                    right={item.location}
                                    subLeft={[item.degree, item.field].filter(Boolean).join(" in ")}
                                    subRight={dateRange(item.dates)}
                                />
                                {item.gpa && <div style={small}>GPA: {item.gpa}</div>}
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {experience.length > 0 && (
                <Section title="Experience">
                    <ul style={listStart}>
                        {experience.map((item) => (
                            <li key={item.id} data-block style={{ marginBottom: pt(5) }}>
                                <Subheading
                                    left={item.position}
                                    right={dateRange(item.dates)}
                                    subLeft={item.company}
                                    subRight={item.location}
                                />
                                <Bullets items={entryBullets(item)} />
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {projects.length > 0 && (
                <Section title="Projects">
                    <ul style={listStart}>
                        {projects.map((item) => (
                            <li key={item.id} data-block style={{ marginBottom: pt(5) }}>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, ...small }}>
                                    <span>
                                        <strong style={{ fontWeight: 700 }}>{item.name}</strong>
                                        {item.technologies && (
                                            <>
                                                <span style={{ margin: "0 4px" }}>|</span>
                                                <em>{item.technologies}</em>
                                            </>
                                        )}
                                    </span>
                                    <span style={{ whiteSpace: "nowrap" }}>{dateRange(item.dates)}</span>
                                </div>
                                <Bullets items={toLines(item.description)} />
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {skills.length > 0 && (
                <Section title="Technical Skills">
                    <div style={{ ...listStart, ...small }}>
                        {groupSkills(skills).map(({ category, items }) => (
                            <div key={category}>
                                <strong style={{ fontWeight: 700 }}>{category}</strong>
                                {`: ${items.map((skill) => skill.name).join(", ")}`}
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {certifications.length > 0 && (
                <Section title="Certifications">
                    <div style={{ ...listStart, ...small }}>
                        {certifications.map((item) => (
                            <div key={item.id} data-block>
                                <strong style={{ fontWeight: 700 }}>{item.name}</strong>
                                {item.issuer && ` — ${item.issuer}`}
                                {item.date && ` (${item.date})`}
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {languages.length > 0 && (
                <Section title="Languages">
                    <div style={{ ...listStart, ...small }}>
                        {languages.map((item) => `${item.name}${item.level ? ` (${item.level})` : ""}`).join(", ")}
                    </div>
                </Section>
            )}

            {hobbies.length > 0 && (
                <Section title="Interests">
                    <div style={{ ...listStart, ...small }}>{hobbies.map((item) => item.name).join(", ")}</div>
                </Section>
            )}
        </div>
    );
}
