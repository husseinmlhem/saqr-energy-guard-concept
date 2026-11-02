// Shared scene pieces.
import React from "react";
import { INK, STROKE } from "../theme";

/** soft floor band + horizon line (gives the characters something to stand on) */
export const Ground: React.FC<{ y: number; color?: string }> = ({ y, color = "#F2F5F9" }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
    <rect x={0} y={y - 4} width={1920} height={1080 - y + 4} fill={color} />
    <line x1={-20} x2={1940} y1={y - 4} y2={y - 4} stroke={INK} strokeWidth={STROKE * 0.8} strokeLinecap="round" />
  </svg>
);
