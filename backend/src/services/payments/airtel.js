async function initiatePayment(phone, amount) {
  console.log(`Airtel payment requested: ${phone} - amount: ${amount}`);
  return { status: "success", transactionId: `AIRTEL-${Date.now()}` };
}
module.exports = { initiatePayment };
