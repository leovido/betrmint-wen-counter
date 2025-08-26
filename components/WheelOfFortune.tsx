"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { WheelSegment } from "@/types/wen";

interface WheelOfFortuneProps {
  segments: WheelSegment[];
  isSpinning: boolean;
  onSpin: (winner: unknown) => void;
}

export default function WheelOfFortune({
  segments,
  onSpin,
}: WheelOfFortuneProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinningLocal, setIsSpinningLocal] = useState(false);
  const [wheelStatus, setWheelStatus] = useState("Ready to spin!");

  const spinWheel = () => {
    if (segments.length === 0) {
      alert("No messages to spin from. Start monitoring first.");
      return;
    }

    if (isSpinningLocal) return;

    setIsSpinningLocal(true);
    setWheelStatus("Spinning...");

    // Random rotation between 5 and 10 full rotations
    const minRotations = 5;
    const maxRotations = 10;
    const randomRotations =
      Math.random() * (maxRotations - minRotations) + minRotations;
    const finalRotation = rotation + randomRotations * 360;

    setRotation(finalRotation);

    // Calculate winner based on final position
    setTimeout(() => {
      const segmentAngle = 360 / segments.length;
      const normalizedRotation = finalRotation % 360;
      const winningSegmentIndex =
        Math.floor((360 - normalizedRotation) / segmentAngle) % segments.length;
      const winner = segments[winningSegmentIndex];

      setWheelStatus(`Winner: ${winner.text}!`);
      setIsSpinningLocal(false);
      onSpin(winner.message);
    }, 4000);
  };

  // Generate wheel segments
  const renderWheelSegments = () => {
    if (segments.length === 0) {
      return (
        <div className="absolute inset-0 flex items-center justify-center text-muted text-sm">
          No messages yet
        </div>
      );
    }

    const segmentAngle = 360 / segments.length;

    return segments.map((segment, index) => {
      const angle = index * segmentAngle;
      const isEven = index % 2 === 0;

      return (
        <div
          key={segment.id}
          className={`absolute w-full h-full`}
          style={{
            transform: `rotate(${angle}deg)`,
          }}
        >
          <div
            className={`absolute top-0 left-1/2 w-0 h-0 border-l-[150px] border-r-[150px] border-b-[150px] border-transparent ${
              isEven ? "border-b-cyan/20" : "border-b-pink/20"
            }`}
            style={{
              transformOrigin: "0 150px",
            }}
          />
          <div
            className={`absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-mono ${
              isEven ? "text-cyan" : "text-pink"
            }`}
            style={{
              transform: `rotate(${-angle}deg)`,
              width: "120px",
              textAlign: "center",
            }}
          >
            {segment.text.length > 15
              ? segment.text.substring(0, 15) + "..."
              : segment.text}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col items-center gap-5 p-5">
      <div className="relative">
        <motion.div
          className="wheel"
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: "easeOut" }}
        >
          {renderWheelSegments()}
          <div className="wheel-center">
            <div className="text-cyan text-xl font-bold">▲</div>
          </div>
        </motion.div>
        <div className="wheel-pointer-outer absolute -top-4 left-1/2 transform -translate-x-1/2 text-pink text-3xl font-bold z-10">
          ▼
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={spinWheel}
          disabled={isSpinningLocal || segments.length === 0}
          className="btn btn-spin"
        >
          🎲 SPIN THE WHEEL
        </button>
        <div className="wheel-status text-cyan text-sm font-semibold text-center min-h-5">
          {wheelStatus}
        </div>
      </div>
    </div>
  );
}
