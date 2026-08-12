import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { RetrievalPracticeSession, type RetrievalPracticeItem, type RetrievalPracticeReview } from "./retrieval-practice-session.js";

const meta = { title: "02 Learning patterns/Practice & memory/Retrieval Practice Session", component: RetrievalPracticeSession, parameters: { layout: "centered" } } satisfies Meta<typeof RetrievalPracticeSession>;
export default meta;
type Story = StoryObj<typeof meta>;

const items: RetrievalPracticeItem[] = [
  { id: "spacing", title: "Explain from memory", prompt: "Why does spacing reviews improve retention?", answer: "Spacing allows some forgetting, so later retrieval is effortful enough to strengthen future access." },
  { id: "testing", title: "Retrieve and compare", prompt: "Name one benefit of practice testing.", answer: "Retrieval practice strengthens memory and exposes knowledge gaps." },
];

export const Default: Story = { args: { items } };

export const WithPersistenceAdapter: Story = {
  args: { items },
  render: () => {
    const [saved, setSaved] = React.useState<RetrievalPracticeReview[]>([]);
    return <div style={{ display: "grid", gap: "1rem", width: "38rem" }}><RetrievalPracticeSession items={items} persistence={{ save: (review) => setSaved((all) => [...all, review]) }} /><p style={{ fontSize: ".8rem" }}>Persisted constructed responses: {saved.length}{saved.at(-1) ? ` — “${saved.at(-1)!.response}”` : ""}</p></div>;
  },
};

export const LimitedSession: Story = { args: { items, maxItems: 1 } };
export const StreamingPrompt: Story = { args: { items: [{ id: "pending", prompt: "The model answer will arrive shortly." }] } };
export const Disabled: Story = { args: { items, disabled: true, defaultResponses: { spacing: "My draft response" } } };
export const Empty: Story = { args: { items: [] } };
