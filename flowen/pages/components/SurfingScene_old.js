"use client"; // Lägg till denna rad för att markera filen som en klientkomponent
import { motion, useAnimationFrame } from "framer-motion";
import { useState } from "react";

// Enkel SVG för surfare
const SurferSVG: React.FC<{ color?: string }> = ({ color = "#222" }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 2px 8px #0008)" }}>
    <ellipse cx="30" cy="50" rx="16" ry="6" fill={color} />
    <circle cx="30" cy="32" r="10" fill={color} />
  </svg>
);

// Vågbakgrund – ren SVG med ljusblå yta
const WaveBG = ({ t }: { t: number }) => {
  // Räkna ut positionskoordinater för vågen baserat på tiden
  const wavePath = `M0 ${100 + Math.sin(t) * 20} Q200 ${150 + Math.sin(t + 1) * 20} 400 ${100 + Math.sin(t) * 20} T800 ${100 + Math.sin(t) * 20} V200 H0 Z`;
  return (
    <svg width="100%" height="200" viewBox="0 0 800 200" style={{ position: "absolute", bottom: 0, left: 0 }}>
      {/* Ljusblå yta för vågen */}
      <path d={wavePath} fill="#a0e7ff" opacity="0.6" />
      {/* Tydligare blå för en annan del av vågen */}
      <path d={wavePath} fill="#4fc3f7" opacity="0.6" />
    </svg>
  );
};

export default function SurfingScene() {
  const [t, setT] = useState(0);

  // Använd useAnimationFrame för att uppdatera animationen
  useAnimationFrame((time) => {
    setT(time / 800); // justera hastigheten här
  });

  // Räkna ut x/y längs vågen (för att surfarna ska följa vågen)
  const getSurferPos = (baseOffset: number, amplitude: number = 40, phase: number = 0) => {
    const x = baseOffset + Math.sin(t + phase) * 200; // x-position
    const y = 100 + Math.sin(t + phase) * amplitude; // y-position följer vågform
    return { x, y };
  };

  const surfer1 = getSurferPos(260, 30, 0);
  const surfer2 = getSurferPos(500, 40, Math.PI);

  return (
    <div style={{ width: "100%", height: 240, position: "relative", background: "#e0f7fa", overflow: "hidden" }}>
      {/* Vågbakgrund */}
      <WaveBG t={t} />
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
