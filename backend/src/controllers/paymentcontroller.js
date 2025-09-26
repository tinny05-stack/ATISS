import { pool } from '../config/db.js';
import { getProvider } from '../services/payments/index.js';

export async function initiate(req, res) {
  const { phone, amount, provider, plan = 'daily-30' } = req.body;
  if (!phone || !amount || !provider) return res.status(400).json({ error: 'phone, amount, provider required' });
  const ourRef = `ATISS-${Date.now()}-${Math.floor(Math.random()*10000)}`;
  const callbackUrl = `${process.env.PUBLIC_BASE_URL}/api/payments/webhook/${provider}`;
  const description = `ATISS plan ${plan}`;

  const impl = getProvider(provider);
  const out = await impl.initiatePayment({ phone, amount, ourRef, description, callbackUrl });

  await pool.query('INSERT INTO payments (phone, provider, amount, status, ext_ref, our_ref, description, raw_response) VALUES (?,?,?,?,?,?,?,?)', [phone, provider, amount, 'pending', out.ext_ref || null, ourRef, description, JSON.stringify(out.raw || {})]);

  return res.json({ ok: true, ourRef, provider, extRef: out.ext_ref });
}

export async function webhookVodacom(req, res) {
  // Verify signature per contract (not implemented here)
  const payload = req.body;
  const status = payload?.status === 'SUCCESS' ? 'success' : (payload?.status === 'FAILED' ? 'failed' : 'pending');
  const ourRef = payload?.reference || payload?.ourRef;
  await pool.query('UPDATE payments SET status=?, raw_response=? WHERE our_ref=?', [status, JSON.stringify(payload), ourRef]);
  res.json({ ok: true });
}

export async function webhookTigo(req, res) {
  const payload = req.body;
  const status = payload?.status === 'SUCCESS' ? 'success' : (payload?.status === 'FAILED' ? 'failed' : 'pending');
  const ourRef = payload?.reference || payload?.ourRef;
  await pool.query('UPDATE payments SET status=?, raw_response=? WHERE our_ref=?', [status, JSON.stringify(payload), ourRef]);
  res.json({ ok: true });
}
