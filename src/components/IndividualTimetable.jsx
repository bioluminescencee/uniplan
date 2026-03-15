import { Avatar } from "./Avatar";
import { EventBlock } from "./EventBlock";
import { DAYS, formatTime, HOURS } from "../utils";

// ── Individual Timetable View ─────────────────────────────────────────────────
export function IndividualTimetable({ friend, events, onClose }) {
  const myEvents = events.filter(e => e.user_id === friend.id);
  const SLOT = 52;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: "var(--bg)", border: "1px solid var(--border)",
        borderRadius: 16, width: "min(860px,95vw)", maxHeight: "85vh",
        overflow: "hidden", display: "flex", flexDirection: "column",
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 20px", borderBottom: "1px solid var(--border)",
          background: friend.color + "11",
        }}>
          <Avatar user={friend} size={42} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: "var(--text)" }}>{friend.name}'s Schedule</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{myEvents.length} events this week</div>
          </div>
          <button onClick={onClose} style={{
            marginLeft: "auto", background: "none", border: "none",
            fontSize: 20, cursor: "pointer", color: "var(--muted)", padding: "4px 8px",
          }}>✕</button>
        </div>
        <div style={{ overflowY: "auto", padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "48px repeat(7, 1fr)", gap: 2 }}>
            {/* Day headers */}
            <div />
            {DAYS.map(d => (
              <div key={d} style={{
                textAlign: "center", fontSize: 11, fontWeight: 700,
                color: "var(--muted)", padding: "4px 0", letterSpacing: "0.06em",
              }}>{d}</div>
            ))}
            {/* Time rows */}
            {HOURS.map(hour => (
              <>
                <div key={`h${hour}`} style={{
                  fontSize: 10, color: "var(--muted)", textAlign: "right",
                  paddingRight: 6, paddingTop: 4, lineHeight: `${SLOT}px`,
                }}>{formatTime(hour)}</div>
                {DAYS.map((_, di) => {
                  const evs = myEvents.filter(e => e.day === di && e.start === hour);
                  return (
                    <div key={di} style={{
                      height: SLOT, position: "relative",
                      borderBottom: "1px solid var(--border)", borderRight: "1px solid var(--border)",
                    }}>
                      {evs.map(e => <EventBlock key={e.id} event={e} slotH={SLOT} />)}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}