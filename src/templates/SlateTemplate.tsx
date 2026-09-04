import type { CSSProperties, ReactNode } from "react";
import type { TemplateProps } from "./paper";
import { CM, PAGE, SKILL_SCORE, dateRange, entryBullets, joinNonEmpty, toLines } from "./paper";

/* =============================================================================
   Slate — the agency two-column layout.

   Not a LaTeX class: a design-studio résumé, so the measurements are the
   design's own rather than a class file's. A charcoal aside holds the portrait
   and everything about the person; the white column holds the record, with a
   rail and a node down the left of each entry the way a timeline is drawn.

   The reference sets its heads in a condensed grotesque. Nothing condensed is
   vendored here, so the heads are Archivo — the same face the application
   itself uses for heads — tracked tight and sized down to hold the same
   colour. Body copy is Roboto, as the reference has it.
   ========================================================================== */

const SLATE = "#3E3E3E";
const INK = "#2E2E2E";
const BODY_INK = "#5A5A5A";
const MUTE = "#8C8C8C";
const RULE = "#D8D8D8";
const TRACK = "#D6D6D6";
const ASIDE_INK = "#EAEAEA";
const ASIDE_MUTE = "#B4B4B4";
const ASIDE_RULE = "rgba(255, 255, 255, 0.34)";

const ASIDE_W = 6.6 * CM;
const PAD_TOP = 0.7 * CM;
const PAD_BOTTOM = 0.7 * CM;
const ASIDE_PAD_X = 26;
const MAIN_PAD_L = 30;
const MAIN_PAD_R = 34;
const PHOTO = 3.7 * CM;

export const slatePagePadding = { top: PAD_TOP, bottom: PAD_BOTTOM };

/** The charcoal aside is painted by the sheet rather than by this component,
 *  so it runs the full height of a second and third page instead of stopping
 *  where the aside's own content does. */
export const slateSheetBackground =
    `linear-gradient(to right, ${SLATE} 0px, ${SLATE} ${ASIDE_W}px, #ffffff ${ASIDE_W}px, #ffffff 100%)`;

const head = '"Archivo", "Helvetica Neue", Arial, sans-serif';
const sans = '"Roboto", "Helvetica Neue", Arial, sans-serif';

const body: CSSProperties = { fontFamily: sans, fontSize: 10, lineHeight: 1.5, color: BODY_INK };
const meta: CSSProperties = { fontFamily: sans, fontSize: 9.5, lineHeight: 1.45, color: MUTE };

/* ---- icons -----------------------------------------------------------------
   Drawn rather than set in an icon font: a font would have to be vendored, and
   a glyph that fails to load leaves a hole in the exported page. Stroked paths
   on a 16-unit box, sized by the caller. */

function Glyph({ children }: { children: ReactNode }) {
    return (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </svg>
    );
}

const PinIcon = (
    <Glyph>
        <path d="M8 14.2s4.7-4.4 4.7-7.7a4.7 4.7 0 1 0-9.4 0c0 3.3 4.7 7.7 4.7 7.7Z" />
        <circle cx="8" cy="6.3" r="1.8" />
    </Glyph>
);

const PhoneIcon = (
    <Glyph>
        <path d="M4.3 2.4h2.2l1 2.6-1.3 1a8.4 8.4 0 0 0 3.8 3.8l1-1.3 2.6 1v2.2a1.1 1.1 0 0 1-1.2 1.1A11 11 0 0 1 3.2 3.6a1.1 1.1 0 0 1 1.1-1.2Z" />
    </Glyph>
);

const MailIcon = (
    <Glyph>
        <path d="M2.6 4.2h10.8v7.6H2.6z" />
        <path d="m2.9 4.6 5.1 3.8 5.1-3.8" />
    </Glyph>
);

const LinkIcon = (
    <Glyph>
        <path d="M6.8 9.2a2.9 2.9 0 0 1 0-4l1.6-1.6a2.9 2.9 0 0 1 4 4l-.8.8" />
        <path d="M9.2 6.8a2.9 2.9 0 0 1 0 4l-1.6 1.6a2.9 2.9 0 0 1-4-4l.8-.8" />
    </Glyph>
);

/* ---- shared furniture ----------------------------------------------------- */

/** A head in the white column: caps over a rule the width of the column. */
function MainSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section data-block style={{ marginBottom: 22 }}>
            <h2
                style={{
                    fontFamily: head,
                    fontSize: 14.5,
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                    textTransform: "uppercase",
                    color: INK,
                    margin: "0 0 6px",
                    lineHeight: 1.1,
                }}
            >
                {title}
            </h2>
            <div style={{ borderTop: `2px solid ${INK}`, marginBottom: 14 }} />
            {children}
        </section>
    );
}

/** A head in the aside, hung under a hairline that separates it from the
 *  division above it. The first one carries no rule. */
function AsideSection({ title, first, children }: { title: string; first?: boolean; children: ReactNode }) {
    return (
        <section
            data-block
            style={
                first
                    ? { marginTop: 4 }
                    : { marginTop: 24, paddingTop: 24, borderTop: `1px solid ${ASIDE_RULE}` }
            }
        >
            <h2
                style={{
                    fontFamily: head,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.09em",
                    textTransform: "uppercase",
                    color: "#ffffff",
                    margin: "0 0 10px",
                    lineHeight: 1.1,
                }}
            >
                {title}
            </h2>
            {children}
        </section>
    );
}

/**
 * One record on the timeline: the where and when in the margin, then the rail
 * with its node, then what was done.
 *
 * The rail is drawn to the bottom of the entry's own padding rather than to
 * the last line of text, so consecutive entries join into one continuous line
 * without anything having to know how many entries there are.
 */
function Entry({
    title,
    subtitle,
    lines,
    footnote,
    children,
}: {
    title: string;
    subtitle: string[];
    lines: string[];
    footnote?: string;
    children?: ReactNode;
}) {
    return (
        <div data-block style={{ display: "grid", gridTemplateColumns: "142px 24px 1fr", paddingBottom: 16 }}>
            <div style={{ paddingRight: 12 }}>
                <div
                    style={{
                        fontFamily: head,
                        fontSize: 10.5,
                        fontWeight: 700,
                        letterSpacing: "0.02em",
                        textTransform: "uppercase",
                        color: INK,
                        lineHeight: 1.25,
                    }}
                >
                    {title}
                </div>
                {subtitle.filter(Boolean).map((line) => (
                    <div key={line} style={{ ...meta, marginTop: 2 }}>
                        {line}
                    </div>
                ))}
            </div>

            <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: 6, bottom: 0, width: 1.5, background: INK }} />
                <span style={{ position: "absolute", left: 5, top: 1, width: 11, height: 11, borderRadius: "50%", background: INK }} />
            </div>

            <div style={{ paddingLeft: 4 }}>
                {children}
                {lines.map((line, index) => (
                    <p key={index} style={{ ...body, margin: index === 0 && children ? "5px 0 0" : "4px 0 0" }}>
                        {line}
                    </p>
                ))}
                {footnote && <p style={{ ...meta, margin: "5px 0 0" }}>{footnote}</p>}
            </div>
        </div>
    );
}

function EntryTitle({ children }: { children: ReactNode }) {
    return <div style={{ fontFamily: sans, fontSize: 10.5, fontWeight: 700, color: INK, lineHeight: 1.3 }}>{children}</div>;
}

/** A filled dot before a word, the way the reference tags its short lists. */
function DotItem({ label, color = MUTE, ink = BODY_INK }: { label: string; color?: string; ink?: string }) {
    return (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flex: "none" }} />
            <span
                style={{
                    fontFamily: sans,
                    fontSize: 9.5,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: ink,
                    lineHeight: 1.2,
                }}
            >
                {label}
            </span>
        </span>
    );
}

function SkillMeter({ label, score }: { label: string; score: number }) {
    return (
        <div data-block>
            <div
                style={{
                    fontFamily: sans,
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: INK,
                    lineHeight: 1.2,
                }}
            >
                {label}
            </div>
            <div style={{ height: 5, background: TRACK, marginTop: 6 }}>
                <div style={{ height: 5, width: `${Math.max(0, Math.min(6, score)) * (100 / 6)}%`, background: INK }} />
            </div>
        </div>
    );
}

export function SlateTemplate({ data, format }: TemplateProps) {
    const { personal, education, experience, skills, projects, certifications, languages, hobbies } = data;
    const page = PAGE[format];

    // The reference breaks the name across two lines. Given words, the first
    // is the line above and everything else is the line below.
    const words = (personal.name || "Your Name").trim().split(/\s+/);
    const [given, ...family] = words;

    const contact = [
        personal.location && { icon: PinIcon, text: personal.location },
        personal.phone && { icon: PhoneIcon, text: personal.phone },
        personal.email && { icon: MailIcon, text: personal.email },
        personal.website && { icon: LinkIcon, text: personal.website },
    ].filter(Boolean) as { icon: ReactNode; text: string }[];

    const links = [
        personal.linkedin && { label: "LinkedIn", value: personal.linkedin },
        personal.github && { label: "GitHub", value: personal.github },
    ].filter(Boolean) as { label: string; value: string }[];

    const asideSections = [
        personal.summary && {
            title: "About me",
            body: (
                <p style={{ fontFamily: sans, fontSize: 10, lineHeight: 1.55, color: ASIDE_INK, margin: 0 }}>{personal.summary}</p>
            ),
        },
        links.length > 0 && {
            title: "Links",
            body: links.map((link) => (
                <div key={link.label} style={{ marginBottom: 10 }}>
                    <div style={{ fontFamily: sans, fontSize: 10, color: ASIDE_INK, lineHeight: 1.4 }}>{link.label}</div>
                    <div style={{ fontFamily: sans, fontSize: 10, color: ASIDE_MUTE, lineHeight: 1.4, wordBreak: "break-word" }}>
                        {link.value}
                    </div>
                </div>
            )),
        },
        certifications.length > 0 && {
            title: "Certifications",
            body: certifications.map((item) => (
                <div key={item.id} style={{ marginBottom: 11 }}>
                    <div
                        style={{
                            fontFamily: sans,
                            fontSize: 10,
                            letterSpacing: "0.02em",
                            textTransform: "uppercase",
                            color: ASIDE_INK,
                            lineHeight: 1.35,
                        }}
                    >
                        {item.name}
                    </div>
                    {joinNonEmpty([item.issuer, item.date], " · ") && (
                        <div style={{ fontFamily: sans, fontSize: 9.5, color: ASIDE_MUTE, lineHeight: 1.4 }}>
                            {joinNonEmpty([item.issuer, item.date], " · ")}
                        </div>
                    )}
                </div>
            )),
        },
        languages.length > 0 && {
            title: "Languages",
            body: (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "9px 18px" }}>
                    {languages.map((item) => (
                        <DotItem key={item.id} label={joinNonEmpty([item.name, item.level], " · ")} color={ASIDE_MUTE} ink={ASIDE_INK} />
                    ))}
                </div>
            ),
        },
    ].filter(Boolean) as { title: string; body: ReactNode }[];

    return (
        <div style={{ width: page.w, fontFamily: sans, color: BODY_INK, background: "transparent" }}>
            <div style={{ display: "grid", gridTemplateColumns: `${ASIDE_W}px 1fr` }}>
                {/* ---- the charcoal aside ------------------------------------- */}
                <aside style={{ padding: `${PAD_TOP}px ${ASIDE_PAD_X}px ${PAD_BOTTOM}px` }}>
                    {/* Painted as a background rather than as an image element:
                        the exporter's rasteriser has no object-fit, and would put
                        a non-square portrait into the PDF stretched to the circle
                        instead of cropped to it. */}
                    {personal.photoBase64 && (
                        <div
                            aria-hidden="true"
                            style={{
                                width: PHOTO,
                                height: PHOTO,
                                margin: "6px auto 26px",
                                borderRadius: "50%",
                                backgroundImage: `url("${personal.photoBase64}")`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                            }}
                        />
                    )}

                    {/* Built as a list so the hairline always falls between two
                        divisions and never above the first one, whichever
                        divisions this profile happens to fill in. */}
                    {asideSections.map((section, index) => (
                        <AsideSection key={section.title} title={section.title} first={index === 0}>
                            {section.body}
                        </AsideSection>
                    ))}

                </aside>

                {/* ---- the white column -------------------------------------- */}
                <main style={{ padding: `${PAD_TOP}px ${MAIN_PAD_R}px ${PAD_BOTTOM}px ${MAIN_PAD_L}px` }}>
                    <header data-block style={{ display: "flex", justifyContent: "space-between", gap: 26, marginBottom: 30 }}>
                        <div style={{ minWidth: 0, paddingTop: 4 }}>
                            <h1
                                style={{
                                    fontFamily: head,
                                    fontSize: 33,
                                    fontWeight: 700,
                                    letterSpacing: "0.005em",
                                    textTransform: "uppercase",
                                    color: INK,
                                    lineHeight: 1.06,
                                    margin: 0,
                                }}
                            >
                                {given}
                                {family.length > 0 && (
                                    <>
                                        <br />
                                        {family.join(" ")}
                                    </>
                                )}
                            </h1>
                            {personal.title && (
                                <div
                                    style={{
                                        fontFamily: head,
                                        fontSize: 8.5,
                                        fontWeight: 600,
                                        letterSpacing: "0.2em",
                                        textTransform: "uppercase",
                                        color: MUTE,
                                        marginTop: 8,
                                    }}
                                >
                                    {personal.title}
                                </div>
                            )}
                        </div>

                        {contact.length > 0 && (
                            <div style={{ width: 250, flex: "none" }}>
                                {contact.map((item) => (
                                    <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                                        <span
                                            style={{
                                                width: 25,
                                                height: 25,
                                                borderRadius: "50%",
                                                background: INK,
                                                flex: "none",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {item.icon}
                                        </span>
                                        <span
                                            style={{
                                                ...body,
                                                flex: 1,
                                                minWidth: 0,
                                                paddingBottom: 5,
                                                borderBottom: `1px solid ${RULE}`,
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {item.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </header>

                    {experience.length > 0 && (
                        <MainSection title="Work experience">
                            {experience.map((item) => (
                                <Entry
                                    key={item.id}
                                    title={item.company}
                                    subtitle={[item.location, dateRange(item.dates)]}
                                    lines={entryBullets(item)}
                                >
                                    <EntryTitle>{item.position}</EntryTitle>
                                </Entry>
                            ))}
                        </MainSection>
                    )}

                    {education.length > 0 && (
                        <MainSection title="Education">
                            {education.map((item) => (
                                <Entry
                                    key={item.id}
                                    title={item.school}
                                    subtitle={[item.location, dateRange(item.dates)]}
                                    lines={item.gpa ? [`GPA: ${item.gpa}`] : []}
                                >
                                    <EntryTitle>{joinNonEmpty([item.degree, item.field], " in ") || item.school}</EntryTitle>
                                </Entry>
                            ))}
                        </MainSection>
                    )}

                    {projects.length > 0 && (
                        <MainSection title="Projects">
                            {projects.map((item) => (
                                <Entry
                                    key={item.id}
                                    title={item.name}
                                    subtitle={[dateRange(item.dates)]}
                                    lines={toLines(item.description)}
                                    footnote={item.url}
                                >
                                    {item.technologies && <EntryTitle>{item.technologies}</EntryTitle>}
                                </Entry>
                            ))}
                        </MainSection>
                    )}

                    {skills.length > 0 && (
                        <MainSection title="Skills">
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 34, rowGap: 13 }}>
                                {skills.map((item) => (
                                    <SkillMeter key={item.id} label={item.name} score={SKILL_SCORE[item.level]} />
                                ))}
                            </div>
                        </MainSection>
                    )}

                    {hobbies.length > 0 && (
                        <MainSection title="Hobbies">
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 26px" }}>
                                {hobbies.map((item) => (
                                    <DotItem key={item.id} label={item.name} />
                                ))}
                            </div>
                        </MainSection>
                    )}
                </main>
            </div>
        </div>
    );
}
