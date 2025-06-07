"use client"; // Lägg till denna rad för att markera filen som en klientkomponent
import { motion, useAnimationFrame } from "framer-motion"; // Importera motion från framer-motion
import { useState } from "react";

// Enkel cirkel SVG-komponent för testanimationen
const TestAnimation = () => {
  const [t, setT] = useState(0);

  // Uppdatera animationen kontinuerligt med useAnimationFrame
  useAnimationFrame((time) => {
    setT(time / 1000); // Justera hastigheten här
  });

  return (
    <div style={{ width: "100%", height: "200px", backgroundColor: "#e0f7fa", position: "relative" }}>
      {/* Enkel testanimerad cirkel */}
      <motion.div
        style={{
          position: "absolute",
          top: "50%",
          left: `${50 + Math.sin(t) * 50}%`, // Cirkeln rör sig horisontellt
          transform: "translateY(-50%)",
        }}
      >
        <svg width="50" height="50" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="#ff6347" />
        </svg>
      </motion.div>
    </div>
  );
};

export default function TestAnimationPage() {
  return (
    <div>
      <h1>Test Animation</h1>
      <TestAnimation />
    </div>
  );
}
