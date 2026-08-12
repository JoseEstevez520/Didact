import type { Meta, StoryObj } from "@storybook/react-vite";
import { DrawingResponse, type DrawingResponseDefinition } from "./drawing-response.js";

const meta: Meta<typeof DrawingResponse> = {
  title: "04 Applied experiences/Visual construction/Drawing Response",
  component: DrawingResponse,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[min(760px,calc(100vw-2rem))]"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

const geometry: DrawingResponseDefinition = {
  id: "geometry.vector",
  title: "Represent the vector",
  description: "Mathematics · Coordinate geometry",
  instructions: "Use the line tool to represent the vector from (20, 80) to (75, 25). You can also add exact markers through the coordinate controls.",
  tools: ["line", "marker"],
};

const procedureBackground = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600"><rect width="1000" height="600" fill="#f5f5f4"/><rect x="160" y="110" width="680" height="380" rx="28" fill="#fff" stroke="#a8a29e" stroke-width="8"/><rect x="230" y="180" width="210" height="180" rx="14" fill="#e7e5e4"/><circle cx="685" cy="265" r="74" fill="#d6d3d1" stroke="#78716c" stroke-width="8"/><rect x="620" y="390" width="130" height="38" rx="19" fill="#a8a29e"/></svg>`)}`;
const procedure: DrawingResponseDefinition = {
  id: "safety.machine",
  title: "Mark the isolation point",
  description: "Operations · Safety procedure",
  instructions: "Place a marker on the control that must be isolated before maintenance, then annotate the safe access route.",
  background: { src: procedureBackground, alt: "Front view of an industrial machine with a panel, circular control and lower handle" },
  tools: ["marker", "freehand"],
};

export const GeometryVector: Story = { args: { definition: geometry, evaluate: async (strokes) => strokes.some(({ tool }) => tool === "line") ? { status: "correct", feedback: "The response contains a directed line representation." } : { status: "partial", feedback: "Add the vector with the line tool." } } };
export const ProcedureAnnotation: Story = { args: { definition: procedure } };
export const Streaming: Story = { args: { streaming: true } };
export const Disabled: Story = { args: { definition: geometry, disabled: true } };
