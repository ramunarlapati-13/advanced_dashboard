// This file contains sensitive hardware configuration
// In a production environment, strictly use process.env
// But for this local-first hardware-tethered app, we hardcode the Admin IDs as requested.

// List of authorized hardware IDs
export const AUTHORIZED_HARDWARE_IDS = [
    process.env.NEXT_PUBLIC_HW_ID_1 || "", // Your ACTUAL Machine ID
    process.env.NEXT_PUBLIC_HW_ID_2 || "", // Co-developer's ID
];

// Legacy export for backward compatibility
export const ADMIN_HARDWARE_ID = AUTHORIZED_HARDWARE_IDS[0];

export const APP_CONFIG = {
    APP_NAME: "Admin Sentinel",
    VERSION: "1.0.0",
};
