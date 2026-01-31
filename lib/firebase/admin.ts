import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// 1. Construct service account object from environment variables
// Note: Private keys in .env often have newlines encoded as \n. We replace them to actual newlines.
// 1. Zest Academy Credentials
const academyServiceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, // zest-academy
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// 2. Zestfolio Credentials (Optional)
const zestfolioServiceAccount = {
    projectId: "zestfolio-247",
    clientEmail: process.env.ZESTFOLIO_CLIENT_EMAIL,
    privateKey: process.env.ZESTFOLIO_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// 3. Singleton initialization
export function initAdmin(): App {
    const existing = getApps().find(a => a.name === "[DEFAULT]");
    if (existing) return existing;

    if (!academyServiceAccount.privateKey || !academyServiceAccount.clientEmail) {
        throw new Error("Missing FIREBASE_PRIVATE_KEY or FIREBASE_CLIENT_EMAIL");
    }

    return initializeApp({
        credential: cert(academyServiceAccount),
    }); // Default App
}

export function initZestfolioAdmin(): App | null {
    const appName = "zestfolio-admin";
    const existing = getApps().find(a => a.name === appName);
    if (existing) return existing;

    // Return null if not configured yet
    if (!zestfolioServiceAccount.privateKey || !zestfolioServiceAccount.clientEmail) {
        return null;
    }

    return initializeApp({
        credential: cert(zestfolioServiceAccount),
    }, appName);
}

// 4. Auth Accessors
export async function getAdminAuth() {
    const app = initAdmin();
    return getAuth(app);
}

export async function getZestfolioAdminAuth() {
    const app = initZestfolioAdmin();
    if (!app) return null; // Not configured
    return getAuth(app);
}
