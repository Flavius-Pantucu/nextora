import type { CSSProperties, ReactNode } from "react";
import type { TemplateProps } from "./paper";
import { CM, PAGE, dateRange, entryBullets, joinNonEmpty, toLines } from "./paper";

/* =============================================================================
   Greyboard — the whole sheet printed on board.

   No white anywhere: the page itself is the grey, and everything sits directly
   on it. The given name is set light and widely tracked over a heavy family
   name, and each head in the wide column carries a small cross at its outer
   end above a hairline. A square portrait, not a circle.

   Raleway throughout, tracked hard in the heads and left alone in the text.
   ========================================================================== */

const BOARD = "#D9D9D9";
const INK = "#26261F";
const BODY_INK = "#2F2F2A";
const MUTE = "#5E5E58";
const RULE = "#8C8C86";

const PAD_X = 1.45 * CM;
const PAD_TOP = 1.15 * CM;
const PAD_BOTTOM = 1.15 * CM;

export const greyboardPagePadding = { top: PAD_TOP, bottom: PAD_BOTTOM };

/** The board is the sheet's own colour, so it carries across every page
 *  rather than stopping where this component's content does. */
export const greyboardSheetBackground = BOARD;

const sans = '"Raleway", "Helvetica Neue", Arial, sans-serif';

const body: CSSProperties = { fontFamily: sans, fontSize: 10.5, lineHeight: 1.62, color: BODY_INK };

const headType: CSSProperties = {
    fontFamily: sans,
    fontSize: 13.5,
    fontWeight: 700,
    letterSpacing: "0.24em",
    textTransform: "uppercase",
    color: INK,
    lineHeight: 1.2,
    margin: 0,
};

/** The cross that closes a head in the wide column. Drawn rather than set:
 *  a dingbat would depend on whatever glyph the fallback face happens to have. */
function Cross() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={RULE} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M7 1.6v10.8M1.6 7h10.8" />
        </svg>
    );
}

function WideSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section data-block style={{ marginBottom: 26 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <h2 style={headType}>{title}</h2>
                <Cross />
            </div>
            <div style={{ borderTop: `1px solid ${RULE}`, margin: "8px 0 13px" }} />
            {children}
        </section>
    );
}

function NarrowSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section data-block style={{ marginBottom: 24 }}>
            <h2 style={{ ...headType, fontSize: 12.5, letterSpacing: "0.2em" }}>{title}</h2>
            <div style={{ borderTop: `1px solid ${RULE}`, margin: "8px 0 12px" }} />
            {children}
        </section>
    );
}

/** A disc bullet, drawn at the size the design wants rather than left to the
 *  browser's list marker — the exporter draws markers itself and lands them a
 *  little off the line. */
function Bullet({ children }: { children: ReactNode }) {
    return (
        <div style={{ display: "flex", gap: 9, marginBottom: 4 }}>
            <span style={{ width: 4.5, height: 4.5, borderRadius: "50%", background: BODY_INK, flex: "none", marginTop: 7 }} />
            <span style={{ ...body, flex: 1, minWidth: 0 }}>{children}</span>
        </div>
    );
}

function Glyph({ children }: { children: ReactNode }) {
    return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </svg>
    );
}

const PhoneIcon = (
    <Glyph>
        <path d="M4.3 2.4h2.2l1 2.6-1.3 1a8.4 8.4 0 0 0 3.8 3.8l1-1.3 2.6 1v2.2a1.1 1.1 0 0 1-1.2 1.1A11 11 0 0 1 3.2 3.6a1.1 1.1 0 0 1 1.1-1.2Z" />
    </Glyph>
);

const MailIcon = (
    <Glyph>
        <path d="M2.4 4.3h11.2v7.4H2.4z" />
        <path d="m2.7 4.7 5.3 3.9 5.3-3.9" />
    </Glyph>
);

const HomeIcon = (
    <Glyph>
        <path d="M2.6 7.4 8 3l5.4 4.4" />
        <path d="M4.1 8.4v4.9h7.8V8.4" />
    </Glyph>
);

const LinkIcon = (
    <Glyph>
        <path d="M6.8 9.2a2.9 2.9 0 0 1 0-4l1.6-1.6a2.9 2.9 0 0 1 4 4l-.8.8" />
        <path d="M9.2 6.8a2.9 2.9 0 0 1 0 4l-1.6 1.6a2.9 2.9 0 0 1-4-4l.8-.8" />
    </Glyph>
);

export function GreyboardTemplate({ data, format }: TemplateProps) {
    const { personal, education, experience, skills, projects, certifications, languages, hobbies } = data;
    const page = PAGE[format];

    const words = (personal.name || "Your Name").trim().split(/\s+/);
    const given = words.length > 1 ? words.slice(0, -1).join(" ") : "";
    const family = words[words.length - 1];

    const contact = [
        personal.phone && { icon: PhoneIcon, text: personal.phone },
        personal.email && { icon: MailIcon, text: personal.email },
        personal.location && { icon: HomeIcon, text: personal.location },
        personal.linkedin && { icon: LinkIcon, text: personal.linkedin },
    ].filter(Boolean) as { icon: ReactNode; text: string }[];

    return (
        <div
            style={{
                width: page.w,
                padding: `${PAD_TOP}px ${PAD_X}px ${PAD_BOTTOM}px`,
                fontFamily: sans,
                color: BODY_INK,
                background: BOARD,
            }}
        >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 0.62fr", columnGap: 42, alignItems: "start" }}>
                {/* ---- the wide column ---------------------------------------- */}
                <div>
                    <header data-block style={{ marginBottom: 30 }}>
                        {given && (
                            <div style={{ fontSize: 25, fontWeight: 400, letterSpacing: "0.3em", color: INK, lineHeight: 1.2 }}>{given}</div>
                        )}
                        <div style={{ fontSize: 55, fontWeight: 800, letterSpacing: "0.005em", color: INK, lineHeight: 1.02, marginTop: 2 }}>
                            {family}
                        </div>
                    </header>

                    {personal.title && (
                        <div data-block style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: INK, marginBottom: 14 }}>
                            {personal.title}
                        </div>
                    )}

                    {personal.summary && (
                        <p data-block style={{ ...body, textAlign: "justify", margin: "0 0 30px" }}>
                            {personal.summary}
                        </p>
                    )}

                    {experience.length > 0 && (
                        <WideSection title="Experience">
                            {experience.map((item) => (
                                <div key={item.id} data-block style={{ marginBottom: 16 }}>
                                    <div style={{ ...body, fontWeight: 700, color: INK }}>{item.position}</div>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 18, marginBottom: 6 }}>
                                        <span style={body}>{joinNonEmpty([item.company, item.location], ", ")}</span>
                                        <span style={{ ...body, whiteSpace: "nowrap" }}>{dateRange(item.dates)}</span>
                                    </div>
                                    {entryBullets(item).map((line, index) => (
                                        <Bullet key={index}>{line}</Bullet>
                                    ))}
                                </div>
                            ))}
                        </WideSection>
                    )}

                    {education.length > 0 && (
                        <WideSection title="Education">
                            {education.map((item) => (
                                <div key={item.id} data-block style={{ marginBottom: 12 }}>
                                    <div style={{ ...body, fontWeight: 700, color: INK }}>
                                        {joinNonEmpty([item.degree, item.field], " in ") || item.school}
                                    </div>
                                    <div style={body}>
                                        {joinNonEmpty([item.school, item.location, dateRange(item.dates), item.gpa && `GPA ${item.gpa}`], ", ")}
                                    </div>
                                </div>
                            ))}
                        </WideSection>
                    )}

                    {certifications.length > 0 && (
                        <WideSection title="Certifications">
                            {certifications.map((item) => (
                                <div key={item.id} data-block style={{ marginBottom: 12 }}>
                                    <div style={{ ...body, fontWeight: 700, color: INK }}>{item.name}</div>
                                    <div style={body}>{joinNonEmpty([item.issuer, item.date], ", ")}</div>
                                </div>
                            ))}
                        </WideSection>
                    )}
                </div>

                {/* ---- the narrow column -------------------------------------- */}
                <div>
                    {contact.length > 0 && (
                        <div data-block style={{ marginBottom: 26, paddingTop: 6 }}>
                            {contact.map((item) => (
                                <div key={item.text} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 11 }}>
                                    <span style={{ flex: "none", marginTop: 2 }}>{item.icon}</span>
                                    <span style={{ ...body, flex: 1, minWidth: 0, wordBreak: "break-word" }}>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Square, and cropped by the box rather than by the picture:
                        the exporter has no object-fit and would stretch it. */}
                    {personal.photoBase64 && (
                        <div
                            aria-hidden="true"
                            data-block
                            style={{
                                width: "100%",
                                height: 200,
                                marginBottom: 28,
                                backgroundImage: `url("${personal.photoBase64}")`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                            }}
                        />
                    )}

                    {skills.length > 0 && (
                        <NarrowSection title="Skills">
                            {skills.map((item) => (
                                <Bullet key={item.id}>{item.name}</Bullet>
                            ))}
                        </NarrowSection>
                    )}

                    {(projects.length > 0 || personal.website) && (
                        <NarrowSection title="Portfolio">
                            {personal.website && (
                                <div style={{ ...body, fontWeight: 700, color: INK, marginBottom: 8, wordBreak: "break-word" }}>
                                    {personal.website}
                                </div>
                            )}
                            {projects.map((item) => (
                                <div key={item.id} data-block style={{ marginBottom: 10 }}>
                                    <div style={{ ...body, fontWeight: 700, color: INK }}>{item.name}</div>
                                    {toLines(item.description)[0] && <div style={body}>{toLines(item.description)[0]}</div>}
                                    {item.technologies && <div style={{ ...body, color: MUTE }}>{item.technologies}</div>}
                                </div>
                            ))}
                        </NarrowSection>
                    )}

                    {languages.length > 0 && (
                        <NarrowSection title="Languages">
                            {languages.map((item) => (
                                <Bullet key={item.id}>{joinNonEmpty([item.name, item.level && `(${item.level})`], " ")}</Bullet>
                            ))}
                        </NarrowSection>
                    )}

                    {hobbies.length > 0 && (
                        <NarrowSection title="Interests">
                            {hobbies.map((item) => (
                                <Bullet key={item.id}>{item.name}</Bullet>
                            ))}
                        </NarrowSection>
                    )}
                </div>
            </div>
        </div>
    );
}
