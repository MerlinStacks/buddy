'use client';

/**
 * Buddy Blob 3D Component
 * Animated greenish blob with cute face and mood-responsive animations
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BuddyMood } from '@/lib/store';

interface BuddyBlobProps {
    mood: BuddyMood;
}

// Eye positions relative to blob center
const LEFT_EYE_POS = new THREE.Vector3(-0.35, 0.2, 0.8);
const RIGHT_EYE_POS = new THREE.Vector3(0.35, 0.2, 0.8);

export function BuddyBlob({ mood }: BuddyBlobProps) {
    const blobRef = useRef<THREE.Mesh>(null);
    const leftEyeRef = useRef<THREE.Mesh>(null);
    const rightEyeRef = useRef<THREE.Mesh>(null);
    const mouthRef = useRef<THREE.Mesh>(null);

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

    // Eye material (shiny black)
    const eyeMaterial = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#1a1a2e',
                roughness: 0.1,
                metalness: 0.3,
            }),
        []
    );

    // Animate based on mood
    useFrame((state) => {
        if (!blobRef.current) return;
        const t = state.clock.elapsedTime;

        // Base wobble animation
        let scaleX = 1;
        let scaleY = 1;
        let scaleZ = 1;

        switch (mood) {
            case 'idle':
                // Gentle breathing
                scaleY = 1 + Math.sin(t * 1.5) * 0.03;
                scaleX = 1 - Math.sin(t * 1.5) * 0.015;
                break;

            case 'thinking':
                // Slow pulse
                const pulse = Math.sin(t * 2) * 0.02;
                scaleX = scaleY = scaleZ = 1 + pulse;
                // Slight tilt
                blobRef.current.rotation.z = Math.sin(t) * 0.1;
                break;

            case 'talking':
                // Fast bouncy
                scaleY = 1 + Math.sin(t * 8) * 0.08;
                scaleX = 1 - Math.sin(t * 8) * 0.04;
                break;

            case 'happy':
                // Excited wiggle
                scaleY = 1 + Math.sin(t * 4) * 0.05;
                scaleX = 1 + Math.cos(t * 4) * 0.03;
                blobRef.current.rotation.z = Math.sin(t * 3) * 0.15;
                break;

            case 'sleepy':
                // Slow, droopy
                scaleY = 0.95 + Math.sin(t * 0.8) * 0.02;
                scaleX = 1.02;
                break;

            case 'confused':
                // Wobbly uncertainty
                scaleX = 1 + Math.sin(t * 3) * 0.04;
                blobRef.current.rotation.z = Math.sin(t * 2) * 0.2;
                break;
        }

        blobRef.current.scale.set(scaleX, scaleY, scaleZ);

        // Eye animations
        if (leftEyeRef.current && rightEyeRef.current) {
            // Blink occasionally
            const blink = Math.sin(t * 0.3) > 0.95;
            const eyeScaleY = blink ? 0.1 : mood === 'sleepy' ? 0.5 : 1;
            leftEyeRef.current.scale.y = eyeScaleY;
            rightEyeRef.current.scale.y = eyeScaleY;

            // Eyes follow a subtle pattern
            const eyeLookX = Math.sin(t * 0.5) * 0.05;
            const eyeLookY = Math.cos(t * 0.7) * 0.03;
            leftEyeRef.current.position.x = LEFT_EYE_POS.x + eyeLookX;
            leftEyeRef.current.position.y = LEFT_EYE_POS.y + eyeLookY;
            rightEyeRef.current.position.x = RIGHT_EYE_POS.x + eyeLookX;
            rightEyeRef.current.position.y = RIGHT_EYE_POS.y + eyeLookY;
        }
    });

    return (
        <group>
            {/* Main blob body */}
            <mesh ref={blobRef} material={blobMaterial}>
                <sphereGeometry args={[1, 64, 64]} />
            </mesh>

            {/* Left eye */}
            <mesh ref={leftEyeRef} position={LEFT_EYE_POS} material={eyeMaterial}>
                <sphereGeometry args={[0.12, 32, 32]} />
                {/* Eye highlight */}
                <mesh position={[0.03, 0.03, 0.08]}>
                    <sphereGeometry args={[0.04, 16, 16]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
            </mesh>

            {/* Right eye */}
            <mesh ref={rightEyeRef} position={RIGHT_EYE_POS} material={eyeMaterial}>
                <sphereGeometry args={[0.12, 32, 32]} />
                {/* Eye highlight */}
                <mesh position={[0.03, 0.03, 0.08]}>
                    <sphereGeometry args={[0.04, 16, 16]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
            </mesh>

            {/* Smile - simple curved line */}
            <mesh ref={mouthRef} position={[0, -0.15, 0.9]} rotation={[0, 0, 0]}>
                <torusGeometry args={[0.15, 0.025, 16, 32, Math.PI]} />
                <meshStandardMaterial color="#1a1a2e" />
            </mesh>
        </group>
    );
}
