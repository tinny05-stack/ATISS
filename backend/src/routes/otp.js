const express = require("express");
const router = express.Router();
const { detectProvider } = require("../utilis/provider");

// SMS services
const vodacomSms = require("../services/sms/provider_vodacom");
const tigoSms = require("../services/sms/provider_tigo");
const airtelSms = require("../services/sms/provider_airtel");

// In-memory OTP store
const otpStore = new Map();

// Send OTP (used after payment)
router.post("/send", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone required" });

  const provider = detectProvider(phone);
  if (!provider) return res.status(400).json({ error: "Unsupported phone prefix" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, { otp, verified: false });

  try {
    if (provider === "vodacom") await vodacomSms.sendOtp(phone, otp);
    if (provider === "tigo") await tigoSms.sendOtp(phone, otp);
    if (provider === "airtel") await airtelSms.sendOtp(phone, otp);

    res.json({ message: `OTP sent via ${provider}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Verify OTP
router.post("/verify", (req, res) => {
  const { phone, otp } = req.body;
  const entry = otpStore.get(phone);

  if (!entry) return res.status(400).json({ error: "No OTP found" });
  if (entry.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

  otpStore.set(phone, { otp: entry.otp, verified: true });
  res.json({ message: "OTP verified" });
});

module.exports = router;
