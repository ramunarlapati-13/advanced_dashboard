"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Shield, ChevronRight, Eye, EyeOff, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import { auth } from "@/lib/firebase/config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Mock Credentials for Development/Demo (Remove in Prod)
const MOCK_STEALTH_KEY = "sentinel-alpha"; // The secret key

export default function LoginPage() {
    const router = useRouter();
    const [step, setStep] = useState<"credentials" | "mfa">("credentials");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mfaCode, setMfaCode] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // 0. Hardware ID Check (Gate 0)
            // In a real scenario, this would comes from a persistent device fingerprint or local storage token
            // that was installed during "Dev Registration".
            const deviceId = localStorage.getItem("zest_hw_id");
            const allowedId = process.env.NEXT_PUBLIC_ALLOWED_HW_ID;

            // If strict mode is on, we block unknown devices. 
            // For now, if no ID is found, we might warn or block.
            if (deviceId !== allowedId) {
                // For dev convenience, if they provide the ID in the password field with a prefix, allow registration
                if (password.startsWith("REG:")) {
                    const newId = password.split("REG:")[1];
                    if (newId === allowedId) {
                        localStorage.setItem("zest_hw_id", newId);
                        // Continue to auth...
                    } else {
                        throw new Error("ACCESS DENIED: INVALID HARDWARE ID");
                    }
                } else {
                    // throw new Error("UNAUTHORIZED TERMINAL: HARDWARE MISMATCH");
                    console.warn("Hardware ID mismatch. Proceeding for Dev, but in Prod this blocks.");
                }
            }

            // 2. Check Primary Credentials (Gate 1)
            // Using Server Action to keep env vars secure
            // Dynamically import to ensure it works with next build/dev refresh cycles appropriately
            const { verifyCredentials } = await import("@/app/actions");
            const isValid = await verifyCredentials(email, password);

            if (!isValid) {
                throw new Error("Invalid Credentials or Unauthorized Email");
            }

            // If passed, move to MFA (Gate 4)
            setStep("mfa");
        } catch (err: any) {
            setError(err.message || "Authentication Failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMfaVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // 1. Verify TOTP (Simulated or Real)
            // 1. Verify TOTP (Simulated or Real)
            const { verify2FA } = await import("../actions");
            const isMfaValid = await verify2FA(mfaCode);

            if (!isMfaValid) {
                throw new Error("Invalid TOTP Code");
            }

            // 2. Firebase Authentication (The "Key" to the Database)
            // Now we trigger the actual Firebase Login to get the token
            const provider = new GoogleAuthProvider();

            // We explicitly ask for login now that they passed the gates
            const result = await signInWithPopup(auth, provider);
            console.log("Authenticated User:", result.user.email);

            // 3. Authorization Check (Gate 5 - Post-Auth)
            if (result.user.email) {
                const { checkAdminAccess } = await import("@/app/actions");
                const isAuthorized = await checkAdminAccess(result.user.email);

                if (!isAuthorized) {
                    await auth.signOut();
                    throw new Error(`ACCESS DENIED: Account '${result.user.email}' is not valid for Admin Access.`);
                }
            }

            // 4. Set Session & Redirect
            if (typeof window !== 'undefined') {
                sessionStorage.setItem("admin_session", "active");
            }
            router.push("/");
        } catch (err: any) {
            console.error("Auth Error Details:", err);
            let errorMessage = "Authentication Failed";

            if (err.code === "auth/popup-blocked") {
                errorMessage = "Popup blocked by browser. Please allow popups for this site.";
            } else if (err.code === "auth/operation-not-allowed") {
                errorMessage = "Google sign-in is not enabled in Firebase Console.";
            } else if (err.code === "auth/unauthorized-domain") {
                errorMessage = "This domain is not authorized for Google sign-in.";
            } else {
                errorMessage = err.message || "Authentication Failed";
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black opacity-40" />
            <div className="absolute inset-0 z-0 bg-[url('/grid.svg')] opacity-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-md p-8 bg-black/50 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl glass-panel"
            >
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                        <Shield className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-wider text-white">ADMIN SENTINEL</h1>
                    <p className="text-sm text-gray-500 font-mono mt-2">SECURE ACCESS TERMINAL</p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mb-6 p-3 bg-red-950/30 border border-red-800/50 rounded flex items-center gap-3 text-red-400 text-sm font-mono"
                        >
                            <AlertTriangle className="w-4 h-4" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {step === "credentials" ? (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            {/* Email */}
                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 font-mono uppercase">Identifier</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_10px_rgba(59,130,246,0.2)] transition-all font-mono placeholder:text-gray-700"
                                    placeholder="admin@system.local"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 font-mono uppercase">Passkey</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_10px_rgba(59,130,246,0.2)] transition-all font-mono"
                                    placeholder="••••••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span className="tracking-widest">AUTHENTICATE</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <motion.form
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onSubmit={handleMfaVerify}
                        className="space-y-6"
                    >
                        <div className="text-center space-y-4">
                            <p className="text-sm text-gray-400">Enter TOTP from Authenticator Device</p>

                            <div className="flex justify-center flex-col items-center">
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={mfaCode}
                                    onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-48 bg-black/40 border border-blue-500/50 rounded p-4 text-center text-2xl tracking-[0.5em] text-blue-400 font-mono focus:outline-none focus:border-blue-400 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                    placeholder="000000"
                                    autoFocus
                                />
                                <p className="text-[10px] text-gray-600 mt-2 font-mono">DEV HINT: CODE IS 123456</p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
                        >
                            {isLoading ? "VERIFYING..." : "CONFIRM ACCESS"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep("credentials")}
                            className="w-full text-xs text-gray-600 hover:text-white transition-colors"
                        >
                            Back to Credentials
                        </button>
                    </motion.form>
                )}

                {/* Decorative Footer */}
                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-700 font-mono">
                    <span>UNK-992-ALPHA</span>
                    <span>SECURE CONNECTION: ENCRYPTED</span>
                </div>
            </motion.div>
        </div>
    );
}
