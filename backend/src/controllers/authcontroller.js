import { signToken } from '../middleware/auth.js';

export async function issueToken(req, res) {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'phone required' });
  // In a stricter setup, ensure OTP verified recently. Simplified here.
  const token = signToken({ phone });
  res.json({ token });
}
