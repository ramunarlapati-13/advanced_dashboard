# Admin Sentinel Dashboard

A high-security, hardware-tethered analytical dashboard with multi-gate authentication and unified multi-database intelligence.

### 📱 Mobile Automation (Telegram)
To enable mobile reports:
1.  **Create Bot**: Message [@BotFather](https://t.me/botfather) on Telegram to create a new bot.
2.  **Get Token**: Copy the HTTP API Token he gives you.
3.  **Configure Env**: Add `TELEGRAM_BOT_TOKEN=your_token_here` to `.env.local`.
4.  **Set Webhook**: 
    - Deploy your project (must be HTTPS).
    - Run: `curl -F "url=https://your-domain.com/api/telegram/webhook" https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook`
5.  **Usage**: Send `/report` to your bot to get instant analytics.

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

## 📂 Project Structure & Workflow

### 🏗️ Core Directory Structure

- **`app/`**: Next.js App Router (Main Application Logic)
    - **`login/page.tsx`**: The entry point. Handles the 5-Gate Authentication process.
    - **`page.tsx`**: The Main Dashboard. Orchestrates the global view, sidebar navigation, and dynamic component rendering.
    - **`actions.ts`**: Secure Server Actions. Handles sensitive operations like Credential verification, MFA validation (`otplib`), and Admin Access checks hidden from the client.
- **`lib/`**: Shared Utilities & Configuration
    - **`firebase/`**: Contains separate configurations for **Zest Academy** (`config.ts`), **Zestfolio** (`zestfolio.ts`), and the Admin SDK (`admin.ts`) for server-side operations.
    - **`security/`**: Hardware ID tethering logic (`hardware-check.ts`) and allowlists.
- **`components/`**: Reusable UI Elements
    - **`UserDirectory.tsx`**: Advanced user table with search, filter, and CSV export.
    - **`AnalyticsCharts.tsx`**: Visualizations for user growth and platform metrics.
- **`scripts/`**: Maintenance Utilities
    - `generate-mfa.js`: Generates QR codes for new Admin encryptions.

### �️ Dashboard UI Hierarchy
```text
Layout (Root)
├── Sidebar (Navigation)
│   ├── Branding (Zest Sentinel)
│   ├── Main Menu
│   │   ├── Dashboard (Overview)
│   │   ├── User Management (Academy/Zestfolio)
│   │   ├── Global Insights (Analytics)
│   │   └── System Health
│   └── User Profile (Bottom)
└── Main Content Area
    ├── Header
    │   ├── Breadcrumbs (Navigation Path)
    │   ├── Global Search Bar
    │   └── Quick Actions (Notifications, Theme, Profile)
    └── Dynamic View Container
        ├── 📊 Dashboard View (Default)
        │   ├── Stats Grid (Key Metrics: Users, Portfolios, Status)
        │   └── Analytics Panel
        │       └── AnalyticsCharts (Line, Pie, Bar + Export Tools)
        ├── 👥 User Directory View
        │   └── Advanced Table (Search, Filter, CSV Export)
        └── ⚡ Activity Feed View
            └── Real-time Event Stream
```

### �🔄 System Workflow

#### 1. Authentication Flow (The "Sentinel" Gate)
The system employs a rigorous multi-step access protocol:
1.  **User Visits `/login`**:
2.  **Gate 1 (Hardware)**: System silently checks physical Machine ID. If mismatch -> **Block**.
3.  **Gate 2 (Credentials)**: Checks Email/Password against Server Action allowlist.
4.  **Gate 3 (MFA)**: Validates TOTP code using `otplib` (Real Google Authenticator).
5.  **Gate 4 (Authorization)**: Post-login, strict server-side check ensuring the authenticated Google Account is in the `ADMIN_EMAILS` allowlist.

#### 2. Data Aggregation Flow
Once inside, the Dashboard acts as a central nervous system:
- **Initialization**: `page.tsx` triggers parallel data fetches using Server Actions.
- **Source 1 (Academy)**: Fetches user data via Firebase Admin SDK.
- **Source 2 (Zestfolio)**: Connects to secondary firebase project via `zestfolio.ts` config.
- **Normalization**: Data is merged, finding "Common Users" (registered on both) and calculating global ecosystem health.
- **Visualization**: Data is piped into `AnalyticsCharts` and global counters.

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
...

# MFA Secret (from generate-mfa.js)
NEXT_PUBLIC_MFA_SECRET=YOUR_GENERATED_SECRET

# Authorized Hardware IDs
NEXT_PUBLIC_HW_ID_1=your_machine_id
```

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000/login`

## 🔐 Default Credentials (Demo Mode)

- **Email**: `admin@gmail.com`
- **Password**: `password`
- **MFA Code**: `123456` (or use real code from Google Authenticator)

## 🔧 Hardware Lock

1. Run `node scripts/get-hardware-id.js` (or `npx node-machine-id`)
2. Add the ID to `.env.local` as `NEXT_PUBLIC_HW_ID_1`

## 🎨 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Security**: otplib, node-machine-id
- **Charts**: Chart.js, react-chartjs-2
- **Database**: Firebase (Firestore & RTDB)
