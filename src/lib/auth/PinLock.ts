/**
 * PIN Lock authentication system
 * Handles hashing, verification, and lockout logic
 */

const SALT_LENGTH = 16;
const LOCKOUT_DURATION_MS = 30000; // 30 seconds
const MAX_ATTEMPTS = 5;

let failedAttempts = 0;
let lockoutUntil = 0;

/**
 * Generates a cryptographically secure salt
 */
function generateSalt(): string {
    const array = new Uint8Array(SALT_LENGTH);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(array);
    } else {
        // Fallback for non-secure contexts (dev only)
        for (let i = 0; i < SALT_LENGTH; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
    }
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Simple hash function fallback when crypto.subtle is unavailable
 * Why: crypto.subtle requires HTTPS, but we need to work in dev
 */
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    // Expand to longer hash by running multiple rounds
    let result = '';
    for (let round = 0; round < 8; round++) {
        let roundHash = hash + round * 31337;
        for (let i = 0; i < str.length; i++) {
            roundHash = ((roundHash << 5) - roundHash) + str.charCodeAt(i) + round;
            roundHash = roundHash & roundHash;
        }
        result += Math.abs(roundHash).toString(16).padStart(8, '0');
    }
    return result;
}

/**
 * Hashes a PIN with salt using SHA-256 (or fallback)
 * Why: Secure storage without storing the actual PIN
 */
async function hashPin(pin: string, salt: string): Promise<string> {
    const input = salt + pin;

    // Try Web Crypto API first (requires HTTPS)
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(input);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        } catch {
            // Fall through to simple hash
        }
    }

    // Fallback for HTTP/dev environments
    return simpleHash(input);
}

/**
 * Creates a new PIN hash with embedded salt
 */
export async function createPinHash(pin: string): Promise<string> {
    if (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
        throw new Error('PIN must be 4-6 digits');
    }

    const salt = generateSalt();
    const hash = await hashPin(pin, salt);
    return `${salt}:${hash}`;
}

/**
 * Verifies a PIN against a stored hash
 * Returns true if valid, false if invalid or locked out
 */
export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
    // Check lockout
    if (isLockedOut()) {
        return false;
    }

    const [salt, expectedHash] = storedHash.split(':');
    if (!salt || !expectedHash) {
        return false;
    }

    const hash = await hashPin(pin, salt);
    const isValid = hash === expectedHash;

    if (isValid) {
        failedAttempts = 0;
    } else {
        failedAttempts++;
        if (failedAttempts >= MAX_ATTEMPTS) {
            lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
        }
    }

    return isValid;
}

/**
 * Checks if currently locked out due to failed attempts
 */
export function isLockedOut(): boolean {
    if (lockoutUntil > Date.now()) {
        return true;
    }

    // Lockout expired, reset
    if (lockoutUntil > 0) {
        lockoutUntil = 0;
        failedAttempts = 0;
    }

    return false;
}

/**
 * Gets remaining lockout time in seconds
 */
export function getLockoutRemaining(): number {
    if (!isLockedOut()) return 0;
    return Math.ceil((lockoutUntil - Date.now()) / 1000);
}

/**
 * Gets remaining attempts before lockout
 */
export function getRemainingAttempts(): number {
    return Math.max(0, MAX_ATTEMPTS - failedAttempts);
}
