import type { ComponentManifest } from "@didact/schema";
import { branchingScenarioManifest, codeExerciseManifest, dataExplorerManifest, interactiveMediaManifest, simulationLabManifest } from "./experience-foundations";

import { learningWaveManifests } from "./planned";
import { diverseWaveManifests } from "./diverse-wave";

import {
  accessibility,
  booleanField,
  evidence,
  informativeFeedbackSource,
  learningTechniquesSource,
  listField,
  numberField,
  objectField,
  qti,
  schemaVersion,
  selectField,
  textField,
  xapi,
} from "../manifest-helpers";

export const flashcardManifest = {
  id: "didact.flashcard",
  name: "Flashcard",
  description: "Prompts active recall before revealing a concise answer.",
  role: "interaction",
  families: ["retrieval-practice"],
  facets: { subjects: ["general"], representations: ["text"], learnerActions: ["respond", "inspect"], purposes: ["retrieve", "practice"], contexts: ["self-paced", "classroom"] },
  lifecycle: { availability: "available", maturity: "stable" },
  version: { schema: schemaVersion, component: "1.0.0" },
  variants: [
    { id: "basic", name: "Basic", description: "Prompt and explicit answer reveal." },
    { id: "self-rated", name: "Self-rated", description: "Adds confidence or recall rating." },
  ],
  authoring: { version: schemaVersion, fields: [
    textField("prompt", "Prompt", "Question or retrieval cue.", true, true),
    textField("answer", "Answer", "Answer revealed after the attempt.", true, true),
    textField("hint", "Hint", "Optional cue before reveal.", false, true),
  ], supportsLocalization: true },
  capabilities: ["response:reveal", "response:self-rating", "result:ungraded", "feedback:on-demand", "feedback:informative"],
  evidence: [evidence(
    "dunlosky-2013-flashcard-boundary",
    "not-evaluated",
    learningTechniquesSource,
    "A flashcard alone is not evidence of distributed practice.",
    "Its value depends on retrieval behavior and, when scheduled, distributed practice.",
  )],
  accessibility: accessibility(
    "Reveal and rating controls are keyboard operable; reveal state and content changes are announced; meaning never depends on flip motion.",
    ["2.1.1", "2.4.7", "4.1.2", "4.1.3"],
  ),
  mappings: {
    qti: qti("none", "none", "Flashcard reveal is not a QTI interaction."),
    xapi: { verbs: ["attempted", "experienced"], notes: "Use generic verbs; do not invent an interactionType." },
  },
  optionalDependencies: [],
  tags: ["active-recall", "implemented:@didact/core/Flashcard"],
} as const satisfies ComponentManifest;

export const quizManifest = {
  id: "didact.quiz",
  name: "Quiz",
  description: "Collects an answer and returns informative, optionally scored feedback.",
  role: "interaction",
  families: ["assessment", "retrieval-practice"],
  facets: { subjects: ["general"], representations: ["text"], learnerActions: ["select", "write", "respond"], purposes: ["assess", "retrieve", "practice"], contexts: ["self-paced", "classroom", "corporate"] },
  lifecycle: { availability: "available", maturity: "stable" },
  version: { schema: schemaVersion, component: "1.0.0" },
  variants: [
    { id: "choice", name: "Choice" },
    { id: "multiple-choice", name: "Multiple choice" },
    { id: "true-false", name: "True / false" },
    { id: "fill-in", name: "Fill in" },
    { id: "open", name: "Open answer" },
  ],
  authoring: { version: schemaVersion, fields: [
    textField("prompt", "Prompt", "Question presented to the learner.", true, true),
    selectField("variant", "Variant", "Response interaction.", ["choice", "multiple-choice", "true-false", "fill-in", "open"]),
    listField("options", "Options", "Choice options when required.", false),
    objectField("solution", "Solution", "Correct response and checking policy.", false),
    textField("feedback", "Feedback", "Explanatory feedback after an attempt.", false, true),
  ], supportsLocalization: true },
  capabilities: ["response:choice", "response:boolean", "response:text", "result:scored", "result:partial-credit", "feedback:immediate", "feedback:deferred", "feedback:author-reviewed"],
  evidence: [evidence(
    "dunlosky-2013-practice-testing",
    "high",
    learningTechniquesSource,
    "Practice testing has high utility when quizzes elicit retrieval.",
    `A quiz used only for grading does not automatically realize that benefit. Feedback design follows ${informativeFeedbackSource}.`,
  )],
  accessibility: accessibility(
    "Inputs use native behavior; prompts, grouped choices, errors, results and feedback have explicit relationships; correctness is not color-only.",
    ["1.3.1", "1.4.1", "2.1.1", "3.3.1", "4.1.3"],
  ),
  mappings: {
    qti: [
      qti("choiceInteraction", "exact", "Choice, multiple choice and true/false variants."),
      qti("textEntryInteraction", "exact", "Typed fill-in variant."),
      qti("extendedTextInteraction", "exact", "Short-answer variant."),
    ],
    xapi: [
      xapi("choice", "Choice variants."), xapi("true-false", "Binary variant."),
      xapi("fill-in", "Short typed variant."), xapi("long-fill-in", "Open variant."),
    ],
  },
  optionalDependencies: [],
  tags: ["practice-testing", "informative-feedback"],
} as const satisfies ComponentManifest;

export const matchingExercisesManifest = {
  id: "didact.matching-exercises",
  name: "Matching exercises",
  description: "Practises relationships, sequences and classification through movable items.",
  role: "interaction",
  families: ["assessment", "knowledge-representation"],
  facets: { subjects: ["general"], representations: ["text", "procedural"], learnerActions: ["order", "relate", "manipulate"], purposes: ["practice", "assess"], contexts: ["self-paced", "classroom", "corporate"] },
  lifecycle: { availability: "available", maturity: "stable" },
  version: { schema: schemaVersion, component: "1.0.0" },
  variants: [
    { id: "matching", name: "Matching", description: "Associate items across sets." },
    { id: "sort", name: "Sort", description: "Place items in sequence." },
    { id: "categorize", name: "Categorize", description: "Assign items to groups." },
  ],
  authoring: { version: schemaVersion, fields: [
    textField("prompt", "Prompt", "Task instruction.", true, true),
    selectField("variant", "Variant", "Relationship model.", ["matching", "sort", "categorize"]),
    listField("items", "Items", "Stable-id items to manipulate."),
    objectField("solution", "Solution", "Expected associations, order or categories."),
    textField("feedback", "Feedback", "Explanation of target relationships.", false, true),
  ], supportsLocalization: true },
  capabilities: ["response:matching", "response:ordering", "result:scored", "result:partial-credit", "feedback:immediate", "feedback:deferred"],
  evidence: [evidence(
    "didact-research-matching",
    "not-evaluated",
    "Didact education-component research synthesis",
    "The reviewed evidence does not establish this family as an independent technique.",
    "Effectiveness depends on objective, prompt and feedback.",
  )],
  accessibility: accessibility(
    "Every drag action has a select-and-move or button equivalent. Position, destinations and moves are announced.",
    ["1.1.1", "2.1.1", "2.5.7", "4.1.3"],
    { keyboard: "alternative", draggingAlternative: true },
  ),
  mappings: {
    qti: [qti("matchInteraction", "exact", "Matching."), qti("orderInteraction", "exact", "Sort."), qti("associateInteraction", "approximate", "Categorization as multiple-cardinality association with named groups; gapMatch applies only to embedded gaps.")],
    xapi: [xapi("matching", "Matching and categorization."), xapi("sequencing", "Sort.")],
  },
  optionalDependencies: [{ package: "@dnd-kit/core", purpose: "Pointer drag enhancement.", fallback: "Select-and-move keyboard controls." }],
  tags: ["drag-and-drop", "implemented:@didact/core/MatchingExercise", "implemented:@didact/core/SortExercise", "implemented:@didact/core/CategorizeExercise"],
} as const satisfies ComponentManifest;

export const hintRevealManifest = {
  id: "didact.hint-reveal",
  name: "Hint / Reveal",
  description: "Offers progressive learner-controlled support without immediately exposing the answer.",
  role: "interaction",
  families: ["feedback-scaffolding"],
  facets: { subjects: ["general"], representations: ["text"], learnerActions: ["inspect"], purposes: ["scaffold"], contexts: ["self-paced", "classroom"] },
  lifecycle: { availability: "available", maturity: "stable" },
  version: { schema: schemaVersion, component: "1.0.0" },
  variants: [{ id: "hint", name: "Progressive hint" }, { id: "reveal", name: "Reveal" }],
  authoring: { version: schemaVersion, fields: [
    textField("label", "Label", "Purposeful control label."),
    listField("hints", "Hints", "Ordered support from least to most explicit."),
  ], supportsLocalization: true },
  capabilities: ["response:reveal-request", "result:ungraded", "feedback:on-demand", "feedback:informative"],
  evidence: [evidence(
    "didact-research-hints",
    "not-evaluated",
    "Didact education-component research synthesis",
    "The reviewed evidence does not evaluate progressive hints independently.",
    "Hints should cue or explain rather than praise or merely expose correctness.",
  )],
  accessibility: accessibility(
    "Controls are buttons in document order; expanded state and new content are exposed; no empty content region is reserved before reveal.",
    ["1.3.1", "2.1.1", "4.1.2", "4.1.3"],
  ),
  mappings: {
    qti: qti("none", "none", "A hint is supporting content, not a response interaction."),
    xapi: { verbs: ["requested"], notes: "Hint use is a generic event, not an interactionType." },
  },
  optionalDependencies: [],
  tags: ["progressive-disclosure", "implemented:@didact/core/HintReveal"],
} as const satisfies ComponentManifest;

export const rubricManifest = {
  id: "didact.rubric",
  name: "Rubric",
  description: "Makes criteria and performance levels explicit for assessment or self-assessment.",
  role: "interaction",
  families: ["assessment", "progress-mastery"],
  facets: { subjects: ["general"], representations: ["text", "procedural"], learnerActions: ["inspect", "interpret", "respond"], purposes: ["assess", "reflect"], contexts: ["self-paced", "classroom", "corporate", "instructor-led"] },
  lifecycle: { availability: "available", maturity: "stable" },
  version: { schema: schemaVersion, component: "1.0.0" },
  variants: [{ id: "analytic", name: "Analytic" }, { id: "self-assessment", name: "Self-assessment" }],
  authoring: { version: schemaVersion, fields: [
    listField("criteria", "Criteria", "Criteria with stable identifiers."),
    listField("levels", "Levels", "Ordered performance descriptors."),
    objectField("scoring", "Scoring", "Optional weights and point values.", false),
  ], supportsLocalization: true },
  capabilities: ["response:criterion-level", "response:reflection", "result:scored", "result:partial-credit", "result:mastery", "feedback:author-reviewed"],
  evidence: [evidence(
    "didact-research-rubric",
    "not-evaluated",
    "Didact education-component research synthesis",
    "Rubric effectiveness was not evaluated by the current source set.",
    "No standalone learning-effect claim is made.",
  )],
  accessibility: accessibility(
    "Criteria and levels retain table or fieldset relationships; every level has text and all selections are keyboard operable.",
    ["1.3.1", "2.1.1", "3.3.2", "4.1.2"],
  ),
  mappings: {
    qti: qti("none", "none", "QTI has no dedicated rubric response interaction."),
    xapi: xapi("performance", "Approximate only when recording performance against named criteria."),
  },
  optionalDependencies: [],
  tags: ["self-assessment", "implemented:@didact/core/Rubric"],
} as const satisfies ComponentManifest;

export const glossaryManifest = {
  id: "didact.glossary",
  name: "Glossary / Term",
  description: "Provides contextual definitions and a browsable collection of course terminology.",
  role: "display",
  families: ["knowledge-representation"],
  facets: { subjects: ["general", "language"], representations: ["text"], learnerActions: ["inspect", "respond"], purposes: ["present", "retrieve", "scaffold"], contexts: ["self-paced", "classroom"] },
  lifecycle: { availability: "available", maturity: "stable" },
  version: { schema: schemaVersion, component: "1.0.0" },
  variants: [{ id: "glossary", name: "Glossary" }, { id: "term", name: "Inline term" }],
  authoring: { version: schemaVersion, fields: [
    listField("entries", "Entries", "Terms, definitions and stable identifiers."),
    textField("label", "Accessible label", "Label for the glossary or inline definition.", false),
  ], supportsLocalization: true },
  capabilities: ["response:none", "result:none", "feedback:on-demand", "content:definition"],
  evidence: [evidence(
    "didact-research-glossary",
    "not-evaluated",
    "Didact education-component research synthesis",
    "The current evidence set does not establish passive glossary lookup as an effective learning technique.",
    "Use it as reference support; pair with retrieval when active recall is the objective.",
  )],
  accessibility: accessibility(
    "Inline terms are focusable without replacing their semantic text; definitions work without hover and glossary navigation is keyboard operable.",
    ["1.3.1", "2.1.1", "2.4.6", "4.1.2"],
  ),
  mappings: {
    qti: qti("none", "none", "Definitions are supporting content, not response interactions."),
    xapi: { verbs: ["experienced"], notes: "Definition views may be generic activity events; no interactionType applies." },
  },
  optionalDependencies: [],
  tags: ["reference", "implemented:@didact/core/Glossary"],
} as const satisfies ComponentManifest;

export const progressManifest = {
  id: "didact.progress",
  name: "Progress Indicator / Overview",
  description: "Represents completion or mastery progress for one item or a collection.",
  role: "display",
  families: ["progress-mastery"],
  facets: { subjects: ["general"], representations: ["numeric", "data-series"], learnerActions: ["inspect", "interpret"], purposes: ["present", "orchestrate"], contexts: ["self-paced", "classroom", "corporate"] },
  lifecycle: { availability: "available", maturity: "stable" },
  version: { schema: schemaVersion, component: "1.0.0" },
  variants: [{ id: "indicator", name: "Indicator" }, { id: "overview", name: "Overview" }],
  authoring: { version: schemaVersion, fields: [
    selectField("kind", "Kind", "Whether the tracked item is a lesson or a skill.", ["lesson", "skill"]),
    objectField("value", "Value", "Current value and optional maximum."),
    listField("entries", "Entries", "Optional overview rows.", false),
  ], supportsLocalization: true },
  capabilities: ["response:none", "result:none", "display:completion", "display:mastery"],
  evidence: [evidence(
    "didact-research-progress",
    "not-evaluated",
    "Didact education-component research synthesis",
    "Progress visualization was not evaluated as an independent learning technique.",
    "It reports state supplied by the consumer and must not infer mastery from completion.",
  )],
  accessibility: accessibility(
    "The numeric value and whether it means completion or mastery are exposed as text; visual badges are not required to understand state.",
    ["1.3.1", "1.4.1", "4.1.2"],
    { keyboard: "not-applicable" },
  ),
  mappings: {
    qti: qti("none", "none", "Progress is outcome display, not a QTI response interaction."),
    xapi: { verbs: ["progressed"], notes: "Reporting belongs to an adapter; there is no xAPI interactionType for this display." },
  },
  optionalDependencies: [],
  tags: ["completion", "mastery", "implemented:@didact/core/ProgressIndicator"],
} as const satisfies ComponentManifest;

export const masteryBadgeManifest = {
  id: "didact.mastery-badge",
  name: "Mastery Badge",
  description: "Displays an externally determined mastery level without calculating or gamifying it.",
  role: "display",
  families: ["progress-mastery"],
  facets: { subjects: ["general"], representations: ["text", "numeric"], learnerActions: ["inspect", "interpret"], purposes: ["present", "reflect"], contexts: ["self-paced", "classroom", "corporate"] },
  lifecycle: { availability: "available", maturity: "stable" },
  version: { schema: schemaVersion, component: "1.0.0" },
  variants: [{ id: "mastery-level", name: "Mastery level" }],
  authoring: { version: schemaVersion, fields: [
    selectField("level", "Level", "Mastery tier supplied by the consumer.", ["beginner", "intermediate", "advanced"]),
    numberField("percent", "Percent", "Optional mastery percentage from 0 to 100.", { min: 0, max: 100 }),
    booleanField("interactive", "Interactive", "Whether the badge can reveal its detail."),
    textField("label", "Label", "Localized textual state."),
  ], supportsLocalization: true },
  capabilities: ["response:none", "result:none", "display:mastery"],
  evidence: [evidence(
    "didact-research-mastery-badge",
    "not-evaluated",
    "Didact education-component research synthesis",
    "A mastery badge has no independent learning-effect claim in the reviewed evidence.",
    "It displays consumer-owned state and must not substitute points or praise for informative feedback.",
  )],
  accessibility: accessibility(
    "Every state has a textual name and does not rely on color or icon shape alone.",
    ["1.3.1", "1.4.1", "1.4.3"],
    { keyboard: "not-applicable" },
  ),
  mappings: {
    qti: qti("none", "none", "Mastery display is not a QTI interaction."),
    xapi: { verbs: ["mastered"], notes: "A future adapter may report the underlying outcome; the badge emits no statement itself." },
  },
  optionalDependencies: [],
  tags: ["mastery", "implemented:@didact/core/MasteryBadge"],
} as const satisfies ComponentManifest;

export const timelineManifest = {
  id: "didact.timeline",
  name: "Timeline / Steps",
  description: "Presents chronological events or ordered procedural steps with explicit status.",
  role: "display",
  families: ["sequence-procedure", "knowledge-representation"],
  facets: { subjects: ["general", "science", "business", "humanities"], representations: ["temporal", "procedural"], learnerActions: ["inspect", "interpret"], purposes: ["present", "explore"], contexts: ["self-paced", "classroom", "corporate", "instructor-led"] },
  lifecycle: { availability: "available", maturity: "stable" },
  version: { schema: schemaVersion, component: "1.0.0" },
  variants: [{ id: "chronology", name: "Chronology" }, { id: "steps", name: "Steps" }],
  authoring: { version: schemaVersion, fields: [
    listField("steps", "Steps", "Ordered events or procedural steps."),
    textField("label", "Label", "Accessible name for the sequence."),
  ], supportsLocalization: true },
  capabilities: ["response:none", "result:none", "display:sequence", "display:status"],
  evidence: [evidence(
    "didact-research-timeline",
    "not-evaluated",
    "Didact education-component research synthesis",
    "Timeline and step display were not evaluated as independent learning techniques.",
    "Use them to represent structure, not as evidence that a procedure has been learned.",
  )],
  accessibility: accessibility(
    "Semantic list order matches visual order; dates, status and connectors have textual equivalents.",
    ["1.3.1", "1.4.1", "1.4.10"],
    { keyboard: "not-applicable" },
  ),
  mappings: {
    qti: qti("none", "none", "Timeline and steps are content structures, not response interactions."),
    xapi: { verbs: ["experienced"], notes: "Viewing a sequence may be generic activity reporting; no interactionType applies." },
  },
  optionalDependencies: [],
  tags: ["sequence", "procedure", "implemented:@didact/core/Timeline"],
} as const satisfies ComponentManifest;

export const availableManifests = [
  flashcardManifest,
  quizManifest,
  matchingExercisesManifest,
  glossaryManifest,
  hintRevealManifest,
  progressManifest,
  masteryBadgeManifest,
  rubricManifest,
  timelineManifest,
  ...learningWaveManifests,
  ...diverseWaveManifests,
  interactiveMediaManifest,
  dataExplorerManifest,
  branchingScenarioManifest,
  simulationLabManifest,
  codeExerciseManifest,
] as const satisfies readonly ComponentManifest[];
