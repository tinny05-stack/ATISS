# ATISS Backend

## 1) Install & Configure
```bash
cd backend
cp .env.example .env
# edit .env with your MySQL + provider details
npm i 
npm run db:init
npm run dev
API base: http://localhost:8080/api
2) Webhook exposure (local dev)
•	Install ngrok or cloudflared.
•	Start tunnel to your backend port.
•	Set PUBLIC_BASE_URL in .env to the tunnel URL.
•	Register your webhook URLs with the operators:
o	Vodacom: ${PUBLIC_BASE_URL}/api/payments/webhook/vodacom
o	Tigo: ${PUBLIC_BASE_URL}/api/payments/webhook/tigo
3) Payment flow (placeholder)
1.	Client calls POST /payments/initiate with { phone, amount, provider }.
2.	Provider pushes a callback to our webhook on success/failure.
3.	On success, create a session (either in webhook or via queue/worker).
In this starter, the frontend calls /sessions/create immediately after initiate to simulate a confirmed payment. Replace with real confirmation logic once webhooks are live.
4) OTP
•	POST /otp/request → sends OTP via chosen SMS provider (Vodacom/Tigo/Airtel).
•	POST /otp/verify → validates OTP (5-minute expiry). Ensure phone format matches operator expectations (msisdn).
5) Session
•	POST /sessions/create → creates a timed access window.
•	GET /sessions/:phone → returns current session status.
6) Router Integration (Practice with MiFi)
Basic Huawei MiFi devices generally do not expose captive portal controls. For practice: - Broadcast your MiFi SSID normally. - Host frontend (index.html) on a local machine/VPS and share the URL/QR to users. - After payment, you may display the Wi‑Fi password or a token to users. (Real network enforcement requires a router that supports captive portal).
Production paths: - MikroTik (Hotspot + CoA + API) or OpenWrt (nodogsplash/chilli + RADIUS). ATISS backend then acts as your AAA/paywall.
7) Security Checklist
•	Replace placeholder payment/SMS endpoints with your contract specs.
•	Implement webhook signature validation and idempotency (store hashes of payloads).
•	Rate-limit OTP requests per phone/IP.
•	Validate MSISDN formats (e.g., 2557XXXXXXX) consistently.
•	Move session creation to fire only on confirmed payment.

---

## frontend/README.md
```md
# ATISS Frontend

Serve `frontend/public` with any static server:
```bash
cd frontend/public
# Python
python -m http.server 5500
# or Node
npx serve . -l 5500
Edit frontend/public/app.js if your API base is different:
const api = 'http://<your-backend-host>:8080/api';
localStorage.setItem('api', api);
Open http://localhost:5500. ```
