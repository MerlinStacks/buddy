'use client';

/**
 * 3D Buddy Scene
 * React Three Fiber canvas containing the animated blob mascot
 */

import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import { BuddyBlob } from './BuddyBlob';
import { useAppStore, type BuddyMood } from '@/lib/store';

interface BuddySceneProps {
    className?: string;
}

export function BuddyScene({ className }: BuddySceneProps) {
    const mood = useAppStore((s) => s.buddyMood);
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={containerRef} className={`relative ${className || ''}`}>
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                style={{ background: 'transparent' }}
            >
                <Suspense fallback={null}>
                    {/* Soft ambient lighting */}
                    <ambientLight intensity={0.4} />

                    {/* Key light from above-right */}
                    <directionalLight
                        position={[5, 5, 5]}
                        intensity={0.8}
                        color="#ffffff"
                    />

                    {/* Fill light from left */}
                    <directionalLight
                        position={[-3, 2, 2]}
                        intensity={0.3}
                        color="#a8e6cf"
                    />

                    {/* Rim light for glow effect */}
                    <pointLight
                        position={[0, 0, -3]}
                        intensity={0.5}
                        color="#88d8b0"
                    />

                    {/* The blob with floating animation */}
                    <Float
                        speed={mood === 'sleepy' ? 0.5 : 1.5}
                        rotationIntensity={mood === 'happy' ? 0.3 : 0.1}
                        floatIntensity={mood === 'sleepy' ? 0.3 : 0.8}
                    >
                        <BuddyBlob mood={mood} />
                    </Float>

                    {/* Subtle environment reflection */}
                    <Environment preset="sunset" />
                </Suspense>

                {/* Allow subtle rotation on drag */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    maxPolarAngle={Math.PI / 1.8}
                    minPolarAngle={Math.PI / 2.2}
                    rotateSpeed={0.3}
                />
            </Canvas>
        </div>
    );
}
