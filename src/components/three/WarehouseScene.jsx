import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function Shelf({ position, boxes }) {
    return (
        <group position={position}>
            {/* Shelf frame */}
            {[0, 1.2, 2.4].map((y) => (
                <mesh key={y} position={[0, y, 0]}>
                    <boxGeometry args={[2.5, 0.06, 0.8]} />
                    <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
                </mesh>
            ))}
            {/* Shelf legs */}
            {[-1.2, 1.2].map((x) => (
                <mesh key={x} position={[x, 1.2, 0]}>
                    <boxGeometry args={[0.06, 2.5, 0.06]} />
                    <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.4} />
                </mesh>
            ))}
            {/* Boxes on shelves */}
            {boxes.map((b, i) => (
                <Float key={i} speed={0.5} floatIntensity={0.1}>
                    <mesh position={b.pos}>
                        <boxGeometry args={b.size} />
                        <meshStandardMaterial
                            color={b.color}
                            roughness={0.4}
                            metalness={0.5}
                            transparent
                            opacity={0.9}
                        />
                    </mesh>
                </Float>
            ))}
        </group>
    )
}

function Forklift({ startPos }) {
    const ref = useRef()
    const offset = useMemo(() => Math.random() * Math.PI * 2, [])

    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.elapsedTime + offset
            ref.current.position.x = startPos[0] + Math.sin(t * 0.3) * 2
            ref.current.position.z = startPos[2] + Math.cos(t * 0.3) * 1.5
            ref.current.rotation.y = Math.atan2(
                Math.cos(t * 0.3) * 2,
                -Math.sin(t * 0.3) * 1.5
            )
        }
    })

    return (
        <group ref={ref} position={startPos}>
            {/* Body */}
            <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[0.5, 0.3, 0.7]} />
                <meshStandardMaterial color="#06b6d4" metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Fork */}
            <mesh position={[0, 0.05, -0.5]}>
                <boxGeometry args={[0.4, 0.04, 0.3]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Wheels */}
            {[[-0.2, 0, 0.25], [0.2, 0, 0.25], [-0.2, 0, -0.25], [0.2, 0, -0.25]].map((p, i) => (
                <mesh key={i} position={p}>
                    <sphereGeometry args={[0.06, 8, 8]} />
                    <meshStandardMaterial color="#1e293b" />
                </mesh>
            ))}
            {/* Light */}
            <pointLight position={[0, 0.5, -0.5]} color="#06b6d4" intensity={0.3} distance={2} />
        </group>
    )
}

function Floor() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial
                color="#0f172a"
                roughness={0.8}
                metalness={0.2}
                transparent
                opacity={0.8}
            />
        </mesh>
    )
}

function Scene() {
    const shelves = useMemo(() => [
        {
            pos: [-3, 0, -2],
            boxes: [
                { pos: [-0.7, 0.35, 0], size: [0.5, 0.5, 0.5], color: '#06b6d4' },
                { pos: [0.2, 0.35, 0], size: [0.4, 0.4, 0.5], color: '#10b981' },
                { pos: [0.8, 0.35, 0], size: [0.3, 0.5, 0.4], color: '#8b5cf6' },
                { pos: [-0.5, 1.55, 0], size: [0.6, 0.5, 0.5], color: '#f59e0b' },
                { pos: [0.4, 1.55, 0], size: [0.5, 0.4, 0.5], color: '#ef4444' },
            ]
        },
        {
            pos: [0, 0, -2],
            boxes: [
                { pos: [-0.5, 0.35, 0], size: [0.5, 0.5, 0.5], color: '#3b82f6' },
                { pos: [0.5, 0.35, 0], size: [0.4, 0.6, 0.4], color: '#ec4899' },
                { pos: [0, 1.55, 0], size: [0.7, 0.4, 0.5], color: '#14b8a6' },
                { pos: [-0.8, 1.55, 0], size: [0.3, 0.5, 0.3], color: '#06b6d4' },
            ]
        },
        {
            pos: [3, 0, -2],
            boxes: [
                { pos: [-0.3, 0.35, 0], size: [0.5, 0.5, 0.5], color: '#8b5cf6' },
                { pos: [0.6, 0.35, 0], size: [0.35, 0.4, 0.5], color: '#f59e0b' },
                { pos: [0, 1.55, 0], size: [0.5, 0.5, 0.5], color: '#10b981' },
                { pos: [0.7, 1.55, 0], size: [0.4, 0.35, 0.4], color: '#3b82f6' },
            ]
        },
    ], [])

    return (
        <>
            <ambientLight intensity={0.25} />
            <pointLight position={[0, 6, 2]} intensity={0.6} color="#e2e8f0" />
            <pointLight position={[-4, 3, 3]} intensity={0.3} color="#06b6d4" />
            <pointLight position={[4, 3, 3]} intensity={0.3} color="#8b5cf6" />

            <Floor />
            {shelves.map((s, i) => (
                <Shelf key={i} position={s.pos} boxes={s.boxes} />
            ))}
            <Forklift startPos={[-1, 0, 2]} />
            <Forklift startPos={[2, 0, 1]} />
        </>
    )
}

export default function WarehouseScene() {
    return (
        <Canvas
            camera={{ position: [0, 4, 7], fov: 45 }}
            style={{ background: 'transparent' }}
            gl={{ antialias: true, alpha: true }}
        >
            <Scene />
        </Canvas>
    )
}
