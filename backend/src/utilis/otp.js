export function generateOtp(len = 6) {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < len; i++) code += digits[Math.floor(Math.random() * 10)];
  return code;
}

export function minutesFromNow(mins = 5) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + mins);
  return d;
}
