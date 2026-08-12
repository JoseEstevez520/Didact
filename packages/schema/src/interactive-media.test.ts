import { describe, expect, it } from "vitest";

import {
  INTERACTIVE_MEDIA_SCHEMA_VERSION,
  validateInteractiveMediaDefinition,
  type InteractiveMediaDefinition,
} from "./interactive-media";

const validVideo: InteractiveMediaDefinition = {
  schemaVersion: INTERACTIVE_MEDIA_SCHEMA_VERSION,
  id: "safety.lockout",
  title: "Lockout procedure",
  media: {
    kind: "video",
    src: "https://cdn.example.test/lockout.mp4",
    durationMs: 120_000,
    tracks: [
      { id: "captions-en", kind: "captions", src: "https://cdn.example.test/lockout.en.vtt", language: "en", label: "English captions", default: true },
    ],
    transcript: [
      { id: "cue-1", startMs: 0, endMs: 10_000, text: "Isolate the energy source before maintenance." },
    ],
    visualDescription: "A technician disconnects and labels the machine's power supply.",
  },
  checkpoints: [
    {
      id: "isolation-check",
      atMs: 45_000,
      required: true,
      pause: true,
      activity: {
        id: "isolation-question",
        manifestId: "didact.quiz",
        typeId: "didact.quiz.single-choice",
        authoring: { prompt: "What must happen first?", options: ["Isolate power", "Open housing"] },
      },
    },
  ],
  completion: { kind: "both", minimumWatchRatio: 0.8 },
};

describe("validateInteractiveMediaDefinition", () => {
  it("accepts a complete accessible video definition", () => {
    expect(validateInteractiveMediaDefinition(validVideo)).toEqual({ success: true, data: validVideo, issues: [] });
  });

  it("requires captions and a visual equivalent for meaningful video", () => {
    const result = validateInteractiveMediaDefinition({
      ...validVideo,
      media: { kind: "video", src: "video.mp4", durationMs: 120_000 },
    });
    expect(result.success).toBe(false);
    expect(result.issues.map(({ code }) => code).sort()).toEqual([
      "interactive-media.video-captions",
      "interactive-media.video-description",
    ]);
  });

  it("requires a transcript for prerecorded audio", () => {
    const result = validateInteractiveMediaDefinition({
      ...validVideo,
      media: { kind: "audio", src: "lesson.mp3", durationMs: 120_000 },
    });
    expect(result.issues.some(({ code }) => code === "interactive-media.audio-transcript")).toBe(true);
  });

  it("rejects unordered or out-of-bounds cues and checkpoints", () => {
    const result = validateInteractiveMediaDefinition({
      ...validVideo,
      media: {
        ...validVideo.media,
        durationMs: 20_000,
        transcript: [
          { id: "later", startMs: 10_000, endMs: 15_000, text: "Later" },
          { id: "earlier", startMs: 2_000, endMs: 25_000, text: "Earlier" },
        ],
      },
      checkpoints: [{ ...validVideo.checkpoints[0]!, atMs: 30_000 }],
    });
    const codes = result.issues.map(({ code }) => code);
    expect(codes).toContain("interactive-media.cue-order");
    expect(codes).toContain("interactive-media.cue-bounds");
    expect(codes).toContain("interactive-media.checkpoint-bounds");
  });

  it("rejects duplicated checkpoint identities and non-serializable authoring data", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    const checkpoint = validVideo.checkpoints[0]!;
    const result = validateInteractiveMediaDefinition({
      ...validVideo,
      checkpoints: [
        checkpoint,
        { ...checkpoint, atMs: 60_000, activity: { ...checkpoint.activity, authoring: circular } },
      ],
    });
    const codes = result.issues.map(({ code }) => code);
    expect(codes).toContain("interactive-media.checkpoint-duplicate");
    expect(codes).toContain("interactive-media.authoring");
  });

  it("accepts progressive media data in streaming mode", () => {
    const result = validateInteractiveMediaDefinition({
      schemaVersion: INTERACTIVE_MEDIA_SCHEMA_VERSION,
      id: "streaming.lesson",
      media: { kind: "audio" },
      checkpoints: [],
      completion: { kind: "media-ended" },
    }, { mode: "streaming" });
    expect(result.success).toBe(true);
  });
});
