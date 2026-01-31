---
description: React component development standards for Buddy PWA with Glassmorphism UI
---

# Buddy Component Patterns

Standards for building React components in the Buddy AI chatbot.

## File Structure

```
src/components/
├── feature-name/
│   ├── FeatureName.tsx      # Main component
│   └── feature-helpers.ts   # Local utilities (if needed)
```

## Component Template

```tsx
/**
 * ComponentName
 * Why: Brief explanation of the component's purpose
 */

'use client';

import { useAppStore } from '@/lib/store';

interface ComponentNameProps {
  // Always define explicit prop types
}

export function ComponentName({ ...props }: ComponentNameProps) {
  // Use selectors to avoid unnecessary re-renders
  const theme = useAppStore((s) => s.theme);

  return (
    <div className="glass-panel">
      {/* Component content */}
    </div>
  );
}
```

## Glassmorphism Design System

### Glass Panel Base
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
}
```

### Interactive States
- **Hover**: Increase background opacity to `0.08`
- **Active**: Add subtle scale transform `scale(0.98)`
- **Focus**: Use ring with accent color

### Color Tokens
- Primary accent: `--accent-primary` (vibrant purple/blue)
- Success: `--color-success` (green)
- Error: `--color-error` (red)
- Text primary: `rgba(255, 255, 255, 0.95)`
- Text secondary: `rgba(255, 255, 255, 0.6)`

## State Management

### Zustand Selectors
```tsx
// ✅ Good: Single property selector
const userName = useAppStore((s) => s.userName);

// ❌ Bad: Selecting entire store
const store = useAppStore();
```

### Actions
```tsx
// Call actions directly, no need for dispatch
const setTheme = useAppStore((s) => s.setTheme);
setTheme('dark');
```

## Error Handling

Wrap components that may fail with error boundaries:
```tsx
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

<ErrorBoundary fallback={<ErrorFallback />}>
  <RiskyComponent />
</ErrorBoundary>
```

## Accessibility

1. **ARIA labels**: All interactive elements need labels
2. **Keyboard nav**: Support Tab, Enter, Escape
3. **Focus visible**: Use `focus-visible:` utilities
4. **Contrast**: Ensure 4.5:1 minimum ratio
