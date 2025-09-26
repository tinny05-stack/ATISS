async function initiatePayment(phone, amount) {
  console.log(`Tigo payment requested: ${phone} - amount: ${amount}`);
  return { status: "success", transactionId: `TIGO-${Date.now()}` };
}
module.exports = { initiatePayment };
