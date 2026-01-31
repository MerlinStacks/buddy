'use client';

/**
 * Theme Provider
 * Manages dark/light theme with system preference detection
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAppStore } from '@/lib/store';

type ResolvedTheme = 'dark' | 'light';

interface ThemeContextValue {
    theme: ResolvedTheme;
    setTheme: (theme: 'dark' | 'light' | 'system') => void;
    preference: 'dark' | 'light' | 'system';
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const preference = useAppStore((s) => s.theme);
    const setPreference = useAppStore((s) => s.setTheme);
    const [resolved, setResolved] = useState<ResolvedTheme>('dark');

    useEffect(() => {
        // Resolve theme based on preference
        const resolveTheme = (): ResolvedTheme => {
            if (preference === 'system') {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            return preference;
        };

        const updateTheme = () => {
            const theme = resolveTheme();
            setResolved(theme);
            document.documentElement.setAttribute('data-theme', theme);
            document.documentElement.classList.toggle('dark', theme === 'dark');
        };

        updateTheme();

        // Listen for system preference changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            if (preference === 'system') updateTheme();
        };
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [preference]);

    return (
        <ThemeContext.Provider
            value={{
                theme: resolved,
                setTheme: setPreference,
                preference,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
