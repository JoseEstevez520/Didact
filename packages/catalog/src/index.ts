export type { ComponentManifest } from "@didact/schema";
export type { CatalogCollection, ComponentFacets } from "@didact/schema";

export {
  availableCollections,
  corporateTrainingCollection,
  getAvailableCollection,
  languageLearningCollection,
  learningEssentialsCollection,
  mathematicsDataCollection,
  technicalTrainingCollection,
  visualSpatialCollection,
} from "./collections";

export {
  availableManifests,
  flashcardManifest,
  glossaryManifest,
  hintRevealManifest,
  matchingExercisesManifest,
  masteryBadgeManifest,
  progressManifest,
  quizManifest,
  rubricManifest,
  timelineManifest,
} from "./manifests/available";
export {
  completionProblemManifest,
  learningWaveManifests,
  plannedManifests,
  practiceSetManifest,
  retrievalPracticeSessionManifest,
  selfExplanationPromptManifest,
  workedExampleManifest,
} from "./manifests/planned";
export { branchingScenarioManifest, codeExerciseManifest, dataExplorerManifest, interactiveMediaManifest, simulationLabManifest } from "./manifests/experience-foundations";
export {
  corporateProcedureVideoFixture,
  interactiveMediaFixtures,
  languageComprehensionAudioFixture,
} from "./fixtures/interactive-media";
export {
  dataCoordinateFixtures,
  linearFunctionFixture,
  monthlyRevenueFixture,
} from "./fixtures/data-coordinate";
export { decisionGraphFixtures, safetyProcedureFixture, salesConversationFixture } from "./fixtures/decision-graph";
export { inventorySimulationFixture, motionSimulationFixture, simulationFixtures } from "./fixtures/simulation";
export { artifactWorkspaceFixtures, javascriptArtifactFixture, policyArtifactFixture } from "./fixtures/artifact-execution";
export {
  diverseWaveManifests,
  hotspotManifest,
  labelDiagramManifest,
  conceptMapManifest,
  drawingResponseManifest,
  equationWorkbenchManifest,
  evidenceAnnotationManifest,
  measurementLabManifest,
  numericQuestionManifest,
  wordBankManifest,
} from "./manifests/diverse-wave";
export { availableTypes, catalog, designCatalog, getAvailableManifest, getDesignManifest } from "./registry";
