import React, { useState, useMemo, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { formulas, POINT_COUNT } from "../formulas/registry";
import { InfoPanel } from "../components/InfoPanel";
import { SceneCanvas } from "../components/SceneCanvas";
import { motion } from "motion/react";
import { BlockMath } from "react-katex";
import { startPattern } from "../api/cobot";

export const Viewer = () => {
  const { formulaId } = useParams<{ formulaId: string }>();
  const formula = useMemo(
    () => formulas.find((f) => f.id === formulaId),
    [formulaId],
  );

  const [renderMode, setRenderMode] = useState<"line" | "particles" | "both">(
    "both",
  );
  const [showAxes, setShowAxes] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [speed, setSpeed] = useState(10);
  const [restartTrigger, setRestartTrigger] = useState(0);
  const [resetCameraTrigger, setResetCameraTrigger] = useState(0);
  const [status, setStatus] = useState<
    "moving_to_start" | "drawing" | "drawing_done" | "returning_home" | "idle"
  >("moving_to_start");

  const [uiLocked, setUiLocked] = useState(true);
  const navigate = useNavigate();

  const points = useMemo(() => {
    if (!formula) return [];
    return formula.generatorFunction(POINT_COUNT);
  }, [formula, restartTrigger]);

  if (!formula) {
    return <Navigate to="/" replace />;
  }

  const handleRestart = () => {
    setRestartTrigger((prev) => prev + 1);
    load();
  };

  const handleResetCamera = () => {
    setResetCameraTrigger((prev) => prev + 1);
  };

  const load = () => {
    if (!formula) return;

    setUiLocked(true);
    setStatus("moving_to_start");

    startPattern(formula.pattern);

    // robot moving from home -> start
    setTimeout(() => {
      setStatus("drawing");
    }, formula.startDelay * 1000);

    // drawing finished
    setTimeout(
      () => {
        setStatus("drawing_done");
      },
      (formula.startDelay + formula.duration) * 1000,
    );

    // robot returning home
    setTimeout(
      () => {
        setStatus("returning_home");
      },
      (formula.startDelay + formula.duration + 1) * 1000,
    );

    // unlock UI when robot reaches home
    setTimeout(
      () => {
        setStatus("idle");
      },
      (formula.startDelay + formula.duration + formula.endDelay) * 1000,
    );
    setTimeout(
      () => {
        setUiLocked(false);
      },
      (formula.startDelay + formula.duration + formula.endDelay + 3) * 1000,
    );
  };

  useEffect(() => {
    load()
  }, [formula]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-screen w-full overflow-hidden bg-black relative font-light"
    >
      <div className="w-96 h-1/2   z-10 shadow-2xl absolute bg-white left-12 top-12 text-black p-10 flex flex-col gap-1 rounded-2xl rounded-br-[10rem]">
        <p className="p-2 absolute top-5 right-5 bg-[#DDDDDD] rounded-sm text-xl">
          2D
        </p>

        <div
          className={`w-32 h-32 absolute -top-6 -left-6 bg-[#FF6900] rounded-br-[100%] rounded-3xl border-[0.8rem] flex justify-center items-center pr-3 pb-3 
  ${uiLocked ? "opacity-40 pointer-events-none" : "cursor-pointer"}`}
          onClick={() => !uiLocked && navigate("/formulas")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="white"
            className="size-16"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </div>

        <h1 className="text-4xl mt-12">{formula.name}</h1>
        <div className="text-sm ">
          <span>EQUATION:</span>
          <BlockMath math={`${formula.latex}`} />
        </div>

        <p className="text-xl">
          Description:
          <span> {formula.description}</span>
        </p>
      </div>
      <div className="w-24 h-[100%]   z-20 shadow-2xl absolute  right-12 top-1/2 -translate-y-1/2 flex flex-col py-10 gap-10 items-center">
        <div
          className={`w-full aspect-square text-4xl border-white border-3 rounded-2xl flex items-center justify-center 
  ${uiLocked ? "opacity-40 pointer-events-none" : "cursor-pointer"}`}
          onClick={() => !uiLocked && navigate("/")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className="size-16"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
        </div>

        <div className="border-2 w-24 h-full border-[#FF7311] rounded-2xl">
          <div className="flex items-center justify-center h-full ">
            <div className="transform rotate-90 whitespace-nowrap text-3xl  text-[#FF7311]">
              MATH IN MOTION
            </div>
          </div>
        </div>
      </div>

      <button
        className="absolute bg-[#FF6900] text-white z-20 bottom-1/3 left-12 text-3xl px-7 py-3 rounded-lg font-interval "
        onClick={handleResetCamera}
      >
        RESET VIEW
      </button>
      <button
        className={`absolute bg-[#FF6900] text-white z-20 bottom-1/6 left-12 text-3xl px-7 py-3 rounded-lg font-interval ${uiLocked ? "opacity-40 pointer-events-none" : "cursor-pointer"}`}
        onClick={handleRestart}
      >
        Restart
      </button>

      <div className=" absolute w-10 h-10 z-10  bottom-24 left-24 border-4 border-white border-b-transparent border-l-transparent"></div>

      <div className=" absolute z-10 left-1/2 bottom-1/12 -translate-y-1/2 -translate-x-1/2 text-2xl uppercase ">
        scroll to see the entire graph from different axis
      </div>

      <div
        className="absolute left-1/2 bottom-6 -translate-x-1/2 z-30 
bg-white/90 text-black px-8 py-4  shadow-xl text-xl flex items-center gap-4"
      >
        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>

        {status === "moving_to_start" && "Cobot moving to start position"}

        {status === "drawing" && "Cobot drawing the shape"}

        {status === "drawing_done" && "Shape completed"}

        {status === "returning_home" && "Cobot returning to home position"}

        {status === "idle" && "Ready for next drawing"}
      </div>

      <div className="flex-1 h-full relative">
        <SceneCanvas
          formula={formula}
          points={points}
          renderMode={renderMode}
          showAxes={showAxes}
          showGrid={showGrid}
          speed={speed}
          restartTrigger={restartTrigger}
          resetCameraTrigger={resetCameraTrigger}
        />
      </div>
    </motion.div>
  );
};

//  <InfoPanel
//           formula={formula}
//           points={points}
//           renderMode={renderMode}
//           setRenderMode={setRenderMode}
//           showAxes={showAxes}
//           setShowAxes={setShowAxes}
//           showGrid={showGrid}
//           setShowGrid={setShowGrid}
//           speed={speed}
//           setSpeed={setSpeed}
//           onRestart={handleRestart}
//           onResetCamera={handleResetCamera}
//         />
