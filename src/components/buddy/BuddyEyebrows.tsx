'use client';

/**
 * Buddy Eyebrows Component
 * Expressive eyebrows that convey emotion through angle and position
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BuddyMood } from '@/lib/store';

interface BuddyEyebrowsProps {
    mood: BuddyMood;
}

// Base positions above eyes
const LEFT_BROW_POS = new THREE.Vector3(-0.35, 0.42, 0.8);
const RIGHT_BROW_POS = new THREE.Vector3(0.35, 0.42, 0.8);

/**
 * Eyebrow configurations per mood.
 * innerAngle: rotation at inner edge (near center of face)
 * outerAngle: rotation at outer edge
 * height: vertical offset from base position
 */
const EYEBROW_CONFIGS: Record<BuddyMood, {
    leftInnerAngle: number;
    leftOuterAngle: number;
    rightInnerAngle: number;
    rightOuterAngle: number;
    heightOffset: number;
    thickness: number;
}> = {
    idle: { leftInnerAngle: 0, leftOuterAngle: 0, rightInnerAngle: 0, rightOuterAngle: 0, heightOffset: 0, thickness: 1 },
    thinking: { leftInnerAngle: 0.3, leftOuterAngle: 0.1, rightInnerAngle: -0.2, rightOuterAngle: 0, heightOffset: 0.02, thickness: 1 },
    talking: { leftInnerAngle: 0.1, leftOuterAngle: 0, rightInnerAngle: 0.1, rightOuterAngle: 0, heightOffset: 0.01, thickness: 1 },
    happy: { leftInnerAngle: -0.1, leftOuterAngle: 0.1, rightInnerAngle: -0.1, rightOuterAngle: 0.1, heightOffset: 0.03, thickness: 1 },
    sleepy: { leftInnerAngle: 0.2, leftOuterAngle: 0.3, rightInnerAngle: 0.2, rightOuterAngle: 0.3, heightOffset: -0.03, thickness: 0.8 },
    confused: { leftInnerAngle: -0.3, leftOuterAngle: 0.2, rightInnerAngle: 0.3, rightOuterAngle: -0.1, heightOffset: 0.04, thickness: 1 },
    excited: { leftInnerAngle: -0.2, leftOuterAngle: 0.15, rightInnerAngle: -0.2, rightOuterAngle: 0.15, heightOffset: 0.06, thickness: 1.1 },
    sad: { leftInnerAngle: -0.4, leftOuterAngle: 0.2, rightInnerAngle: -0.4, rightOuterAngle: 0.2, heightOffset: -0.01, thickness: 0.9 },
    surprised: { leftInnerAngle: -0.3, leftOuterAngle: -0.1, rightInnerAngle: -0.3, rightOuterAngle: -0.1, heightOffset: 0.08, thickness: 1.2 },
    embarrassed: { leftInnerAngle: -0.2, leftOuterAngle: 0.1, rightInnerAngle: -0.2, rightOuterAngle: 0.1, heightOffset: 0.02, thickness: 0.9 },
};

export function BuddyEyebrows({ mood }: BuddyEyebrowsProps) {
    const leftBrowRef = useRef<THREE.Mesh>(null);
    const rightBrowRef = useRef<THREE.Mesh>(null);
    const currentConfig = useRef({ ...EYEBROW_CONFIGS.idle });

    const browMaterial = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#2d5a45',
                roughness: 0.4,
                metalness: 0.1,
            }),
        []
    );

    useFrame(() => {
        const target = EYEBROW_CONFIGS[mood];

        // Smooth lerp towards target
        const lerp = (a: number, b: number, factor: number) => a + (b - a) * factor;
        const lerpSpeed = 0.1;

        currentConfig.current.leftInnerAngle = lerp(currentConfig.current.leftInnerAngle, target.leftInnerAngle, lerpSpeed);
        currentConfig.current.leftOuterAngle = lerp(currentConfig.current.leftOuterAngle, target.leftOuterAngle, lerpSpeed);
        currentConfig.current.rightInnerAngle = lerp(currentConfig.current.rightInnerAngle, target.rightInnerAngle, lerpSpeed);
        currentConfig.current.rightOuterAngle = lerp(currentConfig.current.rightOuterAngle, target.rightOuterAngle, lerpSpeed);
        currentConfig.current.heightOffset = lerp(currentConfig.current.heightOffset, target.heightOffset, lerpSpeed);
        currentConfig.current.thickness = lerp(currentConfig.current.thickness, target.thickness, lerpSpeed);

        const config = currentConfig.current;

        if (leftBrowRef.current) {
            leftBrowRef.current.position.y = LEFT_BROW_POS.y + config.heightOffset;
            leftBrowRef.current.rotation.z = (config.leftInnerAngle + config.leftOuterAngle) / 2;
            leftBrowRef.current.scale.y = config.thickness;
        }

        if (rightBrowRef.current) {
            rightBrowRef.current.position.y = RIGHT_BROW_POS.y + config.heightOffset;
            rightBrowRef.current.rotation.z = -(config.rightInnerAngle + config.rightOuterAngle) / 2;
            rightBrowRef.current.scale.y = config.thickness;
        }
    });

    return (
        <>
            {/* Left eyebrow */}
            <mesh
                ref={leftBrowRef}
                position={[LEFT_BROW_POS.x, LEFT_BROW_POS.y, LEFT_BROW_POS.z]}
                material={browMaterial}
            >
                <capsuleGeometry args={[0.02, 0.12, 4, 8]} />
            </mesh>

            {/* Right eyebrow */}
            <mesh
                ref={rightBrowRef}
                position={[RIGHT_BROW_POS.x, RIGHT_BROW_POS.y, RIGHT_BROW_POS.z]}
                material={browMaterial}
            >
                <capsuleGeometry args={[0.02, 0.12, 4, 8]} />
            </mesh>
        </>
    );
}
