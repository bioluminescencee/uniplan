export function Pill({ label, color, small }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: color + "22", border: `1px solid ${color}55`,
      color, borderRadius: 4,
      padding: small ? "1px 6px" : "2px 8px",
      fontSize: small ? 10 : 11, fontWeight: 600, letterSpacing: "0.03em",
    }}>{label}</span>
  );
}