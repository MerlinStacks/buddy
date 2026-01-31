'use client';

/**
 * Chat Container
 * Main chat interface with message list and input
 */

import { useRef, useEffect, useState, useCallback, FormEvent } from 'react';
import { useAppStore } from '@/lib/store';
import { streamChat, type ChatMessage } from '@/lib/openrouter';
import { saveMessage, getRecentMessages } from '@/lib/memory/MemoryStore';
import { analyzeStreamingEmotion } from '@/lib/emotionDetector';
import { MessageBubble } from './MessageBubble';
import { BuddyScene } from '@/components/buddy/BuddyScene';

export function ChatContainer() {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const messages = useAppStore((s) => s.messages);
    const addMessage = useAppStore((s) => s.addMessage);
    const apiKey = useAppStore((s) => s.apiKey);
    const selectedModel = useAppStore((s) => s.selectedModel);
    const userName = useAppStore((s) => s.userName);
    const personality = useAppStore((s) => s.personality);
    const setBuddyMood = useAppStore((s) => s.setBuddyMood);
    const setStreaming = useAppStore((s) => s.setStreaming);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load messages from IndexedDB on mount
    useEffect(() => {
        async function loadMessages() {
            const stored = await getRecentMessages(100);
            stored.forEach((msg) => {
                if (msg.role !== 'system') {
                    addMessage({
                        id: msg.id,
                        role: msg.role as 'user' | 'assistant',
                        content: msg.content,
                        timestamp: msg.timestamp,
                    });
                }
            });
        }
        if (messages.length === 0) {
            loadMessages();
        }
    }, []);

    const buildSystemPrompt = useCallback((): string => {
        const personalityTraits = {
            playful: 'You are playful, use emojis often, and have a fun, casual tone.',
            balanced: 'You are friendly and helpful with a warm, conversational tone.',
            professional: 'You are professional and concise while remaining warm.',
        };

        return `You are Buddy, a friendly AI companion. ${personalityTraits[personality]}
${userName ? `The user's name is ${userName}. Use their name occasionally.` : ''}
You remember previous conversations and care about the user's wellbeing.
Keep responses concise but thoughtful. Show genuine interest in the user.`;
    }, [userName, personality]);

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !apiKey || !selectedModel || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setIsLoading(true);
        setBuddyMood('thinking');

        // Add user message
        const userMsgId = crypto.randomUUID();
        addMessage({
            id: userMsgId,
            role: 'user',
            content: userMessage,
            timestamp: Date.now(),
        });
        await saveMessage('user', userMessage);

        // Build conversation history
        const chatMessages: ChatMessage[] = [
            { role: 'system', content: buildSystemPrompt() },
            ...messages.slice(-20).map((m) => ({
                role: m.role as 'system' | 'user' | 'assistant',
                content: m.content,
            })),
            { role: 'user', content: userMessage },
        ];

        // Create abort controller for cancellation
        abortControllerRef.current = new AbortController();

        try {
            setStreaming(true);
            setBuddyMood('talking');

            let assistantContent = '';
            const assistantMsgId = crypto.randomUUID();

            // Add placeholder message
            addMessage({
                id: assistantMsgId,
                role: 'assistant',
                content: '',
                timestamp: Date.now(),
            });

            // Stream the response
            for await (const chunk of streamChat(
                apiKey,
                selectedModel.id,
                chatMessages,
                abortControllerRef.current.signal
            )) {
                assistantContent += chunk;

                // Analyze emotion in response content and update mood
                const detectedMood = analyzeStreamingEmotion(assistantContent, 'talking');
                if (detectedMood !== 'talking') {
                    setBuddyMood(detectedMood);
                }

                // Update the message in-place by modifying store
                useAppStore.setState((state) => ({
                    messages: state.messages.map((m) =>
                        m.id === assistantMsgId ? { ...m, content: assistantContent } : m
                    ),
                }));
            }

            // Save to IndexedDB and set final mood based on content
            await saveMessage('assistant', assistantContent);
            const finalMood = analyzeStreamingEmotion(assistantContent, 'happy');
            setBuddyMood(finalMood);

            // Return to idle after a moment
            setTimeout(() => setBuddyMood('idle'), 3000);
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                setBuddyMood('confused');
                addMessage({
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: `Oops, something went wrong: ${(error as Error).message}`,
                    timestamp: Date.now(),
                });
            }
        } finally {
            setIsLoading(false);
            setStreaming(false);
            abortControllerRef.current = null;
        }
    }, [input, apiKey, selectedModel, isLoading, messages, addMessage, buildSystemPrompt, setBuddyMood, setStreaming]);

    const handleCancel = useCallback(() => {
        abortControllerRef.current?.abort();
    }, []);

    return (
        <div className="flex flex-col h-full">
            {/* Buddy at top */}
            <div className="flex-shrink-0 h-48 md:h-64">
                <BuddyScene className="w-full h-full" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
                {messages.length === 0 && (
                    <div className="text-center text-white/40 py-8">
                        <p>Say hi to Buddy! 👋</p>
                    </div>
                )}
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        role={msg.role}
                        content={msg.content}
                        timestamp={msg.timestamp}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex-shrink-0 p-4 border-t border-white/10">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 disabled:opacity-50"
                    />
                    {isLoading ? (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-3 bg-red-500/80 hover:bg-red-500 text-white rounded-xl transition-colors"
                        >
                            Stop
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={!input.trim() || !apiKey || !selectedModel}
                            className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                        >
                            Send
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
