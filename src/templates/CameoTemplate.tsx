import type { CSSProperties, ReactNode } from "react";
import type { TemplateProps } from "./paper";
import { PAGE, SKILL_SCORE, dateRange, entryBullets, joinNonEmpty, toLines } from "./paper";

/* =============================================================================
   Cameo — the charcoal column with a domed cradle.

   The reference is an agency one-pager: a charcoal column stood off the left
   edge of the sheet, broken once by a white band. Both charcoal blocks close
   on a shallow dome rather than a straight edge, and the portrait sits in the
   upper dome like a cameo in its setting. The white band between them carries
   the contact facts; everything else about the person stays on the charcoal.

   The record runs down the white side in a single measure, each division
   opened by a filled disc badge and a heavy cap head. Nothing is ruled — the
   badges do the work a rule would normally do.

   Archivo for the heads, Lato for the reading matter.
   ========================================================================== */

const INK = "#2C2C2C";
const TITLE_INK = "#232323";
const BODY_INK = "#767676";
const DARK_BODY = "#C9C9C9";
const DARK_MUTE = "#9A9A9A";
const TRACK = "#D4D4D4";

/** The sheet's own margins. The charcoal column stands only just off the top
 *  and runs off the foot of the page, so the top margin is thin and the whole
 *  frame is deliberately asymmetric — wide to the left of the column, narrow
 *  to the right of the record. */
const PAD_L = 68;
const PAD_R = 40;
const PAD_TOP = 30;
const PAD_BOTTOM = 40;

const ASIDE_W = 262;
const GUTTER = 36;

/** Half-height of the ellipse that closes a charcoal block: the dome's depth
 *  where it is deepest, at the centre of the column. */
const DOME = 22;

/** The portrait, set to leave an even margin of charcoal either side. */
const PHOTO = ASIDE_W - 40;

/** The record starts lower than the charcoal, so the name sits above the first
 *  head rather than level with it. */
const MAIN_DROP = 46;

/** The portrait is cradled by the dome rather than sitting clear above it, so
 *  the charcoal left under it is a hair, not a margin. */
const PHOTO_DROP = 4;

/** The white band's own margins, measured from the charcoal's straight edges —
 *  the domes eat DOME of each, which is why both are set past it. */
const BAND_TOP = DOME + 42;
const BAND_BOTTOM = DOME + 38;

export const cameoPagePadding = { top: PAD_TOP, bottom: PAD_BOTTOM };

/** The charcoal column is the sheet's own ground rather than a block drawn by
 *  this component, so it runs the full height of every page instead of
 *  stopping where the record happens to stop. What is drawn here is the white
 *  band cut out of it, and the gap above it on the first page. */
export const cameoSheetBackground =
    `linear-gradient(to right, #ffffff 0px, #ffffff ${PAD_L}px, ${INK} ${PAD_L}px, ${INK} ${PAD_L + ASIDE_W}px, #ffffff ${PAD_L + ASIDE_W}px, #ffffff 100%)`;

const head = '"Archivo", "Helvetica Neue", Arial, sans-serif';
const sans = '"Lato", "Helvetica Neue", Arial, sans-serif';

const body: CSSProperties = { fontFamily: sans, fontSize: 11, lineHeight: 1.62, color: BODY_INK };

/* -----------------------------------------------------------------------------
   Badges and glyphs.

   Every head is opened by a filled disc with a glyph in it — charcoal on the
   white side, white on the charcoal side, the disc and the glyph trading
   colours as the ground changes. The glyphs are drawn rather than set: a
   dingbat would depend on whatever the fallback face happens to carry.
   -------------------------------------------------------------------------- */

function Glyph({ stroke, size = 12, children }: { stroke: string; size?: number; children: ReactNode }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

const personGlyph = (
    <>
        <circle cx="8" cy="5.4" r="2.7" />
        <path d="M2.9 13.4a5.1 5.1 0 0 1 10.2 0" />
    </>
);

const caseGlyph = (
    <>
        <path d="M2.4 5.6h11.2v7.6H2.4z" />
        <path d="M6 5.6V3.9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.7" />
        <path d="M2.4 9h11.2" />
    </>
);

const capGlyph = (
    <>
        <path d="M8 3 14.2 6 8 9 1.8 6 8 3Z" />
        <path d="M4.4 7.3v3.6c0 .9 1.6 1.8 3.6 1.8s3.6-.9 3.6-1.8V7.3" />
    </>
);

const starGlyph = (
    <>
        <path d="M8 2.6 9.7 6l3.8.5-2.8 2.6.7 3.7L8 11.1l-3.4 1.7.7-3.7L2.5 6.5 6.3 6 8 2.6Z" />
    </>
);

const globeGlyph = (
    <>
        <circle cx="8" cy="8" r="5.6" />
        <path d="M2.4 8h11.2" />
        <path d="M8 2.4c1.5 1.6 2.3 3.5 2.3 5.6S9.5 12 8 13.6C6.5 12 5.7 10.1 5.7 8s.8-4 2.3-5.6Z" />
    </>
);

const heartGlyph = (
    <>
        <path d="M8 13.2S2.6 10 2.6 6.3a2.9 2.9 0 0 1 5.4-1.5 2.9 2.9 0 0 1 5.4 1.5C13.4 10 8 13.2 8 13.2Z" />
    </>
);

const folderGlyph = (
    <>
        <path d="M2.4 4.6h4l1.3 1.7h5.9v7H2.4z" />
    </>
);

const sealGlyph = (
    <>
        <circle cx="8" cy="6.2" r="3.6" />
        <path d="M5.9 9.3 5.2 13.4 8 12l2.8 1.4-.7-4.1" />
    </>
);

const phoneGlyph = (
    <path d="M4.3 2.4h2.2l1 2.6-1.3 1a8.4 8.4 0 0 0 3.8 3.8l1-1.3 2.6 1v2.2a1.1 1.1 0 0 1-1.2 1.1A11 11 0 0 1 3.2 3.6a1.1 1.1 0 0 1 1.1-1.2Z" />
);

const mailGlyph = (
    <>
        <path d="M2.4 4.3h11.2v7.4H2.4z" />
        <path d="m2.7 4.7 5.3 3.9 5.3-3.9" />
    </>
);

const pinGlyph = (
    <>
        <path d="M8 14.2s4.7-4.4 4.7-7.7a4.7 4.7 0 1 0-9.4 0c0 3.3 4.7 7.7 4.7 7.7Z" />
        <circle cx="8" cy="6.3" r="1.5" />
    </>
);

const BADGE = 22;

/** The disc that opens a head. `light` is the disc's own colour, `dark` the
 *  glyph's — inverted on the charcoal so the badge reads the same either way. */
function Badge({ glyph, disc, ink }: { glyph: ReactNode; disc: string; ink: string }) {
    return (
        <span
            style={{
                width: BADGE,
                height: BADGE,
                borderRadius: "50%",
                background: disc,
                flex: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Glyph stroke={ink}>{glyph}</Glyph>
        </span>
    );
}

/** A head: the badge, then heavy caps. `onDark` swaps both grounds. */
function Head({ glyph, title, onDark = false }: { glyph: ReactNode; title: string; onDark?: boolean }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Badge glyph={glyph} disc={onDark ? "#ffffff" : INK} ink={onDark ? INK : "#ffffff"} />
            <h2
                style={{
                    fontFamily: head,
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: onDark ? "#ffffff" : TITLE_INK,
                    lineHeight: 1.2,
                    margin: 0,
                }}
            >
                {title}
            </h2>
        </div>
    );
}

function MainSection({ glyph, title, children }: { glyph: ReactNode; title: string; children: ReactNode }) {
    return (
        <section data-block style={{ marginBottom: 24 }}>
            <Head glyph={glyph} title={title} />
            {children}
        </section>
    );
}

/**
 * A dome closing one end of the white band.
 *
 * An ellipse as wide as the column and `2 × DOME` tall, centred on the band's
 * edge so that exactly half of it reaches into the white — the charcoal above
 * and below the band bulging into it. Drawn as an oval rather than as an
 * elliptical `border-radius` because the exporter's rasteriser is dependable
 * about a plain 50% radius and not about the two-value form.
 */
function Dome({ edge }: { edge: "top" | "bottom" }) {
    return (
        <span
            aria-hidden="true"
            style={{
                position: "absolute",
                left: 0,
                right: 0,
                height: DOME * 2,
                background: INK,
                borderRadius: "50%",
                ...(edge === "top" ? { top: -DOME } : { bottom: -DOME }),
            }}
        />
    );
}

/** A record in the charcoal column: a heavy line, then quieter ones under it. */
function DarkEntry({ title, lines }: { title: string; lines: string[] }) {
    return (
        <div data-block style={{ marginBottom: 13 }}>
            <div
                style={{
                    fontFamily: head,
                    fontSize: 11.5,
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                    textTransform: "uppercase",
                    color: "#ffffff",
                    lineHeight: 1.35,
                }}
            >
                {title}
            </div>
            {lines.filter(Boolean).map((line, index) => (
                <div
                    key={index}
                    style={{
                        fontFamily: sans,
                        fontSize: 9.5,
                        lineHeight: 1.5,
                        letterSpacing: "0.04em",
                        color: index === 0 ? DARK_BODY : DARK_MUTE,
                        textTransform: index === 0 ? "uppercase" : "none",
                        wordBreak: "break-word",
                    }}
                >
                    {line}
                </div>
            ))}
        </div>
    );
}

/** A fact in the white band: a small glyph, then the value. */
function ContactRow({ glyph, text }: { glyph: ReactNode; text: string }) {
    return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 7 }}>
            {/* Laid out as a flex box, not left inline: an inline SVG sits on
                the text baseline and would hang a few pixels below its line. */}
            <span style={{ flex: "none", display: "flex", marginTop: 3 }}>
                <Glyph stroke={INK} size={10.5}>
                    {glyph}
                </Glyph>
            </span>
            <span style={{ fontFamily: sans, fontSize: 10.5, lineHeight: 1.5, color: "#4A4A4A", minWidth: 0, wordBreak: "break-word" }}>
                {text}
            </span>
        </div>
    );
}

/** A record on the white side: role and years on one line, the house in
 *  italics under them, then what was done. */
function Record({ title, place, dates, lines }: { title: string; place: string; dates: string; lines: string[] }) {
    return (
        <div data-block style={{ marginBottom: 15 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <span
                    style={{
                        fontFamily: head,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.03em",
                        textTransform: "uppercase",
                        color: TITLE_INK,
                        lineHeight: 1.3,
                        flex: 1,
                        minWidth: 0,
                    }}
                >
                    {title}
                </span>
                {dates && (
                    <span
                        style={{
                            fontFamily: head,
                            fontSize: 10,
                            fontWeight: 600,
                            color: TITLE_INK,
                            whiteSpace: "nowrap",
                            flex: "none",
                        }}
                    >
                        {dates}
                    </span>
                )}
            </div>
            {place && <div style={{ ...body, fontSize: 10.5, fontStyle: "italic", margin: "1px 0 3px" }}>{place}</div>}
            {lines.map((line, index) => (
                <p key={index} style={{ ...body, textAlign: "justify", margin: index === 0 ? 0 : "3px 0 0" }}>
                    {line}
                </p>
            ))}
        </div>
    );
}

/** A skill: the name, then a meter run out to the right of it. */
function SkillMeter({ label, score }: { label: string; score: number }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ ...body, fontSize: 10, flex: 1, minWidth: 0, wordBreak: "break-word" }}>{label}</span>
            <span style={{ position: "relative", width: 78, height: 5, background: TRACK, flex: "none" }}>
                <span
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${Math.round((score / 6) * 100)}%`,
                        background: INK,
                    }}
                />
            </span>
        </div>
    );
}

/** A listed item: a disc, then the value in caps. */
function DotItem({ label }: { label: string }) {
    return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 5 }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: INK, flex: "none", marginTop: 6 }} />
            <span
                style={{
                    fontFamily: sans,
                    fontSize: 10,
                    lineHeight: 1.5,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "#4A4A4A",
                    minWidth: 0,
                    wordBreak: "break-word",
                }}
            >
                {label}
            </span>
        </div>
    );
}

export function CameoTemplate({ data, format }: TemplateProps) {
    const { personal, education, experience, skills, projects, certifications, languages, hobbies } = data;
    const page = PAGE[format];

    const contact = [
        personal.phone && { glyph: phoneGlyph, text: personal.phone },
        personal.email && { glyph: mailGlyph, text: personal.email },
        personal.website && { glyph: globeGlyph, text: personal.website },
        personal.linkedin && { glyph: globeGlyph, text: personal.linkedin },
        personal.github && { glyph: globeGlyph, text: personal.github },
        personal.location && { glyph: pinGlyph, text: personal.location },
    ].filter(Boolean) as { glyph: ReactNode; text: string }[];

    /* The two divisions that stand on the lower charcoal block. Built as a list
       so the block holds whichever of them this profile actually fills in. */
    const darkSections = [
        education.length > 0 && {
            title: "Education",
            glyph: capGlyph,
            body: education.map((item) => (
                <DarkEntry
                    key={item.id}
                    title={item.school || joinNonEmpty([item.degree, item.field], " in ")}
                    lines={[
                        joinNonEmpty([item.degree, item.field], " in "),
                        joinNonEmpty([dateRange(item.dates), item.location, item.gpa && `GPA ${item.gpa}`], " · "),
                    ]}
                />
            )),
        },
        certifications.length > 0 && {
            title: "Certificates",
            glyph: sealGlyph,
            body: certifications.map((item) => (
                <DarkEntry key={item.id} title={item.name} lines={[item.issuer, item.date, item.url ?? ""]} />
            )),
        },
    ].filter(Boolean) as { title: string; glyph: ReactNode; body: ReactNode }[];

    return (
        <div
            style={{
                width: page.w,
                padding: `${PAD_TOP}px ${PAD_R}px ${PAD_BOTTOM}px ${PAD_L}px`,
                fontFamily: sans,
                color: BODY_INK,
                // Deliberately transparent: the charcoal column is painted by
                // the sheet underneath, and a white ground here would hide it.
            }}
        >
            {/* The two columns. Neither has to reach the foot of the sheet:
                the charcoal is the sheet's own ground, so the column is there
                whether this profile fills it or not. */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `${ASIDE_W}px 1fr`,
                    columnGap: GUTTER,
                    alignItems: "start",
                }}
            >
                {/* ---- the charcoal column ---------------------------------- */}
                <div style={{ position: "relative" }}>
                    {/* The column stands off the head of the first page. The
                        ground runs to the sheet's edge, so the gap is painted
                        back in over it rather than left by a margin. */}
                    <span
                        aria-hidden="true"
                        style={{ position: "absolute", left: 0, right: 0, top: -PAD_TOP, height: PAD_TOP, background: "#ffffff" }}
                    />

                    {/* The name, the trade, and the portrait cradled in the
                        dome that closes this end of the charcoal. */}
                    <div
                        style={{
                            // Opaque charcoal, and above the band: the band's
                            // domes are whole ovals, half of each reaching out
                            // past the band's edge into the column. Charcoal on
                            // charcoal, that half is meant to be invisible —
                            // but only something opaque can hide it, and the
                            // ground here belongs to the sheet, not to this
                            // block. Left transparent, the upper dome would cut
                            // an arc off the foot of the portrait.
                            position: "relative",
                            zIndex: 1,
                            background: INK,
                            padding: `30px 20px ${PHOTO_DROP}px`,
                        }}
                    >
                        <div
                            style={{
                                fontFamily: head,
                                fontSize: 27,
                                fontWeight: 700,
                                letterSpacing: "0.02em",
                                textTransform: "uppercase",
                                color: "#ffffff",
                                lineHeight: 1.12,
                                textAlign: "center",
                            }}
                        >
                            {personal.name || "Your Name"}
                        </div>

                        {personal.title && (
                            <div
                                style={{
                                    fontFamily: head,
                                    fontSize: 11,
                                    fontWeight: 500,
                                    letterSpacing: "0.15em",
                                    textTransform: "uppercase",
                                    color: DARK_MUTE,
                                    lineHeight: 1.4,
                                    textAlign: "center",
                                    marginTop: 7,
                                }}
                            >
                                {personal.title}
                            </div>
                        )}

                        {/* Painted as a background rather than set as an image:
                            the exporter has no object-fit and would stretch a
                            tall photograph into the circle. The ring is a
                            border, which it does draw. */}
                        <div
                            aria-hidden="true"
                            style={{
                                width: PHOTO,
                                height: PHOTO,
                                margin: "22px auto 0",
                                borderRadius: "50%",
                                border: "3px solid #ffffff",
                                background: personal.photoBase64 ? undefined : "#4A4A4A",
                                backgroundImage: personal.photoBase64 ? `url("${personal.photoBase64}")` : undefined,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                            }}
                        />
                    </div>

                    {/* ---- the white band cut out of the column ------------- */}
                    {contact.length > 0 && (
                        <div
                            data-block
                            style={{
                                position: "relative",
                                background: "#ffffff",
                                padding: `${BAND_TOP}px 12px ${BAND_BOTTOM}px 4px`,
                            }}
                        >
                            <Dome edge="top" />
                            <Dome edge="bottom" />

                            <div style={{ position: "relative" }}>
                                <Head glyph={personGlyph} title="Contact me" />
                                <div style={{ paddingLeft: BADGE + 10 }}>
                                    {contact.map((item) => (
                                        <ContactRow key={item.text} glyph={item.glyph} text={item.text} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ---- what stands below the band ----------------------- */}
                    <div style={{ position: "relative", zIndex: 1, background: INK, padding: "16px 24px 0" }}>
                        {darkSections.map((section) => (
                            <section data-block key={section.title} style={{ marginBottom: 22 }}>
                                <Head glyph={section.glyph} title={section.title} onDark />
                                {section.body}
                            </section>
                        ))}
                    </div>
                </div>

                {/* ---- the record ------------------------------------------- */}
                <div style={{ paddingTop: MAIN_DROP }}>
                    {personal.summary && (
                        <MainSection glyph={personGlyph} title="About me">
                            <p style={{ ...body, textAlign: "justify", margin: 0 }}>{personal.summary}</p>
                        </MainSection>
                    )}

                    {experience.length > 0 && (
                        <MainSection glyph={caseGlyph} title="Job experience">
                            {experience.map((item) => (
                                <Record
                                    key={item.id}
                                    title={item.position}
                                    place={joinNonEmpty([item.company, item.location], " / ")}
                                    dates={dateRange(item.dates)}
                                    lines={entryBullets(item)}
                                />
                            ))}
                        </MainSection>
                    )}

                    {projects.length > 0 && (
                        <MainSection glyph={folderGlyph} title="Projects">
                            {projects.map((item) => (
                                <Record
                                    key={item.id}
                                    title={item.name}
                                    place={joinNonEmpty([item.technologies, item.url], " / ")}
                                    dates={dateRange(item.dates)}
                                    lines={toLines(item.description)}
                                />
                            ))}
                        </MainSection>
                    )}

                    {skills.length > 0 && (
                        <MainSection glyph={starGlyph} title="Skills">
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 26, rowGap: 9 }}>
                                {skills.map((item) => (
                                    <SkillMeter key={item.id} label={item.name} score={SKILL_SCORE[item.level]} />
                                ))}
                            </div>
                        </MainSection>
                    )}

                    {/* The two short lists stand side by side under the record,
                        as the reference sets them. Either one alone simply
                        takes its own half and leaves the other empty. */}
                    {(languages.length > 0 || hobbies.length > 0) && (
                        <div data-block style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 26 }}>
                            <div>
                                {languages.length > 0 && (
                                    <MainSection glyph={globeGlyph} title="Language">
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 14 }}>
                                            {languages.map((item) => (
                                                <DotItem key={item.id} label={item.name} />
                                            ))}
                                        </div>
                                    </MainSection>
                                )}
                            </div>
                            <div>
                                {hobbies.length > 0 && (
                                    <MainSection glyph={heartGlyph} title="Hobbies">
                                        {hobbies.map((item) => (
                                            <DotItem key={item.id} label={item.name} />
                                        ))}
                                    </MainSection>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
