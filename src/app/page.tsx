'use client';

/**
 * Main Page
 * Entry point that handles onboarding, lock screen, and chat
 */

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { LockScreen } from '@/components/auth/LockScreen';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const isUnlocked = useAppStore((s) => s.isUnlocked);
  const pinHash = useAppStore((s) => s.pinHash);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show onboarding for new users
  if (!hasCompletedOnboarding) {
    return <OnboardingWizard />;
  }

  // Show lock screen if PIN is set and not unlocked
  if (pinHash && !isUnlocked) {
    return <LockScreen />;
  }

  // Main chat interface
  return (
    <main className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h1 className="text-lg font-semibold text-white">Buddy</h1>
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Settings"
        >
          <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <ChatContainer />
      </div>

      {/* Settings Panel */}
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </main>
  );
}
