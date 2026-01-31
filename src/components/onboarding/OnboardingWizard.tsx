'use client';

/**
 * Onboarding Wizard
 * Multi-step setup: name, API key, PIN, notifications, meet Buddy
 */

import { useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { createPinHash } from '@/lib/auth/PinLock';
import { BuddyScene } from '@/components/buddy/BuddyScene';

type Step = 'welcome' | 'name' | 'apiKey' | 'pin' | 'notifications' | 'complete';

export function OnboardingWizard() {
    const [step, setStep] = useState<Step>('welcome');
    const [name, setName] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [pin, setPin] = useState('');
    const [pinConfirm, setPinConfirm] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const setUserName = useAppStore((s) => s.setUserName);
    const setApiKeyStore = useAppStore((s) => s.setApiKey);
    const setPinHash = useAppStore((s) => s.setPinHash);
    const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);
    const setUnlocked = useAppStore((s) => s.setUnlocked);
    const setBuddyMood = useAppStore((s) => s.setBuddyMood);

    const handleNameSubmit = useCallback(() => {
        if (name.trim().length < 1) {
            setError('Please enter your name');
            return;
        }
        setUserName(name.trim());
        setError('');
        setStep('apiKey');
    }, [name, setUserName]);

    const handleApiKeySubmit = useCallback(() => {
        if (!apiKey.startsWith('sk-')) {
            setError('API key should start with "sk-"');
            return;
        }
        setApiKeyStore(apiKey);
        setError('');
        setStep('pin');
    }, [apiKey, setApiKeyStore]);

    const handlePinSubmit = useCallback(async () => {
        if (pin.length < 4 || pin.length > 6) {
            setError('PIN must be 4-6 digits');
            return;
        }
        if (!/^\d+$/.test(pin)) {
            setError('PIN must contain only numbers');
            return;
        }
        if (pin !== pinConfirm) {
            setError('PINs do not match');
            return;
        }

        setIsLoading(true);
        try {
            const hash = await createPinHash(pin);
            setPinHash(hash);
            setError('');
            setStep('notifications');
        } catch (e) {
            setError('Failed to create PIN');
        } finally {
            setIsLoading(false);
        }
    }, [pin, pinConfirm, setPinHash]);

    const handleNotifications = useCallback(async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
        setStep('complete');
        setBuddyMood('happy');
    }, [setBuddyMood]);

    const handleComplete = useCallback(() => {
        setOnboardingComplete();
        setUnlocked(true);
    }, [setOnboardingComplete, setUnlocked]);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 z-50">
            {/* Buddy appears throughout onboarding */}
            <div className="w-48 h-48 mb-6">
                <BuddyScene className="w-full h-full" />
            </div>

            <div className="w-full max-w-sm">
                {/* Step: Welcome */}
                {step === 'welcome' && (
                    <div className="text-center animate-fade-in">
                        <h1 className="text-3xl font-bold text-white mb-2">Hey there! 👋</h1>
                        <p className="text-white/70 mb-8">
                            I&apos;m Buddy, your AI companion. Let&apos;s get to know each other!
                        </p>
                        <button
                            onClick={() => setStep('name')}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
                        >
                            Get Started
                        </button>
                    </div>
                )}

                {/* Step: Name */}
                {step === 'name' && (
                    <div className="animate-fade-in">
                        <h2 className="text-xl font-semibold text-white mb-2 text-center">
                            What&apos;s your name?
                        </h2>
                        <p className="text-white/50 text-sm mb-6 text-center">
                            So I know what to call you
                        </p>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 mb-4"
                            onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                            autoFocus
                        />
                        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                        <button
                            onClick={handleNameSubmit}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* Step: API Key */}
                {step === 'apiKey' && (
                    <div className="animate-fade-in">
                        <h2 className="text-xl font-semibold text-white mb-2 text-center">
                            OpenRouter API Key
                        </h2>
                        <p className="text-white/50 text-sm mb-6 text-center">
                            Get yours at{' '}
                            <a
                                href="https://openrouter.ai/keys"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:underline"
                            >
                                openrouter.ai/keys
                            </a>
                        </p>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-or-v1-..."
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 mb-4 font-mono text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleApiKeySubmit()}
                            autoFocus
                        />
                        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                        <button
                            onClick={handleApiKeySubmit}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* Step: PIN */}
                {step === 'pin' && (
                    <div className="animate-fade-in">
                        <h2 className="text-xl font-semibold text-white mb-2 text-center">
                            Set a PIN
                        </h2>
                        <p className="text-white/50 text-sm mb-6 text-center">
                            Protects your conversations
                        </p>
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="4-6 digit PIN"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 mb-3 text-center text-2xl tracking-widest"
                            inputMode="numeric"
                            autoFocus
                        />
                        <input
                            type="password"
                            value={pinConfirm}
                            onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Confirm PIN"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 mb-4 text-center text-2xl tracking-widest"
                            inputMode="numeric"
                            onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
                        />
                        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                        <button
                            onClick={handlePinSubmit}
                            disabled={isLoading}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
                        >
                            {isLoading ? 'Setting up...' : 'Continue'}
                        </button>
                    </div>
                )}

                {/* Step: Notifications */}
                {step === 'notifications' && (
                    <div className="animate-fade-in text-center">
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Stay Connected
                        </h2>
                        <p className="text-white/50 text-sm mb-6">
                            I can send you reminders and check in from time to time
                        </p>
                        <button
                            onClick={handleNotifications}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors mb-3"
                        >
                            Enable Notifications
                        </button>
                        <button
                            onClick={() => setStep('complete')}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white/70 font-medium rounded-xl transition-colors"
                        >
                            Maybe Later
                        </button>
                    </div>
                )}

                {/* Step: Complete */}
                {step === 'complete' && (
                    <div className="animate-fade-in text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Nice to meet you, {useAppStore.getState().userName}! 🎉
                        </h2>
                        <p className="text-white/70 mb-8">
                            I&apos;m excited to chat with you. Ask me anything, set reminders,
                            or just say hi whenever you want!
                        </p>
                        <button
                            onClick={handleComplete}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
                        >
                            Start Chatting
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
