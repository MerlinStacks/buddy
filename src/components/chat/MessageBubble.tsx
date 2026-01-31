'use client';

/**
 * Message Bubble Component
 * Glassmorphism styled chat bubbles with timestamps
 */

import { memo } from 'react';

interface MessageBubbleProps {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

function formatTime(timestamp: number): string {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(new Date(timestamp));
}

export const MessageBubble = memo(function MessageBubble({
    role,
    content,
    timestamp,
}: MessageBubbleProps) {
    const isUser = role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[80%] md:max-w-[70%] px-4 py-3 rounded-2xl ${isUser
                        ? 'bg-emerald-500/80 text-white rounded-br-md'
                        : 'bg-white/10 backdrop-blur-md text-white/90 border border-white/10 rounded-bl-md'
                    }`}
            >
                {/* Content with markdown-lite rendering */}
                <div className="whitespace-pre-wrap break-words text-sm md:text-base">
                    {content || (
                        <span className="inline-flex gap-1">
                            <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                    )}
                </div>

                {/* Timestamp */}
                <div
                    className={`text-xs mt-1 ${isUser ? 'text-white/60' : 'text-white/40'
                        }`}
                >
                    {formatTime(timestamp)}
                </div>
            </div>
        </div>
    );
});
