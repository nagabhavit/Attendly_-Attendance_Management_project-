import { Link } from 'react-router-dom';
import ProgressRing from './ProgressRing';

export function insight(s) {
  if (s.total === 0) return 'No classes logged yet';
  if (s.isLow) {
    return s.mustAttend === null
      ? 'Target is out of reach'
      : `Attend the next ${s.mustAttend} class${s.mustAttend === 1 ? '' : 'es'} to recover`;
  }
  return s.canSkip > 0
    ? `You can skip ${s.canSkip} class${s.canSkip === 1 ? '' : 'es'}`
    : "You're right on the line — don't skip!";
}

export default function SubjectCard({ subject, target, onMark, todayStatus }) {
  return (
    <article className="card subject-card" style={{ '--accent': subject.color }}>
      <div className="subject-head">
        <div>
          <Link to={`/subjects/${subject.id}`} className="subject-name">{subject.name}</Link>
          <p className="muted small">{subject.code || '—'}</p>
        </div>
        {subject.isLow && <span className="pill pill-danger">Low</span>}
      </div>

      <div className="subject-body">
        <ProgressRing value={subject.percentage} target={target} />
        <div className="subject-meta">
          <p><b>{subject.present}</b> / {subject.total} attended</p>
          <p className="muted small">{insight(subject)}</p>
        </div>
      </div>

      <div className="subject-actions">
        <button
          className={`btn btn-sm btn-success ${todayStatus === 'present' ? 'active' : ''}`}
          onClick={() => onMark(subject.id, 'present')}
        >
          ✓ Present
        </button>
        <button
          className={`btn btn-sm btn-danger ${todayStatus === 'absent' ? 'active' : ''}`}
          onClick={() => onMark(subject.id, 'absent')}
        >
          ✕ Absent
        </button>
      </div>
    </article>
  );
}
