import type { ComponentType } from "react";
import type { DiagramId } from "../types";
import { BattlecodeBook } from "./battlecode";
import { GuitarPipeline } from "./guitar";
import { IrisContactGraph, IrisPipeline } from "./iris";
import { MovelIntegrations } from "./movel";
import { TariiFlow, TariiNameMatch } from "./tarii";

export const DIAGRAMS: Record<DiagramId, ComponentType> = {
  "iris-pipeline": IrisPipeline,
  "iris-contact-graph": IrisContactGraph,
  "tarii-flow": TariiFlow,
  "tarii-name-match": TariiNameMatch,
  "movel-integrations": MovelIntegrations,
  "guitar-pipeline": GuitarPipeline,
  "battlecode-book": BattlecodeBook,
};
