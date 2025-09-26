import * as Vodacom from './vodacom_mpesa.js';
import * as Tigo from './tigo_pesa.js';

export function getProvider(name) {
  if (name === 'vodacom') return Vodacom;
  if (name === 'tigo') return Tigo;
  throw new Error('Unsupported payment provider');
}
