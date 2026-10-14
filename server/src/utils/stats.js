/**
 * Attendance maths. `target` is a percentage (e.g. 75).
 *
 * mustAttend: classes in a row you must attend to reach the target
 *   smallest x where (present + x) / (total + x) >= r
 * canSkip:    classes you can miss and still stay at/above the target
 *   largest y where present / (total + y) >= r
 */
function computeStats(present, total, target = 75) {
  const r = target / 100;
  const percentage = total === 0 ? 0 : Math.round((present / total) * 1000) / 10;

  let mustAttend = 0;
  let canSkip = 0;

  if (total > 0 && present / total < r) {
    mustAttend = r >= 1 ? Infinity : Math.ceil((r * total - present) / (1 - r));
  } else if (total > 0) {
    canSkip = Math.max(0, Math.floor(present / r - total + 1e-9));
  }

  return {
    present,
    absent: total - present,
    total,
    percentage,
    isLow: total > 0 && percentage < target,
    mustAttend: Number.isFinite(mustAttend) ? mustAttend : null,
    canSkip,
  };
}

module.exports = { computeStats };
