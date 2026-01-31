# Admin Sentinel Dashboard

A high-security, hardware-tethered analytical dashboard with multi-gate authentication.

## 🛡️ Security Features

### Four-Gate Authentication System
1. **Primary Gate**: Firebase Email/Password Authentication
2. **Hardware Gate**: Machine ID verification (Server-side)
3. **Stealth Gate**: Hidden security key input
4. **MFA Gate**: Google Authenticator TOTP

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate MFA Secret
```bash
node scripts/generate-mfa.js
```
Scan the generated `mfa-qr.png` with Google Authenticator.

### 3. Configure Environment
Create `.env.local`:
```env
# Firebase (Optional - currently using mock auth)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# MFA Secret (from generate-mfa.js)
NEXT_PUBLIC_MFA_SECRET=YOUR_GENERATED_SECRET
```

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000/login`

## 🔐 Default Credentials (Demo Mode)

- **Email**: `admin@sentinel.com`
- **Password**: `password`
- **Stealth Key**: `sentinel-alpha` (hover over gap between password and login button)
- **MFA Code**: `123456` (or use real code from Google Authenticator)

## 📊 Features

- **Global Insights**: Real-time analytics dashboard
- **User Directory**: Searchable user table with CSV export
- **Hardware Lock**: Automatic lockout on unauthorized hardware
- **Dark Theme**: "Command Center" aesthetic with neon accents

## 🔧 Hardware Lock

Your machine ID: `4c990fe24d101b9656c59070518151225dc11da4d4052436aa28bd3f5`

To update for a new machine:
1. Run `npx node-machine-id`
2. Update `lib/security/config.ts` with the new ID

## 📁 Project Structure

```
├── app/
│   ├── login/          # Authentication page
│   ├── page.tsx        # Main dashboard
│   └── layout.tsx      # Root layout with hardware check
├── components/
│   └── UserDirectory.tsx
├── lib/
│   ├── firebase/       # Firebase configuration
│   └── security/       # Hardware validation
└── scripts/
    └── generate-mfa.js # MFA setup utility
```

## 🎨 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Security**: otplib, node-machine-id
- **Charts**: Chart.js, react-chartjs-2
- **Animations**: Framer Motion
