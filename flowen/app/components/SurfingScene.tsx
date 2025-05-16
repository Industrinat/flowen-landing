"use client";
import { motion, useAnimationFrame } from "framer-motion";
import { useState, useEffect, useRef } from "react";

// Enkel SVG för surfare
const SurferSVG = ({ color }: { color: string }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 2px 8px #0008)" }}>
    <ellipse cx="30" cy="50" rx="16" ry="6" fill={color} />
    <circle cx="30" cy="32" r="10" fill={color} />
  </svg>
);

// Vågbakgrund – ren SVG
const WaveBG = () => (
  <svg width="100%" height="200" viewBox="0 0 800 200" style={{ position: "absolute", bottom: 0, left: 0 }}>
    <path
      d="M0 100 Q200 150 400 100 T800 100 V200 H0 Z"
      fill="#a0e7ff"
      opacity="0.6"
    />
    <path
      d="M0 120 Q200 170 400 120 T800 120 V200 H0 Z"
      fill="#4fc3f7"
      opacity="0.6"
    />
  </svg>
);

export default function SurfingScene() {
  const [t, setT] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(200);

  // För att uppdatera bredden och höjden vid fönsterstorleksändring
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
        setHeight(containerRef.current.offsetHeight);
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Uppdatera tiden för animationen
  useAnimationFrame((time: number) => {
    setT(time / 800); // justera hastighet här
  });

  // Räkna ut x/y position för surfarna
  const getSurferPos = (baseOffset: number, amplitude = 40, phase = 0) => {
    const x = baseOffset + Math.sin(t + phase) * 200; // x-position
    const y = 120 + Math.sin((t + phase) * 2) * amplitude; // y följer vågform
    return { x, y };
  };

  const surfer1 = getSurferPos(260, 30, 0);
  const surfer2 = getSurferPos(500, 40, Math.PI);

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
      <WaveBG />
      <motion.div
        style={{
          position: "absolute",
          left: surfer1.x,
          top: surfer1.y,
        }}
      >
        <SurferSVG color="#26a69a" />
      </motion.div>
      <motion.div
        style={{
          position: "absolute",
          left: surfer2.x,
          top: surfer2.y,
        }}
      >
        <SurferSVG color="#fbc02d" />
      </motion.div>
    </div>
  );
}
