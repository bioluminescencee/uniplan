import { useAuth } from "../hooks/useAuth";
import { ProfileMenu } from "./ProfileMenu";

export function TopBar({view, setView, setShowAddEvent, setShowPlanActivity, darkMode, setDarkMode, setShowGroupMenu, showGroupMenu, profile, currentGroup, groups, currentGroupId, onSelectGroup, onSignOut, updateProfile }) {

  return (
    <>
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
        borderBottom: "1px solid var(--border)", flexWrap: "wrap",
      }}>
        <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: "var(--text)" }}>
          <span style={{ color: "#5b8dd9" }}>uni</span>squad
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'DM Mono', monospace" }}>
          week planner
        </div>

        <button onClick={() => setShowGroupMenu(v => !v)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', borderRadius: 8,
          border: '1px solid var(--border)', background: 'var(--input-bg)',
          color: 'var(--text)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>
          {currentGroup?.name ?? 'No group'} ▾
        </button>

        {showGroupMenu && (
          <div style={{
            position: 'absolute', top: 52, left: 120, zIndex: 200,
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 8, minWidth: 200,
          }}>
            {groups.map(g => (
              <button key={g.id} onClick={() => { onSelectGroup(g.id); setShowGroupMenu(false) }} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 12px', borderRadius: 8, border: 'none',
                background: g.id === currentGroupId ? '#5b8dd922' : 'none',
                color: g.id === currentGroupId ? '#5b8dd9' : 'var(--text)',
                fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              }}>{g.name}</button>
            ))}
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '6px 0' }} />
            {/* Invite code for current group */}
            <div style={{ padding: '6px 12px', fontSize: 11, color: 'var(--muted)' }}>
              Invite code:
              <span style={{
                marginLeft: 6, fontFamily: 'monospace', fontWeight: 700,
                color: 'var(--text)', letterSpacing: '0.1em',
              }}>{currentGroup?.invite_code}</span>
            </div>
          </div>
        )}

        {/* ... rest of top bar (view toggle, actions, sign out) ... */}

        {/* View toggle */}
        <div style={{
          display: "flex", gap: 2, background: "var(--input-bg)",
          border: "1px solid var(--border)", borderRadius: 8, padding: 3, marginLeft: 8,
        }}>
          {[["heatmap", "🌡 Heatmap"], ["group", "👥 Group View"]].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "5px 12px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: view === v ? "#5b8dd9" : "transparent",
              color: view === v ? "#fff" : "var(--muted)",
            }}>{label}</button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginLeft: "auto", flexWrap: "wrap" }}>
          <button onClick={() => setShowAddEvent(true)} style={{
            padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border)",
            background: "var(--input-bg)", color: "var(--text)", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>＋ Add Class</button>
          <button onClick={() => setShowPlanActivity(true)} style={{
            padding: "7px 14px", borderRadius: 8, border: "none",
            background: "#5b8dd9", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>🎯 Plan Activity</button>
          <button onClick={() => setDarkMode(d => !d)} style={{
            padding: "7px 10px", borderRadius: 8, border: "1px solid var(--border)",
            background: "var(--input-bg)", color: "var(--muted)", fontSize: 14, cursor: "pointer",
          }}>{darkMode ? "☀️" : "🌙"}</button>

          {profile && (
            
            <div style={{ margin: '0 8px', fontSize: 12, color: 'var(--muted)', display: "flex", alignItems: "center" }}>
              {profile.name}
            </div>
          )}
          {/* <button onClick={onSignOut} style={{
            padding: '7px 12px', borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--input-bg)', color: 'var(--muted)',
            fontSize: 12, cursor: 'pointer',
          }}>Sign out</button> */}
          <ProfileMenu
            profile={profile}
            onUpdate={updateProfile}
            onSignOut={onSignOut}
          />
        </div>
      </div>
    </>
  )
}