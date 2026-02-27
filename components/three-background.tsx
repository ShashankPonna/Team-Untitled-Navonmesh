"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

function FloatingParticles({ count = 200 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null)

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const sz = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15
      sz[i] = Math.random() * 2 + 0.5
    }
    return [pos, sz]
  }, [count])

  useFrame((state) => {
    if (!mesh.current) return
    mesh.current.rotation.y = state.clock.elapsedTime * 0.02
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1
    const posArray = mesh.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      posArray[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.002
    }
    mesh.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#5aada0"
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function FloatingOrbs() {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.y = state.clock.elapsedTime * 0.05
  })

  const orbs = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        position: [
          Math.cos((i / 5) * Math.PI * 2) * 6,
          Math.sin(i * 1.5) * 2,
          Math.sin((i / 5) * Math.PI * 2) * 6,
        ] as [number, number, number],
        scale: 0.3 + Math.random() * 0.5,
        speed: 0.2 + Math.random() * 0.3,
        color: ["#5aada0", "#7bc4b9", "#d4a574", "#8fb8a0", "#c9956a"][i],
      })),
    []
  )

  return (
    <group ref={group}>
      {orbs.map((orb, i) => (
        <FloatingOrb key={i} {...orb} index={i} />
      ))}
    </group>
  )
}

function FloatingOrb({
  position,
  scale,
  speed,
  color,
  index,
}: {
  position: [number, number, number]
  scale: number
  speed: number
  color: string
  index: number
}) {
  const mesh = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!mesh.current) return
    mesh.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * speed + index) * 1.5
    mesh.current.position.x =
      position[0] + Math.cos(state.clock.elapsedTime * speed * 0.5 + index) * 0.5
  })

  return (
    <mesh ref={mesh} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.15}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  )
}

function WaveGrid() {
  const mesh = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!mesh.current) return
    const geo = mesh.current.geometry as THREE.PlaneGeometry
    const posAttr = geo.attributes.position
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i)
      const y = posAttr.getY(i)
      const wave =
        Math.sin(x * 0.5 + state.clock.elapsedTime * 0.5) * 0.3 +
        Math.cos(y * 0.3 + state.clock.elapsedTime * 0.3) * 0.2
      posAttr.setZ(i, wave)
    }
    posAttr.needsUpdate = true
  })

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 3, 0, 0]} position={[0, -4, -5]}>
      <planeGeometry args={[40, 40, 60, 60]} />
      <meshStandardMaterial
        color="#5aada0"
        wireframe
        transparent
        opacity={0.06}
      />
    </mesh>
  )
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.3} />
        <FloatingParticles count={150} />
        <FloatingOrbs />
        <WaveGrid />
      </Canvas>
    </div>
  )
}
