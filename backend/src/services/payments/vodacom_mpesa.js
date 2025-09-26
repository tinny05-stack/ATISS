import axios from 'axios';

const baseURL = process.env.VODACOM_BASE_URL;
const key = process.env.VODACOM_CONSUMER_KEY;
const secret = process.env.VODACOM_CONSUMER_SECRET;
const shortcode = process.env.VODACOM_SHORTCODE;
const passkey = process.env.VODACOM_PASSKEY;

async function token() {
  // Placeholder token call; replace per contract
  const { data } = await axios.post(`${baseURL}/oauth/token`, { key, secret });
  return data.access_token || data.token;
}

export async function initiatePayment({ phone, amount, ourRef, description, callbackUrl }) {
  const access = await token();
  const payload = {
    shortcode,
    passkey,
    amount,
    msisdn: phone,
    reference: ourRef,
    description,
    callback_url: callbackUrl,
  };
  const { data } = await axios.post(`${baseURL}/payments/stkpush`, payload, { headers: { Authorization: `Bearer ${access}` } });
  return { provider: 'vodacom', raw: data, ext_ref: data?.checkoutRequestId || data?.transactionId };
}
