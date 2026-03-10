import React, { useEffect, useRef, useCallback } from 'react';

export interface CircularProgressProps {
  /** The width and height of the SVG container */
  size?: number;
  /** The thickness of the track and progress arc */
  strokeWidth?: number;
  /** The color of the background track */
  trackColor?: string;
  /** The color of the filled progress arc */
  progressColor?: string;
  /** The color of the draggable handle */
  handleColor?: string;
  /** Duration of the auto-animation loop in milliseconds */
  autoAnimationDuration?: number;
  /** Duration of the snap-back animation in milliseconds */
  snapBackDuration?: number;
  /** The maximum progress (0 to 1) the auto-animation reaches before looping */
  maxAutoProgress?: number;
  /** Callback fired when the user completes the full circle */
  onComplete?: () => void;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size = 280,
  strokeWidth = 10,
  trackColor = '#e5e5e5',
  progressColor = '#ff8c00',
  handleColor = '#ff8c00',
  autoAnimationDuration = 2000,
  snapBackDuration = 400,
  maxAutoProgress = 0.75,
  onComplete,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const handleRef = useRef<SVGCircleElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);

  // We use refs for mutable state to avoid React re-renders during 60fps animation
  const progressRef = useRef(0);
  const modeRef = useRef<'AUTO' | 'DRAGGING' | 'SNAP_BACK' | 'COMPLETED'>('AUTO');
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const startProgressRef = useRef<number>(0);

  // Core rendering function that updates SVG DOM directly for maximum performance
  const setProgress = useCallback((p: number) => {
    progressRef.current = p;
    const radius = (size - strokeWidth) / 2;
    const cx = size / 2;
    const cy = size / 2;
    
    // Fixed start angle at 4 o'clock (30 degrees or PI/6 radians in standard math)
    const startAngle = Math.PI / 6; 
    const endAngle = startAngle + p * 2 * Math.PI;

    const startX = cx + radius * Math.cos(startAngle);
    const startY = cy + radius * Math.sin(startAngle);
    const endX = cx + radius * Math.cos(endAngle);
    const endY = cy + radius * Math.sin(endAngle);

    const largeArcFlag = p > 0.5 ? 1 : 0;

    let pathData = '';
    if (p >= 0.999) {
      // Draw a full circle minus a tiny fraction to avoid SVG arc rendering collapse
      pathData = `M ${cx + radius * Math.cos(startAngle)} ${cy + radius * Math.sin(startAngle)} A ${radius} ${radius} 0 1 1 ${cx + radius * Math.cos(startAngle - 0.001)} ${cy + radius * Math.sin(startAngle - 0.001)}`;
    } else if (p <= 0.001) {
      // Draw nothing or just the start point
      pathData = `M ${startX} ${startY}`;
    } else {
      // Draw the progress arc
      pathData = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
    }

    if (pathRef.current) {
      pathRef.current.setAttribute('d', pathData);
    }

    if (handleRef.current) {
      handleRef.current.setAttribute('cx', endX.toString());
      handleRef.current.setAttribute('cy', endY.toString());
    }

    if (glowRef.current) {
      glowRef.current.setAttribute('cx', endX.toString());
      glowRef.current.setAttribute('cy', endY.toString());
      // Glow becomes stronger as progress increases towards completion
      const glowOpacity = 0.15 + 0.45 * p;
      glowRef.current.setAttribute('opacity', glowOpacity.toString());
    }
  }, [size, strokeWidth]);

  // Auto-animation loop
  const animateAuto = useCallback((timestamp: number) => {
    if (modeRef.current !== 'AUTO') return;
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    
    const elapsed = timestamp - startTimeRef.current;
    const p = ((elapsed % autoAnimationDuration) / autoAnimationDuration) * maxAutoProgress;
    
    setProgress(p);
    animationRef.current = requestAnimationFrame(animateAuto);
  }, [autoAnimationDuration, maxAutoProgress, setProgress]);

  // Snap-back animation when user releases early
  const animateSnapBack = useCallback((timestamp: number) => {
    if (modeRef.current !== 'SNAP_BACK') return;
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
      startProgressRef.current = progressRef.current;
    }
    
    const elapsed = timestamp - startTimeRef.current;
    let t = elapsed / snapBackDuration;
    
    if (t >= 1) {
      t = 1;
      setProgress(maxAutoProgress);
      modeRef.current = 'AUTO';
      startTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animateAuto);
      return;
    }
    
    // easeOutQuad easing function for smooth snap back
    const easeT = t * (2 - t);
    const currentProgress = startProgressRef.current + (maxAutoProgress - startProgressRef.current) * easeT;
    
    setProgress(currentProgress);
    animationRef.current = requestAnimationFrame(animateSnapBack);
  }, [snapBackDuration, maxAutoProgress, setProgress, animateAuto]);

  // Initialize auto-animation on mount
  useEffect(() => {
    modeRef.current = 'AUTO';
    startTimeRef.current = 0;
    animationRef.current = requestAnimationFrame(animateAuto);
    return () => cancelAnimationFrame(animationRef.current);
  }, [animateAuto]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (modeRef.current === 'COMPLETED') return;
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = (size - strokeWidth) / 2;

    // Hit area: within 40px of the track radius
    if (Math.abs(distance - radius) > 40) return;

    let angle = Math.atan2(dy, dx);
    let normalizedAngle = angle - Math.PI / 6; // Offset by 4 o'clock start
    if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

    const clickedProgress = normalizedAngle / (2 * Math.PI);

    // Allow clicking anywhere between 0 and maxAutoProgress (e.g., 75%)
    // Also allow clicking near 0 (which might wrap to 0.95+)
    if (clickedProgress > maxAutoProgress + 0.05 && clickedProgress < 0.95) {
      return;
    }

    (e.target as Element).setPointerCapture(e.pointerId);
    modeRef.current = 'DRAGGING';
    cancelAnimationFrame(animationRef.current);

    const startProgress = clickedProgress > 0.95 ? 0 : clickedProgress;
    setProgress(startProgress);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (modeRef.current !== 'DRAGGING') return;
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    let angle = Math.atan2(dy, dx);
    let normalizedAngle = angle - Math.PI / 6; // Offset by 4 o'clock start
    if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

    let newProgress = normalizedAngle / (2 * Math.PI);
    let delta = newProgress - progressRef.current;

    // Handle wrapping around the 0/1 boundary to determine shortest path
    if (delta > 0.5) delta -= 1;
    if (delta < -0.5) delta += 1;

    let nextProgress = progressRef.current + delta;
    // Clamp progress between 0 and 1. Backward dragging below 0 is stopped.
    nextProgress = Math.max(0, Math.min(nextProgress, 1));

    setProgress(nextProgress);

    // Completion check (approx 3.6 degrees tolerance)
    if (nextProgress >= 0.99) {
      modeRef.current = 'COMPLETED';
      setProgress(1);
      if (onComplete) onComplete();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (modeRef.current === 'DRAGGING') {
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch (err) {
        // Ignore errors if capture was already released
      }
      modeRef.current = 'SNAP_BACK';
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
      width="100%"
      height="100%"
      viewBox={`0 0 ${size} ${size}`}
      style={{
        touchAction: 'none',
        overflow: 'visible',
        maxWidth: size,
        maxHeight: size,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      {/* Progress Arc */}
      <path
        ref={pathRef}
        fill="none"
        stroke={progressColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={{ cursor: 'pointer' }}
      />
      {/* Handle Glow */}
      <circle
        ref={glowRef}
        r={strokeWidth * 2.5}
        fill={handleColor}
        style={{ pointerEvents: 'none' }}
      />
      {/* Draggable Handle */}
      <circle
        ref={handleRef}
        r={strokeWidth * 1.5}
        fill={handleColor}
        style={{ cursor: 'grab', touchAction: 'none' }}
      />
    </svg>
  );
};
