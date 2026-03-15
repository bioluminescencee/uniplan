import { Avatar } from "./Avatar";
import { DAYS, formatTime } from "../utils";
import { useState } from "react";

// ── RSVP Panel ────────────────────────────────────────────────────────────────
export function RSVPPanel({ activity, friends, onRSVP, onClose }) {
  const [rsvps, setRsvps] = useState(activity.rsvps || {});
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: "var(--bg)", border: "1px solid var(--border)",
        borderRadius: 16, padding: 24, width: "min(420px, 92vw)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 28, textAlign: "center", marginBottom: 4 }}>{activity.emoji}</div>
        <div style={{ fontWeight: 700, fontSize: 16, textAlign: "center", color: "var(--text)", marginBottom: 4 }}>{activity.title}</div>
        <div style={{ fontSize: 13, textAlign: "center", color: "var(--muted)", marginBottom: 20 }}>
          {DAYS[activity.day]} · {formatTime(activity.start)} – {formatTime(activity.end)} · 📍 {activity.location}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 10, letterSpacing: "0.06em" }}>
          WHO'S COMING?
        </div>
        {friends.map(f => {
          // const rsvp = activity.rsvps?.[f.id];
          return (
            <div key={f.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 0", borderBottom: "1px solid var(--border)",
            }}>
              <Avatar user={f} size={32} />
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{f.name}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => {onRSVP(activity.id, f.id, "yes"); setRsvps(prev => ({ ...prev, [f.id]: "yes" }));}} style={{
                  padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
                  background: rsvps[f.id] === "yes" ? "#6bbf8e" : "var(--input-bg)",
                  color: rsvps[f.id] === "yes" ? "#fff" : "var(--muted)",
                }}>✓ Yes</button>
                <button onClick={() => {onRSVP(activity.id, f.id, "no"); setRsvps(prev => ({ ...prev, [f.id]: "no" }));}} style={{
                  padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
                  background: rsvps[f.id] === "no" ? "#d4836e" : "var(--input-bg)",
                  color: rsvps[f.id] === "no" ? "#fff" : "var(--muted)",
                }}>✗ No</button>
              </div>
            </div>
          );
        })}
        <button onClick={onClose} style={{
          marginTop: 16, width: "100%", background: "var(--input-bg)",
          border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8,
          padding: "9px 0", fontSize: 14, cursor: "pointer",
        }}>Done</button>
      </div>
    </div>
  );
}