import { formatTime } from "../utils";

// ── Event Block on individual timetable ──────────────────────────────────────
export function EventBlock({ event, slotH }) {
  const h = (event.end - event.start) * slotH;
  const typeColors = { class: "#5b8dd9", club: "#6bbf8e", personal: "#c9a84c", work: "#d4669a" };
  const c = typeColors[event.type] || event.color;
  return (
    <div style={{
      position: "absolute", left: 2, right: 2, top: 2,
      height: h - 4, background: c + "22",
      border: `1.5px solid ${c}88`, borderRadius: 6,
      padding: "3px 6px", overflow: "hidden", cursor: "default",
      boxSizing: "border-box",
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: c, lineHeight: 1.2 }}>{event.title}</div>
      {event.location && (
        <div style={{ fontSize: 10, color: c + "bb", marginTop: 1, lineHeight: 1.2 }}>
          📍 {event.location}
        </div>
      )}
      <div style={{ fontSize: 10, color: c + "99", marginTop: 1 }}>
        {formatTime(event.start)} – {formatTime(event.end)}
      </div>
    </div>
  );
}