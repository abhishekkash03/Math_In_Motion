import React, { useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Formula } from '../formulas/registry';
import * as THREE from 'three';

const PreviewCurve = ({ formula }: { formula: Formula }) => {
  const points = useMemo(() => formula.generatorFunction(300), [formula]);
  const lineRef = useRef<THREE.Line>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
    });
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [points]);

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      lineRef.current.rotation.x = state.clock.elapsedTime * 0.2;
    }
  });

  useMemo(() => {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (box) {
      const center = new THREE.Vector3();
      box.getCenter(center);
      geometry.translate(-center.x, -center.y, -center.z);
      
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        geometry.scale(10 / maxDim, 10 / maxDim, 10 / maxDim);
      }
    }
  }, [geometry]);

  return (
    // @ts-ignore
    <line ref={lineRef as any} geometry={geometry}>
      <lineBasicMaterial color={formula.color} linewidth={2} />
    </line>
  );
};

export const FormulaCard = ({ formula }: { formula: Formula }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/viewer/${formula.id}`)}
      className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] group flex flex-col"
    >
      <div className="h-48 w-full bg-black relative">
        <Canvas camera={{ position: [0, 0, 15] }}>
          <ambientLight intensity={0.5} />
          <PreviewCurve formula={formula} />
        </Canvas>
        <div 
          className="absolute top-3 right-3 w-3 h-3 rounded-full shadow-lg" 
          style={{ backgroundColor: formula.color, boxShadow: `0 0 10px ${formula.color}` }}
        />
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-zinc-300 transition-colors">{formula.name}</h3>
        <p className="text-zinc-400 text-sm line-clamp-2">{formula.description}</p>
      </div>
    </div>
  );
};
