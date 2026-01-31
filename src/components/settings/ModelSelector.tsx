'use client';

/**
 * Model Selector
 * Searchable dropdown for OpenRouter model selection
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { fetchModels, type OpenRouterModel } from '@/lib/openrouter';

export function ModelSelector() {
    const [models, setModels] = useState<OpenRouterModel[]>([]);
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const apiKey = useAppStore((s) => s.apiKey);
    const selectedModel = useAppStore((s) => s.selectedModel);
    const setSelectedModel = useAppStore((s) => s.setSelectedModel);

    // Load models when API key is available
    const loadModels = useCallback(async () => {
        if (!apiKey) return;

        setIsLoading(true);
        setError('');
        try {
            const data = await fetchModels(apiKey);
            // Sort by name
            data.sort((a, b) => a.name.localeCompare(b.name));
            setModels(data);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, [apiKey]);

    useEffect(() => {
        loadModels();
    }, [loadModels]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter models by search
    const filtered = models.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.id.toLowerCase().includes(search.toLowerCase())
    );

    const formatContextLength = (length: number): string => {
        if (length >= 1000000) return `${(length / 1000000).toFixed(1)}M`;
        if (length >= 1000) return `${(length / 1000).toFixed(0)}k`;
        return String(length);
    };

    if (!apiKey) {
        return (
            <div className="text-white/50 text-sm">
                Enter API key first
            </div>
        );
    }

    return (
        <div ref={dropdownRef} className="relative">
            {/* Selected / Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/15 transition-colors"
            >
                <span className="truncate text-left">
                    {selectedModel ? selectedModel.name : 'Select a model...'}
                </span>
                <svg
                    className={`w-4 h-4 text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/20 rounded-lg shadow-xl z-10 max-h-80 overflow-hidden flex flex-col">
                    {/* Search */}
                    <div className="p-2 border-b border-white/10">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search models..."
                            className="w-full px-3 py-2 bg-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none text-sm"
                            autoFocus
                        />
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto flex-1">
                        {isLoading && (
                            <div className="p-4 text-center text-white/50">Loading models...</div>
                        )}
                        {error && (
                            <div className="p-4 text-center text-red-400 text-sm">
                                {error}
                                <button onClick={loadModels} className="block mx-auto mt-2 text-emerald-400 hover:underline">
                                    Retry
                                </button>
                            </div>
                        )}
                        {!isLoading && !error && filtered.length === 0 && (
                            <div className="p-4 text-center text-white/50">No models found</div>
                        )}
                        {filtered.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => {
                                    setSelectedModel(model);
                                    setIsOpen(false);
                                    setSearch('');
                                }}
                                className={`w-full px-3 py-2 text-left hover:bg-white/10 transition-colors ${selectedModel?.id === model.id ? 'bg-emerald-500/20' : ''
                                    }`}
                            >
                                <div className="text-white text-sm font-medium truncate">{model.name}</div>
                                <div className="text-white/50 text-xs flex gap-2">
                                    <span>{formatContextLength(model.context_length)} ctx</span>
                                    <span>•</span>
                                    <span>${parseFloat(model.pricing.prompt) * 1000000}/M tok</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
