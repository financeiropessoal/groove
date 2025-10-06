/**
 * @fileoverview This file centralizes the logic for determining the application's base URL,
 * ensuring consistency for generating links (referral, password reset, QR codes, etc.)
 * across different environments (local, preview, production).
 */

/**
 * Generates the base URL for the application.
 * 
 * In a local development environment (localhost or 127.0.0.1), it allows for an override
 * via `DEV_NETWORK_URL` to facilitate testing on other devices on the same network (e.g., mobile phones).
 * 
 * In production or other environments, it dynamically resolves the origin from `window.location.origin`,
 * which correctly provides the canonical base URL (scheme, hostname, port).
 * 
 * @returns {string} The application's base URL, ending with a slash.
 */
export const getBaseUrl = (): string => {
    // --- LOCAL DEVELOPMENT HELPER ---
    // To test links (like QR codes or password resets) on other devices on your Wi-Fi,
    // you can set your machine's network IP address here.
    // Example: const DEV_NETWORK_URL = 'http://192.168.1.10:5173';
    // For production, this MUST be an empty string.
    const DEV_NETWORK_URL: string = '';

    if (DEV_NETWORK_URL && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return DEV_NETWORK_URL.endsWith('/') ? DEV_NETWORK_URL : `${DEV_NETWORK_URL}/`;
    }
    
    const origin = window.location.origin;
    // Ensure the base URL always ends with a slash.
    return origin.endsWith('/') ? origin : `${origin}/`;
};
