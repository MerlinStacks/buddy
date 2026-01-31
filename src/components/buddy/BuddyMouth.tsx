'use client';

/**
 * Buddy Mouth Component
 * Dynamic mouth shapes that change based on mood
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BuddyMood } from '@/lib/store';

interface BuddyMouthProps {
    mood: BuddyMood;
}

/**
 * Mouth configurations per mood.
 * Controls curve, width, height, and animation speed.
 */
const MOUTH_CONFIGS: Record<BuddyMood, {
    curveAmount: number;  // Positive = smile, negative = frown
    width: number;
    height: number;
    openAmount: number;   // 0 = closed, 1 = fully open
    animSpeed: number;
    offsetX: number;
}> = {
    idle: { curveAmount: 0.3, width: 0.18, height: 0.08, openAmount: 0, animSpeed: 0, offsetX: 0 },
    thinking: { curveAmount: -0.1, width: 0.12, height: 0.06, openAmount: 0, animSpeed: 0, offsetX: 0.05 },
    talking: { curveAmount: 0.2, width: 0.15, height: 0.12, openAmount: 0.8, animSpeed: 12, offsetX: 0 },
    happy: { curveAmount: 0.5, width: 0.22, height: 0.1, openAmount: 0.3, animSpeed: 0, offsetX: 0 },
    sleepy: { curveAmount: 0, width: 0.1, height: 0.04, openAmount: 0.1, animSpeed: 0, offsetX: 0 },
    confused: { curveAmount: 0, width: 0.15, height: 0.06, openAmount: 0, animSpeed: 2, offsetX: 0 },
    excited: { curveAmount: 0.6, width: 0.25, height: 0.15, openAmount: 0.6, animSpeed: 4, offsetX: 0 },
    sad: { curveAmount: -0.4, width: 0.15, height: 0.08, openAmount: 0, animSpeed: 0, offsetX: 0 },
    surprised: { curveAmount: 0, width: 0.12, height: 0.18, openAmount: 1, animSpeed: 0, offsetX: 0 },
    embarrassed: { curveAmount: 0.1, width: 0.1, height: 0.05, openAmount: 0, animSpeed: 0, offsetX: 0.03 },
};

export function BuddyMouth({ mood }: BuddyMouthProps) {
    const mouthRef = useRef<THREE.Mesh>(null);
    const currentConfig = useRef({ ...MOUTH_CONFIGS.idle });

    const mouthMaterial = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#1a1a2e',
                roughness: 0.3,
                metalness: 0.1,
                side: THREE.DoubleSide,
            }),
        []
    );

    // Inner mouth (visible when open)
    const innerMouthMaterial = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#ff6b8a',
                roughness: 0.5,
                metalness: 0,
            }),
        []
    );

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        const target = MOUTH_CONFIGS[mood];

        // Smooth lerp to target config
        const lerp = (a: number, b: number, factor: number) => a + (b - a) * factor;
        const lerpSpeed = 0.1;

        currentConfig.current.curveAmount = lerp(currentConfig.current.curveAmount, target.curveAmount, lerpSpeed);
        currentConfig.current.width = lerp(currentConfig.current.width, target.width, lerpSpeed);
        currentConfig.current.height = lerp(currentConfig.current.height, target.height, lerpSpeed);
        currentConfig.current.openAmount = lerp(currentConfig.current.openAmount, target.openAmount, lerpSpeed);
        currentConfig.current.offsetX = lerp(currentConfig.current.offsetX, target.offsetX, lerpSpeed);

        if (!mouthRef.current) return;

        const config = currentConfig.current;

        // Talking animation
        let dynamicOpen = config.openAmount;
        if (target.animSpeed > 0) {
            dynamicOpen = config.openAmount * (0.5 + Math.abs(Math.sin(t * target.animSpeed)) * 0.5);
        }

        // Confused wiggle
        let wiggleX = 0;
        if (mood === 'confused') {
            wiggleX = Math.sin(t * 3) * 0.02;
        }

        // Update position
        mouthRef.current.position.x = config.offsetX + wiggleX;

        // Scale for open/close animation
        const scaleY = config.height * (1 + dynamicOpen * 0.5);
        mouthRef.current.scale.set(config.width * 5, scaleY * 5, 1);

        // Rotation for curve effect (smile/frown)
        mouthRef.current.rotation.z = config.curveAmount * 0.3;
    });

    return (
        <group position={[0, -0.2, 0.92]}>
            {/* Main mouth shape */}
            <mesh ref={mouthRef} material={mouthMaterial}>
                <planeGeometry args={[0.1, 0.05]} />
            </mesh>

            {/* Inner mouth (tongue area, visible when open) */}
            {currentConfig.current.openAmount > 0.2 && (
                <mesh position={[0, -0.02, -0.01]} material={innerMouthMaterial}>
                    <sphereGeometry args={[0.05, 16, 16]} />
                </mesh>
            )}
        </group>
    );
}
