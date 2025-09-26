import { pool } from '../config/db.js';

export async function createAfterPayment(req, res) {
  const { phone, plan = 'daily-30' } = req.body;
  const minutes = plan === 'hour-1' ? 60 : plan === 'daily-30' ? 1440 : 60;
  const starts = new Date();
  const ends = new Date(starts.getTime() + minutes * 60000);
  await pool.query('INSERT INTO sessions (phone, plan, minutes, starts_at, ends_at, active) VALUES (?,?,?,?,?,1)', [phone, plan, minutes, starts, ends]);
  res.json({ ok: true, starts, ends, plan });
}

export async function statusByPhone(req, res) {
  const phone = req.params.phone;
  const [rows] = await pool.query('SELECT * FROM sessions WHERE phone=? AND active=1 AND ends_at>NOW() ORDER BY id DESC LIMIT 1', [phone]);
  if (!rows.length) return res.json({ active: false });
  res.json({ active: true, session: rows[0] });
}
