export {
  COMPONENT_FAMILIES,
  COMPONENT_ROLES,
  LEARNER_ACTION_FACETS,
  LEARNING_CONTEXT_FACETS,
  LEARNING_PURPOSE_FACETS,
  REPRESENTATION_FACETS,
  SUBJECT_FACETS,
  isComponentFamily,
  isComponentRole,
  isLearnerActionFacet,
  isLearningContextFacet,
  isLearningPurposeFacet,
  isRepresentationFacet,
  isSubjectFacet,
} from "./taxonomy";

export type {
  ComponentFamily,
  ComponentRole,
  LearnerActionFacet,
  LearningContextFacet,
  LearningPurposeFacet,
  RepresentationFacet,
  SubjectFacet,
} from "./taxonomy";

export type {
  AccessibilityMetadata,
  AuthoringCondition,
  AuthoringField,
  AuthoringOption,
  AuthoringSchema,
  AuthoringValidationOptions,
  CatalogLifecycle,
  CatalogCollection,
  CatalogCollectionKind,
  CatalogCollectionKit,
  CatalogCollectionStatus,
  CollectionItem,
  CollectionItemRole,
  ComponentFacets,
  ComponentManifest,
  ComponentVariant,
  ConditionOperator,
  ConditionalRequiredness,
  EvidenceReference,
  EvidenceStrength,
  Feedback,
  InteroperabilityMappings,
  LocalizedText,
  MigrationMetadata,
  OptionalDependency,
  QtiMapping,
  Requiredness,
  RequirednessLevel,
  Response,
  ResponseStatus,
  Result,
  ValidationIssue,
  ValidationResult,
  VersionMetadata,
  XapiMapping,
} from "./types";

export {
  validateAuthoringSchema,
  validateAuthoringData,
  validateCatalogCollection,
  validateComponentFacets,
  validateComponentManifest,
  validateResponse,
  validateResult,
} from "./validation";

export {
  INTERACTIVE_MEDIA_SCHEMA_VERSION,
  validateInteractiveMediaDefinition,
} from "./interactive-media";

export {
  ARTIFACT_EXECUTION_SCHEMA_VERSION,
  createArtifactWorkspaceState,
  validateArtifactWorkspaceDefinition,
  validateArtifactWorkspaceState,
} from "./artifact-execution";

export type {
  ArtifactEvaluationResult,
  ArtifactExecutionMode,
  ArtifactExecutionRequest,
  ArtifactExecutionResponse,
  ArtifactFileDefinition,
  ArtifactKind,
  ArtifactOutputEntry,
  ArtifactWorkspaceDefinition,
  ArtifactWorkspaceEvent,
  ArtifactWorkspaceState,
} from "./artifact-execution";

export {
  DECISION_GRAPH_SCHEMA_VERSION,
  applyDecisionEffects,
  evaluateDecisionCondition,
  validateDecisionGraphDefinition,
} from "./decision-graph";

export {
  SIMULATION_SCHEMA_VERSION,
  createSimulationInitialState,
  validateSimulationDefinition,
  validateSimulationState,
} from "./simulation";

export type {
  SimulationActionDefinition,
  SimulationClock,
  SimulationDefinition,
  SimulationEvent,
  SimulationParameter,
  SimulationResult,
  SimulationSnapshot,
  SimulationState,
  SimulationStateVariable,
  SimulationValue,
  SimulationValues,
} from "./simulation";

export type {
  DecisionChoice,
  DecisionCondition,
  DecisionEffect,
  DecisionGraphDefinition,
  DecisionGraphEvent,
  DecisionGraphResult,
  DecisionGraphState,
  DecisionHistoryEntry,
  DecisionNode,
  DecisionOutcome,
  DecisionValue,
  DecisionVariables,
} from "./decision-graph";

export {
  DATA_COORDINATE_SCHEMA_VERSION,
  validateDataCoordinateDefinition,
  validateDataCoordinateResult,
  validateDataCoordinateState,
} from "./data-coordinate";

export type {
  DataCoordinateAxis,
  DataCoordinateDatumReference,
  DataCoordinateDefinition,
  DataCoordinateDomain,
  DataCoordinateEvent,
  DataCoordinateFunctionSource,
  DataCoordinateInteraction,
  DataCoordinatePoint,
  DataCoordinatePointEditability,
  DataCoordinatePointOverride,
  DataCoordinatePointsSource,
  DataCoordinateResult,
  DataCoordinateScale,
  DataCoordinateSeries,
  DataCoordinateSeriesKind,
  DataCoordinateSeriesSource,
  DataCoordinateState,
  DataCoordinateTable,
  DataCoordinateValidationOptions,
  DataCoordinateValue,
  DataCoordinateViewport,
  LinearDomain,
  TimeDomain,
} from "./data-coordinate";

export type {
  EmbeddedLearningActivity,
  InteractiveMediaAsset,
  InteractiveMediaCheckpoint,
  InteractiveMediaCompletionPolicy,
  InteractiveMediaDefinition,
  InteractiveMediaKind,
  InteractiveMediaRuntimeState,
  InteractiveMediaTrack,
  InteractiveMediaTrackKind,
  InteractiveMediaTranscriptCue,
  InteractiveMediaValidationOptions,
  SerializablePrimitive,
  SerializableValue,
} from "./interactive-media";

export {
  EQUATION_WORKBENCH_SCHEMA_VERSION,
  validateEquationWorkbenchDefinition,
  validateEquationWorkbenchState,
  validateEquationWorkbenchResult,
} from "./equation-workbench";
export type {
  EquationExpression,
  EquationStepPolicy,
  EquationWorkbenchDefinition,
  EquationWorkbenchStep,
  EquationWorkbenchState,
  EquationWorkbenchEvent,
  EquationWorkbenchResult,
  EquationWorkbenchValidationOptions,
} from "./equation-workbench";

export {
  EVIDENCE_ANNOTATION_SCHEMA_VERSION,
  validateEvidenceAnnotationDefinition,
  validateEvidenceAnnotationState,
  validateEvidenceAnnotationResult,
} from "./evidence-annotation";
export type {
  EvidenceDocument,
  EvidenceSpan,
  EvidenceLabelDefinition,
  EvidenceClaimDefinition,
  EvidenceAnnotationDefinition,
  LearnerEvidenceAnnotation,
  ClaimEvidenceRelation,
  EvidenceAnnotationState,
  EvidenceAnnotationEvent,
  EvidenceAnnotationResult,
  EvidenceAnnotationValidationOptions,
} from "./evidence-annotation";

export {
  MEASUREMENT_LAB_SCHEMA_VERSION,
  validateMeasurementLabDefinition,
  validateMeasurementLabState,
  validateMeasurementLabResult,
} from "./measurement-lab";
export type {
  MeasurementInstrumentKind,
  MeasurementUnit,
  MeasurementScale,
  MeasurementTarget,
  MeasurementLabDefinition,
  MeasurementLabState,
  MeasurementLabEvent,
  MeasurementLabResult,
  MeasurementLabValidationOptions,
} from "./measurement-lab";
