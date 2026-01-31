---
description: React Three Fiber patterns for 3D mascot animations and performance
---

# Three.js Mascot Development

Standards for the 3D Buddy mascot using React Three Fiber.

## Component Location

`src/components/buddy/` - All 3D mascot components

## Canvas Setup

```tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

export function BuddyCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      dpr={[1, 2]} // Limit pixel ratio for performance
      performance={{ min: 0.5 }} // Allow frame drops on slow devices
    >
      <Suspense fallback={null}>
        <BuddyMascot />
      </Suspense>
    </Canvas>
  );
}
```

## Mood-Based Animation

```tsx
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Mesh } from 'three';
import { useAppStore } from '@/lib/store';

export function BuddyMascot() {
  const meshRef = useRef<Mesh>(null);
  const mood = useAppStore((s) => s.buddyMood);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    switch (mood) {
      case 'idle':
        // Gentle floating
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
        break;
      case 'thinking':
        // Slow rotation
        meshRef.current.rotation.y += delta * 0.5;
        break;
      case 'talking':
        // Slight bounce
        meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.02;
        break;
      case 'happy':
        // Energetic bounce
        meshRef.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 3)) * 0.2;
        break;
    }
  });

  return (
    <mesh ref={meshRef}>
      {/* Mascot geometry */}
    </mesh>
  );
}
```

## Performance Optimization

### Frame Rate Control
```tsx
<Canvas frameloop="demand"> // Only render when needed
```

### Geometry Optimization
- Use `BufferGeometry` over `Geometry`
- Limit polygon count to <10k for mobile
- Use `useMemo` for static geometry

### Mobile Detection
```tsx
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

<Canvas dpr={isMobile ? 1 : [1, 2]} />
```

## Drei Helpers

Common utilities from `@react-three/drei`:

```tsx
import {
  Float,           // Automatic floating animation
  Center,          // Center geometry
  useGLTF,         // Load GLTF models
  Environment,     // HDR environment maps
  OrbitControls,   // Camera controls (dev only)
} from '@react-three/drei';

// Float wrapper for idle animation
<Float speed={2} floatIntensity={0.5}>
  <BuddyMascot />
</Float>
```

## Loading States

```tsx
import { useProgress, Html } from '@react-three/drei';

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress.toFixed(0)}%</Html>;
}

<Suspense fallback={<Loader />}>
  <BuddyMascot />
</Suspense>
```

## Mood Transitions

Smooth transitions between moods:
```tsx
import { useSpring, animated } from '@react-spring/three';

const { scale } = useSpring({
  scale: mood === 'happy' ? 1.1 : 1,
  config: { tension: 300, friction: 20 },
});

<animated.mesh scale={scale}>
  {/* ... */}
</animated.mesh>
```

## Accessibility

- Provide 2D fallback for `prefers-reduced-motion`
- Add `aria-label` to Canvas wrapper
- Don't rely solely on animation for state
