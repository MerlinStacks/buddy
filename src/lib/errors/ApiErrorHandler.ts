/**
 * API Error Handler
 * Provides user-friendly error messages and recovery actions
 */

export interface ApiError {
    code: string;
    message: string;
    recoveryAction?: 'settings' | 'retry' | 'wait';
    retryAfter?: number; // seconds
}

/**
 * Parses API errors into user-friendly format
 */
export function parseApiError(error: unknown): ApiError {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();

        // Invalid API key
        if (message.includes('invalid api key') || message.includes('401') || message.includes('unauthorized')) {
            return {
                code: 'INVALID_API_KEY',
                message: 'Your API key is invalid or expired. Please check your settings.',
                recoveryAction: 'settings',
            };
        }

        // Rate limited
        if (message.includes('rate limit') || message.includes('429') || message.includes('too many requests')) {
            const retryMatch = message.match(/retry.+?(\d+)/i);
            const retryAfter = retryMatch ? parseInt(retryMatch[1], 10) : 60;
            return {
                code: 'RATE_LIMITED',
                message: `Too many requests. Please wait ${retryAfter} seconds.`,
                recoveryAction: 'wait',
                retryAfter,
            };
        }

        // Model unavailable
        if (message.includes('model') && (message.includes('unavailable') || message.includes('not found'))) {
            return {
                code: 'MODEL_UNAVAILABLE',
                message: 'The selected model is currently unavailable. Try a different model.',
                recoveryAction: 'settings',
            };
        }

        // Network error
        if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) {
            return {
                code: 'NETWORK_ERROR',
                message: 'Unable to connect. Check your internet connection.',
                recoveryAction: 'retry',
            };
        }

        // Insufficient credits
        if (message.includes('credit') || message.includes('balance') || message.includes('payment')) {
            return {
                code: 'INSUFFICIENT_CREDITS',
                message: 'Your OpenRouter account has insufficient credits.',
                recoveryAction: 'settings',
            };
        }

        // Generic error
        return {
            code: 'UNKNOWN',
            message: error.message || 'An unexpected error occurred.',
            recoveryAction: 'retry',
        };
    }

    return {
        code: 'UNKNOWN',
        message: 'An unexpected error occurred.',
        recoveryAction: 'retry',
    };
}

/**
 * Gets recovery action description
 */
export function getRecoveryMessage(error: ApiError): string {
    switch (error.recoveryAction) {
        case 'settings':
            return 'Go to Settings to fix this.';
        case 'retry':
            return 'Tap to try again.';
        case 'wait':
            return `Please wait ${error.retryAfter || 60} seconds.`;
        default:
            return '';
    }
}
