import type { CSSProperties, ReactNode } from "react";
import type { TemplateProps } from "./paper";
import { CM, PAGE, dateRange, entryBullets, joinNonEmpty, toLines } from "./paper";

/* =============================================================================
   Marquee — the navy aside.

   A dark band runs the full height of the page, flush to its left edge,
   carrying a circular portrait and everything that stands still about the
   person: how to reach them, what they studied, what they can do, what they
   speak. The white side carries the name at full size, then the record on a
   threaded timeline, then references set two to a row.

   Heads are sentence case, not caps, and each is closed by a hairline that
   runs the width of its column — the one rule the whole page is built on.

   Archivo for the heads, Lato for the reading matter.
   ========================================================================== */

const NAVY = "#2E3A4C";
const INK = "#1E2A38";
const BODY_INK = "#5A6472";
const MUTE = "#79838F";
const RULE = "#C6CCD4";
const ON_NAVY = "#FFFFFF";
const ON_NAVY_MUTE = "#BEC5CF";
const ON_NAVY_RULE = "rgba(255, 255, 255, 0.55)";

const ASIDE_W = 7.5 * CM;
const ASIDE_PAD_X = 46;
const MAIN_PAD_L = 30;
const MAIN_PAD_R = 34;
const PAD_TOP = 1.15 * CM;
const PAD_BOTTOM = 1 * CM;
const PHOTO = 3.8 * CM;

export const marqueePagePadding = { top: PAD_TOP, bottom: PAD_BOTTOM };

/** The navy band is painted by the sheet rather than by this component, so it
 *  runs the full height of a second and third page instead of stopping where
 *  the aside's own content does. */
export const marqueeSheetBackground =
    `linear-gradient(to right, ${NAVY} 0px, ${NAVY} ${ASIDE_W}px, #ffffff ${ASIDE_W}px, #ffffff 100%)`;

const head = '"Archivo", "Helvetica Neue", Arial, sans-serif';
const sans = '"Lato", "Helvetica Neue", Arial, sans-serif';

const body: CSSProperties = { fontFamily: sans, fontSize: 9.5, lineHeight: 1.55, color: BODY_INK };
const asideBody: CSSProperties = { fontFamily: sans, fontSize: 9.5, lineHeight: 1.5, color: ON_NAVY_MUTE };
const asideLabel: CSSProperties = { fontFamily: sans, fontSize: 9.5, fontWeight: 700, color: ON_NAVY, lineHeight: 1.4 };

/** A head on the white side: sentence case over a hairline the width of the
 *  column. */
function MainSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section data-block style={{ marginBottom: 26 }}>
            <h2 style={{ fontFamily: head, fontSize: 21, fontWeight: 700, letterSpacing: "-0.01em", color: INK, margin: 0, lineHeight: 1.15 }}>
                {title}
            </h2>
            <div style={{ height: 1, background: RULE, margin: "8px 0 14px" }} />
            {children}
        </section>
    );
}

/** The same head in the aside, in white on the band. */
function AsideSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section data-block style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: head, fontSize: 19, fontWeight: 700, letterSpacing: "-0.01em", color: ON_NAVY, margin: 0, lineHeight: 1.15 }}>
                {title}
            </h2>
            <div style={{ height: 1, background: ON_NAVY_RULE, margin: "7px 0 12px" }} />
            {children}
        </section>
    );
}

/**
 * A record on the white side, tagged with a ringed node and threaded to the
 * one below it. The thread is drawn to the bottom of the entry's own padding,
 * so consecutive records join without anything counting them.
 */
function Record({ dates, place, title, lines }: { dates: string; place: string; title: string; lines: string[] }) {
    return (
        <div data-block style={{ display: "grid", gridTemplateColumns: "14px 1fr", columnGap: 13 }}>
            <div style={{ position: "relative" }}>
                <span
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 2,
                        width: 13,
                        height: 13,
                        borderRadius: "50%",
                        border: `2px solid ${INK}`,
                        background: "#ffffff",
                    }}
                />
                <span style={{ position: "absolute", left: 6, top: 17, bottom: 0, width: 1.5, background: RULE }} />
            </div>

            <div style={{ paddingBottom: 22 }}>
                {dates && <div style={{ fontFamily: sans, fontSize: 10.5, fontWeight: 700, color: INK, lineHeight: 1.35 }}>{dates}</div>}
                {place && <div style={{ ...body, fontSize: 10, color: MUTE, marginTop: 2 }}>{place}</div>}
                {title && <div style={{ fontFamily: sans, fontSize: 10.5, fontWeight: 700, color: INK, marginTop: 4 }}>{title}</div>}
                {lines.map((line, index) => (
                    <p key={index} style={{ ...body, textAlign: "justify", margin: index === 0 ? "7px 0 0" : "4px 0 0" }}>
                        {line}
                    </p>
                ))}
            </div>
        </div>
    );
}

/** A fact in the aside: what it is in white, then what it says in grey. */
function Fact({ name, value }: { name: string; value: string }) {
    return (
        <div style={{ marginBottom: 10 }}>
            <div style={asideLabel}>{name}</div>
            <div style={{ ...asideBody, wordBreak: "break-word" }}>{value}</div>
        </div>
    );
}

/** A bulleted item, the way the aside lists what someone can do. */
function Bulleted({ text }: { text: string }) {
    return (
        <div style={{ display: "flex", gap: 9, marginBottom: 7 }}>
            <span style={{ width: 3.5, height: 3.5, borderRadius: "50%", background: ON_NAVY, flex: "none", marginTop: 6 }} />
            <span style={{ ...asideBody, color: "#E7EAEE" }}>{text}</span>
        </div>
    );
}

/** A line of a reference block: the label in bold, the value beside it. */
function ReferenceLine({ name, value }: { name: string; value: string }) {
    return (
        <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
            <span style={{ fontFamily: sans, fontSize: 8.5, fontWeight: 700, color: INK, flex: "none" }}>{name}</span>
            <span style={{ fontFamily: sans, fontSize: 8.5, color: BODY_INK, minWidth: 0, wordBreak: "break-word" }}>{value}</span>
        </div>
    );
}

export function MarqueeTemplate({ data, format }: TemplateProps) {
    const { personal, education, experience, skills, projects, certifications, languages, hobbies } = data;
    const page = PAGE[format];

    const facts = [
        personal.phone && { name: "Phone", value: personal.phone },
        personal.email && { name: "Email", value: personal.email },
        personal.location && { name: "Address", value: personal.location },
        personal.linkedin && { name: "LinkedIn", value: personal.linkedin },
        personal.github && { name: "GitHub", value: personal.github },
        personal.website && { name: "Website", value: personal.website },
    ].filter(Boolean) as { name: string; value: string }[];

    return (
        <div style={{ width: page.w, fontFamily: sans, color: BODY_INK, background: "transparent" }}>
            <div style={{ display: "grid", gridTemplateColumns: `${ASIDE_W}px 1fr`, alignItems: "start" }}>
                {/* ---- the navy aside ----------------------------------------
                    The portrait is a background rather than a picture element:
                    the exporter's rasteriser has no object-fit and would stretch
                    a non-square photo to the circle instead of cropping it. */}
                <aside style={{ padding: `${PAD_TOP}px ${ASIDE_PAD_X}px ${PAD_BOTTOM}px` }}>
                    {personal.photoBase64 && (
                        <div
                            aria-hidden="true"
                            data-block
                            style={{
                                width: PHOTO,
                                height: PHOTO,
                                margin: "0 auto 30px",
                                borderRadius: "50%",
                                backgroundImage: `url("${personal.photoBase64}")`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                            }}
                        />
                    )}

                    {facts.length > 0 && (
                        <AsideSection title="Contact">
                            {facts.map((fact) => (
                                <Fact key={fact.name} name={fact.name} value={fact.value} />
                            ))}
                        </AsideSection>
                    )}

                    {education.length > 0 && (
                        <AsideSection title="Education">
                            {education.map((item) => (
                                <div key={item.id} data-block style={{ marginBottom: 12 }}>
                                    {dateRange(item.dates) && <div style={{ ...asideBody, fontSize: 9 }}>{dateRange(item.dates)}</div>}
                                    <div style={asideLabel}>{joinNonEmpty([item.degree, item.field], " in ") || item.school}</div>
                                    <div style={asideBody}>{joinNonEmpty([item.school, item.location], ", ")}</div>
                                    {item.gpa && <div style={{ ...asideBody, fontSize: 9 }}>GPA: {item.gpa}</div>}
                                </div>
                            ))}
                        </AsideSection>
                    )}

                    {skills.length > 0 && (
                        <AsideSection title="Expertise">
                            {skills.map((item) => (
                                <Bulleted key={item.id} text={item.name} />
                            ))}
                        </AsideSection>
                    )}

                    {languages.length > 0 && (
                        <AsideSection title="Language">
                            {languages.map((item) => (
                                <div key={item.id} style={{ marginBottom: 7 }}>
                                    <div style={asideLabel}>{item.name}</div>
                                    {item.level && <div style={{ ...asideBody, fontSize: 9 }}>{item.level}</div>}
                                </div>
                            ))}
                        </AsideSection>
                    )}

                    {hobbies.length > 0 && (
                        <AsideSection title="Interests">
                            {hobbies.map((item) => (
                                <Bulleted key={item.id} text={item.name} />
                            ))}
                        </AsideSection>
                    )}
                </aside>

                {/* ---- the white side ---------------------------------------- */}
                <main style={{ padding: `${PAD_TOP}px ${MAIN_PAD_R}px ${PAD_BOTTOM}px ${MAIN_PAD_L}px` }}>
                    <header data-block style={{ marginBottom: 34 }}>
                        <h1
                            style={{
                                fontFamily: head,
                                fontSize: 42,
                                fontWeight: 700,
                                letterSpacing: "-0.025em",
                                color: INK,
                                lineHeight: 1.05,
                                margin: 0,
                            }}
                        >
                            {personal.name || "Your Name"}
                        </h1>
                        {personal.title && (
                            <div
                                style={{
                                    fontFamily: head,
                                    fontSize: 15,
                                    fontWeight: 400,
                                    letterSpacing: "0.2em",
                                    color: INK,
                                    lineHeight: 1.3,
                                    marginTop: 7,
                                }}
                            >
                                {personal.title}
                            </div>
                        )}
                        {personal.summary && (
                            <p style={{ ...body, textAlign: "justify", margin: "16px 0 0" }}>{personal.summary}</p>
                        )}
                    </header>

                    {experience.length > 0 && (
                        <MainSection title="Experience">
                            {experience.map((item) => (
                                <Record
                                    key={item.id}
                                    dates={dateRange(item.dates)}
                                    place={joinNonEmpty([item.company, item.location], " | ")}
                                    title={item.position}
                                    lines={entryBullets(item)}
                                />
                            ))}
                        </MainSection>
                    )}

                    {projects.length > 0 && (
                        <MainSection title="Projects">
                            {projects.map((item) => (
                                <Record
                                    key={item.id}
                                    dates={dateRange(item.dates)}
                                    place={joinNonEmpty([item.technologies, item.url], " | ")}
                                    title={item.name}
                                    lines={toLines(item.description)}
                                />
                            ))}
                        </MainSection>
                    )}

                    {/* Set two to a row, the way the reference sets its
                        references at the foot of the page. */}
                    {certifications.length > 0 && (
                        <MainSection title="Certifications">
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 26, rowGap: 16 }}>
                                {certifications.map((item) => (
                                    <div key={item.id} data-block>
                                        <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: INK, lineHeight: 1.3 }}>
                                            {item.name}
                                        </div>
                                        {item.issuer && <div style={{ ...body, fontSize: 10, marginTop: 2 }}>{item.issuer}</div>}
                                        {item.date && <ReferenceLine name="Date:" value={item.date} />}
                                        {item.url && <ReferenceLine name="Link:" value={item.url} />}
                                    </div>
                                ))}
                            </div>
                        </MainSection>
                    )}
                </main>
            </div>
        </div>
    );
}
