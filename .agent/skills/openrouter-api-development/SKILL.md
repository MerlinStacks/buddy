---
description: OpenRouter API integration patterns for streaming chat and model management
---

# OpenRouter API Development

Standards for working with the OpenRouter API in Buddy.

## Core Module

All OpenRouter logic lives in `src/lib/openrouter.ts`.

## Streaming Chat Pattern

```tsx
import { streamChat, type ChatMessage } from '@/lib/openrouter';

async function handleChat(messages: ChatMessage[]) {
  const apiKey = useAppStore.getState().apiKey;
  const model = useAppStore.getState().selectedModel;
  
  if (!apiKey || !model) {
    throw new Error('API key and model required');
  }

  let fullResponse = '';
  
  for await (const chunk of streamChat(apiKey, model.id, messages)) {
    fullResponse += chunk;
    // Update UI incrementally
  }
  
  return fullResponse;
}
```

## Message Formatting

### System Prompt
Always include personality context:
```tsx
const systemMessage: ChatMessage = {
  role: 'system',
  content: buildSystemPrompt(personality, userName),
};

function buildSystemPrompt(personality: PersonalityLevel, name: string | null): string {
  const base = `You are Buddy, a friendly AI companion.`;
  const nameContext = name ? ` The user's name is ${name}.` : '';
  
  const tones = {
    playful: 'Be enthusiastic, use emojis, and keep things fun!',
    balanced: 'Be friendly and helpful with a warm tone.',
    professional: 'Be concise and informative.',
  };
  
  return `${base}${nameContext} ${tones[personality]}`;
}
```

## Error Handling

```tsx
try {
  const response = await streamChat(apiKey, model, messages);
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('401')) {
      // Invalid API key
      showError('Invalid API key. Please check your settings.');
    } else if (error.message.includes('429')) {
      // Rate limited
      showError('Too many requests. Please wait a moment.');
    } else {
      showError(error.message);
    }
  }
}
```

## Model Selection

### Filtering
Filter models by capability:
```tsx
const chatModels = models.filter(
  (m) => m.architecture?.output_modalities?.includes('text')
);
```

### Recommended Defaults
- Fast responses: `anthropic/claude-3-haiku`
- Balanced: `anthropic/claude-sonnet-4-20250514`
- High quality: `anthropic/claude-opus-4-20250514`

## AbortController for Cancellation

```tsx
const controller = new AbortController();

// In component
useEffect(() => {
  return () => controller.abort();
}, []);

// Pass to streamChat
for await (const chunk of streamChat(apiKey, model, messages, controller.signal)) {
  // ...
}
```

## Token Optimization

1. Limit conversation history to last 10-20 messages
2. Summarize old context periodically
3. Use shorter model IDs when possible
