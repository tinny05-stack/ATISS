import axios from 'axios';

const baseURL = process.env.TIGO_BASE_URL;
const clientId = process.env.TIGO_CLIENT_ID;
const clientSecret = process.env.TIGO_CLIENT_SECRET;
const merchant = process.env.TIGO_MERCHANT_CODE;

async function token() {
  const { data } = await axios.post(`${baseURL}/oauth/token`, { client_id: clientId, client_secret: clientSecret });
  return data.access_token || data.token;
}

export async function initiatePayment({ phone, amount, ourRef, description, callbackUrl }) {
  const access = await token();
  const payload = {
    merchant,
    amount,
    msisdn: phone,
    reference: ourRef,
    narrative: description,
    callback_url: callbackUrl,
  };
  const { data } = await axios.post(`${baseURL}/payments/charge`, payload, { headers: { Authorization: `Bearer ${access}` } });
  return { provider: 'tigo', raw: data, ext_ref: data?.transactionId || data?.id };
}
