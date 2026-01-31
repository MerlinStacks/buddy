'use client';

/**
 * Buddy Effects Component
 * Particle effects and visual accents that appear based on mood
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BuddyMood } from '@/lib/store';

interface BuddyEffectsProps {
    mood: BuddyMood;
}

interface Particle {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    life: number;
    maxLife: number;
    scale: number;
}

/**
 * Effect configurations per mood.
 */
const EFFECT_CONFIGS: Record<BuddyMood, {
    enabled: boolean;
    color: string;
    particleCount: number;
    speed: number;
    type: 'hearts' | 'sparkles' | 'dots' | 'sweat' | 'zzz' | 'stars' | 'none';
}> = {
    idle: { enabled: false, color: '#ffffff', particleCount: 0, speed: 0, type: 'none' },
    thinking: { enabled: true, color: '#88d8b0', particleCount: 3, speed: 0.5, type: 'dots' },
    talking: { enabled: false, color: '#ffffff', particleCount: 0, speed: 0, type: 'none' },
    happy: { enabled: true, color: '#ffb6c1', particleCount: 5, speed: 1, type: 'hearts' },
    sleepy: { enabled: true, color: '#a8c8ff', particleCount: 2, speed: 0.3, type: 'zzz' },
    confused: { enabled: true, color: '#ffd700', particleCount: 2, speed: 0.8, type: 'sweat' },
    excited: { enabled: true, color: '#ffd700', particleCount: 8, speed: 1.5, type: 'stars' },
    sad: { enabled: false, color: '#87ceeb', particleCount: 0, speed: 0, type: 'none' },
    surprised: { enabled: true, color: '#ffffff', particleCount: 6, speed: 2, type: 'sparkles' },
    embarrassed: { enabled: true, color: '#ff9999', particleCount: 2, speed: 0.5, type: 'sweat' },
};

export function BuddyEffects({ mood }: BuddyEffectsProps) {
    const particlesRef = useRef<Particle[]>([]);
    const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
    const lastMood = useRef<BuddyMood>(mood);

    const config = EFFECT_CONFIGS[mood];

    // Reset particles when mood changes
    if (mood !== lastMood.current) {
        particlesRef.current = [];
        lastMood.current = mood;
    }

    // Particle materials
    const heartMaterial = useMemo(
        () => new THREE.MeshBasicMaterial({ color: '#ff6b8a', transparent: true, opacity: 0.8 }),
        []
    );

    const starMaterial = useMemo(
        () => new THREE.MeshBasicMaterial({ color: '#ffd700', transparent: true, opacity: 0.9 }),
        []
    );

    const dotMaterial = useMemo(
        () => new THREE.MeshBasicMaterial({ color: '#88d8b0', transparent: true, opacity: 0.6 }),
        []
    );

    useFrame((state, delta) => {
        if (!config.enabled) return;

        const t = state.clock.elapsedTime;

        // Spawn new particles
        while (particlesRef.current.length < config.particleCount) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.8 + Math.random() * 0.3;

            particlesRef.current.push({
                position: new THREE.Vector3(
                    Math.cos(angle) * radius,
                    0.3 + Math.random() * 0.4,
                    Math.sin(angle) * radius * 0.3 + 0.5
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.2,
                    0.3 + Math.random() * 0.3,
                    (Math.random() - 0.5) * 0.1
                ),
                life: 0,
                maxLife: 2 + Math.random() * 1,
                scale: 0.05 + Math.random() * 0.03,
            });
        }

        // Update particles
        particlesRef.current = particlesRef.current.filter((particle, i) => {
            particle.life += delta * config.speed;

            if (particle.life >= particle.maxLife) {
                return false;
            }

            // Movement based on type
            if (config.type === 'dots') {
                // Orbiting dots for thinking
                const orbitAngle = t * 2 + i * (Math.PI * 2 / config.particleCount);
                particle.position.x = Math.cos(orbitAngle) * 1.2;
                particle.position.y = 0.3 + Math.sin(t * 3 + i) * 0.1;
                particle.position.z = Math.sin(orbitAngle) * 0.3 + 0.8;
            } else {
                // Float upward
                particle.position.add(particle.velocity.clone().multiplyScalar(delta));
            }

            // Update mesh
            const mesh = meshRefs.current[i];
            if (mesh) {
                mesh.position.copy(particle.position);

                // Fade out near end of life
                const lifeRatio = particle.life / particle.maxLife;
                const opacity = lifeRatio > 0.7 ? 1 - ((lifeRatio - 0.7) / 0.3) : 1;
                mesh.scale.setScalar(particle.scale * (0.5 + opacity * 0.5));

                // Rotation for visual interest
                mesh.rotation.z = t * 2 + i;
            }

            return true;
        });
    });

    if (!config.enabled || config.type === 'none') {
        return null;
    }

    // Choose material based on effect type
    const getMaterial = () => {
        switch (config.type) {
            case 'hearts':
                return heartMaterial;
            case 'stars':
            case 'sparkles':
                return starMaterial;
            default:
                return dotMaterial;
        }
    };

    return (
        <group>
            {particlesRef.current.map((particle, i) => (
                <mesh
                    key={i}
                    ref={(el) => { meshRefs.current[i] = el; }}
                    position={particle.position}
                    material={getMaterial()}
                >
                    {config.type === 'hearts' ? (
                        <sphereGeometry args={[0.05, 8, 8]} />
                    ) : config.type === 'stars' || config.type === 'sparkles' ? (
                        <octahedronGeometry args={[0.04]} />
                    ) : (
                        <sphereGeometry args={[0.03, 8, 8]} />
                    )}
                </mesh>
            ))}

            {/* Blush cheeks for happy/embarrassed */}
            {(mood === 'happy' || mood === 'embarrassed' || mood === 'excited') && (
                <>
                    <mesh position={[-0.55, 0.05, 0.7]}>
                        <sphereGeometry args={[0.12, 16, 16]} />
                        <meshBasicMaterial
                            color={mood === 'embarrassed' ? '#ff6b6b' : '#ffb3ba'}
                            transparent
                            opacity={mood === 'embarrassed' ? 0.5 : 0.3}
                        />
                    </mesh>
                    <mesh position={[0.55, 0.05, 0.7]}>
                        <sphereGeometry args={[0.12, 16, 16]} />
                        <meshBasicMaterial
                            color={mood === 'embarrassed' ? '#ff6b6b' : '#ffb3ba'}
                            transparent
                            opacity={mood === 'embarrassed' ? 0.5 : 0.3}
                        />
                    </mesh>
                </>
            )}
        </group>
    );
}
