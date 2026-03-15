import { useState } from "react";
import { DAYS, formatTime, getBusyness, getBusyPeople, getFreePeople, HOURS } from "../utils";
import { Avatar } from "./Avatar";

// ── Plan Activity Modal ───────────────────────────────────────────────────────
export function PlanActivityModal({ friends, events, suggestions, onPlan, onClose }) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [custom, setCustom] = useState({ title: "", location: "", duration: 2, emoji: "🎉" });
  const [planned, setPlanned] = useState({ day: null, start: null });
  const [useCustom, setUseCustom] = useState(false);

  const activity = useCustom ? custom : selected;

  const getBestSlots = () => {
    const slots = [];
    for (let d = 0; d < 7; d++) {
      for (let h = 8; h < 22; h++) {
        const dur = activity?.duration || 2;
        if (h + dur > 22) continue;
        let maxBusy = 0;
        for (let offset = 0; offset < dur; offset++) {
          const ratio = getBusyness(events, d, h + offset, friends);
          maxBusy = Math.max(maxBusy, ratio);
        }
        if (maxBusy < 0.4) {
          const free = getFreePeople(events, d, h, friends);
          slots.push({ day: d, start: h, freePct: free.length / friends.length, freeCount: free.length, maxBusy });
        }
      }
    }
    return slots.sort((a, b) => b.freePct - a.freePct).slice(0, 5);
  };

  const inp = {
    background: "var(--input-bg)", border: "1px solid var(--border)",
    borderRadius: 7, color: "var(--text)", padding: "7px 10px",
    fontSize: 13, width: "100%", boxSizing: "border-box", fontFamily: "inherit",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: "var(--bg)", border: "1px solid var(--border)",
        borderRadius: 16, padding: 24, width: "min(560px,92vw)", maxHeight: "85vh",
        overflowY: "auto",
      }} onClick={e => e.stopPropagation()}>
        {/* Step indicators */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "center" }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: step >= s ? "#5b8dd9" : "var(--input-bg)",
                border: `2px solid ${step >= s ? "#5b8dd9" : "var(--border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
                color: step >= s ? "#fff" : "var(--muted)",
              }}>{s}</div>
              {s < 3 && <div style={{ width: 30, height: 2, background: step > s ? "#5b8dd9" : "var(--border)" }} />}
            </div>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
            {step === 1 ? "Choose Activity" : step === 2 ? "Pick Time Slot" : "Confirm & Add"}
          </span>
        </div>

        {/* Step 1: pick activity */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>
              What do you want to do?
            </div>
            {/* Suggestions */}
            {["external", "uni"].map(cat => (
              <div key={cat} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.07em", marginBottom: 8 }}>
                  {cat === "external" ? "🌆 AROUND THE CITY" : "🏛 UNI CLUBS & EVENTS"}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {suggestions.filter(s => s.category === cat).map(s => (
                    <button key={s.id} onClick={() => { setSelected(s); setUseCustom(false); }} style={{
                      background: selected?.id === s.id && !useCustom ? "#5b8dd922" : "var(--input-bg)",
                      border: `1.5px solid ${selected?.id === s.id && !useCustom ? "#5b8dd9" : "var(--border)"}`,
                      borderRadius: 10, padding: "10px 12px", cursor: "pointer", textAlign: "left",
                    }}>
                      <div style={{ fontSize: 18, marginBottom: 3 }}>{s.emoji}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{s.title}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>📍 {s.location}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>⏱ {s.duration}h</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {/* Custom */}
            <div style={{
              border: `1.5px solid ${useCustom ? "#5b8dd9" : "var(--border)"}`,
              borderRadius: 10, padding: 14, marginTop: 6,
              background: useCustom ? "#5b8dd911" : "var(--input-bg)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: useCustom ? 12 : 0 }}>
                <span style={{ fontSize: 16 }}>✏️</span>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>Custom Activity</div>
                <button onClick={() => setUseCustom(v => !v)} style={{
                  marginLeft: "auto", background: "none", border: "none",
                  fontSize: 12, color: "#5b8dd9", cursor: "pointer", fontWeight: 600,
                }}>{useCustom ? "Collapse" : "Add custom →"}</button>
              </div>
              {useCustom && (
                <div style={{ display: "grid", gap: 10 }}>
                  <input style={inp} placeholder="Activity name" value={custom.title} onChange={e => setCustom(c => ({ ...c, title: e.target.value }))} />
                  <input style={inp} placeholder="Location" value={custom.location} onChange={e => setCustom(c => ({ ...c, location: e.target.value }))} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <input style={{ ...inp, width: "auto", flex: 1 }} placeholder="Emoji" value={custom.emoji} onChange={e => setCustom(c => ({ ...c, emoji: e.target.value }))} maxLength={2} />
                    <select style={{ ...inp, flex: 2 }} value={custom.duration} onChange={e => setCustom(c => ({ ...c, duration: parseInt(e.target.value) }))}>
                      {[1,2,3,4,5,6].map(d => <option key={d} value={d}>{d}h</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => activity && setStep(2)}
              disabled={!activity || (useCustom && !custom.title)}
              style={{
                width: "100%", marginTop: 18,
                background: (activity && (!useCustom || custom.title)) ? "#5b8dd9" : "var(--border)",
                color: (activity && (!useCustom || custom.title)) ? "#fff" : "var(--muted)",
                border: "none", borderRadius: 8, padding: "9px 0",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>Next: Pick Time Slot →</button>
          </div>
        )}

        {/* Step 2: best time slots */}
        {step === 2 && activity && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
              {activity.emoji || "🎉"} {activity.title}
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
              Best times when most friends are free ({activity.duration || 2}h block)
            </div>
            {getBestSlots().map((slot, i) => {
              const free = getFreePeople(events, slot.day, slot.start, friends);
              const isSelected = planned.day === slot.day && planned.start === slot.start;
              return (
                <button key={i} onClick={() => setPlanned({ day: slot.day, start: slot.start })} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  width: "100%", textAlign: "left",
                  background: isSelected ? "#5b8dd922" : "var(--input-bg)",
                  border: `1.5px solid ${isSelected ? "#5b8dd9" : "var(--border)"}`,
                  borderRadius: 10, padding: "12px 14px", cursor: "pointer", marginBottom: 8,
                }}>
                  <div style={{
                    background: isSelected ? "#5b8dd9" : "var(--border)",
                    color: isSelected ? "#fff" : "var(--muted)",
                    borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>
                    {DAYS[slot.day]} {formatTime(slot.start)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                      {free.length}/{friends.length} friends free
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                      {free.map(f => (
                        <span key={f.id} style={{
                          fontSize: 10, background: f.color + "22", color: f.color,
                          border: `1px solid ${f.color}44`, borderRadius: 4, padding: "1px 6px", fontWeight: 600,
                        }}>{f.name}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 22, opacity: 1 - slot.maxBusy,
                    filter: isSelected ? "none" : "grayscale(0.5)",
                  }}>
                    {Math.round(slot.freePct * 100)}%
                  </div>
                </button>
              );
            })}
            {/* Manual override */}
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 12, marginBottom: 8, fontWeight: 600 }}>
              OR pick manually:
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <select style={{ ...inp, flex: 1 }} value={planned.day ?? ""} onChange={e => setPlanned(p => ({ ...p, day: parseInt(e.target.value) }))}>
                <option value="">Day</option>
                {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
              </select>
              <select style={{ ...inp, flex: 1 }} value={planned.start ?? ""} onChange={e => setPlanned(p => ({ ...p, start: parseInt(e.target.value) }))}>
                <option value="">Time</option>
                {HOURS.map(h => <option key={h} value={h}>{formatTime(h)}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button onClick={() => setStep(1)} style={{
                flex: 1, background: "var(--input-bg)", color: "var(--text)",
                border: "1px solid var(--border)", borderRadius: 8, padding: "9px 0", fontSize: 14, cursor: "pointer",
              }}>← Back</button>
              <button
                onClick={() => planned.day !== null && planned.start !== null && setStep(3)}
                disabled={planned.day === null || planned.start === null}
                style={{
                  flex: 2,
                  background: planned.day !== null ? "#5b8dd9" : "var(--border)",
                  color: planned.day !== null ? "#fff" : "var(--muted)",
                  border: "none", borderRadius: 8, padding: "9px 0", fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}>Next: Confirm →</button>
            </div>
          </div>
        )}

        {/* Step 3: confirm */}
        {step === 3 && activity && planned.day !== null && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
              Review & Schedule
            </div>
            <div style={{
              background: "var(--input-bg)", border: "1px solid var(--border)",
              borderRadius: 12, padding: 16, marginBottom: 16,
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{activity.emoji || "🎉"}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{activity.title}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>📍 {activity.location}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
                📅 {DAYS}  {formatTime(planned.start)} – {formatTime(planned.start + (activity.duration || 2))}
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8, fontWeight: 600 }}>
              Friends availability at this time:
            </div>
            {friends.map(f => {
              const busy = getBusyPeople(events, planned.day, planned.start, [f]);
              const isBusy = busy.length > 0;
              return (
                <div key={f.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 0", borderBottom: "1px solid var(--border)",
                }}>
                  <Avatar user={f} size={28} />
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{f.name}</div>
                  {isBusy ? (
                    <span style={{ fontSize: 11, color: "#d4836e", background: "#d4836e22", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>
                      Busy: {busy[0]?.event?.title}
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: "#6bbf8e", background: "#6bbf8e22", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>
                      ✓ Free
                    </span>
                  )}
                </div>
              );
            })}
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button onClick={() => setStep(2)} style={{
                flex: 1, background: "var(--input-bg)", color: "var(--text)",
                border: "1px solid var(--border)", borderRadius: 8, padding: "9px 0", fontSize: 14, cursor: "pointer",
              }}>← Back</button>
              <button onClick={() => {
                onPlan({
                  title: activity.title,
                  location: activity.location,
                  emoji: activity.emoji || "🎉",
                  day: planned.day,
                  start: planned.start,
                  end: planned.start + (activity.duration || 2),
                  category: activity.category || "custom",
                });
                onClose();
              }} style={{
                flex: 2, background: "#6bbf8e", color: "#fff",
                border: "none", borderRadius: 8, padding: "9px 0",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>✓ Schedule Activity</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}