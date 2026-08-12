import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "./card.js";
import { Button } from "./button.js";
import { Badge } from "./badge.js";

/**
 * Storybook story for the `Card` family. See docs/interface-norms.md's "Card composition" for
 * when to use each slot: title/description/optional action in the header, body in content,
 * actions in the footer.
 */
const meta = {
  title: "01 Foundations/Layout/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card style={{ width: "24rem" }}>
      <CardHeader>
        <CardTitle>Lesson 3: Photosynthesis</CardTitle>
        <CardDescription>How plants convert light into energy.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>12 flashcards · 4 quiz questions · ~10 min</p>
      </CardContent>
      <CardFooter>
        <Button>Continue</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithHeaderAction: Story = {
  name: "With a header action",
  render: () => (
    <Card style={{ width: "24rem" }}>
      <CardHeader>
        <CardTitle>Lesson 3: Photosynthesis</CardTitle>
        <CardDescription>How plants convert light into energy.</CardDescription>
        <CardAction>
          <Badge variant="secondary">In progress</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>12 flashcards · 4 quiz questions · ~10 min</p>
      </CardContent>
      <CardFooter style={{ display: "flex", gap: "0.5rem" }}>
        <Button variant="outline">Review later</Button>
        <Button>Continue</Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "CardAction occupies the header's second grid column (only reserved when a " +
          "CardAction child is present), for a status badge or icon button next to the title.",
      },
    },
  },
};

export const ContentOnly: Story = {
  name: "Content only (no header/footer)",
  render: () => (
    <Card style={{ width: "24rem" }}>
      <CardContent>
        <p>A card with only a body -- no title, no actions.</p>
      </CardContent>
    </Card>
  ),
};
