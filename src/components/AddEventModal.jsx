import { useState } from "react";
import { DAYS, formatTime } from "../utils";

// ── Add Event Modal ───────────────────────────────────────────────────────────
export function AddEventModal({ friends, onAdd, onClose }) {
  const [form, setForm] = useState({
    user_id: friends[0]?.id || "",
    title: "", day: 0, start: 9, end: 10,
    location: "", type: "class",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    const user = friends.find(f => f.id === form.user_id);
    onAdd({
        title: form.title.trim(),
        type: form.type,
        location: form.location.trim(),
        start: parseInt(form.start),
        end: parseInt(form.end),
        day: parseInt(form.day),
        color: user?.color || "#888",
        group_id: user.group_id,
        user_id: user.id,
    });
    onClose();
  };

  const inp = {
    background: "var(--input-bg)", border: "1px solid var(--border)",
    borderRadius: 7, color: "var(--text)", padding: "7px 10px",
    fontSize: 13, width: "100%", boxSizing: "border-box",
    fontFamily: "inherit",
  };
  const label = { fontSize: 12, color: "var(--muted)", marginBottom: 4, display: "block", fontWeight: 600 };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: "var(--bg)", border: "1px solid var(--border)",
        borderRadius: 16, padding: 24, width: "min(480px,92vw)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: "var(--text)" }}>
          ＋ Add Schedule Event
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={label}>Person</label>
            <select style={inp} value={form.user_id} onChange={e => set("user_id", e.target.value)}>
              {friends.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={label}>Event Title</label>
            <input style={inp} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. COMP2041 Lecture" />
          </div>
          <div>
            <label style={label}>Day</label>
            <select style={inp} value={form.day} onChange={e => set("day", e.target.value)}>
              {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>Type</label>
            <select style={inp} value={form.type} onChange={e => set("type", e.target.value)}>
              {["class", "club", "personal", "work"].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={label}>Start Time</label>
            <select style={inp} value={form.start} onChange={e => set("start", e.target.value)}>
              {Array.from({ length: 15 }, (_, i) => i + 7).map(h => (
                <option key={h} value={h}>{formatTime(h)}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={label}>End Time</label>
            <select style={inp} value={form.end} onChange={e => set("end", e.target.value)}>
              {Array.from({ length: 15 }, (_, i) => i + 8).map(h => (
                <option key={h} value={h}>{formatTime(h)}</option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={label}>Location</label>
            <input style={inp} value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Roundhouse, Kensington" />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={handleSubmit} style={{
            flex: 1, background: "#5b8dd9", color: "#fff", border: "none",
            borderRadius: 8, padding: "9px 0", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>Add Event</button>
          <button onClick={onClose} style={{
            flex: 1, background: "var(--input-bg)", color: "var(--text)",
            border: "1px solid var(--border)", borderRadius: 8, padding: "9px 0",
            fontSize: 14, cursor: "pointer",
          }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}