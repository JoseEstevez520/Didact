import type { ComponentManifest } from "@didact/schema";

import {
  accessibility,
  evidence,
  generativeLearningSource,
  learningTechniquesSource,
  listField,
  objectField,
  qti,
  schemaVersion,
  selectField,
  textField,
  xapi,
} from "../manifest-helpers";

const availableLifecycle = { availability: "available", maturity: "stable" } as const;

export const practiceSetManifest = {
  id: "didact.practice-set",
  name: "Practice Set",
  description: "Composes practice items into a bounded session with feedback and completion policy.",
  role: "composite",
  families: ["retrieval-practice", "assessment"],
  facets: { subjects: ["general"], representations: ["text", "procedural"], learnerActions: ["respond", "select", "write"], purposes: ["practice", "assess", "orchestrate"], contexts: ["self-paced", "classroom", "corporate"] },
  lifecycle: availableLifecycle,
  version: { schema: schemaVersion, component: "1.0.0" },
  variants: [{ id: "fixed", name: "Fixed sequence" }, { id: "randomized", name: "Randomized selection" }],
  authoring: { version: schemaVersion, fields: [
    listField("items", "Items", "Referenced or embedded practice items."),
    objectField("selection", "Selection", "Ordering and sampling policy."),
    objectField("completion", "Completion", "Session completion conditions."),
  ], supportsLocalization: true },
  capabilities: ["response:composite", "result:scored", "result:partial-credit", "result:mastery", "feedback:immediate", "feedback:deferred"],
  evidence: [evidence(
    "dunlosky-2013-practice-set-boundary",
    "high",
    learningTechniquesSource,
    "Practice-testing evidence applies when this composition elicits retrieval.",
    "The container has no independent effect merely because it groups items.",
  )],
  accessibility: accessibility(
    "Navigation and every child item are keyboard operable; position, validation and completion are announced without replacing page context.",
    ["2.1.1", "2.2.1", "2.4.3", "3.3.1", "4.1.3"],
  ),
  mappings: {
    qti: qti("none", "none", "This is a composition; child items own QTI mappings."),
    xapi: { verbs: ["attempted", "completed"], notes: "Emit child interaction types plus session events." },
  },
  optionalDependencies: [],
  tags: ["practice-testing", "composition", "implemented:@didact/core/PracticeSet"],
} as const satisfies ComponentManifest;

export const retrievalPracticeSessionManifest = {
  id: "didact.retrieval-practice-session",
  name: "Retrieval Practice Session",
  description: "Captures a constructed recall, supports model comparison, and schedules repeated retrieval across time.",
  role: "composite",
  families: ["retrieval-practice", "progress-mastery"],
  facets: { subjects: ["general"], representations: ["text", "temporal"], learnerActions: ["write", "respond", "inspect"], purposes: ["retrieve", "practice", "orchestrate"], contexts: ["self-paced", "classroom"] },
  lifecycle: availableLifecycle,
  version: { schema: schemaVersion, component: "1.0.0" },
  variants: [{ id: "queue", name: "Queue" }, { id: "scheduled", name: "Scheduled" }],
  authoring: { version: schemaVersion, fields: [
    listField("items", "Items", "Retrieval prompts with stable identifiers."),
    selectField("scheduler", "Scheduler", "Queue, SM-2 or optional FSRS policy.", ["queue", "sm2", "fsrs"]),
    objectField("sessionLimits", "Session limits", "Maximum work and stopping conditions."),
  ], supportsLocalization: true },
  capabilities: ["response:constructed", "response:self-rating", "response:composite", "result:mastery", "feedback:immediate", "feedback:informative"],
  evidence: [evidence(
    "dunlosky-2013-retrieval-spacing",
    "high",
    learningTechniquesSource,
    "Practice testing and distributed practice are high-utility techniques.",
    "The claim requires actual retrieval and spacing; a scheduler badge is insufficient.",
  )],
  accessibility: accessibility(
    "Reveal and rating actions are keyboard operable; due state, transitions and rating consequences are textual; grading is not speed-dependent.",
    ["2.1.1", "2.2.1", "2.3.3", "4.1.3"],
  ),
  mappings: {
    qti: qti("none", "none", "The session orchestrates interactions; prompts own their mappings."),
    xapi: { verbs: ["attempted", "mastered"], notes: "Report child interactions and session/mastery events." },
  },
  optionalDependencies: [{ package: "ts-fsrs", purpose: "Optional FSRS scheduling.", fallback: "Dependency-free SM-2 scheduler." }],
  tags: ["distributed-practice", "practice-testing", "implemented:@didact/core/RetrievalPracticeSession"],
} as const satisfies ComponentManifest;

export const selfExplanationPromptManifest = {
  id: "didact.self-explanation-prompt",
  name: "Self-explanation Prompt",
  description: "Asks learners to explain reasoning, relationships or a worked step in their own words.",
  role: "interaction",
  families: ["generative-learning"],
  facets: { subjects: ["general"], representations: ["text"], learnerActions: ["write", "explain"], purposes: ["practice", "reflect"], contexts: ["self-paced", "classroom", "corporate"] },
  lifecycle: availableLifecycle,
  version: { schema: schemaVersion, component: "1.0.0" },
  variants: [{ id: "free-response", name: "Free response" }, { id: "guided", name: "Guided" }],
  authoring: { version: schemaVersion, fields: [
    textField("prompt", "Prompt", "Explanation cue tied to learning material.", true, true),
    listField("scaffold", "Scaffold", "Optional reasoning prompts.", false),
    textField("model", "Model explanation", "Optional comparison after submission.", false, true),
  ], supportsLocalization: true },
  capabilities: ["response:text", "result:ungraded", "feedback:on-demand", "feedback:author-reviewed", "feedback:model-answer"],
  evidence: [evidence(
    "fiorella-mayer-2016-self-explanation",
    "moderate",
    generativeLearningSource,
    "Self-explaining is identified as a generative learning strategy.",
    "Prompt design and integration with the material matter; no universal effect is claimed.",
  )],
  accessibility: accessibility(
    "Response, scaffolds and comparison controls use native interactions; prompts and response instructions are explicitly labelled.",
    ["1.3.1", "2.1.1", "2.2.1", "3.3.2"],
  ),
  mappings: {
    qti: qti("extendedTextInteraction", "approximate", "Carries the response but not self-explanation intent."),
    xapi: xapi("long-fill-in", "Retain self-explanation purpose in activity metadata."),
  },
  optionalDependencies: [],
  tags: ["generative-learning", "reflection", "implemented:@didact/core/SelfExplanationPrompt"],
} as const satisfies ComponentManifest;

export const workedExampleManifest = {
  id: "didact.worked-example",
  name: "Worked Example",
  description: "Presents a solved process in meaningful steps with optional explanatory prompts.",
  role: "display",
  families: ["sequence-procedure", "generative-learning"],
  facets: { subjects: ["general", "mathematics", "science", "business", "technical"], representations: ["text", "procedural"], learnerActions: ["inspect", "interpret"], purposes: ["present", "scaffold"], contexts: ["self-paced", "classroom", "corporate", "technical-training"] },
  lifecycle: availableLifecycle,
  version: { schema: schemaVersion, component: "1.0.0" },
  variants: [{ id: "static", name: "Static" }, { id: "progressive", name: "Progressive" }],
  authoring: { version: schemaVersion, fields: [
    textField("problem", "Problem", "Problem or task demonstrated.", true, true),
    listField("steps", "Steps", "Ordered solution steps and explanations."),
    textField("summary", "Summary", "Principle or transfer cue.", false, true),
  ], supportsLocalization: true },
  capabilities: ["response:step-reveal", "result:ungraded", "feedback:on-demand", "feedback:explanation"],
  evidence: [evidence(
    "fiorella-mayer-2016-worked-example-boundary",
    "low",
    generativeLearningSource,
    "The current source set supports generative prompts around examples more directly than a standalone worked-example claim.",
    "Treat as structured instructional content until broader evidence is added.",
  )],
  accessibility: accessibility(
    "Step order and current step are exposed; progressive controls are keyboard operable; diagrams, notation and motion have accessible equivalents.",
    ["1.1.1", "1.3.1", "2.1.1", "2.3.3"],
  ),
  mappings: {
    qti: qti("none", "none", "A worked example is content, not a response interaction."),
    xapi: { verbs: ["experienced"], notes: "No xAPI interactionType applies." },
  },
  optionalDependencies: [],
  tags: ["scaffolding", "procedure", "implemented:@didact/core/WorkedExample"],
} as const satisfies ComponentManifest;

export const completionProblemManifest = {
  id: "didact.completion-problem",
  name: "Completion Problem",
  description: "Bridges worked examples and independent problem solving through missing steps.",
  role: "interaction",
  families: ["generative-learning", "assessment", "sequence-procedure"],
  facets: { subjects: ["general", "mathematics", "science", "technical"], representations: ["text", "procedural"], learnerActions: ["construct", "write", "calculate"], purposes: ["practice", "assess", "scaffold"], contexts: ["self-paced", "classroom", "technical-training"] },
  lifecycle: availableLifecycle,
  version: { schema: schemaVersion, component: "1.0.0" },
  variants: [{ id: "missing-step", name: "Missing step" }, { id: "faded", name: "Faded" }],
  authoring: { version: schemaVersion, fields: [
    textField("problem", "Problem", "Problem statement.", true, true),
    listField("steps", "Steps", "Worked and learner-completed steps."),
    objectField("checking", "Checking", "Per-step checking and accepted responses."),
    textField("feedback", "Feedback", "Explanation for each completed step.", false, true),
  ], supportsLocalization: true },
  capabilities: ["response:text", "response:choice", "response:composite", "result:scored", "result:partial-credit", "feedback:immediate", "feedback:deferred"],
  evidence: [evidence(
    "didact-research-completion-problem",
    "not-evaluated",
    "Didact education-component research synthesis",
    "Completion problems were not independently evaluated by the current source set.",
    "This is a planned bridge between examples and retrieval practice, not a settled effectiveness claim.",
  )],
  accessibility: accessibility(
    "Every missing-step input is keyboard operable; worked and missing steps are distinguished; feedback remains associated with its step.",
    ["1.3.1", "2.1.1", "3.3.1", "3.3.2", "4.1.3"],
  ),
  mappings: {
    qti: [
      qti("textEntryInteraction", "approximate", "Typed missing step."),
      qti("inlineChoiceInteraction", "approximate", "Choice missing step."),
      qti("extendedTextInteraction", "approximate", "Extended missing step."),
    ],
    xapi: [xapi("fill-in", "Typed step."), xapi("choice", "Choice step."), xapi("long-fill-in", "Extended step.")],
  },
  optionalDependencies: [],
  tags: ["fading", "procedure", "implemented:@didact/core/CompletionProblem"],
} as const satisfies ComponentManifest;

export const learningWaveManifests = [practiceSetManifest, retrievalPracticeSessionManifest, selfExplanationPromptManifest, workedExampleManifest, completionProblemManifest] as const satisfies readonly ComponentManifest[];

/** Designed contracts that are deliberately excluded from the public production catalog. */
export const plannedManifests: readonly ComponentManifest[] = [];
