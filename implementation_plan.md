# Implementation Plan - Admin Sentinel Analytical Dashboard

This document outlines the implementation steps for the **Admin Sentinel Analytical Dashboard**, a high-security, hardware-tethered React/Next.js application.

## 1. Project Initialization & Dependencies
- [ ] **Setup Next.js Project**: Initialize with TypeScript, Tailwind CSS, ESLint.
- [ ] **Install Dependencies**:
    - **Core**: `firebase`
    - **Security**: `node-machine-id`, `otplib` (for TOTP), `qrcode` (for MFA setup/dev).
    - **UI/Viz**: `chart.js`, `react-chartjs-2`, `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`.
- [ ] **Configuration**: Setup `next.config.mjs` to handle native modules (`node-machine-id`) and environment variables.

## 2. Security Architecture (The 4 Gates)
The application will strictly enforce a sequential 4-gate login flow.
- [ ] **Gate 2: Hardware Tethering (Server-Side)**
    - Implement a utility `lib/security/hardware-check.ts` using `node-machine-id`.
    - Enforce this check in the Root Layout or Middleware.
    - **Failure Action**: Render "Illegal Action Performed" lock screen immediately if the host ID does not match the Admin ID.
- [ ] **Gate 1: Primary Authentication**
    - Create a branded Login Page.
    - Integrate Firebase Auth (Email/Password).
- [ ] **Gate 3: Stealth Security Key**
    - Add an "invisible" input field to the Login form (opacity: 0 or hidden unless hovered).
    - Validate the stealth key against a secure env variable/hash before allowing MFA.
- [ ] **Gate 4: Multi-Factor Authentication (MFA)**
    - Implement TOTP verification using `otplib`.
    - Prompt for 6-digit code after Gates 1 & 3 are passed.

## 3. Core UI/UX - "Command Center" Aesthetic
- [ ] **Design System**:
    - Configure `tailwind.config.ts` with a "Sentinel" palette (Deep Blacks, Neon Blues/Reds, Glassmorphism).
    - Typography: Use a technical/monospaced font logic for data.
- [ ] **Layout Architecture**:
    - `DashboardLayout` component with persistent "Status Bar" (System connection, time, security status).
    - Tabbed Navigation for switching between multiple Firebase projects.

## 4. Functional Modules
### 4.1. Dashboard Views
- [ ] **Global Insights**: Aggregated metrics from all connected projects.
- [ ] **Project Tabs**: Dynamic routing or tabbed state to show data for specific projects.
- [ ] **Data Visualization**:
    - Real-time User Count (Line Chart).
    - Demographics (Bar/Pie Chart).
    - User Flow (Sankey or Flow Diagram representation).

### 4.2. User Management
- [ ] **User Directory**: Table view with "Search" and "Filter".
- [ ] **Masking**: Ensure sensitive PII is masked by default (e.g., `em***@gmail.com`) unless revealed by Admin.

### 4.3. File retrieval
- [ ] **Storage Interface**: Browser for Firebase Storage buckets.
- [ ] **Download**: Secure link generation/download.

## 5. Deployment & Security Hardening
- [ ] **Environment Variables**: Secure storage of Firebase Config and Admin Hardware ID.
- [ ] **Anti-Tamper**: Basic checks for environment integrity (though strictly server-side enforcement is the primary defense).

## 6. Verification & Handover
- [ ] Verify Hardware Lock works (test with dummy ID).
- [ ] Verify MFA flow.
- [ ] Check "Export to CSV" functionality.
