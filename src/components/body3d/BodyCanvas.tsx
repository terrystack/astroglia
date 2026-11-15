"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Grid } from "@react-three/drei";
import HumanBody from "./HumanBody";

function SceneGrid() {
  return (
    <Grid
      position={[0, -2.1, 0]}
      args={[10, 10]}
      cellSize={0.5}
      cellThickness={0.5}
      cellColor="#003344"
      sectionSize={2}
      sectionThickness={1}
      sectionColor="#006688"
      fadeDistance={8}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid={false}
    />
  );
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.15} color="#001a2e" />
      <pointLight position={[0, 5, 2]} intensity={2} color="#00e5ff" />
      <pointLight position={[-3, 2, -2]} intensity={1} color="#7c4dff" />
      <pointLight position={[3, -1, 2]} intensity={0.8} color="#00bfa5" />
      <spotLight
        position={[0, 8, 0]}
        angle={0.4}
        penumbra={0.8}
        intensity={3}
        color="#00e5ff"
        castShadow
      />
    </>
  );
}

export default function BodyCanvas() {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Corner decorations */}
      {["tl", "tr", "bl", "br"].map((pos) => (
        <div
          key={pos}
          style={{
            position: "absolute",
            width: "16px",
            height: "16px",
            borderColor: "rgba(0,229,255,0.5)",
            borderStyle: "solid",
            borderWidth: 0,
            ...(pos === "tl" && { top: 8, left: 8, borderTopWidth: 1, borderLeftWidth: 1 }),
            ...(pos === "tr" && { top: 8, right: 8, borderTopWidth: 1, borderRightWidth: 1 }),
            ...(pos === "bl" && { bottom: 8, left: 8, borderBottomWidth: 1, borderLeftWidth: 1 }),
            ...(pos === "br" && { bottom: 8, right: 8, borderBottomWidth: 1, borderRightWidth: 1 }),
            zIndex: 10,
          }}
        />
      ))}

      {/* Scan label */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "8px",
          letterSpacing: "3px",
          color: "rgba(0,229,255,0.5)",
          zIndex: 10,
          textTransform: "uppercase",
        }}
      >
        FULL BODY SCAN · ACTIVE
      </div>

      {/* Axis labels */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 16,
          fontSize: "7px",
          color: "rgba(0,229,255,0.3)",
          zIndex: 10,
          lineHeight: "1.6",
          textAlign: "right",
          letterSpacing: "1px",
        }}
      >
        <div>DRAG: ROTATE</div>
        <div>SCROLL: ZOOM</div>
        <div>CLICK: SELECT REGION</div>
      </div>

      <Canvas
        camera={{ position: [0, 0.5, 5], fov: 45, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        shadows
      >
        <color attach="background" args={["#020408"]} />
        <fog attach="fog" args={["#020408", 8, 20]} />
        <Lighting />
        <Suspense fallback={null}>
          <HumanBody />
          <SceneGrid />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={2.5}
          maxDistance={9}
          minPolarAngle={Math.PI * 0.1}
          maxPolarAngle={Math.PI * 0.85}
          autoRotate={false}
          target={[0, 0.5, 0]}
        />
      </Canvas>
    </div>
  );
}
