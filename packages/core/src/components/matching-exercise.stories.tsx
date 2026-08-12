import type { Meta, StoryObj } from "@storybook/react-vite";

import { MatchingExercise } from "./matching-exercises.js";

const meta: Meta<typeof MatchingExercise> = {
  title: "02 Learning patterns/Relationships & ordering/Matching Exercise",
  component: MatchingExercise,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: "min(42rem, calc(100vw - 2rem))" }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: {
    title: "Match each country to its capital",
    instructions: "Select an item, then select its match on the other side. Dragging also works.",
    sources: [{ id: "fr", content: "France" }, { id: "jp", content: "Japan" }, { id: "ke", content: "Kenya" }],
    targets: [{ id: "nairobi", content: "Nairobi" }, { id: "paris", content: "Paris" }, { id: "tokyo", content: "Tokyo" }],
    correctMatches: { fr: "paris", jp: "tokyo", ke: "nairobi" },
    feedback: "Use the capital-city relationship, not geographic proximity.",
  },
  parameters: {
    docs: { description: { story: "The primary interaction is point to point with two clicks. Dragging remains available, while the click path provides a keyboard and single-pointer alternative." } },
  },
};

export const Empty: Story = {
  args: { title: "Match the concepts", sources: [], targets: [], correctMatches: {} },
};
