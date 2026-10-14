import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from './AuthLayout';

export default function Login() {
  const { user, login, startDemo } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const run = async (fn) => {
    setError('');
    setBusy(true);
    try {
      await fn();
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <AuthLayout title="Welcome back 👋" subtitle="Log in to see your attendance.">
      <form onSubmit={(e) => { e.preventDefault(); run(() => login(form)); }} className="form">
        <label>
          Email
          <input name="email" type="email" required value={form.email} onChange={onChange} placeholder="you@college.edu" />
        </label>
        <label>
          Password
          <input name="password" type="password" required value={form.password} onChange={onChange} placeholder="••••••••" />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <div className="divider"><span>or</span></div>
      <button className="btn btn-outline w-full" onClick={() => run(startDemo)} disabled={busy}>
        ✨ Try the demo — no signup
      </button>
      <p className="muted small center-text">
        New here? <Link to="/register" className="link">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
