'use client';

/**
 * Settings Panel
 * Slide-out panel for all app settings
 */

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { ModelSelector } from './ModelSelector';
import { useTheme } from '@/lib/theme/ThemeProvider';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
    const { theme, setTheme, preference } = useTheme();

    const apiKey = useAppStore((s) => s.apiKey);
    const setApiKey = useAppStore((s) => s.setApiKey);
    const personality = useAppStore((s) => s.personality);
    const setPersonality = useAppStore((s) => s.setPersonality);
    const voiceEnabled = useAppStore((s) => s.voiceEnabled);
    const setVoiceEnabled = useAppStore((s) => s.setVoiceEnabled);
    const proactiveEnabled = useAppStore((s) => s.proactiveEnabled);
    const setProactiveEnabled = useAppStore((s) => s.setProactiveEnabled);
    const proactiveIntervalMinutes = useAppStore((s) => s.proactiveIntervalMinutes);
    const setProactiveInterval = useAppStore((s) => s.setProactiveInterval);

    const [localApiKey, setLocalApiKey] = useState(apiKey || '');

    useEffect(() => {
        setLocalApiKey(apiKey || '');
    }, [apiKey]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-slate-900/95 backdrop-blur-xl border-l border-white/10 z-50 overflow-y-auto animate-slide-in-right">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white">Settings</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* API Key */}
                    <section className="mb-6">
                        <label className="block text-sm font-medium text-white/70 mb-2">
                            OpenRouter API Key
                        </label>
                        <input
                            type="password"
                            value={localApiKey}
                            onChange={(e) => setLocalApiKey(e.target.value)}
                            onBlur={() => setApiKey(localApiKey || null)}
                            placeholder="sk-or-v1-..."
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 font-mono text-sm"
                        />
                    </section>

                    {/* Model Selector */}
                    <section className="mb-6">
                        <label className="block text-sm font-medium text-white/70 mb-2">
                            AI Model
                        </label>
                        <ModelSelector />
                    </section>

                    {/* Theme */}
                    <section className="mb-6">
                        <label className="block text-sm font-medium text-white/70 mb-2">
                            Theme
                        </label>
                        <div className="flex gap-2">
                            {(['dark', 'light', 'system'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTheme(t)}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${preference === t
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                                        }`}
                                >
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Personality */}
                    <section className="mb-6">
                        <label className="block text-sm font-medium text-white/70 mb-2">
                            Personality
                        </label>
                        <div className="flex gap-2">
                            {(['playful', 'balanced', 'professional'] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPersonality(p)}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${personality === p
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                                        }`}
                                >
                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Voice */}
                    <section className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium text-white">
                                    Voice Mode
                                </label>
                                <p className="text-xs text-white/50">Speak to Buddy</p>
                            </div>
                            <button
                                onClick={() => setVoiceEnabled(!voiceEnabled)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${voiceEnabled ? 'bg-emerald-500' : 'bg-white/20'
                                    }`}
                            >
                                <span
                                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${voiceEnabled ? 'translate-x-6' : ''
                                        }`}
                                />
                            </button>
                        </div>
                    </section>

                    {/* Proactive Messages */}
                    <section className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <label className="block text-sm font-medium text-white">
                                    Proactive Messages
                                </label>
                                <p className="text-xs text-white/50">Buddy checks in on you</p>
                            </div>
                            <button
                                onClick={() => setProactiveEnabled(!proactiveEnabled)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${proactiveEnabled ? 'bg-emerald-500' : 'bg-white/20'
                                    }`}
                            >
                                <span
                                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${proactiveEnabled ? 'translate-x-6' : ''
                                        }`}
                                />
                            </button>
                        </div>
                        {proactiveEnabled && (
                            <div>
                                <label className="block text-xs text-white/50 mb-1">
                                    Check-in every {proactiveIntervalMinutes} minutes
                                </label>
                                <input
                                    type="range"
                                    min="15"
                                    max="240"
                                    step="15"
                                    value={proactiveIntervalMinutes}
                                    onChange={(e) => setProactiveInterval(Number(e.target.value))}
                                    className="w-full accent-emerald-500"
                                />
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}
