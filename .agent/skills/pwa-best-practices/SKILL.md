---
description: Progressive Web App standards for offline-first, push notifications, and installability
---

# PWA Best Practices

Standards for PWA features in Buddy.

## Manifest Configuration

Location: `public/manifest.json`

```json
{
  "name": "Buddy - AI Companion",
  "short_name": "Buddy",
  "description": "Your proactive AI chatbot companion",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#8b5cf6",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

## Meta Tags (Next.js 16)

In `src/app/layout.tsx`:
```tsx
export const metadata: Metadata = {
  title: 'Buddy',
  description: 'Your proactive AI chatbot companion',
  manifest: '/manifest.json',
  themeColor: '#8b5cf6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Buddy',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};
```

> **Important**: Use `mobile-web-app-capable`, NOT the deprecated `apple-mobile-web-app-capable`.

## Service Worker

Register in layout or dedicated hook:
```tsx
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
}, []);
```

## Push Notifications (web-push)

### VAPID Keys
Generate once and store in `.env`:
```bash
npx web-push generate-vapid-keys
```

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

### Subscribe Pattern
```tsx
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  });
  
  // Send subscription to server
  await fetch('/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
  });
}
```

## Offline Storage (idb)

Use `idb` for IndexedDB operations:
```tsx
import { openDB } from 'idb';

const db = await openDB('buddy-db', 1, {
  upgrade(db) {
    db.createObjectStore('memories', { keyPath: 'id' });
    db.createObjectStore('conversations', { keyPath: 'id' });
  },
});

// Store memory
await db.put('memories', { id: 'mem-1', content: '...' });

// Retrieve memories
const memories = await db.getAll('memories');
```

## Install Prompt

```tsx
const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

useEffect(() => {
  const handler = (e: Event) => {
    e.preventDefault();
    setDeferredPrompt(e as BeforeInstallPromptEvent);
  };
  
  window.addEventListener('beforeinstallprompt', handler);
  return () => window.removeEventListener('beforeinstallprompt', handler);
}, []);

async function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  }
}
```

## Checklist

- [ ] Manifest with all required icons
- [ ] Service worker registered
- [ ] Offline fallback page
- [ ] Push notification permission flow
- [ ] Install prompt UI
