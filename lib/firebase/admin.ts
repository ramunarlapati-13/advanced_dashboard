import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// 1. Construct service account object from environment variables
// Note: Private keys in .env often have newlines encoded as \n. We replace them to actual newlines.
const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// 2. Singleton initialization pattern
export function initAdmin(): App {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    // Verify encryption keys exist before crashing
    if (!serviceAccount.privateKey || !serviceAccount.clientEmail) {
        throw new Error("Missing FIREBASE_PRIVATE_KEY or FIREBASE_CLIENT_EMAIL in environment variables.");
    }

    return initializeApp({
        credential: cert(serviceAccount),
    });
}

// 3. Export Auth accessor
export async function getAdminAuth() {
    const app = initAdmin();
    return getAuth(app);
}
