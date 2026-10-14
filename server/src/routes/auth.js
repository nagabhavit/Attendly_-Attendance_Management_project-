const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { signToken, requireAuth } = require('../middleware/auth');
const { HttpError } = require('../middleware/errorHandler');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    targetPercentage: row.target_percentage,
  };
}

router.post('/register', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!name) throw new HttpError(400, 'Name is required');
    if (!EMAIL_RE.test(email)) throw new HttpError(400, 'A valid email is required');
    if (password.length < 6) throw new HttpError(400, 'Password must be at least 6 characters');

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) throw new HttpError(409, 'Email is already registered');

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hash],
    );
    const [[row]] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    res.status(201).json({ token: signToken(row), user: toUser(row) });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    const [[row]] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!row || !(await bcrypt.compare(password, row.password_hash))) {
      throw new HttpError(401, 'Invalid email or password');
    }
    res.json({ token: signToken(row), user: toUser(row) });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const [[row]] = await db.query('SELECT * FROM users WHERE id = ?', [req.userId]);
    if (!row) throw new HttpError(404, 'User not found');
    res.json({ user: toUser(row) });
  } catch (err) {
    next(err);
  }
});

router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const target = Number(req.body.targetPercentage);
    if (!Number.isInteger(target) || target < 1 || target > 100) {
      throw new HttpError(400, 'targetPercentage must be an integer between 1 and 100');
    }
    await db.query('UPDATE users SET target_percentage = ? WHERE id = ?', [target, req.userId]);
    const [[row]] = await db.query('SELECT * FROM users WHERE id = ?', [req.userId]);
    res.json({ user: toUser(row) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
