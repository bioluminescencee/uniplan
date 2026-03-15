import { useState } from "react";

const COLOURS = [
    "#e07b54",
    "#5b8dd9",
    "#6bbf8e",
    "#d4669a",
    "#c9a84c",
    "#7c63c9",
    "#5bbcbf",
    "#d4836e",
    "#e05c7a",
    "#7cb87c",
    "#c47ab8",
    "#6b9de0",
    "#e0b554",
    "#54b8e0",
    "#b87c6b",
];

export function ProfileMenu({ profile, onUpdate, onSignOut }) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    async function pickColour(colour) {
        setSaving(true);
        try {
            await onUpdate({ color: colour });
        } finally {
            setSaving(false);
        }
    }

    if (!profile) return null;

    return (
        <div style={{ position: "relative" }}>
            {/* Trigger button — avatar circle */}
            <button
                onClick={() => setOpen(v => !v)}
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: profile.color + "33",
                    border: `2px solid ${profile.color}`,
                    color: profile.color,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'DM Mono', monospace",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {profile.avatar}
            </button>

            {/* Dropdown */}
            {open && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setOpen(false)}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 100,
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            top: 40,
                            right: 0,
                            zIndex: 101,
                            background: "var(--bg)",
                            border: "1px solid var(--border)",
                            borderRadius: 14,
                            padding: 16,
                            width: 220,
                            boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
                        }}
                    >
                        {/* Colour picker */}
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "var(--muted)",
                                letterSpacing: "0.06em",
                                marginBottom: 8,
                            }}
                        >
                            COLOUR
                        </div>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(5, 1fr)",
                                gap: 6,
                                marginBottom: 14,
                            }}
                        >
                            {COLOURS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => pickColour(c)}
                                    disabled={saving}
                                    style={{
                                        width: "100%",
                                        aspectRatio: "1",
                                        borderRadius: "50%",
                                        border: "none",
                                        background: c,
                                        cursor: saving ? "default" : "pointer",
                                        outline:
                                            profile.color === c
                                                ? `3px solid ${c}`
                                                : "3px solid transparent",
                                        outlineOffset: 2,
                                        opacity:
                                            saving && profile.color !== c
                                                ? 0.5
                                                : 1,
                                        transition:
                                            "transform 0.1s, opacity 0.15s",
                                        transform:
                                            profile.color === c
                                                ? "scale(1.15)"
                                                : "scale(1)",
                                    }}
                                />
                            ))}
                        </div>

                        {/* Preview */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "8px 10px",
                                background: "var(--input-bg)",
                                borderRadius: 8,
                                marginBottom: 14,
                            }}
                        >
                            <div
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    background: profile.color + "33",
                                    border: `2px solid ${profile.color}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: profile.color,
                                    fontFamily: "'DM Mono', monospace",
                                }}
                            >
                                {profile.avatar}
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: "var(--text)",
                                    }}
                                >
                                    {profile.name}
                                </div>
                                <div
                                    style={{
                                        fontSize: 10,
                                        color: "var(--muted)",
                                        fontFamily: "monospace",
                                    }}
                                >
                                    {profile.color}
                                </div>
                            </div>
                            {saving && (
                                <div
                                    style={{
                                        marginLeft: "auto",
                                        fontSize: 11,
                                        color: "var(--muted)",
                                    }}
                                >
                                    saving…
                                </div>
                            )}
                        </div>

                        {/* Sign out */}
                        <button
                            onClick={() => {
                                setOpen(false);
                                onSignOut();
                            }}
                            style={{
                                width: "100%",
                                padding: "8px 0",
                                background: "var(--input-bg)",
                                border: "1px solid var(--border)",
                                borderRadius: 8,
                                color: "var(--muted)",
                                fontSize: 13,
                                cursor: "pointer",
                                fontFamily: "inherit",
                            }}
                        >
                            Sign out
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
