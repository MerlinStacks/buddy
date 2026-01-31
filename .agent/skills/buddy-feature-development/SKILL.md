---
description: End-to-end feature implementation guide for Buddy PWA
---

# Buddy Feature Development

Step-by-step guide for implementing new features in Buddy.

## Implementation Path

```
1. lib/       → Types, utilities, API clients
2. components/→ UI components
3. app/       → Page integration
4. store.ts   → State (if needed)
5. Test       → Verify in browser
```

## Step 1: Define Types (lib/)

Create or update types in a dedicated file:

```tsx
// src/lib/feature-name/types.ts
export interface FeatureConfig {
  enabled: boolean;
  options: FeatureOptions;
}

export interface FeatureOptions {
  // ...
}
```

## Step 2: Build Utilities (lib/)

Add business logic:

```tsx
// src/lib/feature-name/utils.ts

/**
 * processFeatureData
 * Why: Handles the core transformation for feature X
 */
export function processFeatureData(input: Input): Output {
  // Implementation
}
```

## Step 3: Create Components (components/)

Follow component patterns skill:

```tsx
// src/components/feature-name/FeaturePanel.tsx

'use client';

import { processFeatureData } from '@/lib/feature-name/utils';

export function FeaturePanel() {
  // Component implementation
}
```

## Step 4: Integrate in Pages (app/)

Wire into the appropriate page:

```tsx
// src/app/page.tsx or specific route

import { FeaturePanel } from '@/components/feature-name/FeaturePanel';

export default function Page() {
  return (
    <main>
      <FeaturePanel />
    </main>
  );
}
```

## Step 5: Add State (optional)

If the feature needs global state:

```tsx
// In src/lib/store.ts

interface AppState {
  // Add new state
  featureEnabled: boolean;
  setFeatureEnabled: (enabled: boolean) => void;
}
```

## Step 6: Verify

1. Run `npm run dev`
2. Test feature in browser
3. Check console for errors
4. Verify mobile responsiveness
5. Test offline behavior (if applicable)

---

## Feature Checklist

Before marking complete:

- [ ] Types defined in `lib/`
- [ ] Business logic isolated from UI
- [ ] Component follows Glassmorphism patterns
- [ ] State added to Zustand (if needed)
- [ ] Error boundaries in place
- [ ] Mobile responsive
- [ ] Keyboard accessible
- [ ] No `console.log` in production code

---

## Common Patterns

### Feature Flag
```tsx
const featureEnabled = useAppStore((s) => s.featureEnabled);

if (!featureEnabled) return null;

return <FeatureComponent />;
```

### Loading State
```tsx
const { data, isLoading, error } = useQuery({...});

if (isLoading) return <Skeleton />;
if (error) return <ErrorDisplay error={error} />;
return <FeatureContent data={data} />;
```

### Optimistic Updates
```tsx
const mutation = useMutation({
  mutationFn: updateFeature,
  onMutate: async (newData) => {
    // Optimistically update UI
    queryClient.setQueryData(['feature'], newData);
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['feature'], context.previousData);
  },
});
```
