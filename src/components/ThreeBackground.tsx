"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function DynamicDataOcean() {
    const pointsRef = useRef<THREE.Points>(null);

    // Massive 150x120 grid spanning the entire ultrawide screen edges
    const xCount = 150;
    const zCount = 120;
    const count = xCount * zCount;
    const spacing = 0.55;

    // Premium SaaS color palette: softened muted indigo/blue
    const colorDeep = useMemo(() => new THREE.Color("#0f172a"), []); // Dark slate trough
    const colorPeak = useMemo(() => new THREE.Color("#38bdf8"), []); // Vibrant cyan peak
    const tempColor = useMemo(() => new THREE.Color(), []);

    const [positions, colors] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        let i = 0;
        for (let ix = 0; ix < xCount; ix++) {
            for (let iz = 0; iz < zCount; iz++) {
                // Initialize X and Z (Y is 0, animated later)
                pos[i * 3] = (ix - xCount / 2) * spacing;
                pos[i * 3 + 1] = 0;
                pos[i * 3 + 2] = (iz - zCount / 2) * spacing;

                // Initialize Colors to black
                col[i * 3] = 0;
                col[i * 3 + 1] = 0;
                col[i * 3 + 2] = 0;
                i++;
            }
        }
        return [pos, col];
    }, [count, xCount, zCount, spacing]);

    useFrame((state) => {
        if (!pointsRef.current) return;

        // Ensure geometries are ready
        const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
        const col = pointsRef.current.geometry.attributes.color.array as Float32Array;
        const time = state.clock.elapsedTime * 0.4;

        let i = 0;
        for (let ix = 0; ix < xCount; ix++) {
            for (let iz = 0; iz < zCount; iz++) {

                // Frequency multipliers
                const x = ix * 0.2;
                const z = iz * 0.2;

                // Extremely organic, fluid multi-wave math - now with slightly taller peaks!
                const y = Math.sin(x + time * 0.8) * 1.5
                    + Math.cos(z + time * 0.6) * 1.5
                    + Math.sin((x + z) * 0.4 - time * 0.4) * 1.2;

                pos[i * 3 + 1] = y;

                // Color mapping: interpolate based on the height
                const heightPercentage = THREE.MathUtils.clamp((y + 4.2) / 8.4, 0, 1);

                // Create a stunning transition
                tempColor.copy(colorDeep).lerp(colorPeak, heightPercentage);

                col[i * 3] = tempColor.r;
                col[i * 3 + 1] = tempColor.g;
                col[i * 3 + 2] = tempColor.b;

                i++;
            }
        }

        // Notify Three.js that the arrays changed this frame
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
        pointsRef.current.geometry.attributes.color.needsUpdate = true;

        // Majestic, sweeping slow rotation wrapper
        pointsRef.current.rotation.y = time * 0.05;
        pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.1 + 0.35; // gentle rocking
    });

    return (
        <points ref={pointsRef} position={[0, -6, -20]}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    args={[positions, 3]}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    args={[colors, 3]}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.10}
                vertexColors
                transparent
                opacity={0.85}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

export default function ThreeBackground() {
    return (
        <div
            className="fixed inset-0 z-0 pointer-events-none"
            style={{ background: "radial-gradient(circle at center top, #09090e, #000000 80%)" }}
        >
            <Canvas camera={{ position: [0, 4, 10], fov: 60 }} dpr={[1, 2]}>
                {/* Thick dense fog at the edges prevents the grid from having a hard mathematical cut-off */}
                <fog attach="fog" args={["#000000", 12, 35]} />
                <DynamicDataOcean />
            </Canvas>
        </div>
    );
}
