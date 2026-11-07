"use client";

import { useEffect, useRef, useState } from "react";
import type { ControlsProps } from ".";

const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
/** Scale bitmasks: bit n is n semitones above the root (see shaders/guitar.ts). */
const SCALES = [
  { label: "Major", mask: 2741 },
  { label: "Minor", mask: 1453 },
  { label: "Major pentatonic", mask: 661 },
  { label: "Minor pentatonic", mask: 1193 },
  { label: "Blues", mask: 1257 },
  { label: "Dorian", mask: 1709 },
];

/** Two small dropdowns: key and scale. Scale "Auto" lets the board play through keys on its own. */
export function GuitarPanel({ setParams }: ControlsProps) {
  const [root, setRoot] = useState(9);
  const [scale, setScale] = useState<number | null>(null);
  const set = useRef(setParams);
  useEffect(() => {
    set.current = setParams;
  }, [setParams]);
  useEffect(() => {
    if (scale === null) set.current({ 0: 0, 1: 0, 2: 0 });
    else set.current({ 0: root, 1: SCALES[scale].mask, 2: 1 });
  }, [root, scale]);

  return (
    <div className="nb-guitar-panel" role="group" aria-label="Key and scale">
      <label>
        <span>Key</span>
        <select
          value={root}
          onChange={(event) => {
            setRoot(Number(event.target.value));
            setScale((s) => s ?? 1);
          }}
        >
          {KEYS.map((key, i) => (
            <option key={key} value={i}>
              {key}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Scale</span>
        <select value={scale ?? "auto"} onChange={(event) => setScale(event.target.value === "auto" ? null : Number(event.target.value))}>
          <option value="auto">Auto</option>
          {SCALES.map((s, i) => (
            <option key={s.label} value={i}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
