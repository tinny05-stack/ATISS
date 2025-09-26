import { Router } from 'express';
import { createAfterPayment, statusByPhone } from '../controllers/sessionController.js';
const r = Router();
r.post('/sessions/create', createAfterPayment);
r.get('/sessions/:phone', statusByPhone);
export default r;
