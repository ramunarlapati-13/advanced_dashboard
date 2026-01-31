// This file contains sensitive hardware configuration
// In a production environment, strictly use process.env
// But for this local-first hardware-tethered app, we hardcode the Admin IDs as requested.

// List of authorized hardware IDs
export const AUTHORIZED_HARDWARE_IDS = [
    "4c990fe24d101b9656c590705181f3e01f2eda4d4052436aa28bd3f51225dc11", // Your ACTUAL Machine ID (from terminal)
    // Add your co-developer's hardware ID below:
    // "PASTE_CO_DEVELOPER_MACHINE_ID_HERE",
];

// Legacy export for backward compatibility
export const ADMIN_HARDWARE_ID = AUTHORIZED_HARDWARE_IDS[0];

export const APP_CONFIG = {
    APP_NAME: "Admin Sentinel",
    VERSION: "1.0.0",
};
