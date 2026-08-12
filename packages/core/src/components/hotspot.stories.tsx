import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Hotspot, type HotspotRegion } from "./hotspot.js";

const meta = { title: "03 Representation domains/Visual & spatial/Hotspot", component: Hotspot, parameters: { layout: "centered" } } satisfies Meta<typeof Hotspot>;
export default meta;
type Story = StoryObj<typeof meta>;

function CellDiagram() {
  return <svg viewBox="0 0 600 320" width="100%" aria-hidden="true" style={{ display: "block", background: "hsl(var(--muted))" }}><ellipse cx="300" cy="160" rx="245" ry="125" fill="none" stroke="currentColor" strokeWidth="5"/><circle cx="230" cy="150" r="58" fill="hsl(var(--primary) / .18)" stroke="currentColor" strokeWidth="4"/><path d="M370 90c70 30 70 110 0 140-45-25-45-115 0-140Z" fill="hsl(var(--secondary))" stroke="currentColor" strokeWidth="4"/><circle cx="125" cy="105" r="18" fill="currentColor" opacity=".35"/><circle cx="470" cy="210" r="22" fill="currentColor" opacity=".35"/></svg>;
}

const regions: HotspotRegion[] = [
  { id: "nucleus", label: "Nucleus", description: "Large circular organelle left of center", x: 0.285, y: 0.285, width: 0.2, height: 0.37 },
  { id: "mitochondrion", label: "Mitochondrion", description: "Curved organelle right of center", x: 0.55, y: 0.25, width: 0.18, height: 0.5 },
];

export const Regions: Story = { args: { title: "Identify the nucleus", instructions: "Select the matching region, then submit.", alt: "Simplified cell with a nucleus and mitochondrion", longDescription: "An oval cell. A round nucleus is left of center; a curved mitochondrion is right of center.", media: <CellDiagram />, regions, grading: { kind: "regions", correctRegionIds: ["nucleus"] }, feedback: (result) => result === "correct" ? "The nucleus contains most of the cell's genetic material." : "Use the shape and central position as cues." } };

export const MultipleRegions: Story = { args: { ...Regions.args, title: "Select both labelled organelles", selection: "multiple", grading: { kind: "regions", correctRegionIds: ["nucleus", "mitochondrion"] } } };

export const FreePoint: Story = { args: { title: "Place a point on the nucleus", instructions: "Click the diagram or enter percentages with the keyboard.", alt: "Simplified cell diagram", longDescription: "The nucleus is centered around 38% horizontally and 47% vertically.", media: <CellDiagram />, interaction: "points", grading: { kind: "points", targets: [{ x: 0.38, y: 0.47 }], tolerance: 0.12 } } };

export const Streaming: Story = { args: { title: "Loading activity", alt: "Diagram loading" } };
export const Disabled: Story = { args: { ...Regions.args, disabled: true, defaultValue: { regionIds: ["nucleus"], points: [] } } };
