---
description: Zustand state management patterns with persist middleware and selector optimization
---

# Zustand State Management

Standards for global state in Buddy using Zustand.

## Store Location

Main store: `src/lib/store.ts`

## Store Structure

```tsx
interface AppState {
  // Group by domain
  // Auth
  isUnlocked: boolean;
  pinHash: string | null;

  // Settings
  apiKey: string | null;
  theme: Theme;

  // Actions (always at the end)
  setTheme: (theme: Theme) => void;
}
```

## Adding New State

### 1. Add to Interface
```tsx
interface AppState {
  // ... existing
  newFeatureEnabled: boolean;
  setNewFeatureEnabled: (enabled: boolean) => void;
}
```

### 2. Add Default & Action
```tsx
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // ... existing
      newFeatureEnabled: false,
      setNewFeatureEnabled: (enabled) => set({ newFeatureEnabled: enabled }),
    }),
    // ...
  )
);
```

### 3. Update Partialize (if persisting)
```tsx
partialize: (state) => ({
  // ... existing
  newFeatureEnabled: state.newFeatureEnabled,
}),
```

## Selector Patterns

### Single Property (Preferred)
```tsx
const theme = useAppStore((s) => s.theme);
```

### Multiple Properties
```tsx
// Use shallow for object equality
import { useShallow } from 'zustand/react/shallow';

const { userName, personality } = useAppStore(
  useShallow((s) => ({
    userName: s.userName,
    personality: s.personality,
  }))
);
```

### Actions Only
```tsx
// Actions are stable, no selector needed
const setTheme = useAppStore((s) => s.setTheme);
```

## Persist Middleware

### What to Persist
- ✅ User preferences (theme, personality)
- ✅ Auth hashes (pinHash)
- ✅ API keys (encrypted ideally)
- ✅ Onboarding completion

### What NOT to Persist
- ❌ Runtime state (isStreaming, buddyMood)
- ❌ Transient UI state
- ❌ Unlocked status (isUnlocked)
- ❌ Full message history (use IndexedDB)

```tsx
partialize: (state) => ({
  // Only include what should survive refresh
  pinHash: state.pinHash,
  theme: state.theme,
  // NOT: isStreaming, messages, buddyMood
}),
```

## Async Actions

For async operations, use external functions:
```tsx
// In a separate file or same store
export async function sendMessage(content: string) {
  const { apiKey, selectedModel, addMessage } = useAppStore.getState();
  
  // Validate
  if (!apiKey || !selectedModel) throw new Error('Not configured');
  
  // Add user message
  addMessage({ id: crypto.randomUUID(), role: 'user', content, timestamp: Date.now() });
  
  // Stream response...
}
```

## Integration with React Query

For server state, prefer React Query:
```tsx
// React Query for server data
const { data: models } = useQuery({
  queryKey: ['models'],
  queryFn: () => fetchModels(apiKey),
});

// Zustand for client state
const selectedModel = useAppStore((s) => s.selectedModel);
```
