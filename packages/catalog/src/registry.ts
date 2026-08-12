import type { ComponentManifest } from "@didact/schema";
import { availableManifests } from "./manifests/available";
import { plannedManifests } from "./manifests/planned";

/** Public production catalog. Draft/planned manifests are deliberately excluded. */
export const catalog = availableManifests;

/** Full design inventory for documentation, governance and roadmap tooling. */
export const designCatalog = [...availableManifests, ...plannedManifests] as const;

/**
 * The available educational types in ROADMAP.md. A manifest can describe several closely related public
 * types (for example, the quiz family), while supporting subcomponents such as Term do not inflate
 * the count. `exportName` is the owning public @didact/core export for each type.
 */
export const availableTypes = [
  { id: "didact.flashcard", manifestId: "didact.flashcard", exportName: "Flashcard" },
  { id: "didact.matching", manifestId: "didact.matching-exercises", exportName: "MatchingExercise" },
  { id: "didact.sort", manifestId: "didact.matching-exercises", exportName: "SortExercise" },
  { id: "didact.categorize", manifestId: "didact.matching-exercises", exportName: "CategorizeExercise" },
  { id: "didact.quiz.single-choice", manifestId: "didact.quiz", exportName: "SingleChoiceQuiz" },
  { id: "didact.quiz.multi-select", manifestId: "didact.quiz", exportName: "MultiSelectQuiz" },
  { id: "didact.quiz.true-false", manifestId: "didact.quiz", exportName: "TrueFalseQuiz" },
  { id: "didact.quiz.fill-in-the-blank", manifestId: "didact.quiz", exportName: "FillInTheBlankQuiz" },
  { id: "didact.quiz.short-answer", manifestId: "didact.quiz", exportName: "ShortAnswerQuiz" },
  { id: "didact.glossary-term", manifestId: "didact.glossary", exportName: "Glossary" },
  { id: "didact.hint-reveal", manifestId: "didact.hint-reveal", exportName: "HintReveal" },
  { id: "didact.progress", manifestId: "didact.progress", exportName: "ProgressIndicator" },
  { id: "didact.mastery-badge", manifestId: "didact.mastery-badge", exportName: "MasteryBadge" },
  { id: "didact.rubric", manifestId: "didact.rubric", exportName: "Rubric" },
  { id: "didact.timeline-steps", manifestId: "didact.timeline", exportName: "Timeline" },
  { id: "didact.practice-set", manifestId: "didact.practice-set", exportName: "PracticeSet" },
  { id: "didact.retrieval-practice-session", manifestId: "didact.retrieval-practice-session", exportName: "RetrievalPracticeSession" },
  { id: "didact.self-explanation-prompt", manifestId: "didact.self-explanation-prompt", exportName: "SelfExplanationPrompt" },
  { id: "didact.worked-example", manifestId: "didact.worked-example", exportName: "WorkedExample" },
  { id: "didact.completion-problem", manifestId: "didact.completion-problem", exportName: "CompletionProblem" },
  { id: "didact.numeric-question", manifestId: "didact.numeric-question", exportName: "NumericQuestion" },
  { id: "didact.word-bank", manifestId: "didact.word-bank", exportName: "WordBank" },
  { id: "didact.hotspot", manifestId: "didact.hotspot", exportName: "Hotspot" },
  { id: "didact.interactive-media", manifestId: "didact.interactive-media", exportName: "InteractiveMedia" },
  { id: "didact.data-explorer", manifestId: "didact.data-explorer", exportName: "DataExplorer" },
  { id: "didact.branching-scenario", manifestId: "didact.branching-scenario", exportName: "BranchingScenario" },
  { id: "didact.simulation-lab", manifestId: "didact.simulation-lab", exportName: "SimulationLab" },
  { id: "didact.code-exercise", manifestId: "didact.code-exercise", exportName: "CodeExercise" },
  { id: "didact.label-diagram", manifestId: "didact.label-diagram", exportName: "LabelDiagram" },
  { id: "didact.concept-map", manifestId: "didact.concept-map", exportName: "ConceptMap" },
  { id: "didact.drawing-response", manifestId: "didact.drawing-response", exportName: "DrawingResponse" },
  { id: "didact.equation-workbench", manifestId: "didact.equation-workbench", exportName: "EquationWorkbench" },
  { id: "didact.evidence-annotation", manifestId: "didact.evidence-annotation", exportName: "EvidenceAnnotation" },
  { id: "didact.measurement-lab", manifestId: "didact.measurement-lab", exportName: "MeasurementLab" },
] as const;

export function getAvailableManifest(id: ComponentManifest["id"]): ComponentManifest | undefined {
  return catalog.find((manifest) => manifest.id === id);
}

export function getDesignManifest(id: ComponentManifest["id"]): ComponentManifest | undefined {
  return designCatalog.find((manifest) => manifest.id === id);
}
