"use client";

import { useEffect, useState } from "react";

import { clamp } from "@/lib/utils";

function barColor(score: number): string {
  if (score >= 75) return "linear-gradient(90deg, #14F195, #10B981)";
  if (score >= 50) return "linear-gradient(90deg, #F59E0B, #FACC15)";
  return "linear-gradient(90deg, #EF4444, #FB7185)";
}

export function ScoreBar({ score }: { score: number }) {
  const safeScore = clamp(score, 0, 100);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const duration = 800;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(safeScore * progress));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [safeScore]);

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <span className="text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)]">
          Composite Score
        </span>
        <span className="font-mono text-5xl font-semibold text-white">{display}</span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${display}%`, backgroundImage: barColor(safeScore) }}
        />
      </div>
    </div>
  );
}
