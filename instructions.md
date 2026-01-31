# Admin Sentinel Dashboard - Quick Start Guide

## 1. Setup Security
Before running the dashboard, you must configure your Admin Security Credentials.

### A. Hardware Lock
Your current machine ID has been hardcoded into the system:
`ID: 4c990fe24d101b9656c59070518151225dc11da4d4052436aa28bd3f5`

If you move to another laptop, run `npx node-machine-id` and update `lib/security/config.ts`.

### B. Multi-Factor Authentication (MFA)
1. Run the setup script to generate your personal Admin Secret:
   ```bash
   node scripts/generate-mfa.js
   ```
2. Scan the QR code or enter the Secret Key into your Google Authenticator App.
3. (Optional) Set the secret in an environment variable `NEXT_PUBLIC_MFA_SECRET` (Current implementation uses a mock verification for demo).

### C. Stealth Key
The login page has a hidden input field (between Password and Login button).
**Current Dev Key**: `sentinel-alpha`
Hover over the gap to reveal it.

## 2. Run the Dashboard
```bash
npm run dev
```
Access at: `http://localhost:3000`

## 3. Login Flow
1. **Gate 1**: Email (`admin@sentinel.com`) / Password (`password`).
2. **Gate 2**: Hardware ID (Checked automatically on load).
3. **Gate 3**: Enter `sentinel-alpha` in the invisible field.
4. **Gate 4**: Enter the 6-digit code from Google Authenticator (or `123456` if mock mode is active).

## 4. Features
- **Global Insights**: Real-time mock data.
- **User Directory**: Searchable user list with CSV Export.
- **Security Lockdown**: Try changing the ID in `lib/security/config.ts` to see the "Illegal Action" screen.
