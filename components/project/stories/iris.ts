import { aiExperience } from "../../../data/profile";
import type { Story } from "../types";

/** The IRIS lines of the profile's AI experience, without the project tag. */
const irisModels = aiExperience.filter((line) => line.endsWith("(IRIS)")).map((line) => line.replace(/\s*\(IRIS\)$/, ""));

// Sources: the IRIS repository (AGENTS.md; docs/project-journey.md; docs/reference/picking-sorting-pipeline.md;
// docs/runbooks/contact-perception.md, dino-identity-training.md) and the INSPIRE 2026 poster
// (output/pdf/IRIS_INSPIRE_2026_Poster_Light_Preview.png). Headline results are the poster's.
export const irisStory: Story = {
  slug: "iris",
  worldId: "iris",
  theme: "iris",
  name: "IRIS",
  role: "Perception and robot control",
  dates: "Jan 2026 – present",
  place: "NUS CDE3301, with the Singapore National Eye Centre",
  header: {
    word: "IRIS",
    title: "Intelligent Robotic Instrument Sorter",
    lede: "How can we identify and sort overlapping, similar-looking instruments while reducing manual effort and protecting delicate tips?",
    team: "Ng Jie Yang / Alexander Yaw",
    figure: {
      src: "/images/iris/wrist-camera-tray.png",
      alt: "Five steel surgical instruments on a green drape, seen from the wrist camera above the tray",
      caption: "The wrist camera's view of a tray: scissors, two scalpel handles, tissue forceps and artery forceps on a green drape. 1280 × 720 colour with aligned depth.",
      width: 1280,
      height: 720,
    },
  },
  facts: [
    { label: "Role", value: "Perception and robot control" },
    { label: "Dates", value: "Jan 2026 – present" },
    { label: "Team", value: "Ng Jie Yang, Alexander Yaw" },
    { label: "Partner", value: "Singapore National Eye Centre (SNEC)" },
    { label: "Module", value: "NUS CDE3301, INSPIRE 2026" },
    { label: "Arm", value: "UFACTORY UF850 with an Intel RealSense on the wrist" },
  ],
  sections: [
    {
      id: "problem",
      nav: "The problem",
      title: "The problem",
      blocks: [
        {
          kind: "p",
          text: "After a surgical case, staff separate and identify the instruments in a cluttered tray before they go back into their sets. The instruments lie on top of each other, so overlap hides the features that tell them apart, and the sorting is repeated after every case.",
        },
        {
          kind: "p",
          text: "Ophthalmic instruments make this hard for a camera too. They are thin, polished steel that reflects light differently on every pass. Several are near-copies: flat and dissecting tweezers are about the same size, and clamping forceps, wafer forceps and long scissors share one outline family. Their tips are delicate, so a robot cannot pull one out from under another.",
        },
        {
          kind: "p",
          text: "That gives the robot cell three questions to answer before it moves: which instrument is this, which one is on top, and where does it go. It also has to know when not to move at all.",
        },
        {
          kind: "callout",
          text: "Our objective: identify the instruments, pick upper tools first, place each in its assigned slot.",
        },
      ],
    },
    {
      id: "built",
      nav: "What I built",
      title: "What I built",
      blocks: [
        {
          kind: "p",
          text: "IRIS is a two-person project. I owned the perception side end to end, from the data to the trained models and their evaluation, and the path that turns a detection into a grasp the arm can make. Every dataset after July was collected by the robot itself, so labels come from the motion log; I hand-corrected masks, checked recorded stacking against the photos, and split everything by arrangement so near-duplicates never cross from training into evaluation.",
        },
        {
          kind: "figure",
          figure: {
            src: "/images/iris/console-tray-check.png",
            alt: "Operator console checking a tray: three of five instruments found, Start sorting disabled",
            caption: "The operator console checking a tray against the selected set. Start sorting stays disabled until the check finishes, and E-STOP is always in the corner.",
            width: 931,
            height: 487,
            frame: "screen",
          },
        },
        {
          kind: "figure",
          figure: {
            src: "/images/iris/dino-identity.png",
            alt: "Four panels: masked crops on a grey background, mask length/width/area for look-alikes, the frozen DINOv3 backbone with a small trained head, and the leave-one-day-out split",
            caption: "Identity retraining for look-alikes: grey backgrounds remove the day's cloth and lighting, mask shape separates some instruments, only a small head is trained, and each capture day is left out in turn.",
            width: 685,
            height: 569,
            frame: "photo",
          },
        },
        {
          kind: "figure",
          figure: {
            src: "/images/iris/grasp-point.png",
            alt: "Pick point drawn on a detected instrument",
            caption: "Where the arm will close, projected back onto the camera frame.",
            width: 1280,
            height: 720,
            optional: true,
            frame: "photo",
          },
        },
        {
          kind: "figure",
          figure: {
            src: "/images/iris/wrist-hardware.png",
            alt: "RealSense camera mounted on the arm's wrist above the gripper",
            caption: "The eye-in-hand camera mount on the wrist.",
            width: 1280,
            height: 720,
            optional: true,
            frame: "photo",
          },
        },
      ],
    },
    {
      id: "models",
      nav: "Models I trained",
      title: "Models I trained",
      blocks: [{ kind: "list", items: [...aiExperience.filter((line) => line.includes("every IRIS model")), ...irisModels] }],
    },
    {
      id: "how",
      nav: "How it works",
      title: "How it works",
      blocks: [
        { kind: "diagram", id: "iris-pipeline", caption: "The agreed pipeline, from the INSPIRE poster. Planning and the pick itself belong to the backend." },
        {
          kind: "p",
          text: "The wrist camera surveys the tray. A segmentation model finds each instrument and a tracker keeps its ID steady. Where a set needs it, an identity model separates look-alikes. Small contact heads decide which instrument lies on top of which, and the free ones are picked first. A mask becomes a grasp point and wrist angle in the arm's base frame, and the backend checks every move against a shared workspace before the operator approves it.",
        },
        { kind: "diagram", id: "iris-contact-graph", caption: "Contacts become a directed graph; an instrument with nothing on top of it is free to pick. A cycle or an unsure answer goes to the operator." },
        {
          kind: "concepts",
          items: ["Instance segmentation", "Multi-object tracking", "Self-supervised embeddings (DINOv3)", "Contact graphs", "Eye-in-hand calibration", "RGB-D deprojection", "Motion planning in a constrained workspace", "Grouped, leave-one-day-out evaluation"],
        },
      ],
    },
    {
      id: "decisions",
      nav: "Decisions",
      title: "Decisions and trade-offs",
      blocks: [
        {
          kind: "decisions",
          items: [
            {
              choice: "Pick height from a calibrated table plane",
              over: "Over the depth reading at the mask",
              why: "Thin polished steel returns holes in the depth image. One tissue forceps detected at 0.91 confidence had no valid depth at its centre in 42 of 42 frames, and measured surfaces put the pick 4 mm too low. Camera depth across the table varied by 14 mm; base-frame height varied by 3.1 mm.",
              cost: "The plane cannot see an instrument resting on another, and it has to be recalibrated whenever the table or camera moves.",
            },
            {
              choice: "Small contact heads decide pick order",
              over: "Over a fine-tuned vision-language model",
              why: "The VLM fine-tunes (SmolVLM2-500M with LoRA) kept lowering their training loss while their answers stayed constant, unparseable or independent of the image. Blank, shuffled and cross-recording image controls exposed it. The contact VLM reached directed contact F1 0.255 on validation and 0.053 on test; the heads are small, measurable, and fast enough on CPU.",
              cost: "Heads need contact labels, and they only see contacts within the 40 px candidate gate, which missed 25 of 226 test contacts.",
            },
            {
              choice: "Score order with metrics a blind guess cannot pass",
              over: "Over \"was the first pick on top\"",
              why: "A model that ignores the image scores 0.92 on topmost-valid, because most scenes have a free instrument somewhere. Directed contact F1 (0.25 for the blind baseline) and legal-order rates separate reading the scene from guessing.",
              cost: "The stricter numbers look worse on paper, and they need complete contact labels.",
            },
            {
              choice: "Depth stays out of the on-top decision",
              over: "Over adding depth as a model input",
              why: "Depth was expected to show which instrument is on top. Measured at this working distance, it does so at chance level, so it was not added.",
            },
            {
              choice: "Identity as a separate, advisory gate",
              over: "Over trusting the detector's class",
              why: "The detector cannot separate look-alikes inside one class, and identity accuracy collapses across capture days. Keeping it separate means a weak identity model can block sorting but never cause a wrong pick.",
              cost: "An extra review step for the operator when a set needs identities.",
            },
          ],
        },
      ],
    },
    {
      id: "results",
      nav: "Results",
      title: "Results",
      blocks: [
        {
          kind: "stats",
          items: [
            { value: "94%", interval: "[88–97] · 131 / 140", label: "Instruments detected from the initial survey" },
            { value: "78%", interval: "[66–87]", label: "Upper instrument identified in touching pairs" },
            { value: "87%", interval: "[80–92]", label: "Proposed picks that were safe", detail: "Nothing was resting on the instrument chosen." },
            { value: "83%", interval: "[66–93] · 25 / 30", label: "Trays fully sorted without intervention" },
          ],
          note: "Poster results on 28 trays with new layouts not in the training data, with 95% intervals. Pick order is advisory; robot motion stays under backend checks and operator supervision.",
        },
        { kind: "h3", text: "How each model was checked" },
        {
          kind: "list",
          items: [
            "Detector: mask mAP50-95 0.634 on 135 held-out images that include overlaps, split so related captures never cross between training and test.",
            "Contact heads: on a sealed 130-scene test split, opened once, the upper instrument was named in 91% of touching pairs and the clearing order was legal in 79% of scenes, against 46% for a blind answer.",
            "Identity head: with whole capture days held out it separates the artery-forceps look-alikes (799 of 900, chance 300) but not the flat tweezers, so it stays advisory and off by default.",
            "Vision-language models: training loss fell while answers ignored the image; blank and shuffled-image controls showed it, and they were not used for pick order.",
          ],
        },
        {
          kind: "p",
          text: "The limits are as important as the numbers. There is one physical instance of each instrument class, one table, one camera and one lighting setup, so no test yet covers a different room or day in the way a hospital would. Detection runs on CPU at about 340 ms a frame, and the camera stalls when the four-core runtime host is saturated.",
        },
      ],
    },
    {
      id: "stack",
      nav: "Stack",
      title: "Stack",
      blocks: [
        {
          kind: "stack",
          groups: [
            { label: "Perception", items: ["YOLO26n-seg (YOLOv8 evaluated first)", "DINOv3 / DINOv2", "PyTorch", "ONNX Runtime", "SAM for offline labelling", "CVAT"] },
            { label: "Robot", items: ["ROS 2 Jazzy", "C++", "MoveIt", "ros2_control", "UFACTORY UF850", "Intel RealSense"] },
            { label: "Operator", items: ["React and Vite", "WebSocket bridge", "MediaMTX WebRTC video"] },
            { label: "Runtime and data", items: ["Docker", "Hugging Face (pinned, hash-checked models)", "GitHub Actions dry-run CI"] },
          ],
        },
      ],
    },
    {
      id: "learned",
      nav: "What I learned",
      title: "What I learned",
      blocks: [
        {
          kind: "list",
          items: [
            "Robot-collected data gives labels people cannot easily produce, because the arm placed every instrument. The robot's own records can still be wrong as labels: 44% of the planner's recorded overlaps were not contact.",
            "Test on data the model was not built from. The first detector scored 0.97 box mAP50-95 on its own collection and fired on only 51% of images from another one.",
            "Preprocessing is part of the model. Changing the DINO crop moved retrieval from 71.9% to 39.6%, and default mask downsampling cut thin-instrument mask IoU to 0.47. Both looked like model problems.",
            "A falling loss is not learning the task. Generated answers and image-replacement controls are what showed it.",
            "Where the geometry is known, simple geometry beats a learned model: a table plane for height and a mask ellipse for yaw were more reliable than anything sensed or trained.",
            "Keep identity separate from pick authority. Models advise; geometry, transforms, workspace limits and the operator decide.",
          ],
        },
      ],
    },
  ],
};
