const express = require("express");
const router = express.Router();
const { detectProvider } = require("../src/utils/provider");
const mysql = require("mysql2/promise");

const vodacomPay = require("../services/payments/vodacom");
const tigoPay = require("../services/payments/tigo");
const airtelPay = require("../services/payments/airtel");

const vodacomSms = require("../services/sms/provider_vodacom");
const tigoSms = require("../services/sms/provider_tigo");
const airtelSms = require("../services/sms/provider_airtel");

// Database config
const dbConfig = { host: "localhost", user: "root", password: "", database: "atiss" };

// Temporary OTP store
const otpStore = new Map();

// Helper to send OTP
async function sendOtp(phone) {
  const provider = detectProvider(phone);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, { otp, verified: false });
  if (provider === "vodacom") await vodacomSms.sendOtp(phone, otp);
  if (provider === "tigo") await tigoSms.sendOtp(phone, otp);
  if (provider === "airtel") await airtelSms.sendOtp(phone, otp);
  return otp;
}

/**
 * Payment Initiation
 * Step 1: User tries to pay
 * - Check if they already have active subscription
 * - If yes: deny payment
 * - If no: proceed with payment → send OTP
 */
router.post("/initiate", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone required" });

  const provider = detectProvider(phone);
  if (!provider) return res.status(400).json({ error: "Unsupported phone prefix" });

  const amount = 1000; // TZS

  try {
    const conn = await mysql.createConnection(dbConfig);

    // Check for active subscription
    const [rows] = await conn.execute(
      "SELECT * FROM clients WHERE phone = ? AND expiry_time > NOW()",
      [phone]
    );
    if (rows.length > 0) {
      await conn.end();
      return res.status(400).json({
        error: `You already have an active subscription until ${rows[0].expiry_time}`
      });
    }

    // Otherwise proceed with payment
    let paymentResult;
    if (provider === "vodacom") paymentResult = await vodacomPay.initiatePayment(phone, amount);
    else if (provider === "tigo") paymentResult = await tigoPay.initiatePayment(phone, amount);
    else if (provider === "airtel") paymentResult = await airtelPay.initiatePayment(phone, amount);

    await conn.end();

    if (paymentResult.status === "pending" || paymentResult.status === "success") {
      await sendOtp(phone);
      res.json({ message: `Payment successful. OTP sent to ${phone}`, otpSent: true });
    } else {
      res.status(400).json({ error: "Payment failed" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment initiation failed" });
  }
});

/**
 * OTP Verification
 * Step 2: Verify OTP
 * - If OTP correct and no active subscription → add new subscription (24h)
 */
router.post("/verify", async (req, res) => {
  const { phone, otp } = req.body;
  const entry = otpStore.get(phone);
  if (!entry) return res.status(400).json({ error: "No OTP found" });
  if (entry.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

  otpStore.set(phone, { otp: entry.otp, verified: true });
  const issued_on = new Date();
  const expiry_time = new Date(issued_on.getTime() + 24 * 60 * 60 * 1000);

  try {
    const conn = await mysql.createConnection(dbConfig);

    // Double-check: ensure no active subscription exists
    const [rows] = await conn.execute(
      "SELECT * FROM clients WHERE phone = ? AND expiry_time > NOW()",
      [phone]
    );
    if (rows.length > 0) {
      await conn.end();
      return res.status(400).json({
        error: `You already have an active subscription until ${rows[0].expiry_time}`
      });
    }

    // Insert new subscription
    await conn.execute(
      "INSERT INTO clients (phone, issued_on, expiry_time) VALUES (?, ?, ?)",
      [phone, issued_on, expiry_time]
    );
    await conn.end();

    res.json({ message: "Client registered successfully", expiry_time });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register client" });
  }
});

// Clean up expired clients
async function deleteExpiredClients() {
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute("DELETE FROM clients WHERE expiry_time <= NOW()");
    await conn.end();
  } catch (err) {
    console.error("Error deleting expired clients:", err);
  }
}
setInterval(deleteExpiredClients, 60 * 60 * 1000); // run hourly

module.exports = router;
