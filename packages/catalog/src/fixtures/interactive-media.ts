import {
  INTERACTIVE_MEDIA_SCHEMA_VERSION,
  type InteractiveMediaDefinition,
} from "@didact/schema";

export const corporateProcedureVideoFixture = {
  schemaVersion: INTERACTIVE_MEDIA_SCHEMA_VERSION,
  id: "fixture.lockout-tagout",
  title: "Lockout/tagout: isolate energy before maintenance",
  learningObjective: "Choose and sequence the actions that prevent unexpected machine startup.",
  media: {
    kind: "video",
    src: "https://media.example.test/lockout-tagout.mp4",
    mimeType: "video/mp4",
    durationMs: 138_000,
    poster: "https://media.example.test/lockout-tagout-poster.jpg",
    tracks: [
      { id: "captions-en", kind: "captions", src: "https://media.example.test/lockout-tagout.en.vtt", language: "en", label: "English captions", default: true },
      { id: "descriptions-en", kind: "descriptions", src: "https://media.example.test/lockout-tagout.descriptions.en.vtt", language: "en", label: "Visual descriptions" },
    ],
    transcript: [
      { id: "intro", startMs: 0, endMs: 24_000, speaker: "Narrator", text: "Before maintenance, identify every energy source connected to the machine." },
      { id: "isolate", startMs: 24_000, endMs: 62_000, speaker: "Narrator", text: "Stop the machine, isolate each source, and attach the assigned lock and tag." },
      { id: "verify", startMs: 62_000, endMs: 112_000, speaker: "Narrator", text: "Try the normal controls and verify zero energy before work begins." },
      { id: "restore", startMs: 112_000, endMs: 138_000, speaker: "Narrator", text: "After inspection, the authorized worker removes the lock and restores energy." },
    ],
    visualDescription: "A technician identifies a disconnect, applies a personal lock and tag, tests the controls, verifies zero energy with a meter, and later restores the machine.",
  },
  checkpoints: [
    {
      id: "identify-first-action",
      atMs: 25_000,
      label: "Predict the first action",
      required: true,
      pause: true,
      activity: {
        id: "first-action-question",
        manifestId: "didact.quiz",
        typeId: "didact.quiz.single-choice",
        authoring: {
          prompt: "What should the worker do before applying a lock?",
          options: [
            { id: "identify", label: "Identify every energy source" },
            { id: "open", label: "Open the machine housing" },
            { id: "notify-after", label: "Notify affected workers after maintenance" },
          ],
          correctOptionId: "identify",
          feedback: "Isolation is reliable only after all energy sources have been identified.",
        },
      },
    },
    {
      id: "sequence-isolation",
      atMs: 113_000,
      label: "Reconstruct the isolation sequence",
      required: true,
      pause: true,
      activity: {
        id: "isolation-order",
        manifestId: "didact.matching-exercises",
        typeId: "didact.sort",
        authoring: {
          prompt: "Place the steps in a safe order.",
          items: ["Identify sources", "Stop and isolate", "Apply lock and tag", "Verify zero energy"],
        },
      },
    },
  ],
  completion: { kind: "both", minimumWatchRatio: 0.8 },
  allowSeeking: true,
  allowPlaybackRate: true,
} as const satisfies InteractiveMediaDefinition;

export const languageComprehensionAudioFixture = {
  schemaVersion: INTERACTIVE_MEDIA_SCHEMA_VERSION,
  id: "fixture.train-announcement",
  title: { en: "Understanding a station announcement", es: "Comprender un anuncio de estación" },
  learningObjective: "Identify destination, departure time and platform in a short spoken announcement.",
  media: {
    kind: "audio",
    src: "https://media.example.test/train-announcement.mp3",
    mimeType: "audio/mpeg",
    durationMs: 52_000,
    transcript: [
      { id: "attention", startMs: 0, endMs: 8_000, speaker: "Announcer", text: "Attention please. The delayed service to Brighton will depart shortly." },
      { id: "details", startMs: 8_000, endMs: 24_000, speaker: "Announcer", text: "The train will now leave at ten forty-five from platform six." },
      { id: "change", startMs: 24_000, endMs: 40_000, speaker: "Announcer", text: "Passengers previously waiting on platform four should use the footbridge." },
      { id: "closing", startMs: 40_000, endMs: 52_000, speaker: "Announcer", text: "We apologize for the delay to this service." },
    ],
  },
  checkpoints: [
    {
      id: "capture-details",
      atMs: 25_000,
      label: "Capture the changed departure details",
      required: true,
      pause: true,
      activity: {
        id: "announcement-gaps",
        manifestId: "didact.word-bank",
        authoring: {
          sentence: "The train leaves at [time] from platform [platform].",
          gaps: [
            { id: "time", acceptedOptionIds: ["ten-forty-five"] },
            { id: "platform", acceptedOptionIds: ["six"] },
          ],
          options: [
            { id: "ten-forty-five", label: "10:45" },
            { id: "ten-fifteen", label: "10:15" },
            { id: "six", label: "6" },
            { id: "four", label: "4" },
          ],
        },
      },
    },
    {
      id: "explain-platform-change",
      atMs: 52_000,
      label: "Explain the change",
      required: false,
      pause: true,
      activity: {
        id: "platform-explanation",
        manifestId: "didact.quiz",
        typeId: "didact.quiz.short-answer",
        authoring: {
          prompt: "Why should some passengers use the footbridge?",
          modelAnswer: "Because the departure platform changed from four to six.",
        },
      },
    },
  ],
  completion: { kind: "required-checkpoints", minimumWatchRatio: 0.7 },
  allowSeeking: true,
  allowPlaybackRate: true,
} as const satisfies InteractiveMediaDefinition;

export const interactiveMediaFixtures = [
  corporateProcedureVideoFixture,
  languageComprehensionAudioFixture,
] as const satisfies readonly InteractiveMediaDefinition[];
