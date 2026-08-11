import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";

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

afterEach(cleanup);

describe("Card", () => {
  it("renders each slot with its data-slot attribute", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Lesson 3</CardTitle>
          <CardDescription>Photosynthesis basics</CardDescription>
          <CardAction>
            <Button size="icon-sm" aria-label="More options">
              …
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>Body content</CardContent>
        <CardFooter>
          <Button>Continue</Button>
        </CardFooter>
      </Card>,
    );

    expect(screen.getByText("Lesson 3").closest("[data-slot=card-title]")).toBeInTheDocument();
    expect(
      screen.getByText("Photosynthesis basics").closest("[data-slot=card-description]"),
    ).toBeInTheDocument();
    expect(screen.getByText("Body content").closest("[data-slot=card-content]")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue" }).closest("[data-slot=card-footer]"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "More options" }).closest("[data-slot=card-action]"),
    ).toBeInTheDocument();
  });

  it("merges a caller className last on the root card", () => {
    render(<Card className="custom-card">content</Card>);
    const card = screen.getByText("content");
    expect(card).toHaveClass("custom-card");
    expect(card.className).toContain("flex");
  });

  it("has no automatically detectable accessibility violations for a full composition", async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Lesson 3</CardTitle>
          <CardDescription>Photosynthesis basics</CardDescription>
          <CardAction>
            <Button size="icon-sm" aria-label="More options">
              …
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>Body content</CardContent>
        <CardFooter>
          <Button>Continue</Button>
        </CardFooter>
      </Card>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
