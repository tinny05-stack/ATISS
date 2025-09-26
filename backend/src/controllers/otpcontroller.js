import { pool } from '../config/db.js';
import { generateOtp, minutesFromNow } from '../utils/otp.js';
import { sendSMS } from '../services/sms/index.js';

export async function requestOtp(req, res) {
  const { phone, smsProvider = 'vodacom' } = req.body;
  if (!phone) return res.status(400).json({ error: 'phone required' });
  const code = generateOtp(6);
  const expires = minutesFromNow(5);
  await pool.query('INSERT INTO otps (phone, code, expires_at) VALUES (?,?,?)', [phone, code, expires]);
  const message = `ATISS OTP: ${code}. Expires in 5 minutes.`;
  try {
    const out = await sendSMS({ provider: smsProvider, to: phone, message });
    await pool.query('INSERT INTO sms_logs (phone, message, provider, status) VALUES (?,?,?,?)', [phone, message, smsProvider, 'sent']);
    return res.json({ ok: true, provider: out.provider });
  } catch (e) {
    await pool.query('INSERT INTO sms_logs (phone, message, provider, status) VALUES (?,?,?,?)', [phone, message, smsProvider, 'failed']);
    return res.status(500).json({ error: 'failed to send otp' });
  }
}

export async function verifyOtp(req, res) {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'phone and code required' });
  const [rows] = await pool.query('SELECT * FROM otps WHERE phone=? AND code=? AND consumed=0 AND expires_at>NOW() ORDER BY id DESC LIMIT 1', [phone, code]);
  if (!rows.length) return res.status(400).json({ error: 'invalid or expired OTP' });
  await pool.query('UPDATE otps SET consumed=1 WHERE id=?', [rows[0].id]);
  await pool.query('INSERT IGNORE INTO users (phone) VALUES (?)', [phone]);
  return res.json({ ok: true });
}
