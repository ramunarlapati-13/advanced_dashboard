# Quick Command Reference

## Get Your Hardware ID

Run this command to get your hardware ID:

```bash
node scripts/get-hardware-id.js
```

**Output Example:**
```
==============================================
YOUR HARDWARE ID:
4c990fe24d101b9656c59070518151225dc11da4d4052436aa28bd3f5
==============================================
```

## Add Co-Developer

1. **Get their hardware ID**: Have them run the command above on their machine
2. **Add to config**: Open `lib/security/config.ts` and add their ID:

```typescript
export const AUTHORIZED_HARDWARE_IDS = [
  "4c990fe24d101b9656c59070518151225dc11da4d4052436aa28bd3f5", // Your ID
  "PASTE_THEIR_ID_HERE", // Co-Developer's ID
];
```

3. **Share credentials**:
   - Email: `admin@sentinel.com`
   - Password: `password`
   - Stealth Key: `sentinel-alpha`
   - MFA: Share the `mfa-qr.png` file

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate new MFA secret
node scripts/generate-mfa.js

# Get hardware ID
node scripts/get-hardware-id.js
```

## Login Instructions

1. Go to `http://localhost:3000/login`
2. Enter email: `admin@sentinel.com`
3. Enter password: `password`
4. **Hover** between password field and login button
5. Type stealth key: `sentinel-alpha` in the revealed field
6. Click "AUTHENTICATE"
7. Enter 6-digit code from Google Authenticator (or `123456` for demo)
8. Click "CONFIRM ACCESS"

## Files to Share with Co-Developer

- `mfa-qr.png` - For Google Authenticator setup
- Login credentials (email, password, stealth key)
- Their hardware ID needs to be added to `lib/security/config.ts`
