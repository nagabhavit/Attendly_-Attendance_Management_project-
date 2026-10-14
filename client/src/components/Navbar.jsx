import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isDemo } = useAuth();
  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <img src="/favicon.svg" alt="" width="28" height="28" />
        <span>Attendly</span>
        {isDemo && <span className="pill pill-warning">Demo</span>}
      </Link>
      {user && (
        <div className="nav-right">
          <span className="avatar" title={user.email}>
            {user.name.charAt(0).toUpperCase()}
          </span>
          <span className="muted hide-sm">{user.name}</span>
          <button className="btn btn-ghost" onClick={logout}>
            Log out
          </button>
        </div>
      )}
    </header>
  );
}
