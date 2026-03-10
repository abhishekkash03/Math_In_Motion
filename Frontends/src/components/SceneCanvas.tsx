import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { FormulaRenderer } from './FormulaRenderer';
import { Formula } from '../formulas/registry';

interface SceneCanvasProps {
  formula: Formula;
  points: {x: number, y: number, z: number}[];
  renderMode: 'line' | 'particles' | 'both';
  showAxes: boolean;
  showGrid: boolean;
  speed: number;
  restartTrigger: number;
  resetCameraTrigger: number;
}

export const SceneCanvas = ({
  formula,
  points,
  renderMode,
  showAxes,
  showGrid,
  speed,
  restartTrigger,
  resetCameraTrigger
}: SceneCanvasProps) => {
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [resetCameraTrigger]);

  return (
    <div className="w-full h-full bg-black ">
      <Canvas camera={{ position: [0, 0, 80], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <OrbitControls 
          ref={controlsRef} 
          makeDefault 
          enableDamping 
          dampingFactor={0.05} 
        />

        {showAxes && <axesHelper args={[50]} />}
        {showGrid && <gridHelper args={[100, 100, 0x444444, 0x222222]} rotation={[Math.PI / 2, 0, 0]} />}

        <FormulaRenderer 
          formula={formula} 
          points={points} 
          renderMode={renderMode} 
          speed={speed} 
          restartTrigger={restartTrigger} 
        />
      </Canvas>
    </div>
  );
};
