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
2. **Add to config**: Open `lib/security/config.ts` and add their ID.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build
```

## Login Instructions

1. Go to `http://localhost:3000/login`
2. **Credentials (Managed in `.env.local`)**:
   - Emails: `admin@sentinel.com`, `ramunarlapati@gmail.com`, `zestacademyonline@gmail.com`
   - Password: `rexplorer@rsmk`
   - MFA: `123456`
