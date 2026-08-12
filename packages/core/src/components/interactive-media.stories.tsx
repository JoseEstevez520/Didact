import * as React from "react";
import { MdForward10, MdPause, MdPlayArrow } from "react-icons/md";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  INTERACTIVE_MEDIA_SCHEMA_VERSION,
  type InteractiveMediaDefinition,
} from "@didact/schema";
import { Button } from "@didact/ui";

import {
  InteractiveMedia,
  type InteractiveMediaPlayerContext,
} from "./interactive-media.js";

const audioDefinition: InteractiveMediaDefinition = {
  schemaVersion: INTERACTIVE_MEDIA_SCHEMA_VERSION,
  id: "story.station-announcement",
  title: "Understanding a station announcement",
  learningObjective: "Identify the changed departure details.",
  media: {
    kind: "audio",
    src: "didact-demo://station-announcement",
    durationMs: 52_000,
    transcript: [
      { id: "intro", startMs: 0, endMs: 8_000, speaker: "Announcer", text: "Attention please. The delayed service to Brighton will depart shortly." },
      { id: "details", startMs: 8_000, endMs: 24_000, speaker: "Announcer", text: "The train will leave at ten forty-five from platform six." },
    ],
  },
  checkpoints: [{
    id: "details-check",
    atMs: 24_000,
    label: "Capture the departure details",
    required: true,
    pause: true,
    activity: { id: "announcement-gaps", manifestId: "didact.word-bank", authoring: { sentence: "The train leaves at [time] from platform [platform]." } },
  }],
  completion: { kind: "required-checkpoints", minimumWatchRatio: 0.7 },
  allowSeeking: true,
  allowPlaybackRate: true,
};

const videoDefinition: InteractiveMediaDefinition = {
  schemaVersion: INTERACTIVE_MEDIA_SCHEMA_VERSION,
  id: "story.lockout-procedure",
  title: "Lockout/tagout procedure",
  learningObjective: "Recognize the safe sequence before maintenance begins.",
  media: {
    kind: "video",
    src: "didact-demo://lockout-procedure",
    durationMs: 138_000,
    tracks: [{ id: "captions-en", kind: "captions", src: "didact-demo://lockout-procedure-captions", language: "en", label: "English captions", default: true }],
    transcript: [
      { id: "isolate", startMs: 0, endMs: 62_000, speaker: "Narrator", text: "Stop the machine, isolate each source, and attach the assigned lock and tag." },
      { id: "verify", startMs: 62_000, endMs: 118_000, speaker: "Narrator", text: "Verify zero energy before any maintenance work begins." },
    ],
    visualDescription: "A technician disconnects the power supply, applies a personal lock and verifies zero energy.",
  },
  checkpoints: [{
    id: "first-action",
    atMs: 45_000,
    label: "Predict the first action",
    required: true,
    pause: true,
    activity: { id: "first-action-question", manifestId: "didact.quiz", typeId: "didact.quiz.single-choice", authoring: { prompt: "What should happen first?" } },
  }],
  completion: { kind: "both", minimumWatchRatio: 0.8 },
};

const meta: Meta<typeof InteractiveMedia> = {
  title: "03 Representation domains/Time, audio & animation/Interactive Media",
  component: InteractiveMedia,
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="mx-auto w-full max-w-5xl"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

const renderActivity = (activity: { id: string }) => (
  <div>
    <p className="text-sm leading-6 text-muted-foreground">
      {activity.id === "announcement-gaps"
        ? "The train leaves at 10:45 from platform 6."
        : "Stop the machine before isolating every energy source."}
    </p>
  </div>
);

function formatTime(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1_000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function DemoPlayer({ context }: { context: InteractiveMediaPlayerContext }) {
  const duration = context.definition.media.durationMs ?? 60_000;
  const [position, setPosition] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);

  const updatePosition = React.useCallback((nextPosition: number) => {
    const clamped = Math.max(0, Math.min(duration, nextPosition));
    setPosition(clamped);
    context.onTimeChange(clamped, duration);
    if (clamped === duration) {
      setPlaying(false);
      context.onEnded();
    }
  }, [context, duration]);

  React.useEffect(() => {
    context.setController({
      play: () => { setPlaying(true); context.onPlay(); },
      pause: () => { setPlaying(false); context.onPause(); },
      seek: updatePosition,
    });
    return () => context.setController(null);
  }, [context, updatePosition]);

  React.useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => updatePosition(position + 1_000), 1_000);
    return () => window.clearInterval(timer);
  }, [playing, position, updatePosition]);

  const isVideo = context.definition.media.kind === "video";
  const controls = <div className={isVideo ? "absolute inset-x-0 bottom-0 flex items-center gap-2 px-3 py-3 text-background sm:gap-3 sm:px-4" : "flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4"}>
      <Button type="button" variant="ghost" size="icon-sm" disabled={context.disabled} onClick={() => { if (playing) { setPlaying(false); context.onPause(); } else { setPlaying(true); context.onPlay(); } }} aria-label={playing ? "Pause demo" : "Play demo"} title={playing ? "Pause" : "Play"} className={isVideo ? "shrink-0 text-background hover:bg-transparent hover:text-background" : "shrink-0 hover:bg-transparent"}>
        {playing ? <MdPause className="size-5" aria-hidden="true" /> : <MdPlayArrow className="size-5" aria-hidden="true" />}
      </Button>
      <label className="flex min-w-0 flex-1 items-center gap-2">
        <span className="sr-only">Demo position</span>
        <span className={isVideo ? "shrink-0 text-xs tabular-nums text-background" : "shrink-0 text-xs tabular-nums text-muted-foreground"}>{formatTime(position)}</span>
        <input type="range" min={0} max={duration} step={1_000} value={position} disabled={context.disabled} onChange={(event) => updatePosition(Number(event.currentTarget.value))} className={isVideo ? "min-w-0 flex-1 accent-background" : "min-w-0 flex-1 accent-foreground"} />
        <span className={isVideo ? "shrink-0 text-xs tabular-nums text-background" : "shrink-0 text-xs tabular-nums text-muted-foreground"}>{formatTime(duration)}</span>
      </label>
      <Button type="button" variant="ghost" size="icon-sm" disabled={context.disabled} onClick={() => updatePosition(position + 10_000)} aria-label="Advance 10 seconds" title="Advance 10 seconds" className={isVideo ? "shrink-0 text-background hover:bg-transparent hover:text-background" : "shrink-0 hover:bg-transparent"}><MdForward10 className="size-5" aria-hidden="true" /></Button>
    </div>;

  if (!isVideo) return <div className="bg-background">{controls}</div>;
  return <div className="relative grid aspect-video place-items-center bg-foreground text-background">
    <div className="grid max-w-md gap-2 px-8 pb-8 text-center">
      <span className="text-xs font-medium text-background">Safety procedure</span>
      <span className="text-xl font-semibold sm:text-2xl">Isolate · Lock · Verify</span>
    </div>
    {controls}
  </div>;
}

const renderPlayer = (context: InteractiveMediaPlayerContext) => <DemoPlayer context={context} />;

export const LanguageAudio: Story = { args: { definition: audioDefinition, renderActivity, renderPlayer } };
export const CorporateProcedureVideo: Story = { args: { definition: videoDefinition, renderActivity, renderPlayer } };
export const Streaming: Story = { args: { validationMode: "streaming", renderActivity } };
export const Disabled: Story = { args: { definition: audioDefinition, renderActivity, renderPlayer, disabled: true } };
