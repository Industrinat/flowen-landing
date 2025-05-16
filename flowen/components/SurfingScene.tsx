"use client";
import { motion, useAnimationFrame } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";

// Detaljerad surfare med hår, armar, ögon, etc
const SurferSVG = ({
  color = "#1976d2",
  skin = "#f8d7b6",
  shorts = "#388e3c",
  hair = "#444",
  longHair = false,
  direction = 1,
  angle = 0,
  size = 70,
}: {
  color?: string;
  skin?: string;
  shorts?: string;
  hair?: string;
  longHair?: boolean;
  direction?: 1 | -1;
  angle?: number;
  size?: number;
}) => (
  <svg
    width={size}
    height={(size * 70) / 80}
    viewBox="0 0 80 70"
    style={{
      filter: "drop-shadow(0 2px 8px #0008)",
      transform: `rotate(${angle}deg) scaleX(${direction})`,
      pointerEvents: "none",
      display: "block",
    }}
  >
    {/* Surfbräda */}
    <ellipse
      cx="40"
      cy="66"
      rx="22"
      ry="6"
      fill="#ffb347"
      stroke="#e6a531"
      strokeWidth="2"
    />
    {/* Ben */}
    <rect x="45" y="48" width="6" height="16" rx="2.5" fill={shorts} />
    <rect x="29" y="48" width="6" height="16" rx="2.5" fill={shorts} />
    {/* Fötter */}
    <ellipse cx="48" cy="62" rx="3" ry="2" fill={skin} />
    <ellipse cx="32" cy="62" rx="3" ry="2" fill={skin} />
    {/* Kropp */}
    {longHair ? (
      <>
        <rect x="35" y="24" width="10" height="26" rx="7" fill={color} />
        <rect x="35" y="31" width="10" height="7" rx="5" fill="#e040fb" />
      </>
    ) : (
      <rect x="33" y="24" width="14" height="26" rx="6" fill={color} />
    )}
    {/* Huvud */}
    <circle
      cx="40"
      cy="16"
      r="9"
      fill={skin}
      stroke="#d0a86b"
      strokeWidth="1.3"
    />
    {/* Hår */}
    {longHair ? (
      <>
        <ellipse cx="40" cy="26" rx="11" ry="8" fill={hair} opacity="0.7" />
        <ellipse cx="44" cy="12" rx="7" ry="4" fill={hair} />
        <ellipse cx="36" cy="12" rx="4" ry="2" fill={hair} />
      </>
    ) : (
      <>
        <ellipse cx="42" cy="12" rx="7" ry="4" fill={hair} />
        <ellipse cx="36" cy="12" rx="4" ry="2" fill={hair} />
      </>
    )}
    {/* Armar */}
    <rect
      x="13"
      y="28"
      width="21"
      height="5"
      rx="2.5"
      fill={skin}
      transform="rotate(-20 24 30)"
    />
    <rect
      x="46"
      y="28"
      width="21"
      height="5"
      rx="2.5"
      fill={skin}
      transform="rotate(18 57 30)"
    />
    {/* Händer */}
    <ellipse cx="13" cy="30" rx="2" ry="2.2" fill={skin} />
    <ellipse cx="67" cy="34" rx="2" ry="2.2" fill={skin} />
    {/* Shorts/kjol */}
    {longHair ? (
      <ellipse cx="40" cy="54" rx="8" ry="6" fill="#e040fb" />
    ) : (
      <rect x="33" y="44" width="14" height="9" rx="6" fill={shorts} />
    )}
    {/* Ögon */}
    <ellipse cx="37.5" cy="18" rx="1.1" ry="1.5" fill="#222" />
    <ellipse cx="42.5" cy="18" rx="1.1" ry="1.5" fill="#222" />
    {/* Leende */}
    <path d="M37 21 Q40 24 43 21" stroke="#b56d1b" strokeWidth="1.2" fill="none" />
  </svg>
);

function waveY(
  x: number,
  t: number,
  width: number,
  amplitude = 24,
  frequency = 0.015,
  speed = 1,
  height = 200
) {
  return (
    height -
    amplitude -
    10 +
    Math.sin(frequency * x * (800 / width) + t * speed) * amplitude
  );
}

function waveAngle(
  x: number,
  t: number,
  width: number,
  amplitude = 24,
  frequency = 0.015,
  speed = 1,
  height = 200
) {
  const dx = 1;
  const dy =
    waveY(x + dx, t, width, amplitude, frequency, speed, height) -
    waveY(x, t, width, amplitude, frequency, speed, height);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

export default function SurfingScene() {
  const [t, setT] = useState(0);
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(200);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
        setHeight(containerRef.current.offsetHeight);
      }
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useAnimationFrame((time: number) => {
    setT(time / 1200);
  });

  const surferSize = 70;
  const minX = surferSize / 2;
  const maxX = width - surferSize / 2;

  const speedBoy = 0.07 * width;
  const speedGirl = 0.06 * width;
  const phaseOffset = 0.3;

  const x1 = minX + ((t * speedBoy) % (maxX - minX));
  const x2 = maxX - (((t + phaseOffset) * speedGirl) % (maxX - minX));

  const y1 = waveY(x1, t, width, 24, 0.015, 1, height) - surferSize + 14;
  const angle1 = waveAngle(x1, t, width, 24, 0.015, 1, height);
  const y2 = waveY(x2, t, width, 24, 0.015, 1, height) - surferSize + 14;
  const angle2 = waveAngle(x2, t, width, 24, 0.015, 1, height);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        maxWidth: 700,
        height: 250,
        position: "relative",
        margin: "0 auto",
        background: "#a0e7ff",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          zIndex: 0,
          pointerEvents: "none",
          display: "block",
        }}
        preserveAspectRatio="none"
      >
        <path
          d={`M0,${height} ${(() => {
            const points = [];
            for (let x = 0; x <= width; x += Math.max(6, width / 120)) {
              const y = waveY(x, t, width, 24, 0.015, 1, height);
              points.push(`${x},${y}`);
            }
            return "L" + points.join(" L");
          })()} L${width},${height} Z`}
          fill="#4fc3f7"
          opacity="0.9"
        />
      </svg>

      <motion.div
        style={{
          position: "absolute",
          left: x1 - surferSize / 2,
          top: y1,
          zIndex: 10,
        }}
      >
        <SurferSVG
          color="#1976d2"
          skin="#f8d7b6"
          shorts="#388e3c"
          hair="#444"
          angle={angle1}
          direction={1}
          size={surferSize}
        />
      </motion.div>

      <motion.div
        style={{
          position: "absolute",
          left: x2 - surferSize / 2,
          top: y2,
          zIndex: 10,
        }}
      >
        <SurferSVG
          color="#e040fb"
          skin="#f2c99c"
          shorts="#e040fb"
          hair="#eea236"
          longHair={true}
          angle={angle2}
          direction={-1}
          size={surferSize}
        />
      </motion.div>
    </div>
  );
}
