const test = require('node:test');
const assert = require('node:assert/strict');
const { computeStats } = require('../src/utils/stats');

test('no classes yet → 0% and not flagged low', () => {
  const s = computeStats(0, 0, 75);
  assert.equal(s.percentage, 0);
  assert.equal(s.isLow, false);
  assert.equal(s.canSkip, 0);
  assert.equal(s.mustAttend, 0);
});

test('percentage is rounded to one decimal', () => {
  assert.equal(computeStats(2, 3).percentage, 66.7);
});

test('below target → classes needed to recover', () => {
  // 6/10 = 60%; need x with (6+x)/(10+x) >= .75 → x = 6
  const s = computeStats(6, 10, 75);
  assert.equal(s.isLow, true);
  assert.equal(s.mustAttend, 6);
  assert.equal(s.canSkip, 0);
});

test('above target → classes that can be skipped', () => {
  // 18/20 = 90%; 18/(20+y) >= .75 → y <= 4
  const s = computeStats(18, 20, 75);
  assert.equal(s.isLow, false);
  assert.equal(s.canSkip, 4);
  assert.equal(s.mustAttend, 0);
});

test('exactly on target → cannot skip any', () => {
  assert.equal(computeStats(3, 4, 75).canSkip, 0);
});

test('100% target that is missed is unreachable', () => {
  assert.equal(computeStats(4, 5, 100).mustAttend, null);
});
