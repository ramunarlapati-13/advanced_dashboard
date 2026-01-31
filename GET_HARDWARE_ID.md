# Hardware ID Setup Guide

## Your Current Hardware ID

**Your Machine ID**: `4c990fe24d101b9656c59070518151225dc11da4d4052436aa28bd3f5`

---

## Adding Your Co-Developer's Hardware ID

### Step 1: Co-Developer Gets Their Hardware ID

Your co-developer needs to run this command on **their machine**:

```bash
node scripts/get-hardware-id.js
```

This will output their unique hardware ID (a long alphanumeric string).

### Step 2: Add Their ID to the System

1. Open `lib/security/config.ts`
2. Find the `AUTHORIZED_HARDWARE_IDS` array
3. Add their hardware ID as a new line:

```typescript
export const AUTHORIZED_HARDWARE_IDS = [
  "4c990fe24d101b9656c59070518151225dc11da4d4052436aa28bd3f5", // Your Machine
  "PASTE_THEIR_HARDWARE_ID_HERE", // Co-Developer's Machine
];
```

### Step 3: Authentication Requirements for Co-Developer

Your co-developer will need to go through **ALL 4 GATES** just like you:

#### Gate 1: Email/Password
- Same credentials: `admin@sentinel.com` / `password`
- (In production, you can create separate Firebase accounts for each admin)

#### Gate 2: Hardware Lock ✅
- **Automatically verified** once their ID is added to `AUTHORIZED_HARDWARE_IDS`

#### Gate 3: Stealth Key
- Same stealth key: `sentinel-alpha`
- They need to hover between password and login button to reveal the hidden input

#### Gate 4: MFA (Google Authenticator)
**Option A: Share the Same MFA Secret** (Easier, Less Secure)
- Share the QR code from `mfa-qr.png` with them
- They scan it with their Google Authenticator app
- Both of you will generate the same TOTP codes

**Option B: Separate MFA Secrets** (More Secure, Recommended)
1. Generate a new MFA secret for them:
   ```bash
   node scripts/generate-mfa.js
   ```
2. This creates a new QR code
3. Modify the login page to support multiple MFA secrets (requires code changes)
4. Each admin has their own unique TOTP

---

## Summary

### What Your Co-Developer Needs:

1. **Hardware ID**: Added to `lib/security/config.ts`
2. **Login Credentials**: `admin@sentinel.com` / `password`
3. **Stealth Key**: `sentinel-alpha`
4. **MFA Setup**: Scan `mfa-qr.png` with Google Authenticator

### Security Level:
- ✅ **4-Gate Authentication** (same as you)
- ✅ **Hardware-Locked** (only works on their specific machine)
- ✅ **MFA Protected** (requires their phone)

---

## Quick Command Reference

```bash
# Get hardware ID
npx node-machine-id

# Generate new MFA secret (if using separate MFA)
node scripts/generate-mfa.js

# Start the dashboard
npm run dev
```
