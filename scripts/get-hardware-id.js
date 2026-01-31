const { machineIdSync } = require('node-machine-id');

try {
    const hardwareId = machineIdSync();
    console.log('\n==============================================');
    console.log('YOUR HARDWARE ID:');
    console.log(hardwareId);
    console.log('==============================================\n');
    console.log('Copy this ID and add it to:');
    console.log('lib/security/config.ts -> AUTHORIZED_HARDWARE_IDS array');
    console.log('\n');
} catch (error) {
    console.error('Error getting hardware ID:', error);
}
