# Admin Sentinel Dashboard

A high-security, hardware-tethered analytical dashboard with multi-gate authentication and unified multi-database intelligence.

## 🛡️ Security Features

### Four-Gate Authentication System
1. **Primary Gate**: Firebase Email/Password Authentication
2. **Hardware Gate**: Machine ID verification (Server-side)
3. **Stealth Gate**: Hidden security key input
4. **MFA Gate**: Google Authenticator TOTP

## 🚀 Key Innovation: Multi-Platform Intelligence

The dashboard now provides a unified "Command Center" view for multiple independent platforms:

- **Unified Intelligence**: Real-time data aggregation from **Zest Academy** (Firebase) and **Zestfolio** (Realtime DB).
- **Common User Detection**: Advanced filtering that identifies users registered across both platforms.
- **Global Insights**: High-level analytics showing total user growth, platform health, and system status across the entire ecosystem.

## 📊 Features

- **Global Overview**: Combined analytics with dynamic growth charts using `react-chartjs-2`.
- **Interactive Sidebar**: Premium hover-expandable dropdowns for Global Insights and Database management.
- **User Directory**: Centralized list of all users with CSV export and powerful search/filter capabilities.
- **Micro-Animations**: Fluid UI interactions built with `Framer Motion` for a high-end feel.
- **Clickable Breadcrumbs**: Fast "Home" navigation via the header and sidebar branding.

## ⚙️ Quick Start

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
# Firebase Configuration
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

## 🔧 Hardware Lock

Your machine ID: `4c990fe24d101b9656c59070518151225dc11da4d4052436aa28bd3f5`

To update for a new machine:
1. Run `npx node-machine-id`
2. Update `lib/security/config.ts` with the new ID

## 🎨 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Security**: otplib, node-machine-id
- **Charts**: Chart.js, react-chartjs-2
- **Database**: Firebase (Firestore & RTDB)
