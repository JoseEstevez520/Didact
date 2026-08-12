/**
 * @didact/core
 *
 * Entry point for layer 3 (education molecules) of the 3-layer architecture described in
 * `specs/education-components/design.md` §2:
 *
 *   3. Education molecules  — Flashcard, MatchingExercise, QuizItem,
 *                              Glossary, Hint, Timeline, Rubric, MasteryBadge, code exercise
 *                              (RF-11, Sandpack), QTI graphical/numeric interactions
 *                              (research.md §9.2) — broad scope organized in complexity waves,
 *                              see this package's README.md and research/decisions.md
 *   2. Styled layer         — Tailwind v4 + `cva` (class-variance-authority) over
 *                              `@didact/theme`'s tokens (CSS custom properties + `@theme` block)
 *   1. Accessible primitives — accessible behavior with no styling of its own (Radix UI by
 *                              default, see research.md P2; Base UI watched as an alternative)
 *
 * IMPORTANT: the real implementation of this layer's components is Phase 4 of `ROADMAP.md`
 * (monorepo root), after the Phase 3 scaffold this file lives in. This package exists today only
 * to fix the package/name contract and the entry point that will consume the registry mechanism
 * (`@didact/registry`) and Didact's registry-based distribution model (`requirements.md` RF-15).
 *
 * Decisions that ARE closed for when this layer gets implemented:
 * - Tailwind v4 IS the core's styling layer — a product decision by Jose (2026-08-11, see
 *   `research/decisions.md` D1), even though `research.md` P3 concluded (and it's still true)
 *   that Didact's registry mechanism doesn't technically require it. Styled with Tailwind +
 *   `cva` over `@didact/theme`'s tokens; see that package for the detail of the two levels
 *   (plain CSS custom properties + `@theme` block).
 * - Broad scope, not a "minimal v1": QTI's graphical/image-based and numeric/Likert interactions
 *   (research.md §9.2) and the code exercise (RF-11, backed by Sandpack for execution) ARE in
 *   scope, as higher-complexity waves — not dropped. See `research/decisions.md` D2 and
 *   `packages/validators/pedagogy/qti-mapping.json` (`scope: "planned"` on the interactions
 *   previously marked as out of v1).
 * - Any non-copied external dependency (e.g. the primitives layer, or Tailwind/cva themselves) is
 *   pinned to an exact version + drift test (RNF-5, see `@didact/validators/drift`).
 * - Every component must be describable with complete or incomplete props without assuming they
 *   all arrive at once (RNF-4, designed for streaming consumption).
 *
 * Phase 3 exit criterion (ROADMAP.md): `MasteryBadge` below is the trivial component that proves
 * this scaffold works end to end (build, test, Storybook, registry entry, copy mechanism) before
 * Phase 4 builds the rest of design.md §5's inventory. It is intentionally simple -- see
 * `src/components/mastery-badge.tsx` for why it needs no layer-1 primitive.
 */

export {
  MasteryBadge,
  type MasteryBadgeProps,
  type MasteryLevel,
} from "./components/mastery-badge.js";

export {
  Flashcard,
  type FlashcardProps,
  type FlashcardStatus,
} from "./components/flashcard.js";

export {
  SingleChoiceQuiz,
  type SingleChoiceQuizProps,
  MultiSelectQuiz,
  type MultiSelectQuizProps,
  TrueFalseQuiz,
  type TrueFalseQuizProps,
  FillInTheBlankQuiz,
  type FillInTheBlankQuizProps,
  ShortAnswerQuiz,
  type ShortAnswerQuizProps,
  type QuizOption,
  type QuizCorrectness,
} from "./components/quiz-item.js";

export {
  Timeline,
  type TimelineProps,
  type TimelineStep,
  type TimelineStepStatus,
  type TimelineLabels,
} from "./components/timeline.js";

export {
  MatchingExercise,
  type MatchingExerciseProps,
  SortExercise,
  type SortExerciseProps,
  CategorizeExercise,
  type CategorizeExerciseProps,
  type ExerciseChoice,
  type ExerciseAssignments,
  type ExerciseSubmission,
} from "./components/matching-exercises.js";

export {
  Glossary,
  type GlossaryProps,
  type GlossaryEntry,
  Term,
  type TermProps,
  type TermLabels,
} from "./components/glossary.js";

export {
  ProgressIndicator,
  type ProgressIndicatorProps,
  ProgressOverview,
  type ProgressOverviewProps,
  type ProgressEntry,
  type ProgressKind,
  type ProgressLabels,
} from "./components/progress-indicator.js";

export {
  Reveal,
  type RevealProps,
  Hint,
  HintReveal,
  type HintProps,
  type HintRevealLabels,
} from "./components/hint-reveal.js";

export {
  Rubric,
  type RubricProps,
  type RubricCriterion,
  type RubricLevel,
  type RubricValue,
  type RubricLabels,
} from "./components/rubric.js";

export {
  PracticeSet,
  type PracticeSetProps,
  type PracticeSetItem,
  type PracticeSetAttempt,
  type PracticeSetPhase,
  type PracticeSetLabels,
} from "./components/practice-set.js";

export {
  RetrievalPracticeSession,
  type RetrievalPracticeSessionProps,
  type RetrievalPracticeItem,
  type RetrievalPracticeReview,
  type RetrievalPracticePersistence,
  type RetrievalPracticeLabels,
} from "./components/retrieval-practice-session.js";

export {
  SelfExplanationPrompt,
  type SelfExplanationPromptProps,
  type SelfExplanationPromptLabels,
  WorkedExample,
  type WorkedExampleProps,
  type WorkedExampleStep,
  type WorkedExampleLabels,
  CompletionProblem,
  type CompletionProblemProps,
  type CompletionProblemStep,
  type CompletionWorkedStep,
  type CompletionMissingStep,
  type CompletionProblemValue,
  type CompletionProblemResult,
  type CompletionStepStatus,
  type CompletionProblemLabels,
} from "./components/generative-learning.js";

export {
  NumericQuestion,
  type NumericQuestionProps,
  type NumericQuestionRule,
  type NumericTolerance,
  type NumericQuestionUnit,
  type NumericQuestionNumberFormat,
  type NumericQuestionStatus,
  type NumericQuestionReason,
  type NumericQuestionResult,
  type NumericQuestionLabels,
  type NumericQuestionInputContext,
} from "./components/numeric-question.js";

export {
  WordBank,
  type WordBankProps,
  type WordBankOption,
  type WordBankGap,
  type WordBankValue,
  type WordBankGapStatus,
  type WordBankResultStatus,
  type WordBankResult,
  type WordBankLabels,
} from "./components/word-bank.js";

export {
  Hotspot,
  type HotspotProps,
  type HotspotPoint,
  type HotspotRegion,
  type HotspotValue,
  type HotspotResult,
  type HotspotGrading,
  type HotspotSubmitPayload,
  type HotspotLabels,
} from "./components/hotspot.js";

export {
  MediaPlayer,
  type MediaPlayerProps,
  type MediaPlayerTrack,
  type MediaPlayerLabels,
  type MediaPlayerController,
} from "./components/media-player.js";

export {
  InteractiveMedia,
  type InteractiveMediaProps,
  type InteractiveMediaLabels,
  type InteractiveMediaPlayerController,
  type InteractiveMediaPlayerContext,
  type InteractiveMediaActivityContext,
} from "./components/interactive-media.js";

export {
  DataExplorer,
  type DataExplorerProps,
  type DataExplorerLabels,
} from "./components/data-explorer.js";

export {
  BranchingScenario,
  type BranchingScenarioProps,
  type BranchingScenarioLabels,
} from "./components/branching-scenario.js";

export {
  SimulationLab,
  type SimulationLabProps,
  type SimulationLabLabels,
  type SimulationRuntimeContext,
  type SimulationActionResult,
} from "./components/simulation-lab.js";

export {
  CodeExercise,
  type CodeExerciseProps,
  type CodeExerciseLabels,
} from "./components/code-exercise.js";

export {
  LabelDiagram,
  type LabelDiagramProps,
  type LabelDiagramTarget,
  type LabelDiagramItem,
  type LabelDiagramValue,
  type LabelDiagramResult,
  type LabelDiagramResultStatus,
  type LabelDiagramTargetStatus,
  type LabelDiagramLabels,
} from "./components/label-diagram.js";

export {
  ConceptMap,
  type ConceptMapProps,
  type ConceptMapDefinition,
  type ConceptMapNode,
  type ConceptMapRelation,
  type ConceptMapState,
  type ConceptMapEvent,
  type ConceptMapEvaluationResult,
  type ConceptMapEvaluationStatus,
  type ConceptMapLabels,
  type ConceptMapText,
} from "./components/concept-map.js";

export {
  DrawingResponse,
  type DrawingResponseProps,
  type DrawingResponseDefinition,
  type DrawingResponseState,
  type DrawingStroke,
  type DrawingPoint,
  type DrawingTool,
  type DrawingEvaluation,
  type DrawingResponseResult,
  type DrawingResponseLabels,
} from "./components/drawing-response.js";

export {
  EquationWorkbench,
  type EquationWorkbenchProps,
  type EquationWorkbenchDefinition,
  type EquationWorkbenchState,
  type EquationStep,
  type EquationWorkbenchEvaluation,
  type EquationWorkbenchResult,
  type EquationRendererContext,
  type EquationWorkbenchLabels,
} from "./components/equation-workbench.js";

export {
  EvidenceAnnotation,
  type EvidenceAnnotationProps,
  type EvidenceAnnotationDefinition,
  type EvidenceAnnotationState,
  type EvidenceAnnotationItem,
  type EvidenceAnnotationText,
  type EvidenceSegment,
  type EvidenceCategory,
  type EvidenceClaim,
  type EvidenceAnnotationEvaluation,
  type EvidenceAnnotationResult,
  type EvidenceAnnotationLabels,
} from "./components/evidence-annotation.js";

export {
  MeasurementLab,
  type MeasurementLabProps,
  type MeasurementLabDefinition,
  type MeasurementLabState,
  type MeasurementInstrumentKind,
  type MeasurementLabEvaluation,
  type MeasurementLabResult,
  type MeasurementLabStatus,
  type MeasurementLabLabels,
} from "./components/measurement-lab.js";
