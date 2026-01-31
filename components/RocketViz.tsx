"use client";

import React, { useMemo, useRef, useState } from "react";
import { Part } from "../lib/types";
import { calcCG } from "../lib/calc";

type Props = {
  parts: Part[];
  lengthCm?: number;
  onMovePart?: (partId: string, newXcm: number) => void;
  cpCm?: number; // CP 표시(옵션)
};

export function RocketViz({ parts, lengthCm = 100, onMovePart, cpCm }: Props) {
  const { cg_cm } = calcCG(parts);

  const W = 900;
  const H = 170;
  const pad = 50;

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const xToPx = (x: number) => {
    const clamped = Math.max(0, Math.min(lengthCm, x));
    return pad + (clamped / lengthCm) * (W - 2 * pad);
  };

  const pxToX = (px: number) => {
    const t = (px - pad) / (W - 2 * pad);
    const x = t * lengthCm;
    return Math.max(0, Math.min(lengthCm, x));
  };

  const partsSorted = useMemo(() => {
    return [...parts].sort((a, b) => a.x_cm - b.x_cm);
  }, [parts]);

  function getSvgLocalX(clientX: number) {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return clientX - rect.left;
  }

  function startDrag(partId: string) {
    setDragId(partId);
  }
  function endDrag() {
    setDragId(null);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragId) return;
    const localX = getSvgLocalX(e.clientX);
    if (localX === null) return;

    const newX = pxToX(localX);
    const rounded = Math.round(newX * 10) / 10; // 0.1cm
    onMovePart?.(dragId, rounded);
  }

  return (
    <svg
      ref={svgRef}
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        background: "white",
        userSelect: "none",
        touchAction: "none",
      }}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      {/* axis */}
      <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="black" strokeWidth={4} />
      <text x={pad} y={H / 2 + 32} fontSize={12} opacity={0.7}>
        Nose (0 cm)
      </text>
      <text x={W - pad - 90} y={H / 2 + 32} fontSize={12} opacity={0.7}>
        Tail ({lengthCm} cm)
      </text>

      {/* ticks */}
      {Array.from({ length: 6 }).map((_, i) => {
        const x = (lengthCm * i) / 5;
        const px = xToPx(x);
        return (
          <g key={i}>
            <line x1={px} y1={H / 2 - 12} x2={px} y2={H / 2 + 12} stroke="black" opacity={0.2} />
            <text x={px - 10} y={H / 2 + 50} fontSize={11} opacity={0.55}>
              {Math.round(x)}
            </text>
          </g>
        );
      })}

      {/* parts */}
      {partsSorted.map((p, idx) => {
        const px = xToPx(p.x_cm);
        const r = Math.max(7, Math.min(14, Math.sqrt(Math.max(1, p.mass_g))));
        const y = H / 2 + (idx % 2 === 0 ? -18 : 18);
        const isDragging = dragId === p.id;

        return (
          <g key={p.id}>
            <circle
              cx={px}
              cy={y}
              r={r}
              fill={isDragging ? "#ffe9e9" : "white"}
              stroke="black"
              style={{ cursor: onMovePart ? "grab" : "default" }}
              onPointerDown={(e) => {
                if (!onMovePart) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                startDrag(p.id);
              }}
              onPointerUp={endDrag}
            />
            <line x1={px} y1={y + r} x2={px} y2={H / 2} stroke="black" opacity={0.25} />
            <text x={px + 10} y={y - 10} fontSize={12}>
              {p.name}
            </text>
            <text x={px + 10} y={y + 12} fontSize={11} opacity={0.7}>
              {p.mass_g}g @ {p.x_cm}cm
            </text>
          </g>
        );
      })}

      {/* CG */}
      <line
        x1={xToPx(cg_cm)}
        y1={16}
        x2={xToPx(cg_cm)}
        y2={H - 16}
        stroke="red"
        strokeWidth={2}
        strokeDasharray="6 4"
      />
      <text x={xToPx(cg_cm) + 8} y={28} fontSize={12} fill="red">
        <tspan fontWeight={700}>CG</tspan> {cg_cm} cm
      </text>

      {/* CP */}
      {typeof cpCm === "number" && (
        <>
          <line
            x1={xToPx(cpCm)}
            y1={16}
            x2={xToPx(cpCm)}
            y2={H - 16}
            stroke="blue"
            strokeWidth={2}
            strokeDasharray="6 4"
          />
          <text x={xToPx(cpCm) + 8} y={46} fontSize={12} fill="blue">
            <tspan fontWeight={700}>CP</tspan> {cpCm} cm
          </text>
        </>
      )}

      <text x={pad} y={18} fontSize={12} opacity={0.6}>
        부품 동그라미를 드래그해서 위치(x)를 조정할 수 있어.
      </text>
    </svg>
  );
}
