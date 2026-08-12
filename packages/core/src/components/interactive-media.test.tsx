import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import {
  INTERACTIVE_MEDIA_SCHEMA_VERSION,
  type InteractiveMediaDefinition,
  type InteractiveMediaRuntimeState,
} from "@didact/schema";

import {
  InteractiveMedia,
  type InteractiveMediaPlayerContext,
} from "./interactive-media.js";

afterEach(cleanup);

const definition: InteractiveMediaDefinition = {
  schemaVersion: INTERACTIVE_MEDIA_SCHEMA_VERSION,
  id: "test.audio-lesson",
  title: "Station announcement",
  media: {
    kind: "audio",
    src: "announcement.mp3",
    durationMs: 30_000,
    transcript: [
      { id: "cue-one", startMs: 0, endMs: 10_000, text: "The train leaves from platform six." },
      { id: "cue-two", startMs: 10_000, endMs: 20_000, text: "The service is delayed." },
    ],
  },
  checkpoints: [{
    id: "detail-check",
    atMs: 10_000,
    label: "Identify the platform",
    required: true,
    pause: true,
    activity: { id: "platform-question", manifestId: "didact.quiz", typeId: "didact.quiz.single-choice", authoring: { prompt: "Which platform?" } },
  }],
  completion: { kind: "required-checkpoints" },
};

function TestPlayer({ context }: { context: InteractiveMediaPlayerContext }) {
  React.useEffect(() => {
    context.setController({ play: vi.fn(), pause: vi.fn(), seek: vi.fn() });
    return () => context.setController(null);
  }, [context.setController]);
  return <div>
    <button type="button" onClick={context.onPlay}>Play test media</button>
    <button type="button" onClick={() => context.onTimeChange(11_000, 30_000)}>Advance to checkpoint</button>
    <button type="button" onClick={context.onEnded}>End test media</button>
  </div>;
}

const renderActivity = (activity: { id: string }) => <p>Activity: {activity.id}</p>;

describe("InteractiveMedia", () => {
  it("opens a checkpoint when playback crosses its cue without evaluating the child", async () => {
    const user = userEvent.setup();
    const onCheckpointOpen = vi.fn();
    render(<InteractiveMedia definition={definition} renderPlayer={(context) => <TestPlayer context={context} />} renderActivity={renderActivity} onCheckpointOpen={onCheckpointOpen} />);
    expect(screen.queryByText("Activity: platform-question")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Play test media" }));
    await user.click(screen.getByRole("button", { name: "Advance to checkpoint" }));
    expect(screen.getByText("Activity: platform-question")).toBeInTheDocument();
    expect(onCheckpointOpen).toHaveBeenCalledWith("detail-check");
  });

  it("completes only after the child checkpoint is explicitly completed", async () => {
    const user = userEvent.setup();
    const onCheckpointComplete = vi.fn();
    const onComplete = vi.fn();
    render(<InteractiveMedia definition={definition} renderPlayer={(context) => <TestPlayer context={context} />} renderActivity={renderActivity} onCheckpointComplete={onCheckpointComplete} onComplete={onComplete} />);
    await user.click(screen.getByRole("button", { name: "Open checkpoint: Identify the platform" }));
    expect(onComplete).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Mark checkpoint complete" }));
    expect(onCheckpointComplete).toHaveBeenCalledWith("detail-check");
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ status: "completed", completedCheckpointIds: ["detail-check"] }));
    expect(screen.getByText("1 of 1 required checkpoints completed")).toBeInTheDocument();
  });

  it("keeps every checkpoint reachable outside playback and exposes the transcript", async () => {
    const user = userEvent.setup();
    render(<InteractiveMedia definition={definition} renderPlayer={(context) => <TestPlayer context={context} />} renderActivity={renderActivity} />);
    expect(screen.getByRole("heading", { name: "Transcript" })).toBeInTheDocument();
    expect(screen.getByText("The train leaves from platform six.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open checkpoint: Identify the platform" }));
    expect(screen.getByText("Activity: platform-question")).toBeInTheDocument();
  });

  it("supports controlled runtime state", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [state, setState] = React.useState<InteractiveMediaRuntimeState>({ status: "idle", positionMs: 0, watchedMs: 0, mediaEnded: false, completedCheckpointIds: [] });
      return <InteractiveMedia definition={definition} state={state} onStateChange={setState} renderPlayer={(context) => <TestPlayer context={context} />} renderActivity={renderActivity} />;
    }
    render(<Controlled />);
    await user.click(screen.getByRole("button", { name: "Open checkpoint: Identify the platform" }));
    expect(screen.getByText("Activity: platform-question")).toBeInTheDocument();
  });

  it("renders useful loading and invalid states", () => {
    const { rerender } = render(<InteractiveMedia validationMode="streaming" renderActivity={renderActivity} />);
    expect(screen.getByText("Media is still loading.")).toBeInTheDocument();
    rerender(<InteractiveMedia definition={{ ...definition, media: { kind: "audio", src: "", transcript: [] } }} renderActivity={renderActivity} />);
    expect(screen.getByRole("alert")).toHaveTextContent("This interactive media configuration is incomplete.");
  });

  it("disables direct checkpoint controls", () => {
    render(<InteractiveMedia definition={definition} disabled renderPlayer={(context) => <TestPlayer context={context} />} renderActivity={renderActivity} />);
    expect(screen.getByRole("button", { name: "Open checkpoint: Identify the platform" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /0:00.*train leaves/i })).toBeDisabled();
  });

  it("highlights the current transcript cue without duplicating player progress", async () => {
    const user = userEvent.setup();
    render(<InteractiveMedia definition={definition} renderPlayer={(context) => <TestPlayer context={context} />} renderActivity={renderActivity} />);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Play test media" }));
    await user.click(screen.getByRole("button", { name: "Advance to checkpoint" }));
    const activeCue = screen.getByRole("button", { name: /0:10.*service is delayed/i });
    expect(activeCue).toHaveClass("bg-accent");
    expect(activeCue.querySelector("span")).toHaveClass("text-foreground");
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<InteractiveMedia definition={definition} renderPlayer={(context) => <TestPlayer context={context} />} renderActivity={renderActivity} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
