import { Flow } from "./Flow";

export function GuitarPipeline() {
  return (
    <div>
      <Flow
        label="Watch"
        steps={[
          { title: "Webcam", body: "Live video of the guitar." },
          { title: "YOLOv8", body: "Finds the fretboard, run in the browser with InferenceJS." },
          { title: "Calibration", body: "Maps the detection to frets and strings." },
          { title: "Scale overlay", body: "Notes of the chosen scale drawn on the neck.", tone: "acc" },
        ]}
      />
      <Flow
        label="Listen"
        steps={[
          { title: "Microphone", body: "What was actually played." },
          { title: "Pitch detection", body: "Web Audio API estimates the note." },
          { title: "Timing check", body: "Compared with the note and beat the exercise expects." },
          { title: "Score", body: "Play-along feedback.", tone: "acc" },
        ]}
      />
    </div>
  );
}
