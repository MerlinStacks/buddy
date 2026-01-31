/**
 * Zustand store for global app state
 * Handles UI state, settings, and chat context
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OpenRouterModel } from './openrouter';

export type BuddyMood = 'idle' | 'thinking' | 'talking' | 'happy' | 'sleepy' | 'confused';
export type PersonalityLevel = 'playful' | 'balanced' | 'professional';
export type Theme = 'dark' | 'light' | 'system';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

interface AppState {
    // Auth
    isUnlocked: boolean;
    pinHash: string | null;

    // User
    userName: string | null;
    hasCompletedOnboarding: boolean;

    // Chat
    messages: Message[];
    isStreaming: boolean;
    buddyMood: BuddyMood;

    // Settings
    apiKey: string | null;
    selectedModel: OpenRouterModel | null;
    personality: PersonalityLevel;
    theme: Theme;
    voiceEnabled: boolean;
    proactiveEnabled: boolean;
    proactiveIntervalMinutes: number;

    // Actions
    setUnlocked: (unlocked: boolean) => void;
    setPinHash: (hash: string | null) => void;
    setUserName: (name: string) => void;
    setOnboardingComplete: () => void;
    addMessage: (message: Message) => void;
    clearMessages: () => void;
    setStreaming: (streaming: boolean) => void;
    setBuddyMood: (mood: BuddyMood) => void;
    setApiKey: (key: string | null) => void;
    setSelectedModel: (model: OpenRouterModel | null) => void;
    setPersonality: (level: PersonalityLevel) => void;
    setTheme: (theme: Theme) => void;
    setVoiceEnabled: (enabled: boolean) => void;
    setProactiveEnabled: (enabled: boolean) => void;
    setProactiveInterval: (minutes: number) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Auth
            isUnlocked: false,
            pinHash: null,

            // User
            userName: null,
            hasCompletedOnboarding: false,

            // Chat
            messages: [],
            isStreaming: false,
            buddyMood: 'idle',

            // Settings
            apiKey: null,
            selectedModel: null,
            personality: 'balanced',
            theme: 'dark',
            voiceEnabled: false,
            proactiveEnabled: true,
            proactiveIntervalMinutes: 60,

            // Actions
            setUnlocked: (unlocked) => set({ isUnlocked: unlocked }),
            setPinHash: (hash) => set({ pinHash: hash }),
            setUserName: (name) => set({ userName: name }),
            setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
            addMessage: (message) =>
                set((state) => ({ messages: [...state.messages, message] })),
            clearMessages: () => set({ messages: [] }),
            setStreaming: (streaming) => set({ isStreaming: streaming }),
            setBuddyMood: (mood) => set({ buddyMood: mood }),
            setApiKey: (key) => set({ apiKey: key }),
            setSelectedModel: (model) => set({ selectedModel: model }),
            setPersonality: (level) => set({ personality: level }),
            setTheme: (theme) => set({ theme: theme }),
            setVoiceEnabled: (enabled) => set({ voiceEnabled: enabled }),
            setProactiveEnabled: (enabled) => set({ proactiveEnabled: enabled }),
            setProactiveInterval: (minutes) => set({ proactiveIntervalMinutes: minutes }),
        }),
        {
            name: 'buddy-storage',
            // Don't persist sensitive data or runtime state
            partialize: (state) => ({
                pinHash: state.pinHash,
                userName: state.userName,
                hasCompletedOnboarding: state.hasCompletedOnboarding,
                apiKey: state.apiKey,
                selectedModel: state.selectedModel,
                personality: state.personality,
                theme: state.theme,
                voiceEnabled: state.voiceEnabled,
                proactiveEnabled: state.proactiveEnabled,
                proactiveIntervalMinutes: state.proactiveIntervalMinutes,
            }),
        }
    )
);
