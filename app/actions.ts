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
 * Fetches the list of multiple users from Firebase Authentication.
 * Requires FIREBASE_PRIVATE_KEY in env.
 */
import { getAdminAuth } from "@/lib/firebase/admin";

export async function getAuthUsers() {
    try {
        const auth = await getAdminAuth();
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
    } catch (error: any) {
        console.error("Failed to list auth users:", error);
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
