import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { overallStats, todayISO } from '../utils/stats';
import StatCard from '../components/StatCard';
import SubjectCard from '../components/SubjectCard';
import AddSubjectModal from '../components/AddSubjectModal';

export default function Dashboard() {
  const { user, updateTarget } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [today, setToday] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState('');

  const target = user.targetPercentage;

  const refresh = useCallback(async () => {
    try {
      const [{ subjects }, { records }] = await Promise.all([api.getSubjects(), api.getAttendance()]);
      setSubjects(subjects);
      const date = todayISO();
      setToday(Object.fromEntries(records.filter((r) => r.date === date).map((r) => [r.subjectId, r.status])));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh, target]);

  const mark = async (subjectId, status) => {
    await api.markAttendance({ subjectId, date: todayISO(), status });
    refresh();
  };

  const addSubject = async (payload) => {
    await api.createSubject(payload);
    refresh();
  };

  const overall = overallStats(subjects, target);
  const lowCount = subjects.filter((s) => s.isLow).length;

  if (loading) return <div className="center muted">Loading your attendance…</div>;

  return (
    <main className="container">
      <section className="page-head">
        <div>
          <h1>Hi, {user.name.split(' ')[0]} 👋</h1>
          <p className="muted">Here’s how your attendance looks today.</p>
        </div>
        <div className="head-actions">
          <label className="target-select">
            <span className="muted small">Target</span>
            <select value={target} onChange={(e) => updateTarget(Number(e.target.value))}>
              {[60, 65, 70, 75, 80, 85, 90].map((t) => <option key={t} value={t}>{t}%</option>)}
            </select>
          </label>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add subject</button>
        </div>
      </section>

      {error && <p className="error">{error}</p>}

      <section className="stats-grid">
        <StatCard icon="📈" label="Overall attendance" value={`${overall.percentage}%`} hint={`Target ${target}%`} />
        <StatCard icon="✅" label="Classes attended" value={overall.present} hint={`of ${overall.total} total`} />
        <StatCard icon="📚" label="Subjects" value={subjects.length} />
        <StatCard icon="⚠️" label="Below target" value={lowCount} hint={lowCount ? 'Needs attention' : 'All good!'} />
      </section>

      <h2 className="section-title">Your subjects</h2>
      {subjects.length === 0 ? (
        <div className="card empty">
          <p>No subjects yet. Add your first subject to start tracking.</p>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add subject</button>
        </div>
      ) : (
        <section className="subjects-grid">
          {subjects.map((s) => (
            <SubjectCard key={s.id} subject={s} target={target} onMark={mark} todayStatus={today[s.id]} />
          ))}
        </section>
      )}

      {showAdd && <AddSubjectModal onClose={() => setShowAdd(false)} onSave={addSubject} />}
    </main>
  );
}
