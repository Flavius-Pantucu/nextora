import type { CSSProperties, ReactNode } from "react";
import type { TemplateProps } from "./paper";
import { CM, PAGE, dateRange, entryBullets, joinNonEmpty, toLines } from "./paper";

/* =============================================================================
   Ribbon — blush and navy, with the margin column set right.

   A blush panel is laid down the left of the page, offset up and out of a
   ruled head so that the head appears to sit on it: the monogram stands in the
   blush, a double rule and a chevron carry the eye across, and the name fills
   the rest. The trade hangs in a blush tab centred on the rule that closes the
   head. Below, every division of the margin column is opened by a navy ribbon
   with a cut leading edge, and each line in that column is set flush right
   against the record on the white side.

   A grey square sits under the top-left corner, half covered by the blush and
   the rule — the offset block the reference opens with.

   Archivo for the heads, Lato for the reading matter.
   ========================================================================== */

const NAVY = "#2E3A50";
const BLUSH = "#F1DEDE";
const BLUSH_RULE = "#E3CDCD";
const GREY_BLOCK = "#D7D9DE";
const TEXT = "#414B5C";
const MUTE = "#7A8493";

const PAD_X = 1.2 * CM;
const PAD_TOP = 1.2 * CM;
const PAD_BOTTOM = 1.2 * CM;

/** The blush column, and the gutter between it and the record. */
const ASIDE_W = 251;
const GUTTER = 51;

/** The ruled head is inset from the blush so the blush shows to the left of
 *  it; its left cell then ends exactly on the blush's right edge. */
const BOX_INSET_L = 23;
const BOX_TOP = 28;
const MONOGRAM_COL = ASIDE_W - BOX_INSET_L - 1;
const DIVIDER_COL = 8;
const NAME_PAD_L = 38;
const TAB_H = 30;

/** The ribbon that opens a division in the blush column, laid out left to
 *  right: blush, a white lead-in, the cut, the bar, then the tick that sits
 *  proud of the column. */
const RIBBON_LEAD = 24;
const RIBBON_WHITE = 20;
const RIBBON_CUT = 24;
const RIBBON_GAP = 10;
const RIBBON_TICK = 18;
const RIBBON_H = 28;
/** How far the tick stands out past the blush column, into the gutter. */
const RIBBON_PROUD = 10;

export const ribbonPagePadding = { top: PAD_TOP, bottom: PAD_BOTTOM };

const head = '"Archivo", "Helvetica Neue", Arial, sans-serif';
const sans = '"Lato", "Helvetica Neue", Arial, sans-serif';

const body: CSSProperties = { fontFamily: sans, fontSize: 9.5, lineHeight: 1.6, color: TEXT };

/**
 * The navy ribbon opening a division in the blush column.
 *
 * The cut leading edge is a border triangle rather than a clip path: the
 * exporter's rasteriser draws borders and knows nothing about clip-path, so a
 * clipped shape would come out of the PDF as a plain rectangle.
 */
function Ribbon({ title }: { title: string }) {
    return (
        <div style={{ display: "flex", height: RIBBON_H, marginRight: -RIBBON_PROUD, marginBottom: 13 }}>
            <span style={{ width: RIBBON_LEAD, flex: "none" }} />
            <span style={{ width: RIBBON_WHITE, background: "#ffffff", flex: "none" }} />
            <span style={{ width: RIBBON_CUT, background: "#ffffff", flex: "none" }}>
                <span
                    style={{
                        display: "block",
                        width: 0,
                        height: 0,
                        borderStyle: "solid",
                        borderWidth: `0 0 ${RIBBON_H}px ${RIBBON_CUT}px`,
                        borderColor: `transparent transparent ${NAVY} transparent`,
                    }}
                />
            </span>
            <span
                style={{
                    flex: 1,
                    minWidth: 0,
                    background: NAVY,
                    color: "#ffffff",
                    fontFamily: head,
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    textAlign: "right",
                    lineHeight: `${RIBBON_H}px`,
                    paddingRight: 12,
                }}
            >
                {title}
            </span>
            <span style={{ width: RIBBON_GAP, flex: "none" }} />
            <span style={{ width: RIBBON_TICK, background: NAVY, flex: "none" }} />
        </div>
    );
}

/** A head on the white side: caps over a hairline that starts thick. */
function MainSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section data-block style={{ marginBottom: 20 }}>
            <h2
                style={{
                    fontFamily: head,
                    fontSize: 12.5,
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                    textTransform: "uppercase",
                    color: NAVY,
                    margin: "0 0 6px",
                    lineHeight: 1.2,
                }}
            >
                {title}
            </h2>
            <div style={{ position: "relative", height: 3, marginBottom: 11 }}>
                <span style={{ position: "absolute", left: 0, right: 0, top: 1, height: 1, background: BLUSH_RULE }} />
                <span style={{ position: "absolute", left: 0, top: 0, width: 110, height: 3, background: NAVY }} />
            </div>
            {children}
        </section>
    );
}

function AsideSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section data-block style={{ marginBottom: 24 }}>
            <Ribbon title={title} />
            <div style={{ padding: "0 25px 0 24px" }}>{children}</div>
        </section>
    );
}

function Glyph({ children }: { children: ReactNode }) {
    return (
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
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

const LinkIcon = (
    <Glyph>
        <path d="M6.8 9.2a2.9 2.9 0 0 1 0-4l1.6-1.6a2.9 2.9 0 0 1 4 4l-.8.8" />
        <path d="M9.2 6.8a2.9 2.9 0 0 1 0 4l-1.6 1.6a2.9 2.9 0 0 1-4-4l.8-.8" />
    </Glyph>
);

const PinIcon = (
    <Glyph>
        <path d="M8 14.2s4.7-4.4 4.7-7.7a4.7 4.7 0 1 0-9.4 0c0 3.3 4.7 7.7 4.7 7.7Z" />
        <circle cx="8" cy="6.3" r="1.6" />
    </Glyph>
);

/** A fact set flush right with its badge outboard of it. */
function ContactRow({ icon, text }: { icon: ReactNode; text: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: 8 }}>
            <span style={{ ...body, textAlign: "right", minWidth: 0, wordBreak: "break-word" }}>{text}</span>
            <span
                style={{
                    width: 17,
                    height: 17,
                    borderRadius: "50%",
                    background: NAVY,
                    flex: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {icon}
            </span>
        </div>
    );
}

/**
 * The monogram: a ruled circle cut by a diagonal that runs past it and is
 * stopped by a dot at each end, with an initial in each half.
 *
 * The rule work is one SVG and the letters are set in HTML over it, because
 * the exporter rasterises SVG through an image and would fall back to a system
 * face for any text inside it.
 */
function Monogram({ initials }: { initials: string[] }) {
    const SIZE = 112;
    return (
        <div style={{ position: "relative", width: SIZE, height: SIZE }}>
            <svg width={SIZE} height={SIZE} viewBox="0 0 112 112" fill="none" aria-hidden="true">
                <circle cx="56" cy="56" r="41" stroke={NAVY} strokeWidth="1.4" />
                <line x1="13" y1="99" x2="99" y2="13" stroke={NAVY} strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="12" cy="100" r="3.2" fill={NAVY} />
                <circle cx="100" cy="12" r="3.2" fill={NAVY} />
            </svg>
            <span
                style={{
                    position: "absolute",
                    left: 30,
                    top: 26,
                    width: 28,
                    textAlign: "center",
                    fontFamily: head,
                    fontSize: 23,
                    fontWeight: 700,
                    color: NAVY,
                    lineHeight: 1,
                }}
            >
                {initials[0] ?? ""}
            </span>
            <span
                style={{
                    position: "absolute",
                    left: 54,
                    top: 62,
                    width: 28,
                    textAlign: "center",
                    fontFamily: head,
                    fontSize: 23,
                    fontWeight: 700,
                    color: NAVY,
                    lineHeight: 1,
                }}
            >
                {initials[1] ?? ""}
            </span>
        </div>
    );
}

export function RibbonTemplate({ data, format }: TemplateProps) {
    const { personal, education, experience, skills, projects, certifications, languages, hobbies } = data;
    const page = PAGE[format];

    const initials = (personal.name || "Your Name")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? "");

    const contact = [
        personal.phone && { icon: PhoneIcon, text: personal.phone },
        personal.email && { icon: MailIcon, text: personal.email },
        personal.linkedin && { icon: LinkIcon, text: personal.linkedin },
        personal.github && { icon: LinkIcon, text: personal.github },
        personal.website && { icon: LinkIcon, text: personal.website },
        personal.location && { icon: PinIcon, text: personal.location },
    ].filter(Boolean) as { icon: ReactNode; text: string }[];

    return (
        <div
            style={{
                position: "relative",
                width: page.w,
                padding: `${PAD_TOP}px ${PAD_X}px ${PAD_BOTTOM}px`,
                fontFamily: sans,
                color: TEXT,
                background: "#ffffff",
            }}
        >
            {/* ---- what the page is printed on -------------------------------
                The grey block in the corner and the blush column are laid down
                first and everything else sits on them. The column is drawn to
                the foot of the content rather than to the foot of the aside, so
                it runs behind a second and third page as well, and never stops
                short of the foot of the first. */}
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                <span style={{ position: "absolute", left: 0, top: 0, width: 126, height: 119, background: GREY_BLOCK }} />
                <span
                    style={{
                        position: "absolute",
                        left: PAD_X,
                        top: PAD_TOP,
                        bottom: PAD_BOTTOM,
                        width: ASIDE_W,
                        // Never shorter than the text area of one page, so a
                        // sparse CV still reads as a column and not as a block
                        // that gave up halfway down.
                        minHeight: page.h - PAD_TOP - PAD_BOTTOM,
                        background: BLUSH,
                    }}
                />
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
                {/* ---- the ruled head ---------------------------------------- */}
                <header
                    data-block
                    style={{
                        position: "relative",
                        border: `1px solid ${NAVY}`,
                        marginLeft: BOX_INSET_L,
                        marginTop: BOX_TOP,
                        marginBottom: 42,
                    }}
                >
                    <div style={{ display: "grid", gridTemplateColumns: `${MONOGRAM_COL}px ${DIVIDER_COL}px 1fr` }}>
                        {/* The blush behind this cell is the column itself; the
                            cell only has to hold the mark. */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 0" }}>
                            {/* A portrait when there is one, the monogram when
                                there is not. Painted as a background: the
                                exporter has no object-fit and would stretch a
                                tall photo into the circle. */}
                            {personal.photoBase64 ? (
                                <div
                                    aria-hidden="true"
                                    style={{
                                        width: 112,
                                        height: 112,
                                        borderRadius: "50%",
                                        backgroundImage: `url("${personal.photoBase64}")`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat",
                                    }}
                                />
                            ) : (
                                <Monogram initials={initials} />
                            )}
                        </div>

                        {/* The double rule, with the chevron that carries the
                            eye over to the name. */}
                        <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: 1, top: 0, bottom: 0, width: 1.4, background: NAVY }} />
                            <span style={{ position: "absolute", left: 5.5, top: 0, bottom: 0, width: 1.4, background: NAVY }} />
                            <span
                                style={{
                                    position: "absolute",
                                    left: DIVIDER_COL,
                                    top: "50%",
                                    marginTop: -13,
                                    width: 0,
                                    height: 0,
                                    borderStyle: "solid",
                                    borderWidth: `13px 0 13px 13px`,
                                    borderColor: `transparent transparent transparent ${NAVY}`,
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: `18px 20px 30px ${NAME_PAD_L}px` }}>
                            <div
                                style={{
                                    fontFamily: head,
                                    fontSize: 40,
                                    fontWeight: 700,
                                    letterSpacing: "0em",
                                    textTransform: "uppercase",
                                    color: NAVY,
                                    lineHeight: 1.1,
                                }}
                            >
                                {personal.name || "Your Name"}
                            </div>
                        </div>
                    </div>

                    {/* The trade, in a blush tab centred on the rule that closes
                        the head so that it hangs below it. */}
                    {personal.title && (
                        <div
                            style={{
                                position: "absolute",
                                left: MONOGRAM_COL + DIVIDER_COL + NAME_PAD_L,
                                bottom: -TAB_H / 2,
                                height: TAB_H,
                                maxWidth: `calc(100% - ${MONOGRAM_COL + DIVIDER_COL + NAME_PAD_L + 40}px)`,
                                background: BLUSH,
                                color: NAVY,
                                fontFamily: head,
                                fontSize: 10,
                                fontWeight: 600,
                                letterSpacing: "0.22em",
                                textTransform: "uppercase",
                                lineHeight: `${TAB_H}px`,
                                padding: "0 18px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                            }}
                        >
                            {personal.title}
                        </div>
                    )}
                </header>

                <div style={{ display: "grid", gridTemplateColumns: `${ASIDE_W}px 1fr`, columnGap: GUTTER, alignItems: "start" }}>
                    {/* ---- the blush column ---------------------------------- */}
                    <div>
                        {contact.length > 0 && (
                            <AsideSection title="Contact">
                                {contact.map((item) => (
                                    <ContactRow key={item.text} icon={item.icon} text={item.text} />
                                ))}
                            </AsideSection>
                        )}

                        {education.length > 0 && (
                            <AsideSection title="Education">
                                {education.map((item) => (
                                    <div key={item.id} data-block style={{ textAlign: "right", marginBottom: 14 }}>
                                        <div style={{ ...body, fontWeight: 700, color: NAVY }}>
                                            {joinNonEmpty([item.degree, item.field], " in ") || item.school}
                                        </div>
                                        <div style={body}>{joinNonEmpty([item.school, item.location], " | ")}</div>
                                        <div style={body}>{joinNonEmpty([dateRange(item.dates), item.gpa && `GPA ${item.gpa}`], " · ")}</div>
                                    </div>
                                ))}
                            </AsideSection>
                        )}

                        {skills.length > 0 && (
                            <AsideSection title="Pro skills">
                                {skills.map((item) => (
                                    <div
                                        key={item.id}
                                        style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 9, marginBottom: 6 }}
                                    >
                                        <span style={{ ...body, textAlign: "right" }}>{item.name}</span>
                                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: NAVY, flex: "none" }} />
                                    </div>
                                ))}
                            </AsideSection>
                        )}

                        {languages.length > 0 && (
                            <AsideSection title="Languages">
                                {languages.map((item) => (
                                    <div key={item.id} style={{ ...body, textAlign: "right", marginBottom: 4 }}>
                                        {joinNonEmpty([item.name, item.level], " · ")}
                                    </div>
                                ))}
                            </AsideSection>
                        )}

                        {hobbies.length > 0 && (
                            <AsideSection title="Interests">
                                {hobbies.map((item) => (
                                    <div key={item.id} style={{ ...body, textAlign: "right", marginBottom: 4 }}>
                                        {item.name}
                                    </div>
                                ))}
                            </AsideSection>
                        )}
                    </div>

                    {/* ---- the white column ---------------------------------- */}
                    <div style={{ paddingTop: 4 }}>
                        {personal.summary && (
                            <MainSection title="Professional profile">
                                <p style={{ ...body, textAlign: "justify", margin: 0 }}>{personal.summary}</p>
                            </MainSection>
                        )}

                        {experience.length > 0 && (
                            <MainSection title="Experience">
                                {experience.map((item) => (
                                    <Record
                                        key={item.id}
                                        title={item.position}
                                        place={joinNonEmpty([item.company, item.location], ", ")}
                                        dates={dateRange(item.dates)}
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
                                        title={item.name}
                                        place={joinNonEmpty([item.technologies, item.url], " · ")}
                                        dates={dateRange(item.dates)}
                                        lines={toLines(item.description)}
                                    />
                                ))}
                            </MainSection>
                        )}

                        {certifications.length > 0 && (
                            <MainSection title="Certifications">
                                {certifications.map((item) => (
                                    <Record
                                        key={item.id}
                                        title={item.name}
                                        place={item.issuer}
                                        dates={item.date}
                                        lines={item.url ? [item.url] : []}
                                    />
                                ))}
                            </MainSection>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/** One record: the role, then the house on a thread with the years in a blush
 *  chip at the end of it, then what was done. */
function Record({ title, place, dates, lines }: { title: string; place: string; dates: string; lines: string[] }) {
    return (
        <div data-block style={{ marginBottom: 15 }}>
            <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: NAVY, lineHeight: 1.3 }}>{title}</div>

            {(place || dates) && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "3px 0 6px" }}>
                    {place && <span style={{ ...body, fontStyle: "italic", flex: "none", maxWidth: "62%" }}>{place}</span>}
                    <span style={{ flex: 1, height: 1, background: BLUSH_RULE, minWidth: 12 }} />
                    {dates && (
                        <span
                            style={{
                                background: BLUSH,
                                color: NAVY,
                                fontFamily: sans,
                                fontSize: 8.5,
                                fontStyle: "italic",
                                padding: "2px 8px",
                                whiteSpace: "nowrap",
                                flex: "none",
                            }}
                        >
                            {dates}
                        </span>
                    )}
                </div>
            )}

            {lines.map((line, index) => (
                <div key={index} style={{ display: "flex", gap: 8, marginBottom: 3 }}>
                    <span style={{ width: 3, height: 3, borderRadius: "50%", background: MUTE, flex: "none", marginTop: 7 }} />
                    <span style={{ ...body, flex: 1, minWidth: 0, textAlign: "justify" }}>{line}</span>
                </div>
            ))}
        </div>
    );
}
