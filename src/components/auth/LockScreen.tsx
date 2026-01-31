'use client';

/**
 * Lock Screen Component
 * PIN entry with numpad and biometric option
 */

import { useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { verifyPin, isLockedOut, getLockoutRemaining, getRemainingAttempts } from '@/lib/auth/PinLock';

export function LockScreen() {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const pinHash = useAppStore((s) => s.pinHash);
    const setUnlocked = useAppStore((s) => s.setUnlocked);
    const userName = useAppStore((s) => s.userName);

    const handleDigit = useCallback((digit: string) => {
        if (pin.length < 6) {
            setPin((p) => p + digit);
            setError('');
        }
    }, [pin]);

    const handleBackspace = useCallback(() => {
        setPin((p) => p.slice(0, -1));
        setError('');
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!pinHash || pin.length < 4) return;

        if (isLockedOut()) {
            setError(`Too many attempts. Try again in ${getLockoutRemaining()}s`);
            return;
        }

        setIsVerifying(true);
        try {
            const valid = await verifyPin(pin, pinHash);
            if (valid) {
                setUnlocked(true);
            } else {
                const remaining = getRemainingAttempts();
                setError(remaining > 0 ? `Incorrect PIN. ${remaining} attempts left` : 'Locked out');
                setPin('');
            }
        } catch {
            setError('Verification failed');
        } finally {
            setIsVerifying(false);
        }
    }, [pin, pinHash, setUnlocked]);

    // Auto-submit when 4-6 digits entered
    const handleDigitWithAutoSubmit = useCallback((digit: string) => {
        const newPin = pin + digit;
        setPin(newPin);
        setError('');

        // Auto-submit at 4 digits (or stored length)
        if (newPin.length >= 4 && pinHash) {
            setTimeout(() => {
                if (isLockedOut()) {
                    setError(`Too many attempts. Try again in ${getLockoutRemaining()}s`);
                    return;
                }
                verifyPin(newPin, pinHash).then((valid) => {
                    if (valid) {
                        setUnlocked(true);
                    } else {
                        const remaining = getRemainingAttempts();
                        setError(remaining > 0 ? `Incorrect PIN. ${remaining} attempts left` : 'Locked out');
                        setPin('');
                    }
                });
            }, 100);
        }
    }, [pin, pinHash, setUnlocked]);

    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50">
            {/* Welcome text */}
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-semibold text-white/90">
                    Welcome back{userName ? `, ${userName}` : ''}
                </h1>
                <p className="text-white/50 text-sm mt-1">Enter your PIN to unlock</p>
            </div>

            {/* PIN dots */}
            <div className="flex gap-3 mb-8">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className={`w-4 h-4 rounded-full transition-all duration-200 ${i < pin.length
                                ? 'bg-emerald-400 scale-110'
                                : 'bg-white/20 border border-white/30'
                            }`}
                    />
                ))}
            </div>

            {/* Error message */}
            {error && (
                <p className="text-red-400 text-sm mb-4 animate-shake">{error}</p>
            )}

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-4 w-64">
                {digits.map((digit, i) => (
                    <button
                        key={i}
                        disabled={isVerifying || (digit === '' ? true : false)}
                        onClick={() => {
                            if (digit === '⌫') handleBackspace();
                            else if (digit !== '') handleDigitWithAutoSubmit(digit);
                        }}
                        className={`h-16 rounded-2xl text-2xl font-medium transition-all duration-150 ${digit === ''
                                ? 'invisible'
                                : digit === '⌫'
                                    ? 'bg-white/5 text-white/70 hover:bg-white/10 active:scale-95'
                                    : 'bg-white/10 text-white hover:bg-white/20 active:scale-95 backdrop-blur-sm'
                            }`}
                    >
                        {digit}
                    </button>
                ))}
            </div>
        </div>
    );
}
