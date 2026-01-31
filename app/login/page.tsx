"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Shield, ChevronRight, Eye, EyeOff, AlertTriangle } from "lucide-react";
import clsx from "clsx";
// import { signInWithEmailAndPassword } from "firebase/auth"; // Uncomment when Firebase is ready
// import { auth } from "@/lib/firebase/config";

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
    const [stealthKey, setStealthKey] = useState(""); // The hidden input
    const [mfaCode, setMfaCode] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // 1. Check Primary Credentials (Gate 1)
            // await signInWithEmailAndPassword(auth, email, password);
            // For now, mock check
            if (email !== "admin@sentinel.com" || password !== "password") {
                // In real app, let Firebase handle invalid email/pass
                // throw new Error("Invalid Credentials");
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
            // Mock MFA Check
            await new Promise((resolve) => setTimeout(resolve, 800));
            if (mfaCode !== "123456") {
                throw new Error("Invalid TOTP Code");
            }

            // Success! Set session and redirect
            if (typeof window !== 'undefined') {
                sessionStorage.setItem("admin_session", "active");
            }
            router.push("/");
        } catch (err: any) {
            setError(err.message);
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

                            {/* GATE 3: STEALTH INPUT */}
                            {/* Invisible input, usually identified by tab order or exact position */}
                            <div className="relative group h-2 overflow-hidden opacity-0 hover:opacity-100 transition-opacity duration-700">
                                <input
                                    type="password"
                                    value={stealthKey}
                                    onChange={(e) => setStealthKey(e.target.value)}
                                    className="w-full bg-transparent border-none text-xs text-gray-800 focus:ring-0 focus:outline-none text-center tracking-[0.5em]"
                                    placeholder="SECURITY KEY"
                                    autoComplete="off"
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

                            <div className="flex justify-center">
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={mfaCode}
                                    onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-48 bg-black/40 border border-blue-500/50 rounded p-4 text-center text-2xl tracking-[0.5em] text-blue-400 font-mono focus:outline-none focus:border-blue-400 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                    placeholder="000000"
                                    autoFocus
                                />
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
