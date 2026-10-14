import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from './AuthLayout';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="It takes less than a minute.">
      <form onSubmit={onSubmit} className="form">
        <label>
          Name
          <input name="name" required value={form.name} onChange={onChange} placeholder="Your name" />
        </label>
        <label>
          Email
          <input name="email" type="email" required value={form.email} onChange={onChange} placeholder="you@college.edu" />
        </label>
        <label>
          Password
          <input name="password" type="password" minLength={6} required value={form.password} onChange={onChange} placeholder="At least 6 characters" />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p className="muted small center-text">
        Already have an account? <Link to="/login" className="link">Log in</Link>
      </p>
    </AuthLayout>
  );
}
