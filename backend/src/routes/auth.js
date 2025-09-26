import { Router } from 'express';
import { issueToken } from '../controllers/authController.js';
const r = Router();
r.post('/auth/token', issueToken);
export default r;
