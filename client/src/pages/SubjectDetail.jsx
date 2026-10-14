import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { todayISO } from '../utils/stats';
import ProgressRing from '../components/ProgressRing';
import { insight } from '../components/SubjectCard';

const fmt = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

export default function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subject, setSubject] = useState(null);
  const [records, setRecords] = useState([]);
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState('');

  const target = user.targetPercentage;

  const refresh = useCallback(async () => {
    try {
      const [{ subjects }, { records }] = await Promise.all([api.getSubjects(), api.getAttendance(id)]);
      const found = subjects.find((s) => String(s.id) === String(id));
      if (!found) return navigate('/', { replace: true });
      setSubject(found);
      setRecords(records);
    } catch (err) {
      setError(err.message);
    }
  }, [id, navigate]);

  useEffect(() => { refresh(); }, [refresh]);

  const mark = async (status) => {
    setError('');
    try {
      await api.markAttendance({ subjectId: Number(id), date, status });
      refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const removeRecord = async (recordId) => {
    await api.deleteAttendance(recordId);
    refresh();
  };

  const removeSubject = async () => {
    if (!window.confirm(`Delete ${subject.name} and all its attendance records?`)) return;
    await api.deleteSubject(id);
    navigate('/');
  };

  if (!subject) return <div className="center muted">Loading…</div>;

  return (
    <main className="container">
      <Link to="/" className="muted small">← Back to dashboard</Link>

      <section className="card detail-hero" style={{ '--accent': subject.color }}>
        <ProgressRing value={subject.percentage} target={target} size={140} stroke={14} />
        <div className="detail-info">
          <h1>{subject.name}</h1>
          <p className="muted">{subject.code || 'No code'} · Target {target}%</p>
          <div className="chips">
            <span className="pill pill-success">{subject.present} present</span>
            <span className="pill pill-danger">{subject.absent} absent</span>
            <span className="pill pill-warning">{subject.total} total</span>
          </div>
          <p className="insight">{insight(subject)}</p>
        </div>
        <button className="btn btn-sm btn-ghost danger-text" onClick={removeSubject}>Delete subject</button>
      </section>

      <section className="card log-card">
        <h3>Log a class</h3>
        <div className="log-row">
          <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
          <button className="btn btn-success" onClick={() => mark('present')}>✓ Present</button>
          <button className="btn btn-danger" onClick={() => mark('absent')}>✕ Absent</button>
        </div>
        {error && <p className="error">{error}</p>}
      </section>

      <h2 className="section-title">History</h2>
      {records.length === 0 ? (
        <div className="card empty muted">No classes logged yet.</div>
      ) : (
        <ul className="card history">
          {records.map((r) => (
            <li key={r.id}>
              <span className={`dot ${r.status}`} />
              <span className="history-date">{fmt(r.date)}</span>
              <span className={`pill ${r.status === 'present' ? 'pill-success' : 'pill-danger'}`}>{r.status}</span>
              <button className="btn btn-sm btn-ghost" onClick={() => removeRecord(r.id)} aria-label="Delete record">🗑</button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
