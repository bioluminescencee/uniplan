import { Avatar } from "./Avatar";

export function FriendFilter({friends, profile, activeFilters, setActiveFilters, handleImportICS}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
      borderBottom: "1px solid var(--border)", flexWrap: "wrap",
    }}>
      <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, letterSpacing: "0.06em" }}>SHOWING:</span>
      {friends.map(f => {
        const on = activeFilters.has(f.id);
        return (
          <button key={f.id} onClick={() => setActiveFilters(prev => {
            const next = new Set(prev);
            if (next.has(f.id)) next.delete(f.id); else next.add(f.id);
            return next;
          })} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 20,
            border: `1.5px solid ${on ? f.color : "var(--border)"}`,
            background: on ? f.color + "18" : "transparent",
            color: on ? f.color : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>
            <Avatar user={f} size={18} />
            {f.name}
          </button>
        );
      })}

      {/* iCal import */}
      {profile && (
            
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button key={profile.id} onClick={() => handleImportICS(profile.id)} title={`Import iCal for ${profile.name}`} style={{
            padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)",
            background: "var(--input-bg)", color: "var(--muted)", fontSize: 10, fontWeight: 600, cursor: "pointer",
          }}>
            <span style={{ fontSize: 9 }}>📅 </span>Import ICS
          </button>
      </div>
          )
          }

    </div>
  )
}