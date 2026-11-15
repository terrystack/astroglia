"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useAstrogliaStore } from "@/store/useAstrogliaStore";

interface BodyPartProps {
  position: [number, number, number];
  geometry: "sphere" | "cylinder" | "box" | "capsule";
  args: number[];
  color: string;
  glowColor: string;
  opacity?: number;
  wireframe?: boolean;
  region?: string;
}

function BodyPart({
  position,
  geometry,
  args,
  color,
  glowColor,
  opacity = 0.7,
  wireframe = false,
  region,
}: BodyPartProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { selectedRegion, setSelectedRegion, metrics } = useAstrogliaStore();

  const isSelected = selectedRegion === region;
  const regionMetrics = metrics.filter((m) => m.bodyRegion === region);
  const hasWarning = regionMetrics.some((m) => m.status === "warning");
  const hasCritical = regionMetrics.some((m) => m.status === "critical");

  const displayColor = hasCritical
    ? "#ff1744"
    : hasWarning
    ? "#ffb300"
    : isSelected
    ? "#00e5ff"
    : color;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (isSelected || hasCritical) {
      meshRef.current.material instanceof THREE.MeshStandardMaterial &&
        (meshRef.current.material.emissiveIntensity =
          0.3 + Math.sin(Date.now() * 0.003) * 0.2);
    }
  });

  const geo = useMemo(() => {
    switch (geometry) {
      case "sphere":
        return <sphereGeometry args={[args[0], args[1] ?? 16, args[2] ?? 12]} />;
      case "cylinder":
        return (
          <cylinderGeometry
            args={[args[0], args[1], args[2], args[3] ?? 12]}
          />
        );
      case "box":
        return <boxGeometry args={[args[0], args[1], args[2]]} />;
      case "capsule":
        return (
          <capsuleGeometry args={[args[0], args[1], args[2] ?? 8, args[3] ?? 16]} />
        );
      default:
        return <sphereGeometry args={[args[0], 16, 12]} />;
    }
  }, [geometry, args]);

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={() => setSelectedRegion(isSelected ? null : region ?? null)}
    >
      {geo}
      <meshStandardMaterial
        color={displayColor}
        emissive={displayColor}
        emissiveIntensity={isSelected || hasCritical ? 0.3 : hasWarning ? 0.2 : 0.05}
        transparent
        opacity={opacity}
        wireframe={wireframe}
        roughness={0.3}
        metalness={0.6}
      />
    </mesh>
  );
}

function BodyWireframe() {
  return (
    <group>
      {/* Head */}
      <BodyPart
        position={[0, 2.5, 0]}
        geometry="sphere"
        args={[0.42, 20, 16]}
        color="#00e5ff"
        glowColor="#00e5ff"
        opacity={0.15}
        wireframe
        region="brain"
      />
      <BodyPart
        position={[0, 2.5, 0]}
        geometry="sphere"
        args={[0.4, 20, 16]}
        color="#00bcd4"
        glowColor="#00bcd4"
        opacity={0.5}
        region="brain"
      />

      {/* Neck */}
      <BodyPart
        position={[0, 1.95, 0]}
        geometry="cylinder"
        args={[0.14, 0.14, 0.4, 10]}
        color="#0097a7"
        glowColor="#0097a7"
        opacity={0.6}
        region="systemic"
      />

      {/* Torso */}
      <BodyPart
        position={[0, 1.1, 0]}
        geometry="box"
        args={[0.85, 1.1, 0.42]}
        color="#00acc1"
        glowColor="#00acc1"
        opacity={0.12}
        wireframe
        region="chest"
      />
      <BodyPart
        position={[0, 1.1, 0]}
        geometry="box"
        args={[0.83, 1.08, 0.4]}
        color="#006064"
        glowColor="#006064"
        opacity={0.45}
        region="chest"
      />

      {/* Heart glow */}
      <BodyPart
        position={[-0.18, 1.2, 0.18]}
        geometry="sphere"
        args={[0.14, 10, 10]}
        color="#e91e63"
        glowColor="#e91e63"
        opacity={0.8}
        region="heart"
      />

      {/* Lungs */}
      <BodyPart
        position={[-0.26, 1.15, 0.05]}
        geometry="capsule"
        args={[0.1, 0.35, 6, 12]}
        color="#7b1fa2"
        glowColor="#7b1fa2"
        opacity={0.5}
        region="lungs"
      />
      <BodyPart
        position={[0.26, 1.15, 0.05]}
        geometry="capsule"
        args={[0.1, 0.35, 6, 12]}
        color="#7b1fa2"
        glowColor="#7b1fa2"
        opacity={0.5}
        region="lungs"
      />

      {/* Spine indicator */}
      <BodyPart
        position={[0, 0.9, -0.17]}
        geometry="cylinder"
        args={[0.04, 0.04, 1.0, 6]}
        color="#ffc107"
        glowColor="#ffc107"
        opacity={0.7}
        region="spine"
      />

      {/* Abdomen */}
      <BodyPart
        position={[0, 0.38, 0]}
        geometry="box"
        args={[0.72, 0.6, 0.38]}
        color="#00695c"
        glowColor="#00695c"
        opacity={0.5}
        region="abdomen"
      />

      {/* Hips */}
      <BodyPart
        position={[0, 0.02, 0]}
        geometry="box"
        args={[0.78, 0.28, 0.4]}
        color="#00695c"
        glowColor="#00695c"
        opacity={0.45}
        region="abdomen"
      />

      {/* Upper Arms */}
      <BodyPart
        position={[-0.62, 1.15, 0]}
        geometry="capsule"
        args={[0.1, 0.52, 6, 10]}
        color="#0288d1"
        glowColor="#0288d1"
        opacity={0.6}
        region="arms"
      />
      <BodyPart
        position={[0.62, 1.15, 0]}
        geometry="capsule"
        args={[0.1, 0.52, 6, 10]}
        color="#0288d1"
        glowColor="#0288d1"
        opacity={0.6}
        region="arms"
      />

      {/* Forearms */}
      <BodyPart
        position={[-0.65, 0.57, 0]}
        geometry="capsule"
        args={[0.08, 0.44, 6, 10]}
        color="#01579b"
        glowColor="#01579b"
        opacity={0.6}
        region="arms"
      />
      <BodyPart
        position={[0.65, 0.57, 0]}
        geometry="capsule"
        args={[0.08, 0.44, 6, 10]}
        color="#01579b"
        glowColor="#01579b"
        opacity={0.6}
        region="arms"
      />

      {/* Hands */}
      <BodyPart
        position={[-0.67, 0.22, 0]}
        geometry="sphere"
        args={[0.08, 8, 8]}
        color="#0d47a1"
        glowColor="#0d47a1"
        opacity={0.65}
        region="arms"
      />
      <BodyPart
        position={[0.67, 0.22, 0]}
        geometry="sphere"
        args={[0.08, 8, 8]}
        color="#0d47a1"
        glowColor="#0d47a1"
        opacity={0.65}
        region="arms"
      />

      {/* Upper Legs */}
      <BodyPart
        position={[-0.24, -0.52, 0]}
        geometry="capsule"
        args={[0.14, 0.72, 6, 10]}
        color="#1a237e"
        glowColor="#1a237e"
        opacity={0.6}
        region="legs"
      />
      <BodyPart
        position={[0.24, -0.52, 0]}
        geometry="capsule"
        args={[0.14, 0.72, 6, 10]}
        color="#1a237e"
        glowColor="#1a237e"
        opacity={0.6}
        region="legs"
      />

      {/* Lower Legs */}
      <BodyPart
        position={[-0.24, -1.42, 0]}
        geometry="capsule"
        args={[0.1, 0.72, 6, 10]}
        color="#283593"
        glowColor="#283593"
        opacity={0.6}
        region="legs"
      />
      <BodyPart
        position={[0.24, -1.42, 0]}
        geometry="capsule"
        args={[0.1, 0.72, 6, 10]}
        color="#283593"
        glowColor="#283593"
        opacity={0.6}
        region="legs"
      />

      {/* Feet */}
      <BodyPart
        position={[-0.24, -1.9, 0.08]}
        geometry="box"
        args={[0.18, 0.1, 0.32]}
        color="#3949ab"
        glowColor="#3949ab"
        opacity={0.65}
        region="legs"
      />
      <BodyPart
        position={[0.24, -1.9, 0.08]}
        geometry="box"
        args={[0.18, 0.1, 0.32]}
        color="#3949ab"
        glowColor="#3949ab"
        opacity={0.65}
        region="legs"
      />
    </group>
  );
}

function FloatingParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions } = useMemo(() => {
    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return { positions };
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#00e5ff"
        size={0.02}
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

export default function HumanBody() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.15) * 0.3;
    groupRef.current.position.y = Math.sin(t * 0.4) * 0.03;
  });

  return (
    <group ref={groupRef}>
      <BodyWireframe />
      <FloatingParticles />
    </group>
  );
}
