export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <section className="auth-hero">
        <img src="/favicon.svg" alt="" width="56" height="56" />
        <h1>Attendly</h1>
        <p>Track every class. Never fall short of the 75% line again.</p>
        <ul>
          <li>📚 Subject-wise attendance</li>
          <li>🧮 Live percentage &amp; skip calculator</li>
          <li>🔔 Low attendance alerts</li>
          <li>📊 Visual graphs</li>
        </ul>
      </section>
      <section className="auth-card card">
        <h2>{title}</h2>
        <p className="muted">{subtitle}</p>
        {children}
      </section>
    </div>
  );
}
