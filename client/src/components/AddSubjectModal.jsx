import { useState } from 'react';

const PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#22d3ee', '#a855f7', '#ef4444'];

export default function AddSubjectModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', code: '', color: PALETTE[0] });
  const [error, setError] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={onSubmit}>
        <h3>Add subject</h3>
        <div className="form">
          <label>
            Subject name
            <input name="name" required autoFocus value={form.name} onChange={onChange} placeholder="e.g. Data Structures" />
          </label>
          <label>
            Code (optional)
            <input name="code" value={form.code} onChange={onChange} placeholder="e.g. CS201" />
          </label>
          <label>
            Colour
            <div className="swatches">
              {PALETTE.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`swatch ${form.color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setForm({ ...form, color: c })}
                  aria-label={c}
                />
              ))}
            </div>
          </label>
          {error && <p className="error">{error}</p>}
          <div className="row-end">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary">Add subject</button>
          </div>
        </div>
      </form>
    </div>
  );
}
