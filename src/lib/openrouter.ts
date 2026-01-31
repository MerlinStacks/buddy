/**
 * OpenRouter API client
 * Handles model listing and chat completions with streaming support
 */

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface OpenRouterModel {
    id: string;
    name: string;
    description?: string;
    context_length: number;
    pricing: {
        prompt: string;
        completion: string;
    };
    top_provider?: {
        context_length: number;
        max_completion_tokens: number;
    };
    architecture?: {
        input_modalities: string[];
        output_modalities: string[];
    };
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatCompletionChunk {
    id: string;
    choices: {
        index: number;
        delta: {
            role?: string;
            content?: string;
        };
        finish_reason: string | null;
    }[];
}

/**
 * Fetches available models from OpenRouter API
 * Why: We need this to populate the model selector dropdown
 */
export async function fetchModels(apiKey: string): Promise<OpenRouterModel[]> {
    const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();

    // Filter to chat-capable models only
    return (data.data as OpenRouterModel[]).filter(
        (model) => model.architecture?.output_modalities?.includes('text')
    );
}

/**
 * Streams a chat completion from OpenRouter
 * Why: Streaming provides better UX with real-time response display
 */
export async function* streamChat(
    apiKey: string,
    model: string,
    messages: ChatMessage[],
    signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        },
        body: JSON.stringify({
            model,
            messages,
            stream: true,
        }),
        signal,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `Chat request failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body is not readable');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') return;

                try {
                    const chunk: ChatCompletionChunk = JSON.parse(data);
                    const content = chunk.choices[0]?.delta?.content;
                    if (content) yield content;
                } catch {
                    // Skip malformed JSON chunks
                }
            }
        }
    }
}
