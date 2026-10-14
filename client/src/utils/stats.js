// Mirrors server/src/utils/stats.js so demo mode behaves like the real API.
export function computeStats(present, total, target = 75) {
  const r = target / 100;
  const percentage = total === 0 ? 0 : Math.round((present / total) * 1000) / 10;

  let mustAttend = 0;
  let canSkip = 0;

  if (total > 0 && present / total < r) {
    mustAttend = r >= 1 ? null : Math.ceil((r * total - present) / (1 - r));
  } else if (total > 0) {
    canSkip = Math.max(0, Math.floor(present / r - total + 1e-9));
  }

  return {
    present,
    absent: total - present,
    total,
    percentage,
    isLow: total > 0 && percentage < target,
    mustAttend,
    canSkip,
  };
}

export function overallStats(subjects, target) {
  const present = subjects.reduce((n, s) => n + s.present, 0);
  const total = subjects.reduce((n, s) => n + s.total, 0);
  return computeStats(present, total, target);
}

export function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
