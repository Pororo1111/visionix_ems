"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Box } from "@react-three/drei";
import type { Mesh } from "three";

function AnimatedCube() {
    const cubeRef = useRef<Mesh>(null!);

    useFrame((state, delta) => {
        if (cubeRef.current) {
            cubeRef.current.rotation.x += delta * 0.5;
            cubeRef.current.rotation.y += delta * 0.5;
        }
    });

    return (
        <Box ref={cubeRef} args={[2, 2, 2]} position={[0, 0, 0]}>
            <meshStandardMaterial
                color="#3b82f6"
                roughness={0.4}
                metalness={0.1}
            />
        </Box>
    );
}

export function ThreeDView() {
    return (
        <div className="w-full h-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    🎯 3D 시스템 뷰
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    실시간 시스템 상태 모니터링
                </p>
            </div>
            <div className="h-96">
                <Canvas
                    camera={{ position: [5, 5, 5], fov: 45 }}
                    className="w-full h-full"
                >
                    <ambientLight intensity={0.6} />
                    <pointLight position={[10, 10, 10]} intensity={0.8} />
                    <directionalLight position={[-5, 5, 5]} intensity={0.5} />
                    
                    <AnimatedCube />
                    
                    <OrbitControls
                        enablePan={true}
                        enableZoom={false}
                        enableRotate={true}
                        minDistance={3}
                        maxDistance={15}
                    />
                </Canvas>
            </div>
        </div>
    );
}