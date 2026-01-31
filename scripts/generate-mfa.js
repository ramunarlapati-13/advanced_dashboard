const { generateSecret, generateURI } = require('otplib');
const qrcode = require('qrcode');

async function generateMfa() {
    console.log("Generating Admin MFA Secret...");

    // Generate Secret using the functional API
    const secret = generateSecret();
    console.log("\n---------------------------------------------------");
    console.log("YOUR NEW MFA SECRET (Save this to .env.local):");
    console.log(`NEXT_PUBLIC_MFA_SECRET=${secret}`);
    console.log("---------------------------------------------------\n");

    // Generate QR Code URI for Google Authenticator
    const user = 'Admin';
    const service = 'SentinelDashboard';

    const otpauth = generateURI({
        type: 'totp',
        label: user,
        issuer: service,
        secret: secret,
        algorithm: 'SHA1',
        digits: 6,
        period: 30
    });

    console.log("Generating QR Code image...");

    try {
        await qrcode.toFile('./mfa-qr.png', otpauth);
        console.log("SUCCESS: Scan 'mfa-qr.png' with Google Authenticator.");

        // Also output the URL
        console.log("\nOr copy this URL to a QR generator if image fails:");
        console.log(otpauth);
        console.log("\nSetup complete! Add the secret to your .env.local file.");
    } catch (err) {
        console.error("Error generating QR code:", err);
    }
}

generateMfa();
