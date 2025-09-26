import { logger } from '../../utils/logger.js';
import * as Vodacom from './provider_vodacom.js';
import * as Tigo from './provider_tigo.js';
import * as Airtel from './provider_airtel.js';

const providers = { vodacom: Vodacom, tigo: Tigo, airtel: Airtel };

export async function sendSMS({ provider = 'vodacom', to, message }) {
  const impl = providers[provider];
  if (!impl) throw new Error(`Unknown SMS provider: ${provider}`);
  try {
    const res = await impl.send({ to, message });
    return res;
  } catch (e) {
    logger.error(e, 'SMS send failed');
    throw e;
  }
}
