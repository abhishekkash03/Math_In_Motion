import React, { useEffect, useRef, useCallback } from "react";

export interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  handleColor?: string;
  autoAnimationDuration?: number;
  snapBackDuration?: number;
  maxAutoProgress?: number;
  onComplete?: () => void;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size = 280,
  strokeWidth = 10,
  trackColor = "#e5e5e5",
  progressColor = "#ff8c00",
  handleColor = "#ff8c00",
  autoAnimationDuration = 2000,
  snapBackDuration = 400,
  maxAutoProgress = 0.75,
  onComplete,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const handleRef = useRef<SVGCircleElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);

  const progressRef = useRef(0);
  const modeRef = useRef<"AUTO" | "DRAGGING" | "SNAP_BACK" | "COMPLETED">("AUTO");
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const startProgressRef = useRef<number>(0);

  const setProgress = useCallback(
    (p: number) => {
      progressRef.current = p;

      const radius = (size - strokeWidth) / 2;
      const cx = size / 2;
      const cy = size / 2;

      const startAngle = Math.PI / 6;
      const endAngle = startAngle + p * 2 * Math.PI;

      const startX = cx + radius * Math.cos(startAngle);
      const startY = cy + radius * Math.sin(startAngle);
      const endX = cx + radius * Math.cos(endAngle);
      const endY = cy + radius * Math.sin(endAngle);

      const largeArcFlag = p > 0.5 ? 1 : 0;

      let pathData = "";
      if (p >= 0.999) {
        pathData = `M ${cx + radius * Math.cos(startAngle)} ${cy + radius * Math.sin(
          startAngle
        )} A ${radius} ${radius} 0 1 1 ${
          cx + radius * Math.cos(startAngle - 0.001)
        } ${cy + radius * Math.sin(startAngle - 0.001)}`;
      } else if (p <= 0.001) {
        pathData = `M ${startX} ${startY}`;
      } else {
        pathData = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
      }

      if (pathRef.current) {
        pathRef.current.setAttribute("d", pathData);
      }

      if (handleRef.current) {
        handleRef.current.setAttribute("cx", endX.toString());
        handleRef.current.setAttribute("cy", endY.toString());
      }

      if (glowRef.current) {
        glowRef.current.setAttribute("cx", endX.toString());
        glowRef.current.setAttribute("cy", endY.toString());
        const glowOpacity = 0.15 + 0.45 * p;
        glowRef.current.setAttribute("opacity", glowOpacity.toString());
      }
    },
    [size, strokeWidth]
  );

  const animateAuto = useCallback(
    (timestamp: number) => {
      if (modeRef.current !== "AUTO") return;
      if (!startTimeRef.current) startTimeRef.current = timestamp;

      const elapsed = timestamp - startTimeRef.current;
      const p =
        ((elapsed % autoAnimationDuration) / autoAnimationDuration) * maxAutoProgress;

      setProgress(p);
      animationRef.current = requestAnimationFrame(animateAuto);
    },
    [autoAnimationDuration, maxAutoProgress, setProgress]
  );

  const animateSnapBack = useCallback(
    (timestamp: number) => {
      if (modeRef.current !== "SNAP_BACK") return;
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
        startProgressRef.current = progressRef.current;
      }

      const elapsed = timestamp - startTimeRef.current;
      let t = elapsed / snapBackDuration;

      if (t >= 1) {
        t = 1;
        setProgress(maxAutoProgress);
        modeRef.current = "AUTO";
        startTimeRef.current = 0;
        animationRef.current = requestAnimationFrame(animateAuto);
        return;
      }

      const easeT = t * (2 - t);
      const currentProgress =
        startProgressRef.current +
        (maxAutoProgress - startProgressRef.current) * easeT;

      setProgress(currentProgress);
      animationRef.current = requestAnimationFrame(animateSnapBack);
    },
    [snapBackDuration, maxAutoProgress, setProgress, animateAuto]
  );

  useEffect(() => {
    modeRef.current = "AUTO";
    startTimeRef.current = 0;
    animationRef.current = requestAnimationFrame(animateAuto);

    return () => cancelAnimationFrame(animationRef.current);
  }, [animateAuto]);

  const getPointerData = (e: React.PointerEvent) => {
    if (!svgRef.current) return null;

    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // IMPORTANT: use rendered radius, not SVG logical radius
    const renderedRadius = (Math.min(rect.width, rect.height) - strokeWidth) / 2;

    let angle = Math.atan2(dy, dx);
    let normalizedAngle = angle - Math.PI / 6;
    if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

    const clickedProgress = normalizedAngle / (2 * Math.PI);

    return {
      rect,
      dx,
      dy,
      distance,
      renderedRadius,
      clickedProgress,
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (modeRef.current === "COMPLETED") return;

    const data = getPointerData(e);
    if (!data) return;

    const { distance, renderedRadius, clickedProgress } = data;

    if (Math.abs(distance - renderedRadius) > 40) return;

    if (clickedProgress > maxAutoProgress + 0.05 && clickedProgress < 0.95) {
      return;
    }

    (e.target as Element).setPointerCapture(e.pointerId);
    modeRef.current = "DRAGGING";
    cancelAnimationFrame(animationRef.current);

    const startProgress = clickedProgress > 0.95 ? 0 : clickedProgress;
    setProgress(startProgress);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (modeRef.current !== "DRAGGING") return;

    const data = getPointerData(e);
    if (!data) return;

    const { clickedProgress } = data;

    let newProgress = clickedProgress;
    let delta = newProgress - progressRef.current;

    if (delta > 0.5) delta -= 1;
    if (delta < -0.5) delta += 1;

    let nextProgress = progressRef.current + delta;
    nextProgress = Math.max(0, Math.min(nextProgress, 1));

    setProgress(nextProgress);

    if (nextProgress >= 0.99) {
      modeRef.current = "COMPLETED";
      setProgress(1);
      onComplete?.();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (modeRef.current === "DRAGGING") {
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        //
      }

      modeRef.current = "SNAP_BACK";
      startTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animateSnapBack);
    }
  };

  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        touchAction: "none",
        overflow: "visible",
        display: "block",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        // stroke={transparent}
        strokeWidth={strokeWidth}
      />

      <path
        ref={pathRef}
        fill="none"
        stroke={progressColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={{ cursor: "pointer" }}
      />

      <circle
        ref={glowRef}
        r={strokeWidth * 2.5}
        fill={handleColor}
        style={{ pointerEvents: "none" }}
      />

      <circle
        ref={handleRef}
        r={strokeWidth * 1.5}
        fill={handleColor}
        style={{ cursor: "grab", touchAction: "none" }}
      />
    </svg>
  );
};