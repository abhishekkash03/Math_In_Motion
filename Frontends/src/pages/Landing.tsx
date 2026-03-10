import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { CircularProgress } from "../components/CircularProgress";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

export const Landing = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate("/formulas");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen w-screen bg-zinc-950 text-white flex flex-col items-center justify-center relative"
    >
      {/* Title */}
      <h1 className="text-7xl md:text-9xl font-light font-montech tracking-wide mb-6">
        MATH IN MOTION
      </h1>
      <div className="absolute left-4/12 top-[30rem] -translate-x-1/2 -translate-y-1/2 ">
        {/* <CircularProgress
          size={300}
          strokeWidth={10}
          trackColor="#27272a" // zinc-800
          progressColor="#ff8c00"
          handleColor="#ff8c00"
          onComplete={() => navigate("/formulas")}
        /> */}

        <CircularProgress
          size={600} // double of 300
          strokeWidth={10}
          trackColor="#27272a"
          progressColor="#ffffff"
          handleColor="#ff8c00"
          onComplete={() => navigate("/formulas")}
        />
      </div>

      {/* Subtitle */}
      <p className="text-orange-400 tracking-widest mb-10 text-3xl">
        [COMPLETE CIRCLE TO BEGIN]
      </p>

      {/* Start Button */}
      {/* <button
        onClick={() => navigate("/formulas")}
        className="px-10 py-4 border border-orange-500 text-orange-500 rounded-full 
        hover:bg-orange-500 hover:text-black transition-all duration-300"
      >
        START
      </button> */}

      <p className=" text-3xl absolute top-1/6 left-4/6">
        <BlockMath
          math={`
\\begin{aligned}
(x^2 + y^2 - 1)^3 - x^2 y^3 &= 0
\\end{aligned}
`}
        />
      </p>
      <p className=" text-3xl absolute top-10/12 left-1/12">
        <BlockMath
          math={`
\\begin{aligned}
x &= 9\\sin(t) + 3\\sin(3t)
\\end{aligned}
`}
        />
      </p>
      <p className=" text-3xl absolute top-8/12 left-3/4">
        <BlockMath
          math={`
\\begin{aligned}
y &= 10\\cos(t) - 2\\cos(3t)
\\end{aligned}
`}
        />
      </p>
      <p className=" text-3xl absolute top-1/12 right-3/4">
        <BlockMath
          math={`
\\begin{aligned}
y &= 10\\cos(t) - 2\\cos(3t)
\\end{aligned}
`}
        />
      </p>
      <p className=" text-3xl absolute bottom-1/12 right-2/6">
        <BlockMath
          math={`
\\begin{aligned}
y &= 10\\cos(t) - 2\\cos(3t)
\\end{aligned}
`}
        />
      </p>
    </motion.div>
  );
};
