import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { validateHardwareEnvironment } from "@/lib/security/hardware-check";
import clsx from "clsx";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin Sentinel Dashboard",
  description: "Secure Analytical Platform - Restricted Access",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Gate 2 (Hardware Check) - Enforced at Root Layout Level (Server Side)
  const { authorized, currentId } = validateHardwareEnvironment();

  if (!authorized) {
    return (
      <html lang="en">
        <body className="bg-black flex items-center justify-center h-screen w-screen overflow-hidden selection:bg-red-900 selection:text-white">
          <div className="relative z-10 max-w-4xl w-full p-12 text-center border-2 border-red-600 bg-black/90 shadow-[0_0_50px_rgba(220,38,38,0.5)]">
            <h1 className="text-6xl md:text-8xl font-black text-red-600 tracking-tighter mb-4 animate-pulse">
              ILLEGAL ACTION
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-red-500 uppercase tracking-[0.2em] mb-8 border-y-2 border-red-800 py-4">
              Unauthorized Hardware Access
            </h2>

            <div className="space-y-4 font-mono text-red-400">
              <p className="text-xl">TERMINAL LOCKDOWN INTIATED</p>
              <p>Security Protocol: <span className="text-white">SENTINEL-ZERO</span></p>

              <div className="bg-red-950/50 p-6 rounded-lg text-left mx-auto max-w-3xl border border-red-800 mt-6">
                <h3 className="text-red-500 uppercase tracking-widest text-sm font-bold mb-4 border-b border-red-800 pb-2">
                  SECURITY VIOLATION: HARDWARE MISMATCH
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-red-300 uppercase mb-1">DETECTED SYSTEM ID (COPY THIS):</p>
                    <div className="bg-black border border-red-900/50 p-3 rounded font-mono text-white text-sm break-all select-all hover:bg-red-900/10 transition-colors">
                      {currentId}
                    </div>
                  </div>

                  <div className="text-xs text-red-400/70 italic">
                    ⚠️ Access denied using ID: {currentId.substring(0, 8)}...
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 p-4 bg-red-950/30 border border-red-800 text-sm text-red-500 font-mono">
              System requires immediate re-authentication via secure terminal. Contact Site ReliabilityAdmin.
            </div>
          </div>

          {/* Background Grid/Effect */}
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(255, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 0, 0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body
        className={clsx(
          geistSans.variable,
          geistMono.variable,
          "antialiased min-h-screen font-sans"
        )}
      >
        {children}
      </body>
    </html>
  );
}
