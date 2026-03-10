import React, { useState, useEffect, useRef } from "react";

export default function CircleComplete() {
  const radius = 110;
  const center = 150;
  const circumference = 2 * Math.PI * radius;

  const svgRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Auto animate to 75%
  useEffect(() => {
    let frame;

    const animate = () => {
      setProgress((p) => {
        if (p >= 0.75) return 0.75;
        return p + 0.003;
      });

      frame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  // convert mouse → circle angle
  const getProgressFromPointer = (event) => {
    const rect = svgRef.current.getBoundingClientRect();

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = event.clientX - cx;
    const dy = event.clientY - cy;

    let angle = Math.atan2(dy, dx);

    angle += Math.PI / 2;

    if (angle < 0) angle += Math.PI * 2;

    return angle / (Math.PI * 2);
  };

  // handle dragging
  useEffect(() => {
    const move = (e) => {
      if (!dragging) return;

      const p = getProgressFromPointer(e);

      if (p < 0.75) return;

      if (p >= 1) {
        setProgress(1);
        setDragging(false);
        alert("Circle completed");
        return;
      }

      setProgress(p);
    };

    const up = () => setDragging(false);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging]);

  const dashOffset = circumference * (1 - progress);

  const angle = progress * 2 * Math.PI - Math.PI / 2;

  const hx = center + radius * Math.cos(angle);
  const hy = center + radius * Math.sin(angle);

  return (
    <svg ref={svgRef} width="300" height="300">
      {/* background circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        stroke="#ddd"
        strokeWidth="12"
        fill="none"
      />

      {/* progress tail */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        stroke="#ff7a00"
        strokeWidth="12"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
      />

      {/* draggable object */}
      <circle
        cx={hx}
        cy={hy}
        r="12"
        fill="#ff7a00"
        style={{ cursor: "pointer" }}
        onPointerDown={() => setDragging(true)}
      />
    </svg>
  );
}