import { Formula, formulas } from "../formulas/registry";
import { FormulaCard } from "../components/FormulaCard";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

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
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
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

export const FormulaSelection = () => {
  const selectedFormulas = formulas.slice(0, 8);
  const navigate = useNavigate();

  const handleClick = (idx) => {
    console.log(selectedFormulas[idx].pattern);
    navigate(`/viewer/${selectedFormulas[idx].pattern}`);
  };

  const handleSurpriceMe = () => {
    const num = Math.floor(Math.random() * 8);
    navigate(`/viewer/${selectedFormulas[num].pattern}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen w-screen  bg-zinc-950 text-white  flex flex-col font-light"
    >
      {/* Header */}

      <div className="flex flex-col p-10 pb-0  gap-3">
        <div className="flex items-center justify-center gap-10 ">
          <div
            className=" h-full aspect-square border border-white rounded-xl flex justify-center items-center border-3"
            onClick={() => navigate("/")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="size-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
          </div>
          <div className="w-full border border-orange-500 rounded-xl py-3 text-center border-4">
            <h1 className="text-orange-500 tracking-widest text-5xl font-light">
              MATH IN MOTION
            </h1>
          </div>
        </div>

        <p className="text-white  text-xl tracking-widest flex-shrink-0 mt-3">
          PICK AN EQUATION AND WATCH THE MAGIC HAPPEN.
        </p>
      </div>

      {/* Masonry Style Grid */}
      <div
        className="flex-1 grid gap-6  px-10 py-10"
        style={{
          gridTemplateColumns: "repeat(24, 1fr)",
          gridTemplateRows: "repeat(12, 1fr)",
        }}
      >
        {/* Heart */}
        <div
          style={{ gridColumn: "1 / 6", gridRow: "1 / 7" }}
          className="rounded-4xl bg-[#A7A7A7] flex flex-col items-start justify-center  p-10 text-black uppercase "
          onClick={() => handleClick(0)}
        >
          <p className="text-5xl mb-10 font-light">
            {selectedFormulas[0].name}
          </p>
          <p className="text-3xl">EQUATION: </p>
          <BlockMath math={`${selectedFormulas[0].latex}`} />
        </div>

        {/* multi-lemniscate */}
        <div
          style={{ gridColumn: "6 / 10", gridRow: "1 / 8" }}
          className="rounded-4xl bg-[#3A3838] flex items-center justify-center p-10 text-white uppercase"
          onClick={() => handleClick(1)}
        >
          <div className="flex flex-col items-start justify-center rotate-[270deg]">
            <p className="text-5xl mb-10 font-light">
              {selectedFormulas[1].name}
            </p>
            <p className="text-2xl">EQUATION: </p>
            <BlockMath math={`${selectedFormulas[1].latex}`} />
          </div>
        </div>

        {/* butterfly */}
        <div
          style={{ gridColumn: "10 / 14", gridRow: "1 / 7" }}
          className="rounded-4xl bg-[#00000] border-2 flex flex-col items-start  justify-center   p-7 text-white uppercase"
          onClick={() => handleClick(2)}
        >
          <p className="text-5xl mb-10">{selectedFormulas[2].name}</p>
          <p className="text-3xl">EQUATION: </p>
          <BlockMath math={`${selectedFormulas[2].latex}`} />
        </div>

        {/* batman */}
        <div
          style={{ gridColumn: "14 / 21", gridRow: "1 / 7" }}
          className="rounded-4xl bg-[#ffffff] flex flex-col items-start justify-center  p-10 text-black uppercase"
          onClick={() => handleClick(3)}
        >
          <p className="text-5xl mb-10 font-light font-light">
            {selectedFormulas[3].name}
          </p>
          <p className="text-2xl">EQUATION: </p>
          <BlockMath math={`${selectedFormulas[3].latex}`} />
        </div>

        {/* Surprice Me */}
        <div
          style={{ gridColumn: "21 / 25", gridRow: "1 / 7" }}
          className="rounded-4xl bg-[#FF6900] flex flex-col items-start justify-center  p-10 text-white uppercase"
          onClick={handleSurpriceMe}
        >
          <p className="text-5xl mb-10 font-extralight">Surprise Me</p>
          <p className="text-2xl">
            The cobot chooses a random equation to draw
          </p>
        </div>

        {/* spiral */}
        <div
          style={{ gridColumn: "1 / 5", gridRow: "7 / 13" }}
          className="rounded-4xl bg-[#ffffff] flex flex-col items-start justify-center  p-10  text-black uppercase"
          onClick={() => handleClick(4)}
        >
          <p className="text-4xl mb-10 font-light">
            {selectedFormulas[4].name}
          </p>
          <p className="text-2xl">EQUATION: </p>
          <BlockMath math={`${selectedFormulas[4].latex}`} />
        </div>

    

        {/* lorenz_custom */}
        <div
          style={{ gridColumn: "5 / 11", gridRow: "8 / 13" }}
          className="rounded-4xl border-2 border-white flex flex-col items-start justify-center  p-10 text-white uppercase"
          onClick={() => handleClick(7)}
        >
          <p className="text-5xl mb-10 font-light">
            {selectedFormulas[7].name}
          </p>
          <p className="text-2xl">EQUATION: </p>
          <BlockMath math={`${selectedFormulas[7].latex}`} />
        </div>

        {/* aizawa */}
        <div
          style={{ gridColumn: "11 / 18", gridRow: "7 / 13" }}
          className="rounded-4xl bg-[#A7A7A7] flex items-center justify-center p-20  text-black uppercase"
          onClick={() => handleClick(6)}
        >
          <div className="flex flex-col items-start justify-center rotate-90">
            <p className="text-5xl mb-10 font-light break-words max-w-[250px]">
              {selectedFormulas[6].name}
            </p>
            <p className="text-2xl">EQUATION:</p>
            <BlockMath math={`${selectedFormulas[6].latex}`} />
          </div>
        </div>

        {/* rose */}
        <div
          style={{ gridColumn: "18 / 25", gridRow: "7 / 13" }}
          className="rounded-4xl bg-[#3A3838] flex flex-col items-start justify-center  p-10 text-white uppercase"
          onClick={() => handleClick(5)}
        >
          <p className="text-5xl mb-10">{selectedFormulas[5].name}</p>
          <p className="text-3xl">EQUATION: </p>
          <BlockMath math={`${selectedFormulas[5].latex}`} />
        </div>
      </div>
    </motion.div>
  );
};

{
  /* <div className="h-32 w-32 bg-transparent  absolute right-10">
            <Canvas camera={{ position: [0, 0, 15] }}>
              <ambientLight intensity={0.5} />
              <PreviewCurve formula={selectedFormulas[0]} />
            </Canvas>
            <div
              className="absolute top-3 right-3 w-3 h-3 rounded-full shadow-lg"
              style={{
                backgroundColor: selectedFormulas[0].color,
                boxShadow: `0 0 10px ${selectedFormulas[0].color}`,
              }}
            />
          </div> */
}
