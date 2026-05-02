"use client";

import { useState, useCallback, useRef } from "react";

interface Leaf {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  color: string;
  rotation: number;
  swayAmount: number;
}

const LEAF_COLORS = [
  "#C0392B",
  "#D35400",
  "#E67E22",
  "#CB4335",
  "#A93226",
  "#DC7633",
  "#BA4A00",
  "#E74C3C",
];

export default function FallingLeaves() {
  const leafIdCounter = useRef(18);
  const [leaves, setLeaves] = useState<Leaf[]>(() => {
    const generated: Leaf[] = [];
    for (let i = 0; i < 18; i++) {
      const id = i + 1;
      generated.push({
        id,
        left: Math.random() * 100,
        size: 22 + Math.random() * 18,
        duration: 14 + Math.random() * 12,
        delay: Math.random() * 16,
        opacity: 0.18 + Math.random() * 0.14,
        color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
        rotation: Math.random() * 360,
        swayAmount: 15 + Math.random() * 25,
      });
    }
    return generated;
  });
  const [poppedLeaves, setPoppedLeaves] = useState<Set<number>>(new Set());

  const generateLeaf = useCallback((): Leaf => {
    leafIdCounter.current += 1;
    return {
      id: leafIdCounter.current,
      left: Math.random() * 100,
      size: 22 + Math.random() * 18,
      duration: 14 + Math.random() * 12,
      delay: 0,
      opacity: 0.18 + Math.random() * 0.14,
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      rotation: Math.random() * 360,
      swayAmount: 15 + Math.random() * 25,
    };
  }, []);

  const handleLeafClick = useCallback((leafId: number) => {
    setPoppedLeaves((prev) => {
      const next = new Set(prev);
      next.add(leafId);
      return next;
    });

    // Remove popped leaf and add a new one after a delay
    setTimeout(() => {
      setLeaves((prev) => {
        const filtered = prev.filter((l) => l.id !== leafId);
        const newLeaf = generateLeaf();
        return [...filtered, newLeaf];
      });
      setPoppedLeaves((prev) => {
        const next = new Set(prev);
        next.delete(leafId);
        return next;
      });
    }, 600);
  }, [generateLeaf]);

  return (
    <div
      className="falling-leaves-container"
      aria-hidden="true"
    >
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className={`leaf ${poppedLeaves.has(leaf.id) ? "leaf-popped" : ""}`}
          style={{
            left: `${leaf.left}%`,
            animationDuration: `${leaf.duration}s`,
            animationDelay: `${leaf.delay}s`,
            opacity: leaf.opacity,
            ["--sway-amount" as string]: `${leaf.swayAmount}px`,
          }}
          onClick={() => handleLeafClick(leaf.id)}
        >
          <svg
            width={leaf.size}
            height={leaf.size * 1.6}
            viewBox="0 0 30 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: `rotate(${leaf.rotation}deg)` }}
          >
            {/* Elongated oval leaf shape with center vein */}
            <ellipse
              cx="15"
              cy="24"
              rx="10"
              ry="22"
              fill={leaf.color}
              opacity="0.9"
            />
            {/* Center vein */}
            <line
              x1="15"
              y1="2"
              x2="15"
              y2="46"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.8"
            />
            {/* Side veins */}
            <line x1="15" y1="12" x2="9" y2="8" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            <line x1="15" y1="12" x2="21" y2="8" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            <line x1="15" y1="20" x2="7" y2="17" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            <line x1="15" y1="20" x2="23" y2="17" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            <line x1="15" y1="28" x2="7" y2="31" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            <line x1="15" y1="28" x2="23" y2="31" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            <line x1="15" y1="36" x2="9" y2="40" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            <line x1="15" y1="36" x2="21" y2="40" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          </svg>
        </div>
      ))}
    </div>
  );
}
