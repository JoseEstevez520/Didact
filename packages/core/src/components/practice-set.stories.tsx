import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { PracticeSet, type PracticeSetItem } from "./practice-set.js";

const items: PracticeSetItem<string, { correct: boolean }>[] = [
  {
    id: "capital",
    title: "Recall",
    canSubmit: Boolean,
    evaluate: (response) => ({ correct: response?.trim().toLowerCase() === "paris" }),
    feedback: (result) => result?.correct ? "Correct: Paris has been France's capital since 987." : "Look again at the map and retrieve the city, not the country.",
    render: ({ phase, response, result, setResponse, disabled }) => <div style={{ display: "grid", gap: ".5rem" }}>
      <label htmlFor="capital-response">What is the capital of France?</label>
      <input id="capital-response" value={response ?? ""} disabled={disabled} onChange={(event) => setResponse(event.target.value)} style={{ border: "1px solid currentColor", borderRadius: ".375rem", padding: ".5rem" }} />
      {phase === "review" ? <strong>{result?.correct ? "Correct" : "Try retrieving it again later"}</strong> : null}
    </div>,
  },
  { id: "reflection", title: "Transfer", render: () => <p>Where else might this fact be useful?</p> },
];

const StringPracticeSet = PracticeSet<string, { correct: boolean }>;
const meta = { title: "02 Learning patterns/Orchestration/Practice Set", component: StringPracticeSet, parameters: { layout: "centered" } } satisfies Meta<typeof StringPracticeSet>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { items } };

export const WithAttemptLog: Story = {
  args: { items },
  render: () => {
    const [log, setLog] = React.useState<string[]>([]);
    return <div style={{ display: "grid", gap: "1rem", width: "34rem" }}><StringPracticeSet items={items} onItemSubmit={(attempt) => setLog((all) => [...all, `${attempt.itemId}: ${JSON.stringify(attempt.result)}`])} /><pre>{log.join("\n")}</pre></div>;
  },
};

export const Complete: Story = { args: { items, index: items.length, attempts: [{ itemId: "capital", itemIndex: 0, response: "Paris", result: { correct: true }, attemptNumber: 1 }] } };
export const Empty: Story = { args: { items: [] } };
