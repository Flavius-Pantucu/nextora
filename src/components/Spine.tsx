interface SpineProps {
    profileName: string;
    updatedAt: string;
}

/**
 * The bound edge: two punch holes and the volume's name running down the
 * spine, the way a ring-bound manual carries it.
 *
 * The small board has no spread to bind, and forty pixels of decoration is a
 * tenth of a phone's width, so the spine is dropped below `lg`. The volume's
 * name goes on carrying in the header's PROFILE readout.
 */
export function Spine({ profileName, updatedAt }: SpineProps) {
    const stamp = new Date(updatedAt);
    const revision = Number.isNaN(stamp.getTime())
        ? ""
        : `${stamp.getFullYear()}.${String(stamp.getMonth() + 1).padStart(2, "0")}${String(stamp.getDate()).padStart(2, "0")}`;

    return (
        <div className="relative hidden w-10 shrink-0 flex-col items-center justify-between border-r border-rule py-8 lg:flex">
            <Hole />
            <div
                className="rubric select-none whitespace-nowrap"
                style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}
            >
                {profileName}
                {revision && <span className="text-ink-3"> · REV {revision}</span>}
            </div>
            <Hole />
        </div>
    );
}

function Hole() {
    return (
        <span
            aria-hidden
            className="block h-3.5 w-3.5 shrink-0 rounded-full"
            style={{
                background: "var(--board-sunk)",
                boxShadow: "inset 0 2px 3px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.35)",
            }}
        />
    );
}
