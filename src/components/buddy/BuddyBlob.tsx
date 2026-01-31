'use client';

/**
 * Buddy Blob 3D Component
 * Animated greenish blob with expressive face and mood-responsive animations.
 * Orchestrates sub-components for eyes, mouth, eyebrows, and effects.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BuddyMood } from '@/lib/store';
import { BuddyEyes } from './BuddyEyes';
import { BuddyMouth } from './BuddyMouth';
import { BuddyEyebrows } from './BuddyEyebrows';
import { BuddyEffects } from './BuddyEffects';

interface BuddyBlobProps {
    mood: BuddyMood;
}

/**
 * Body configuration per mood.
 * Controls color tint, scale animation, and rotation.
 */
const BODY_CONFIGS: Record<BuddyMood, {
    colorTint: string;
    scaleAmplitude: number;
    scaleSpeed: number;
    rotationAmplitude: number;
    rotationSpeed: number;
    squashFactor: number;
}> = {
    idle: { colorTint: '#88d8b0', scaleAmplitude: 0.03, scaleSpeed: 1.5, rotationAmplitude: 0, rotationSpeed: 0, squashFactor: 0 },
    thinking: { colorTint: '#7ec8a5', scaleAmplitude: 0.02, scaleSpeed: 2, rotationAmplitude: 0.1, rotationSpeed: 1, squashFactor: 0 },
    talking: { colorTint: '#88d8b0', scaleAmplitude: 0.08, scaleSpeed: 8, rotationAmplitude: 0, rotationSpeed: 0, squashFactor: 0.04 },
    happy: { colorTint: '#9ee8c0', scaleAmplitude: 0.05, scaleSpeed: 4, rotationAmplitude: 0.15, rotationSpeed: 3, squashFactor: 0.03 },
    sleepy: { colorTint: '#78c8a0', scaleAmplitude: 0.02, scaleSpeed: 0.8, rotationAmplitude: 0, rotationSpeed: 0, squashFactor: 0.02 },
    confused: { colorTint: '#80d0a8', scaleAmplitude: 0.04, scaleSpeed: 3, rotationAmplitude: 0.2, rotationSpeed: 2, squashFactor: 0 },
    excited: { colorTint: '#a0f0d0', scaleAmplitude: 0.08, scaleSpeed: 6, rotationAmplitude: 0.2, rotationSpeed: 4, squashFactor: 0.05 },
    sad: { colorTint: '#70b090', scaleAmplitude: 0.015, scaleSpeed: 1, rotationAmplitude: 0, rotationSpeed: 0, squashFactor: 0.03 },
    surprised: { colorTint: '#98e0b8', scaleAmplitude: 0.1, scaleSpeed: 10, rotationAmplitude: 0, rotationSpeed: 0, squashFactor: 0.08 },
    embarrassed: { colorTint: '#90d8b0', scaleAmplitude: 0.025, scaleSpeed: 2, rotationAmplitude: 0.05, rotationSpeed: 1.5, squashFactor: 0.01 },
};

export function BuddyBlob({ mood }: BuddyBlobProps) {
    const blobRef = useRef<THREE.Mesh>(null);
    const currentConfig = useRef({ ...BODY_CONFIGS.idle });
    const currentColor = useRef(new THREE.Color('#88d8b0'));

    // Blob material with translucent green glow
    const blobMaterial = useMemo(
        () =>
            new THREE.MeshPhysicalMaterial({
                color: '#88d8b0',
                transparent: true,
                opacity: 0.85,
                roughness: 0.2,
                metalness: 0.1,
                transmission: 0.3,
                thickness: 1.5,
                envMapIntensity: 0.5,
                clearcoat: 0.3,
                clearcoatRoughness: 0.2,
            }),
        []
    );

    useFrame((state) => {
        if (!blobRef.current) return;
        const t = state.clock.elapsedTime;
        const target = BODY_CONFIGS[mood];

        // Smooth lerp config
        const lerp = (a: number, b: number, factor: number) => a + (b - a) * factor;
        const lerpSpeed = 0.05;

        currentConfig.current.scaleAmplitude = lerp(currentConfig.current.scaleAmplitude, target.scaleAmplitude, lerpSpeed);
        currentConfig.current.scaleSpeed = lerp(currentConfig.current.scaleSpeed, target.scaleSpeed, lerpSpeed);
        currentConfig.current.rotationAmplitude = lerp(currentConfig.current.rotationAmplitude, target.rotationAmplitude, lerpSpeed);
        currentConfig.current.rotationSpeed = lerp(currentConfig.current.rotationSpeed, target.rotationSpeed, lerpSpeed);
        currentConfig.current.squashFactor = lerp(currentConfig.current.squashFactor, target.squashFactor, lerpSpeed);

        const config = currentConfig.current;

        // Color interpolation
        const targetColor = new THREE.Color(target.colorTint);
        currentColor.current.lerp(targetColor, 0.03);
        blobMaterial.color.copy(currentColor.current);

        // Scale animation with squash/stretch
        const scaleBase = 1;
        const breathe = Math.sin(t * config.scaleSpeed) * config.scaleAmplitude;

        // Squash/stretch: when Y increases, X/Z decrease (and vice versa)
        const squash = Math.sin(t * config.scaleSpeed * 2) * config.squashFactor;

        const scaleX = scaleBase + breathe * 0.5 - squash;
        const scaleY = scaleBase + breathe + squash;
        const scaleZ = scaleBase + breathe * 0.5 - squash;

        blobRef.current.scale.set(scaleX, scaleY, scaleZ);

        // Rotation animation
        if (config.rotationAmplitude > 0) {
            blobRef.current.rotation.z = Math.sin(t * config.rotationSpeed) * config.rotationAmplitude;
        } else {
            // Smoothly return to neutral
            blobRef.current.rotation.z *= 0.95;
        }

        // Subtle Y-axis rotation for life
        blobRef.current.rotation.y = Math.sin(t * 0.3) * 0.05;
    });

    return (
        <group>
            {/* Main blob body */}
            <mesh ref={blobRef} material={blobMaterial}>
                <sphereGeometry args={[1, 64, 64]} />
            </mesh>

            {/* Facial features */}
            <BuddyEyes mood={mood} />
            <BuddyMouth mood={mood} />
            <BuddyEyebrows mood={mood} />
            <BuddyEffects mood={mood} />
        </group>
    );
}

