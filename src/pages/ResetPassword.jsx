import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [done, setDone] = useState(false);
    const [error, setError] = useState(null);

    // Supabase puts the session in the URL hash on redirect —
    // the client lib picks it up automatically via onAuthStateChange.
    // We just need to call updateUser once they submit.
    const handle = async () => {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) setError(error.message);
        else setDone(true);
    };

    if (done)
        return (
            <div
                style={{ padding: 40, color: "#6bbf8e", fontFamily: "inherit" }}
            >
                Password updated.{" "}
                <a href="/" style={{ color: "#5b8dd9" }}>
                    Go to app →
                </a>
            </div>
        );

    return (
        <div
            style={{
                padding: 40,
                fontFamily: "'DM Sans', sans-serif",
                color: "#e8e6e1",
            }}
        >
            <h2 style={{ marginBottom: 16 }}>Set new password</h2>
            <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="New password"
                style={{
                    display: "block",
                    marginBottom: 12,
                    padding: "10px 12px",
                    background: "#1e1e20",
                    border: "1px solid #2a2826",
                    borderRadius: 8,
                    color: "#e8e6e1",
                    fontSize: 14,
                    width: 320,
                }}
            />
            {error && (
                <div style={{ color: "#d4836e", marginBottom: 12 }}>
                    {error}
                </div>
            )}
            <button
                onClick={handle}
                style={{
                    padding: "10px 24px",
                    background: "#5b8dd9",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 14,
                }}
            >
                Update password
            </button>
        </div>
    );
}
