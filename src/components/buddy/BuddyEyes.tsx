'use client';

/**
 * Buddy Eyes Component
 * Expressive eyes with pupil dilation, blinking, and look direction
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BuddyMood } from '@/lib/store';

interface BuddyEyesProps {
    mood: BuddyMood;
}

// Eye positions relative to blob center
const LEFT_EYE_POS = new THREE.Vector3(-0.35, 0.2, 0.85);
const RIGHT_EYE_POS = new THREE.Vector3(0.35, 0.2, 0.85);

/**
 * Eye configuration per mood.
 * Controls pupil size, blink rate, squint level, and look direction.
 */
const EYE_CONFIGS: Record<BuddyMood, {
    pupilScale: number;
    blinkSpeed: number;
    squint: number;
    lookX: number;
    lookY: number;
    eyeScale: number;
}> = {
    idle: { pupilScale: 1, blinkSpeed: 0.3, squint: 0, lookX: 0, lookY: 0, eyeScale: 1 },
    thinking: { pupilScale: 0.8, blinkSpeed: 0.2, squint: 0.1, lookX: 0.3, lookY: 0.2, eyeScale: 1 },
    talking: { pupilScale: 1, blinkSpeed: 0.4, squint: 0, lookX: 0, lookY: 0, eyeScale: 1 },
    happy: { pupilScale: 1.2, blinkSpeed: 0.5, squint: 0.3, lookX: 0, lookY: 0, eyeScale: 1 },
    sleepy: { pupilScale: 0.7, blinkSpeed: 0.1, squint: 0.6, lookX: 0, lookY: -0.1, eyeScale: 1 },
    confused: { pupilScale: 0.9, blinkSpeed: 0.3, squint: 0, lookX: 0.2, lookY: 0.1, eyeScale: 1 },
    excited: { pupilScale: 1.4, blinkSpeed: 0.7, squint: 0, lookX: 0, lookY: 0.05, eyeScale: 1.15 },
    sad: { pupilScale: 1.1, blinkSpeed: 0.15, squint: 0, lookX: 0, lookY: -0.1, eyeScale: 0.95 },
    surprised: { pupilScale: 1.5, blinkSpeed: 0.1, squint: 0, lookX: 0, lookY: 0, eyeScale: 1.3 },
    embarrassed: { pupilScale: 0.85, blinkSpeed: 0.5, squint: 0.15, lookX: 0.15, lookY: -0.05, eyeScale: 1 },
};

export function BuddyEyes({ mood }: BuddyEyesProps) {
    const leftEyeRef = useRef<THREE.Group>(null);
    const rightEyeRef = useRef<THREE.Group>(null);
    const leftPupilRef = useRef<THREE.Mesh>(null);
    const rightPupilRef = useRef<THREE.Mesh>(null);

    // Smooth transition values
    const targetConfig = useRef(EYE_CONFIGS.idle);
    const currentConfig = useRef({ ...EYE_CONFIGS.idle });

    // Eye material (white sclera)
    const scleraMaterial = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#ffffff',
                roughness: 0.3,
                metalness: 0,
            }),
        []
    );

    // Pupil material (shiny black)
    const pupilMaterial = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#1a1a2e',
                roughness: 0.1,
                metalness: 0.3,
            }),
        []
    );

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        targetConfig.current = EYE_CONFIGS[mood];

        // Lerp current config towards target for smooth transitions
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
        const lerpSpeed = 0.08;

        currentConfig.current.pupilScale = lerp(currentConfig.current.pupilScale, targetConfig.current.pupilScale, lerpSpeed);
        currentConfig.current.squint = lerp(currentConfig.current.squint, targetConfig.current.squint, lerpSpeed);
        currentConfig.current.lookX = lerp(currentConfig.current.lookX, targetConfig.current.lookX, lerpSpeed);
        currentConfig.current.lookY = lerp(currentConfig.current.lookY, targetConfig.current.lookY, lerpSpeed);
        currentConfig.current.eyeScale = lerp(currentConfig.current.eyeScale, targetConfig.current.eyeScale, lerpSpeed);

        const config = currentConfig.current;

        // Blink calculation
        const blinkCycle = Math.sin(t * targetConfig.current.blinkSpeed * 10);
        const isBlinking = blinkCycle > 0.97;
        const blinkY = isBlinking ? 0.1 : 1 - config.squint;

        // Apply to eyes
        if (leftEyeRef.current && rightEyeRef.current) {
            const baseScale = config.eyeScale;
            leftEyeRef.current.scale.set(baseScale, baseScale * blinkY, baseScale);
            rightEyeRef.current.scale.set(baseScale, baseScale * blinkY, baseScale);

            // Look direction with subtle movement
            const lookOffsetX = config.lookX + Math.sin(t * 0.5) * 0.03;
            const lookOffsetY = config.lookY + Math.cos(t * 0.7) * 0.02;

            leftEyeRef.current.position.x = LEFT_EYE_POS.x + lookOffsetX * 0.1;
            leftEyeRef.current.position.y = LEFT_EYE_POS.y + lookOffsetY * 0.1;
            rightEyeRef.current.position.x = RIGHT_EYE_POS.x + lookOffsetX * 0.1;
            rightEyeRef.current.position.y = RIGHT_EYE_POS.y + lookOffsetY * 0.1;
        }

        // Pupil dilation
        if (leftPupilRef.current && rightPupilRef.current) {
            const pupilSize = config.pupilScale;
            leftPupilRef.current.scale.setScalar(pupilSize);
            rightPupilRef.current.scale.setScalar(pupilSize);

            // Pupils look in direction
            const pupilOffset = 0.02;
            leftPupilRef.current.position.x = config.lookX * pupilOffset;
            leftPupilRef.current.position.y = config.lookY * pupilOffset;
            rightPupilRef.current.position.x = config.lookX * pupilOffset;
            rightPupilRef.current.position.y = config.lookY * pupilOffset;
        }
    });

    return (
        <>
            {/* Left eye */}
            <group ref={leftEyeRef} position={LEFT_EYE_POS}>
                {/* Sclera (white part) */}
                <mesh material={scleraMaterial}>
                    <sphereGeometry args={[0.14, 32, 32]} />
                </mesh>
                {/* Pupil */}
                <mesh ref={leftPupilRef} position={[0, 0, 0.08]} material={pupilMaterial}>
                    <sphereGeometry args={[0.07, 24, 24]} />
                </mesh>
                {/* Highlight */}
                <mesh position={[0.03, 0.03, 0.12]}>
                    <sphereGeometry args={[0.025, 16, 16]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
            </group>

            {/* Right eye */}
            <group ref={rightEyeRef} position={RIGHT_EYE_POS}>
                {/* Sclera (white part) */}
                <mesh material={scleraMaterial}>
                    <sphereGeometry args={[0.14, 32, 32]} />
                </mesh>
                {/* Pupil */}
                <mesh ref={rightPupilRef} position={[0, 0, 0.08]} material={pupilMaterial}>
                    <sphereGeometry args={[0.07, 24, 24]} />
                </mesh>
                {/* Highlight */}
                <mesh position={[0.03, 0.03, 0.12]}>
                    <sphereGeometry args={[0.025, 16, 16]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
            </group>
        </>
    );
}
