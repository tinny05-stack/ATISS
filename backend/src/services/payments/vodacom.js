async function initiatePayment(phone, amount) {
  console.log(`Vodacom payment requested: ${phone} - amount: ${amount}`);
  return { status: "success", transactionId: `VODA-${Date.now()}` };
}
module.exports = { initiatePayment };
