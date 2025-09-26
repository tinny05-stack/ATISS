
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

// Middleware for admin authentication
function adminAuth(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// Seed PRESIDENT admin if not present
async function seedAdmin() {
  const username = 'PRESIDENT';
  const password = 'MrPresident@2025';
  const hash = await bcrypt.hash(password, 10);
  const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
  if (rows.length === 0) {
    await db.query('INSERT INTO admins (username, password_hash) VALUES (?, ?)', [username, hash]);
  }
}
seedAdmin();

// Admin login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
    if (rows.length === 1) {
      const admin = rows[0];
      const match = await bcrypt.compare(password, admin.password_hash);
      if (match) {
        req.session.isAdmin = true;
        return res.json({ message: 'Login successful' });
      }
    }
    res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get active users (from clients table)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT phone, issued_on, expiry_time, TIMESTAMPDIFF(SECOND, NOW(), expiry_time) AS seconds_remaining
      FROM clients
      WHERE status = 'active' AND expiry_time > NOW()
      ORDER BY expiry_time DESC
    `);
    const formatted = users.map(u => ({
      phone: u.phone,
      issued_on: u.issued_on,
      expiry_time: u.expiry_time,
      time_remaining: formatTime(u.seconds_remaining)
    }));
    res.json({ users: formatted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Delete user (set status to expired)
router.delete('/users/:phone', adminAuth, async (req, res) => {
  const { phone } = req.params;
  try {
    await db.query('UPDATE clients SET status = "expired" WHERE phone = ?', [phone]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

function formatTime(seconds) {
  if (seconds <= 0) return 'Expired';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

module.exports = router;

const bcrypt = require('bcrypt');

// Admin login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
    if (rows.length === 1) {
      const admin = rows[0];
      const match = await bcrypt.compare(password, admin.password_hash);
      if (match) {
        req.session.isAdmin = true;
        return res.json({ message: 'Login successful' });
      }
    }
    res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get active users (paid, verified, not expired)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT u.phone, p.payment_date, p.expiry,
        TIMESTAMPDIFF(SECOND, NOW(), p.expiry) AS seconds_remaining
      FROM users u
      JOIN payments p ON u.phone = p.phone
      WHERE p.verified = 1 AND p.expiry > NOW()
      ORDER BY p.expiry DESC
    `);
    const formatted = users.map(u => ({
      phone: u.phone,
      payment_date: u.payment_date,
      expiry: u.expiry,
      time_remaining: formatTime(u.seconds_remaining)
    }));
    res.json({ users: formatted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Delete user
router.delete('/users/:phone', adminAuth, async (req, res) => {
  const { phone } = req.params;
  try {
    await db.query('DELETE FROM users WHERE phone = ?', [phone]);
    await db.query('DELETE FROM payments WHERE phone = ?', [phone]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

function formatTime(seconds) {
  if (seconds <= 0) return 'Expired';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

module.exports = router;
