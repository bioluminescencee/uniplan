export function Avatar({ user, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: user.color + "33", border: `2px solid ${user.color}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 600, color: user.color,
      flexShrink: 0, fontFamily: "'DM Mono', monospace",
    }}>{user.avatar}</div>
  );
}