import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment } from '@react-three/drei'
import * as THREE from 'three'

function FloatingBox({ position, color, scale = 1, speed = 1 }) {
    const meshRef = useRef()
    const offset = useMemo(() => Math.random() * Math.PI * 2, [])

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.3 + offset) * 0.3
            meshRef.current.rotation.y += 0.005 * speed
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed * 0.5 + offset) * 0.3
        }
    })

    return (
        <Float speed={speed} floatIntensity={0.5}>
            <mesh ref={meshRef} position={position} scale={scale}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.3}
                    metalness={0.7}
                    transparent
                    opacity={0.85}
                />
            </mesh>
        </Float>
    )
}

function ConveyorBelt() {
    const groupRef = useRef()

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
        }
    })

    return (
        <group ref={groupRef}>
            {/* Central platform */}
            <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[2, 4, 64]} />
                <meshStandardMaterial
                    color="#1e293b"
                    roughness={0.5}
                    metalness={0.8}
                    transparent
                    opacity={0.5}
                />
            </mesh>

            {/* Connection lines */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
                const angle = (i / 6) * Math.PI * 2
                const x = Math.cos(angle) * 3
                const z = Math.sin(angle) * 3
                return (
                    <mesh key={i} position={[x, -1.4, z]}>
                        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
                        <meshStandardMaterial
                            color="#06b6d4"
                            emissive="#06b6d4"
                            emissiveIntensity={0.3}
                        />
                    </mesh>
                )
            })}
        </group>
    )
}

function ParticleField() {
    const count = 200
    const meshRef = useRef()

    const positions = useMemo(() => {
        const arr = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            arr[i * 3] = (Math.random() - 0.5) * 20
            arr[i * 3 + 1] = (Math.random() - 0.5) * 20
            arr[i * 3 + 2] = (Math.random() - 0.5) * 20
        }
        return arr
    }, [])

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.02
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1
        }
    })

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.04}
                color="#06b6d4"
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    )
}

function Scene() {
    const boxes = useMemo(() => [
        { pos: [-3, 0, -1], color: '#06b6d4', scale: 0.8, speed: 0.8 },
        { pos: [3, 1, -2], color: '#8b5cf6', scale: 0.6, speed: 1.2 },
        { pos: [-1.5, -0.5, 1], color: '#14b8a6', scale: 0.7, speed: 1 },
        { pos: [2, -1, 1], color: '#3b82f6', scale: 0.5, speed: 0.9 },
        { pos: [0, 2, -3], color: '#ec4899', scale: 0.4, speed: 1.1 },
        { pos: [-2.5, 1.5, -2], color: '#f59e0b', scale: 0.55, speed: 0.7 },
        { pos: [1.5, 0.5, 2], color: '#10b981', scale: 0.65, speed: 1.3 },
        { pos: [-0.5, -1.5, -1], color: '#06b6d4', scale: 0.45, speed: 0.6 },
        { pos: [4, 0, 0], color: '#8b5cf6', scale: 0.35, speed: 1.4 },
        { pos: [-4, -0.5, 1], color: '#3b82f6', scale: 0.5, speed: 0.8 },
    ], [])

    return (
        <>
            <ambientLight intensity={0.3} />
            <pointLight position={[5, 5, 5]} intensity={0.8} color="#06b6d4" />
            <pointLight position={[-5, 3, -5]} intensity={0.5} color="#8b5cf6" />
            <spotLight position={[0, 8, 0]} angle={0.5} penumbra={1} intensity={0.4} color="#14b8a6" />

            {boxes.map((b, i) => (
                <FloatingBox key={i} position={b.pos} color={b.color} scale={b.scale} speed={b.speed} />
            ))}

            <ConveyorBelt />
            <ParticleField />
        </>
    )
}

export default function SupplyChainScene() {
    return (
        <Canvas
            camera={{ position: [0, 2, 8], fov: 50 }}
            style={{ background: 'transparent' }}
            gl={{ antialias: true, alpha: true }}
        >
            <Scene />
        </Canvas>
    )
}
