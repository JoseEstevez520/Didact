import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { MediaPlayer } from "./media-player.js";

afterEach(cleanup);

describe("MediaPlayer", () => {
  it("renders a standalone audio player without educational chrome", () => {
    render(<MediaPlayer kind="audio" src="lesson.mp3" durationMs={30_000} />);
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Media position" })).toBeInTheDocument();
    expect(screen.queryByText("Transcript")).not.toBeInTheDocument();
    expect(screen.queryByText("Learning checkpoints")).not.toBeInTheDocument();
  });

  it("seeks ten seconds with the published control", async () => {
    const user = userEvent.setup();
    const onTimeChange = vi.fn();
    render(<MediaPlayer kind="audio" src="lesson.mp3" durationMs={30_000} onTimeChange={onTimeChange} />);
    await user.click(screen.getByRole("button", { name: "Advance 10 seconds" }));
    expect(onTimeChange).toHaveBeenLastCalledWith(10_000, 30_000);
  });

  it("places video controls in the viewport and exposes tracks", () => {
    const { container } = render(<MediaPlayer kind="video" src="lesson.mp4" durationMs={30_000} tracks={[{ id: "en", kind: "captions", src: "en.vtt", language: "en", label: "English" }]} />);
    expect(container.querySelector("[data-slot=media-player]")).toHaveAttribute("data-kind", "video");
    expect(container.querySelector("track")).toHaveAttribute("kind", "captions");
    expect(screen.getByRole("button", { name: "Play" }).parentElement).toHaveClass("absolute");
  });

  it("reports native media position changes", () => {
    const onTimeChange = vi.fn();
    const { container } = render(<MediaPlayer kind="audio" src="lesson.mp3" durationMs={30_000} onTimeChange={onTimeChange} />);
    const audio = container.querySelector("audio")!;
    Object.defineProperty(audio, "currentTime", { configurable: true, value: 4 });
    Object.defineProperty(audio, "duration", { configurable: true, value: 30 });
    fireEvent.timeUpdate(audio);
    expect(onTimeChange).toHaveBeenLastCalledWith(4_000, 30_000);
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<MediaPlayer kind="audio" src="lesson.mp3" durationMs={30_000} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
