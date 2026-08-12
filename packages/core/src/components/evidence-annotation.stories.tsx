import type { Meta, StoryObj } from "@storybook/react-vite";
import { EvidenceAnnotation, type EvidenceAnnotationDefinition } from "./evidence-annotation.js";

const meta: Meta<typeof EvidenceAnnotation> = {
  title: "04 Applied experiences/Reading & evidence/Evidence Annotation",
  component: EvidenceAnnotation,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-full max-w-[760px]"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

const historicalSource: EvidenceAnnotationDefinition = {
  id: "history.factory-testimony",
  title: "Build an argument from testimony",
  description: "History · Source analysis",
  instructions: "Mark passages that support or complicate the claim. Classify each passage and explain your reasoning when useful.",
  documentTitle: "Excerpt from a parliamentary factory inquiry, 1842",
  segments: [
    { id: "worker-hours", text: "The young worker reported beginning before sunrise and leaving after dark. " },
    { id: "owner-voluntary", text: "The mill owner described every additional hour as voluntary. " },
    { id: "doctor-observation", text: "A physician who examined the children recorded persistent fatigue and joint pain. " },
    { id: "production-rise", text: "Production records show that output rose during the same six-month period." },
  ],
  categories: [{ id: "corroboration", label: "Corroborating evidence" }, { id: "perspective", label: "Perspective or bias" }, { id: "context", label: "Context" }],
  claims: [{ id: "harm", label: "Factory schedules harmed young workers" }, { id: "reliability", label: "The testimony is reliable" }],
};

const incidentReport: EvidenceAnnotationDefinition = {
  id: "compliance.access-incident",
  title: "Identify evidence in an incident report",
  description: "Compliance · Investigation",
  instructions: "Separate observed facts from assumptions and connect relevant evidence to the investigation claims.",
  documentTitle: "Access review — report excerpt",
  segments: [
    { id: "login", text: "At 02:14, the service account authenticated from a previously unseen address. " },
    { id: "assumption", text: "The analyst initially assumed the deployment team was responsible. " },
    { id: "ticket", text: "No approved change ticket existed for the affected environment. " },
    { id: "rotation", text: "Credential rotation had been postponed twice during the preceding quarter." },
  ],
  categories: [{ id: "observation", label: "Observed fact" }, { id: "inference", label: "Inference" }, { id: "control-gap", label: "Control gap" }],
  claims: [{ id: "unauthorised", label: "The access was unauthorised" }, { id: "preventable", label: "The incident was preventable" }],
};

export const HistoricalSource: Story = { args: { definition: historicalSource, evaluate: async (state) => state.annotations.length >= 2 ? { status: "correct", feedback: "You used multiple passages to construct the argument." } : { status: "partial", feedback: "Add evidence from a second perspective." } } };
export const IncidentInvestigation: Story = { args: { definition: incidentReport } };
export const Streaming: Story = { args: { streaming: true } };
export const Disabled: Story = { args: { definition: incidentReport, disabled: true } };
