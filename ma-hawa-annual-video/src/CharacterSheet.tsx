// Studio helper: every character in every expression. Use it to check a face swap.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character } from "./characters/Character";
import { CharId, Expression } from "./characters/config";
import { POSES } from "./characters/rig";
import { idleMotion } from "./sync/beats";
import { FONT, INK, PAPER } from "./theme";

const IDS: CharId[] = ["amr", "ali", "hussein", "michael", "saeed"];
const EXPR: Expression[] = ["neutral", "happy", "shocked", "tired"];
const POSE_FOR: Record<CharId, keyof typeof POSES> = {
  amr: "clipboard",
  ali: "flex",
  hussein: "stand",
  michael: "batReady",
  saeed: "sip",
};

export const CharacterSheet: React.FC<{ expressionRow?: boolean }> = ({ expressionRow = true }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: FONT }}>
      {IDS.map((id, i) => {
        const m = idleMotion(frame, i * 0.37);
        return (
          <React.Fragment key={id}>
            <Character
              id={id}
              x={210 + i * 375}
              y={expressionRow ? 600 : 900}
              scale={0.95}
              pose={POSES[POSE_FOR[id]]}
              expression="happy"
              squashX={m.scaleX}
              squashY={m.scaleY}
              headTilt={m.headTilt}
              goggles={id === "hussein" ? "eyes" : undefined}
              frame={frame}
            />
            <div style={{ position: "absolute", left: 210 + i * 375 - 150, width: 300, top: expressionRow ? 615 : 950, textAlign: "center", fontWeight: 800, fontSize: 30, color: INK }}>
              {id}
            </div>
            {expressionRow &&
              EXPR.map((e, k) => (
                <Character
                  key={e}
                  id={id}
                  x={210 + i * 375 - 120 + k * 80}
                  y={1060}
                  scale={0.33}
                  pose={POSES.stand}
                  expression={e}
                  frame={frame}
                />
              ))}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
