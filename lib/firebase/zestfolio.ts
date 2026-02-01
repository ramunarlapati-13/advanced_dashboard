import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_ZESTFOLIO_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_ZESTFOLIO_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_ZESTFOLIO_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_ZESTFOLIO_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_ZESTFOLIO_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_ZESTFOLIO_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_ZESTFOLIO_MEASUREMENT_ID
};

// Initialize Zestfolio App (Secondary App)
// We give it a name 'zestfolio' to distinguish from the default app
const appName = "zestfolio";
let app;

if (!getApps().map(a => a.name).includes(appName)) {
    app = initializeApp(firebaseConfig, appName);
} else {
    app = getApp(appName);
}

const db = getFirestore(app);
const rtdb = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Helper to ensure we are authenticated against this specific app instance
// We use Anonymous Auth to obtain a valid token for the secondary project.
// This requires "Anonymous" to be enabled in the Zestfolio Firebase Console.
export const ensureZestAuth = async () => {
    if (!auth.currentUser) {
        try {
            console.log("Auto-connecting to Zestfolio (Anon)...");
            const userCredential = await signInAnonymously(auth);
            console.log("Zestfolio Connected:", userCredential.user.uid);
        } catch (error: any) {
            console.error("Zestfolio Connection Failed:", error);

            if (error.code === 'auth/admin-restricted-operation') {
                // Allow the UI to handle this specific error (prompting to enable it in console)
                throw new Error("AUTH_DISABLED");
            }
            throw error;
        }
    }
    return auth.currentUser;
};

export { app, db, rtdb, auth, storage };
