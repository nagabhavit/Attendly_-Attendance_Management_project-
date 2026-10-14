const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { HttpError } = require('../middleware/errorHandler');
const { computeStats } = require('../utils/stats');

const router = express.Router();
router.use(requireAuth);

const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

function parseSubject(body) {
  const name = String(body.name || '').trim();
  const code = body.code ? String(body.code).trim().slice(0, 20) : null;
  const color = COLOR_RE.test(body.color || '') ? body.color : '#6366f1';
  if (!name) throw new HttpError(400, 'Subject name is required');
  if (name.length > 100) throw new HttpError(400, 'Subject name is too long');
  return { name, code, color };
}

async function getTarget(userId) {
  const [[user]] = await db.query('SELECT target_percentage FROM users WHERE id = ?', [userId]);
  return user ? user.target_percentage : 75;
}

router.get('/', async (req, res, next) => {
  try {
    const target = await getTarget(req.userId);
    const [rows] = await db.query(
      `SELECT s.id, s.name, s.code, s.color, s.created_at,
              COALESCE(SUM(a.status = 'present'), 0) AS present,
              COUNT(a.id) AS total
         FROM subjects s
         LEFT JOIN attendance a ON a.subject_id = s.id
        WHERE s.user_id = ?
        GROUP BY s.id
        ORDER BY s.created_at`,
      [req.userId],
    );
    const subjects = rows.map((r) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      color: r.color,
      ...computeStats(Number(r.present), Number(r.total), target),
    }));
    res.json({ target, subjects });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, code, color } = parseSubject(req.body);
    const [result] = await db.query(
      'INSERT INTO subjects (user_id, name, code, color) VALUES (?, ?, ?, ?)',
      [req.userId, name, code, color],
    );
    res.status(201).json({ subject: { id: result.insertId, name, code, color } });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, code, color } = parseSubject(req.body);
    const [result] = await db.query(
      'UPDATE subjects SET name = ?, code = ?, color = ? WHERE id = ? AND user_id = ?',
      [name, code, color, req.params.id, req.userId],
    );
    if (!result.affectedRows) throw new HttpError(404, 'Subject not found');
    res.json({ subject: { id: Number(req.params.id), name, code, color } });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await db.query(
      'DELETE FROM subjects WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId],
    );
    if (!result.affectedRows) throw new HttpError(404, 'Subject not found');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
