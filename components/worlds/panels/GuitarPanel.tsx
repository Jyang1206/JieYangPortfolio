"use client";

import { useEffect, useRef, useState } from "react";
import type { ControlsProps } from ".";

const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
/** Scale bitmasks: bit n is n semitones above the root (see shaders/guitar.ts). */
const SCALES = [
  { label: "Major", mask: 2741 },
  { label: "Minor", mask: 1453 },
  { label: "Major pent.", mask: 661 },
  { label: "Minor pent.", mask: 1193 },
  { label: "Blues", mask: 1257 },
  { label: "Dorian", mask: 1709 },
];

/** Pick a key and a scale for the fretboard; Auto lets it play through keys on its own. */
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
      <div className="row keys">
        {KEYS.map((key, i) => (
          <button
            key={key}
            type="button"
            aria-pressed={scale !== null && root === i}
            onClick={() => {
              setRoot(i);
              setScale((s) => s ?? 1);
            }}
          >
            {key}
          </button>
        ))}
      </div>
      <div className="row scales">
        <button type="button" aria-pressed={scale === null} onClick={() => setScale(null)}>
          Auto
        </button>
        {SCALES.map((s, i) => (
          <button key={s.label} type="button" aria-pressed={scale === i} onClick={() => setScale(i)}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
