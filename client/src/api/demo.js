// A tiny in-browser backend so the UI can be explored without MySQL.
import { computeStats } from '../utils/stats';

const DB_KEY = 'attendly_demo_db';

const SEED_SUBJECTS = [
  { name: 'Data Structures', code: 'CS201', color: '#6366f1', rate: 0.92 },
  { name: 'Operating Systems', code: 'CS305', color: '#10b981', rate: 0.84 },
  { name: 'Database Systems', code: 'CS302', color: '#f59e0b', rate: 0.78 },
  { name: 'Computer Networks', code: 'CS310', color: '#ec4899', rate: 0.62 },
  { name: 'Engineering Maths', code: 'MA201', color: '#22d3ee', rate: 0.7 },
];

function isoDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

// deterministic pseudo-random so the demo looks the same every time
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function seed() {
  const db = {
    nextId: 1,
    user: { id: 1, name: 'Demo Student', email: 'demo@attendly.app', targetPercentage: 75 },
    subjects: [],
    records: [],
  };
  SEED_SUBJECTS.forEach((s, i) => {
    const id = db.nextId++;
    db.subjects.push({ id, name: s.name, code: s.code, color: s.color });
    const rand = rng(i + 7);
    for (let day = 40; day >= 1; day--) {
      const dow = new Date(isoDaysAgo(day)).getDay();
      if (dow === 0 || dow === 6 || (day + i) % 2) continue; // weekdays, alternating
      db.records.push({
        id: db.nextId++,
        subjectId: id,
        date: isoDaysAgo(day),
        status: rand() < s.rate ? 'present' : 'absent',
      });
    }
  });
  return db;
}

function load() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* fall through to a fresh seed */
  }
  const db = seed();
  save(db);
  return db;
}

function save(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

const delay = (v) => new Promise((r) => setTimeout(() => r(v), 120));

export function resetDemo() {
  localStorage.removeItem(DB_KEY);
}

export const demoApi = {
  register: async () => delay({ token: 'demo', user: load().user }),
  login: async () => delay({ token: 'demo', user: load().user }),
  me: async () => delay({ user: load().user }),
  updateMe: async ({ targetPercentage }) => {
    const db = load();
    db.user.targetPercentage = Number(targetPercentage);
    save(db);
    return delay({ user: db.user });
  },

  getSubjects: async () => {
    const db = load();
    const target = db.user.targetPercentage;
    const subjects = db.subjects.map((s) => {
      const recs = db.records.filter((r) => r.subjectId === s.id);
      const present = recs.filter((r) => r.status === 'present').length;
      return { ...s, ...computeStats(present, recs.length, target) };
    });
    return delay({ target, subjects });
  },
  createSubject: async ({ name, code, color }) => {
    if (!name?.trim()) throw new Error('Subject name is required');
    const db = load();
    const subject = { id: db.nextId++, name: name.trim(), code: code || null, color: color || '#6366f1' };
    db.subjects.push(subject);
    save(db);
    return delay({ subject });
  },
  updateSubject: async (id, payload) => {
    const db = load();
    const s = db.subjects.find((x) => x.id === Number(id));
    if (!s) throw new Error('Subject not found');
    Object.assign(s, payload);
    save(db);
    return delay({ subject: s });
  },
  deleteSubject: async (id) => {
    const db = load();
    db.subjects = db.subjects.filter((s) => s.id !== Number(id));
    db.records = db.records.filter((r) => r.subjectId !== Number(id));
    save(db);
    return delay(null);
  },

  getAttendance: async (subjectId) => {
    const db = load();
    const records = db.records
      .filter((r) => !subjectId || r.subjectId === Number(subjectId))
      .sort((a, b) => b.date.localeCompare(a.date));
    return delay({ records });
  },
  markAttendance: async ({ subjectId, date, status }) => {
    const db = load();
    let record = db.records.find((r) => r.subjectId === Number(subjectId) && r.date === date);
    if (record) record.status = status;
    else {
      record = { id: db.nextId++, subjectId: Number(subjectId), date, status };
      db.records.push(record);
    }
    save(db);
    return delay({ record });
  },
  deleteAttendance: async (id) => {
    const db = load();
    db.records = db.records.filter((r) => r.id !== Number(id));
    save(db);
    return delay(null);
  },
};
