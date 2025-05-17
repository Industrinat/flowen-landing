"use client";  // Lägg till denna rad för att markera filen som en klientkomponent

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";  // Importera motion för animation

// Funktion som beräknar y-position för vågen (rör sig horisontellt)
function waveY(
  x: number,
  t: number,
  amplitude = 50, // Amplitud som gör vågen större
  frequency = 0.015,
  speed = 1,
  baseHeight = 150 // Vågens basnivå justeras för att hålla den högre upp på skärmen
) {
  return (
    baseHeight -  // Vågens grundnivå
    amplitude +  // Vågens höjd
    Math.sin(frequency * x + t * speed) * amplitude  // Sinusfunktion för att få vågen att röra sig över tiden
  );
}

// Hook för att uppdatera animationen
function useAnimationFrame(callback: (time: number) => void) {
  useEffect(() => {
    let animationFrameId: number;

    const animate = (time: number) => {
      callback(time);  // Kalla på callback med aktuella tiden
      animationFrameId = requestAnimationFrame(animate);  // Anropa animate igen för att hålla animationen igång
    };

    animationFrameId = requestAnimationFrame(animate);  // Starta animationen

    return () => cancelAnimationFrame(animationFrameId);  // Städa upp när komponenten tas bort
  }, [callback]);
}

// Vågbakgrund – ljusblå nyans (definierad yta)
const WaveBG = ({ t, width, height }: { t: number, width: number, height: number }) => {
  const wavePath = `M0 ${waveY(0, t)} Q200 ${waveY(200, t)} 400 ${waveY(400, t)} T800 ${waveY(800, t)} V200 H0 Z`;
  return (
    <svg width="100%" height="200" viewBox="0 0 800 200" style={{ position: "absolute", bottom: 0, left: 0 }}>
      {/* Här definieras själva vågens ljusblåa yta */}
      <path
        d={wavePath}
        fill="#a1e0f4"  // Ljusblå färg för att skapa en tydlig yta på vågen
        opacity="0.8"
      />
    </svg>
  );
};

// Enkel SVG för surfarna
const SurferSVG = ({ color = "#e040fb", skin = "#f8d7b6", size = 70 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    style={{
      filter: "drop-shadow(0 2px 8px #0008)",
      display: "block",
      pointerEvents: "none",
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
    {/* Kropp */}
    <rect x="35" y="24" width="10" height="26" rx="7" fill={color} />
    {/* Huvud */}
    <circle
      cx="40"
      cy="16"
      r="9"
      fill={skin}
      stroke="#d0a86b"
      strokeWidth="1.3"
    />
  </svg>
);

export default function SurfingScene() {
  const [t, setT] = useState(0);
  const containerRef = useRef(null);
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(200);

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
  useAnimationFrame((time) => {
    setT(time / 1200);  // Dela för att justera hastigheten
  });

  const surferSize = 70;

  // Förenklad version av surfarens position
  const getSurferPos = (baseOffset) => {
    const x = baseOffset + Math.sin(t) * 200;  // X-positionen som rör sig fram och tillbaka
    const y = waveY(x, t);  // Y-positionen som beror på vågen
    return { x, y };
  };

  const surfer1 = getSurferPos(260);
  const surfer2 = getSurferPos(500);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        maxWidth: 700,
        height: 250,
        position: "relative",
        margin: "0 auto",
        background: "#a0e7ff", // Bakgrundsfärg
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      }}
    >
      <WaveBG t={t} width={width} height={height} />
      {/* Surfare 1 */}
      <motion.div
        style={{
          position: "absolute",
          left: surfer1.x,
          top: surfer1.y,
          zIndex: 10,
        }}
      >
        <SurferSVG color="#e040fb" skin="#f8d7b6" size={surferSize} />
      </motion.div>
      {/* Surfare 2 */}
      <motion.div
        style={{
          position: "absolute",
          left: surfer2.x,
          top: surfer2.y,
          zIndex: 10,
        }}
      >
        <SurferSVG color="#1976d2" skin="#f8d7b6" size={surferSize} />
      </motion.div>
    </div>
  );
}
