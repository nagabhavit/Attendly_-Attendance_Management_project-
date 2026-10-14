export default function StatCard({ icon, label, value, hint }) {
  return (
    <div className="card stat-card">
      <span className="stat-icon">{icon}</span>
      <div>
        <p className="muted small">{label}</p>
        <p className="stat-value">{value}</p>
        {hint && <p className="muted small">{hint}</p>}
      </div>
    </div>
  );
}
