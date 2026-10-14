export default function AlertBanner({ lowSubjects, target, permission, onEnableNotifications }) {
  if (lowSubjects.length === 0) return null;

  return (
    <div className="alert-banner" role="alert">
      <span className="alert-icon">🔔</span>
      <div className="alert-text">
        <b>
          {lowSubjects.length} subject{lowSubjects.length > 1 ? 's are' : ' is'} below your {target}% target
        </b>
        <p className="small">
          {lowSubjects
            .map((s) => `${s.name} (${s.percentage}%${s.mustAttend ? ` · attend ${s.mustAttend} more` : ''})`)
            .join(' • ')}
        </p>
      </div>
      {permission === 'default' && (
        <button className="btn btn-sm btn-outline" onClick={onEnableNotifications}>
          Enable notifications
        </button>
      )}
    </div>
  );
}
