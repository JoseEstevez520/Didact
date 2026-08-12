import type { Meta, StoryObj } from "@storybook/react-vite";

import { LabelDiagram, type LabelDiagramItem, type LabelDiagramTarget } from "./label-diagram.js";

const meta: Meta<typeof LabelDiagram> = {
  title: "04 Applied experiences/Diagrams & annotation/Label Diagram",
  component: LabelDiagram,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[min(760px,calc(100vw-2rem))]"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

const anatomyTargets: LabelDiagramTarget[] = [
  { id: "atrium", label: "Upper chamber", description: "The chamber receiving blood from the lungs.", x: 0.24, y: 0.3, correctItemIds: ["left-atrium"] },
  { id: "ventricle", label: "Lower chamber", description: "The chamber pumping blood to the body.", x: 0.72, y: 0.72, correctItemIds: ["left-ventricle"] },
];
const anatomyItems: LabelDiagramItem[] = [
  { id: "left-atrium", content: "Left atrium", accessibleLabel: "Left atrium label" },
  { id: "left-ventricle", content: "Left ventricle", accessibleLabel: "Left ventricle label" },
];

function HeartDiagram() {
  return <svg viewBox="0 0 720 300" className="block h-72 w-full" aria-hidden="true">
    <rect width="720" height="300" fill="hsl(var(--muted))" opacity="0.25" />
    <path d="M360 245C275 195 220 151 220 94c0-73 92-82 140-25 48-57 140-48 140 25 0 57-55 101-140 151Z" fill="none" stroke="currentColor" strokeWidth="3" />
    <path d="M360 72v165M256 128h208" stroke="currentColor" strokeWidth="2" strokeDasharray="7 7" opacity=".45" />
    <path d="M305 50c-15-29-15-43 0-49M413 50c15-29 15-43 0-49" fill="none" stroke="currentColor" strokeWidth="12" opacity=".25" />
  </svg>;
}

export const Anatomy: Story = { args: {
  title: "Label the left side of the heart",
  description: "Place each anatomical label on the correct chamber.",
  alt: "Simplified cross-section of a heart with two numbered destinations",
  longDescription: "A simplified four-chamber heart. Destination one is in the upper-left area and destination two is in the lower-right area.",
  media: <HeartDiagram />, targets: anatomyTargets, items: anatomyItems,
} };

const machineTargets: LabelDiagramTarget[] = [
  { id: "disconnect", label: "Main energy isolator", description: "The primary electrical isolation point.", x: 0.22, y: 0.38, correctItemIds: ["isolate"] },
  { id: "pressure", label: "Pneumatic bleed valve", description: "The stored-pressure release point.", x: 0.78, y: 0.68, correctItemIds: ["bleed"] },
];
const machineItems: LabelDiagramItem[] = [
  { id: "isolate", content: "Apply personal lock", accessibleLabel: "Apply personal lock label" },
  { id: "bleed", content: "Release stored pressure", accessibleLabel: "Release stored pressure label" },
];

function MachineDiagram() {
  return <svg viewBox="0 0 720 300" className="block h-72 w-full" aria-hidden="true">
    <rect width="720" height="300" fill="hsl(var(--muted))" opacity="0.25" />
    <rect x="155" y="55" width="410" height="190" rx="12" fill="none" stroke="currentColor" strokeWidth="3" />
    <rect x="195" y="105" width="95" height="90" rx="5" fill="none" stroke="currentColor" strokeWidth="3" />
    <circle cx="455" cy="150" r="58" fill="none" stroke="currentColor" strokeWidth="3" />
    <path d="M455 92v116M397 150h116M290 150h107M513 150h52" stroke="currentColor" strokeWidth="3" opacity=".45" />
  </svg>;
}

export const MachinerySafety: Story = { args: {
  title: "Identify the lockout points",
  description: "Match each safety action to the correct isolation point before maintenance.",
  alt: "Industrial machine with electrical and pneumatic isolation destinations",
  longDescription: "A machine enclosure. The electrical isolator is on the left and the pneumatic release assembly is on the lower right.",
  media: <MachineDiagram />, targets: machineTargets, items: machineItems,
} };

export const Streaming: Story = { args: { alt: "Diagram loading", streaming: true } };
export const Empty: Story = { args: { alt: "Empty diagram", targets: [], items: [] } };
export const Disabled: Story = { args: { ...MachinerySafety.args, disabled: true } };
