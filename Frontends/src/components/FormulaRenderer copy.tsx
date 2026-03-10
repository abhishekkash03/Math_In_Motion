import React, { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Formula } from "../formulas/registry";

interface FormulaRendererProps {
  formula: Formula;
  points: { x: number; y: number; z: number }[];
  renderMode: "line" | "particles" | "both";
  speed: number;
  restartTrigger: number;
}

export const FormulaRenderer = ({
  formula,
  points,
  renderMode,
  speed,
  restartTrigger,
}: FormulaRendererProps) => {
  const [drawIndex, setDrawIndex] = useState(0);
  const lineRef = useRef<THREE.Line>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const tracerRef = useRef<THREE.Mesh>(null);

  const distances = useMemo(() => {
    const d: number[] = [0];

    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      const dz = points[i].z - points[i - 1].z;

      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      d.push(d[i - 1] + dist);
    }

    return d;
  }, [points]);

  const totalLength = distances[distances.length - 1];

  useEffect(() => {
    setDrawIndex(0);
    startTimeRef.current = null;
  }, [formula, restartTrigger]);

  const startTimeRef = useRef<number | null>(null);

  useFrame(({ clock }) => {
    if (!startTimeRef.current) {
      startTimeRef.current = clock.getElapsedTime();
    }

    const elapsed = clock.getElapsedTime() - startTimeRef.current;

    if (elapsed < formula.startDelay) return;

    const drawElapsed = elapsed - formula.startDelay;

    const progress = Math.min(drawElapsed / formula.duration, 1);

    const targetDistance = progress * totalLength;

    let index = 0;

    while (index < distances.length && distances[index] < targetDistance) {
      index++;
    }

    setDrawIndex((prev) => (prev !== index ? index : prev));
  });

  const visiblePoints = useMemo(
    () => points.slice(0, Math.floor(drawIndex)),
    [points, drawIndex],
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(visiblePoints.length * 3);
    visiblePoints.forEach((p, i) => {
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
    });
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [visiblePoints]);

  const tracerPosition =
    visiblePoints.length > 0
      ? visiblePoints[visiblePoints.length - 1]
      : { x: 0, y: 0, z: 0 };

  return (
    <group>
      {(renderMode === "line" || renderMode === "both") && (
        // @ts-ignore
        <line ref={lineRef as any} geometry={geometry}>
          <lineBasicMaterial
            color={formula.color}
            linewidth={2}
            transparent
            opacity={0.8}
          />
        </line>
      )}

      {(renderMode === "particles" || renderMode === "both") && (
        // @ts-ignore
        <points ref={pointsRef as any} geometry={geometry}>
          <pointsMaterial
            color={formula.color}
            size={0.5}
            sizeAttenuation
            transparent
            opacity={0.8}
          />
        </points>
      )}

      {visiblePoints.length > 0 && visiblePoints.length < points.length && (
        <mesh
          ref={tracerRef}
          position={[tracerPosition.x, tracerPosition.y, tracerPosition.z]}
        >
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
    </group>
  );
};
