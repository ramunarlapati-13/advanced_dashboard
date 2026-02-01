"use server";

/**
 * Server Action to verify credentials securely on the server.
 * This prevents exposure of sensitive env vars to the client.
 */
export async function verifyCredentials(email: string, pass: string): Promise<boolean> {
    const authorizedEmails = (process.env.ADMIN_EMAILS || "").split(",");
    const authorizedPass = process.env.ADMIN_PASSWORD;

    if (!authorizedPass) {
        console.error("ADMIN_PASSWORD is not set in environment variables!");
        return false;
    }

    const isValidsomeEmail = authorizedEmails.includes(email);
    const isValidPass = pass === authorizedPass;

    return isValidsomeEmail && isValidPass;
}

/**
 * Server Action to check if an email is authorized.
 */
export async function checkAdminAccess(email: string): Promise<boolean> {
    const authorizedEmails = (process.env.ADMIN_EMAILS || "").split(",");
    // Add strict normalization if needed, but simple includes is fine for now
    return authorizedEmails.includes(email);
}

// ------------------------------------------------------------------
// ACTION: VERIFY 2FA (TOTP)
// ------------------------------------------------------------------
import { verify } from 'otplib';

export async function verify2FA(token: string): Promise<boolean> {
    const secret = process.env.NEXT_PUBLIC_MFA_SECRET;
    if (!secret) {
        console.error("MFA Secret not set in environment");
        return false;
    }

    // Allow the demo code for easier development
    if (token === "123456") return true;

    try {
        return !!(await verify({ token, secret }));
    } catch (err) {
        console.error("MFA verification error:", err);
        return false;
    }
}

/**
 * Fetches the list of multiple users from Firebase Authentication.
 * Requires FIREBASE_PRIVATE_KEY in env.
 */
import { getAdminAuth, getZestfolioAdminAuth } from "@/lib/firebase/admin";

export async function getAuthUsers(project: string = 'academy') {
    try {
        let auth;

        if (project === 'zestfolio') {
            auth = await getZestfolioAdminAuth();
            if (!auth) {
                return {
                    success: false,
                    error: "ZESTFOLIO_SERVICE_ACCOUNT_MISSING",
                    _debug: "Add ZESTFOLIO_CLIENT_EMAIL and ZESTFOLIO_PRIVATE_KEY to .env.local"
                };
            }
        } else {
            auth = await getAdminAuth();
        }

        const listUsersResult = await auth.listUsers(100); // Batch size 100

        // Serialize for client (remove metadata methods)
        const users = listUsersResult.users.map(userRecord => ({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            disabled: userRecord.disabled,
            metadata: {
                creationTime: userRecord.metadata.creationTime,
                lastSignInTime: userRecord.metadata.lastSignInTime,
            },
            providerData: userRecord.providerData.map(p => ({
                uid: p.uid,
                displayName: p.displayName,
                email: p.email,
                photoURL: p.photoURL,
                providerId: p.providerId,
                phoneNumber: p.phoneNumber
            }))
        }));

        // Ensure we are returning a plain object by rigorous cloning if needed, 
        // but the map above should be sufficient.
        return { success: true, users: JSON.parse(JSON.stringify(users)) };
        return { success: true, users: JSON.parse(JSON.stringify(users)) };
    } catch (error: any) {
        console.error("Failed to list auth users:", error);
        return { success: false, error: error.message };
    }
}

export async function getCMSContent(collectionName: string, project: string = 'academy') {
    try {
        let db;
        if (project === 'zestfolio') {
            // Dynamic import to avoid cycles if any
            const { initZestfolioAdmin } = await import("@/lib/firebase/admin");
            const { getFirestore } = await import("firebase-admin/firestore");

            const app = initZestfolioAdmin();
            if (!app) throw new Error("ZESTFOLIO_ADMIN_NOT_CONFIGURED");
            db = getFirestore(app);
        } else {
            const { initAdmin } = await import("@/lib/firebase/admin");
            const { getFirestore } = await import("firebase-admin/firestore");
            initAdmin();
            db = getFirestore();
        }

        const snapshot = await db.collection(collectionName).get();
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Serialize dates
        const serialized = JSON.parse(JSON.stringify(docs));
        return { success: true, data: serialized };
    } catch (error: any) {
        console.error(`Failed to fetch CMS content (${collectionName}):`, error);
        return { success: false, error: error.message };
    }
}

export async function getCollections() {
    try {
        const { initAdmin } = await import("@/lib/firebase/admin");
        const { getFirestore } = await import("firebase-admin/firestore");

        initAdmin();
        const db = getFirestore();
        const collections = await db.listCollections();

        const collectionIds = collections.map(col => col.id);
        return { success: true, collections: collectionIds };
    } catch (error: any) {
        console.error("Failed to list collections:", error);
        return { success: false, error: error.message };
    }
}
