import { machineIdSync } from 'node-machine-id';
import { AUTHORIZED_HARDWARE_IDS } from './config';

/**
 * Verifies if the current machine matches any of the authorized Admin Hardware IDs.
 * This runs synchronously and should be used on server startup or critical checkpoints.
 * 
 * @returns {boolean} True if hardware matches any authorized ID, False otherwise.
 */
export function validateHardwareEnvironment(): { authorized: boolean; currentId: string } {
    try {
        // Bypass for Vercel / CI Environments
        if (process.env.VERCEL || process.env.CI) {
            console.log("[Security] Vercel/CI environment detected. Bypassing Hardware Lock.");
            return { authorized: true, currentId: "CLOUD_ENV" };
        }

        // We catch errors because machineIdSync might fail on some environments (e.g. edge runtime)
        const currentId = machineIdSync();

        // Debug log (remove in production or keep for audit)
        console.log(`[Security] Checking Hardware ID: ${currentId}`);
        console.log(`[Security] Authorized IDs count: ${AUTHORIZED_HARDWARE_IDS.length}`);

        // Check if current ID matches any authorized ID
        const isAuthorized = AUTHORIZED_HARDWARE_IDS.includes(currentId);

        if (isAuthorized) {
            console.log(`[Security] ✓ Hardware authorized`);
        } else {
            console.log(`[Security] ✗ Hardware NOT authorized`);
        }

        return { authorized: isAuthorized, currentId };
    } catch (error) {
        console.error("[Security] Hardware check failed execution:", error);
        return { authorized: false, currentId: "ERROR_RETRIEVING_ID" };
    }
}
