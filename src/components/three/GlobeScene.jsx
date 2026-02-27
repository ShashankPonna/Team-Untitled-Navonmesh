import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Globe() {
    const meshRef = useRef()
    const wireRef = useRef()

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.08
        }
        if (wireRef.current) {
            wireRef.current.rotation.y = state.clock.elapsedTime * 0.08
        }
    })

    return (
        <group>
            {/* Solid globe */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[2, 64, 64]} />
                <meshStandardMaterial
                    color="#0f172a"
                    roughness={0.8}
                    metalness={0.3}
                    transparent
                    opacity={0.9}
                />
            </mesh>
            {/* Wireframe overlay */}
            <mesh ref={wireRef}>
                <sphereGeometry args={[2.01, 32, 32]} />
                <meshStandardMaterial
                    color="#06b6d4"
                    wireframe
                    transparent
                    opacity={0.15}
                />
            </mesh>
            {/* Glow ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[2.2, 2.25, 128]} />
                <meshStandardMaterial
                    color="#06b6d4"
                    transparent
                    opacity={0.3}
                    emissive="#06b6d4"
                    emissiveIntensity={0.5}
                />
            </mesh>
        </group>
    )
}

function ConnectionArc({ from, to, color = '#06b6d4' }) {
    const lineRef = useRef()

    const curve = useMemo(() => {
        const start = new THREE.Vector3(...from)
        const end = new THREE.Vector3(...to)
        const mid = start.clone().add(end).multiplyScalar(0.5)
        const dist = start.distanceTo(end)
        mid.normalize().multiplyScalar(2 + dist * 0.3)
        return new THREE.QuadraticBezierCurve3(start, mid, end)
    }, [from, to])

    const points = useMemo(() => curve.getPoints(50), [curve])
    const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])

    useFrame((state) => {
        if (lineRef.current) {
            lineRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2
        }
    })

    return (
        <line ref={lineRef} geometry={geometry}>
            <lineBasicMaterial color={color} transparent opacity={0.5} />
        </line>
    )
}

function WarehousePoint({ position, color = '#06b6d4' }) {
    const meshRef = useRef()

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.2)
        }
    })

    return (
        <group position={position}>
            <mesh ref={meshRef}>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.8}
                />
            </mesh>
            {/* Glow halo */}
            <mesh>
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshStandardMaterial
                    color={color}
                    transparent
                    opacity={0.15}
                />
            </mesh>
        </group>
    )
}

function latLonToXYZ(lat, lon, radius = 2.05) {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lon + 180) * (Math.PI / 180)
    return [
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta),
    ]
}

function Scene() {
    const warehouses = useMemo(() => [
        { lat: 40.7, lon: -74, color: '#06b6d4' },   // New York
        { lat: 51.5, lon: -0.1, color: '#8b5cf6' },   // London
        { lat: 35.7, lon: 139.7, color: '#f59e0b' },   // Tokyo
        { lat: 1.35, lon: 103.8, color: '#10b981' },   // Singapore
        { lat: -33.9, lon: 151.2, color: '#ef4444' },   // Sydney
        { lat: 19.1, lon: 72.9, color: '#3b82f6' },    // Mumbai
        { lat: 37.6, lon: -122.4, color: '#14b8a6' },   // San Francisco
        { lat: 55.8, lon: 37.6, color: '#6366f1' },    // Moscow
    ], [])

    const positions = useMemo(
        () => warehouses.map(w => latLonToXYZ(w.lat, w.lon)),
        [warehouses]
    )

    const connections = useMemo(() => [
        [0, 1], [0, 6], [1, 7], [1, 5], [2, 3], [3, 4], [5, 3], [2, 6],
    ], [])

    return (
        <>
            <ambientLight intensity={0.3} />
            <pointLight position={[5, 5, 5]} intensity={0.5} color="#06b6d4" />
            <pointLight position={[-5, 3, -5]} intensity={0.3} color="#8b5cf6" />

            <Globe />

            {warehouses.map((w, i) => (
                <WarehousePoint key={i} position={positions[i]} color={w.color} />
            ))}

            {connections.map(([a, b], i) => (
                <ConnectionArc
                    key={i}
                    from={positions[a]}
                    to={positions[b]}
                    color={warehouses[a].color}
                />
            ))}
        </>
    )
}

export default function GlobeScene() {
    return (
        <Canvas
            camera={{ position: [0, 1, 5], fov: 45 }}
            style={{ background: 'transparent' }}
            gl={{ antialias: true, alpha: true }}
        >
            <Scene />
        </Canvas>
    )
}
