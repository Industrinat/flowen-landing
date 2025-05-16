import { motion, useAnimationFrame } from "framer-motion";
import { useState } from "react";

// Enkel SVG för surfare – byt ut mot egna SVG/Lottie vid behov
const SurferSVG = ({ color = "#222" }) => (
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

  useAnimationFrame((time) => {
    setT(time / 800); // justera hastighet här
  });

  // Räkna ut x/y längs vågen
  const getSurferPos = (baseOffset, amplitude = 40, phase = 0) => {
    const x = baseOffset + Math.sin(t + phase) * 200; // x-position
    const y = 120 + Math.sin((t + phase) * 2) * amplitude; // y följer vågform
    return { x, y };
  };

  const surfer1 = getSurferPos(260, 30, 0);
  const surfer2 = getSurferPos(500, 40, Math.PI);

  return (
    <div style={{ width: "100%", height: 240, position: "relative", background: "#e0f7fa", overflow: "hidden" }}>
      <WaveBG />
      {/* Surfare 1 */}
      <motion.div
        style={{
          position: "absolute",
          left: surfer1.x,
          top: surfer1.y,
        }}
      >
        <SurferSVG color="#26a69a" />
      </motion.div>
      {/* Surfare 2 */}
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
