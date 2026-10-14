const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { HttpError } = require('../middleware/errorHandler');

const router = express.Router();
router.use(requireAuth);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const STATUSES = ['present', 'absent'];

async function assertOwnsSubject(subjectId, userId) {
  const [[row]] = await db.query(
    'SELECT id FROM subjects WHERE id = ? AND user_id = ?',
    [subjectId, userId],
  );
  if (!row) throw new HttpError(404, 'Subject not found');
}

router.get('/', async (req, res, next) => {
  try {
    const params = [req.userId];
    let filter = '';
    if (req.query.subjectId) {
      filter = 'AND a.subject_id = ?';
      params.push(req.query.subjectId);
    }
    const [rows] = await db.query(
      `SELECT a.id, a.subject_id AS subjectId, a.class_date AS date, a.status
         FROM attendance a
         JOIN subjects s ON s.id = a.subject_id
        WHERE s.user_id = ? ${filter}
        ORDER BY a.class_date DESC`,
      params,
    );
    res.json({ records: rows });
  } catch (err) {
    next(err);
  }
});

// Upsert: marking the same subject + date again updates the status.
router.post('/', async (req, res, next) => {
  try {
    const subjectId = Number(req.body.subjectId);
    const date = String(req.body.date || '');
    const status = String(req.body.status || '').toLowerCase();

    if (!subjectId) throw new HttpError(400, 'subjectId is required');
    if (!DATE_RE.test(date)) throw new HttpError(400, 'date must be YYYY-MM-DD');
    if (!STATUSES.includes(status)) throw new HttpError(400, 'status must be present or absent');

    await assertOwnsSubject(subjectId, req.userId);
    await db.query(
      `INSERT INTO attendance (subject_id, class_date, status) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status)`,
      [subjectId, date, status],
    );
    const [[record]] = await db.query(
      `SELECT id, subject_id AS subjectId, class_date AS date, status
         FROM attendance WHERE subject_id = ? AND class_date = ?`,
      [subjectId, date],
    );
    res.status(201).json({ record });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await db.query(
      `DELETE a FROM attendance a
         JOIN subjects s ON s.id = a.subject_id
        WHERE a.id = ? AND s.user_id = ?`,
      [req.params.id, req.userId],
    );
    if (!result.affectedRows) throw new HttpError(404, 'Record not found');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
