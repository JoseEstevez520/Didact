import type { CatalogCollection } from "@didact/schema";

const version = "1.0.0";

export const learningEssentialsCollection = {
  id: "didact.collection.learning-essentials",
  version,
  slug: "learning-essentials",
  title: "Learning Essentials",
  description: "A compact foundation for questions, practice, scaffolding, feedback and progress in general online courses.",
  kind: "foundation",
  status: "available",
  facets: { subjects: ["general"], purposes: ["practice", "assess", "scaffold"] },
  items: [
    { manifestId: "didact.quiz", typeId: "didact.quiz.single-choice", role: "required", reason: "Provides the most common selected-response activity." },
    { manifestId: "didact.flashcard", role: "required", reason: "Adds a minimal active-recall pattern." },
    { manifestId: "didact.hint-reveal", role: "recommended", reason: "Provides progressive help without exposing the answer immediately." },
    { manifestId: "didact.practice-set", role: "recommended", reason: "Composes isolated activities into a bounded practice session." },
    { manifestId: "didact.progress", role: "optional", reason: "Communicates course and skill progress when the consumer tracks it." },
  ],
  kit: { name: "learning-essentials", includeRoles: ["required", "recommended"] },
  tags: ["starter", "general-purpose"],
} as const satisfies CatalogCollection;

export const mathematicsDataCollection = {
  id: "didact.collection.mathematics-data",
  version,
  slug: "mathematics-data",
  title: "Mathematics & Data",
  description: "Quantitative responses and structured reasoning for mathematics, science, statistics and business data.",
  kind: "subject",
  status: "available",
  facets: { subjects: ["mathematics", "data"], representations: ["numeric"] },
  items: [
    { manifestId: "didact.data-explorer", role: "required", reason: "Explores functions and data series through synchronized graph and table views." },
    { manifestId: "didact.simulation-lab", role: "recommended", reason: "Explores quantitative systems through adjustable parameters, observables and deterministic steps." },
    { manifestId: "didact.drawing-response", role: "optional", reason: "Captures geometric constructions and visual reasoning as structured strokes." },
    { manifestId: "didact.equation-workbench", role: "required", reason: "Captures symbolic transformations and their reasoning without assuming string equivalence." },
    { manifestId: "didact.measurement-lab", role: "recommended", reason: "Practises scale, unit and precision interpretation through accessible instruments." },
    { manifestId: "didact.numeric-question", role: "required", reason: "Captures values, ranges, tolerance and units." },
    { manifestId: "didact.worked-example", role: "recommended", reason: "Presents a complete quantitative process before independent work." },
    { manifestId: "didact.completion-problem", role: "recommended", reason: "Lets learners complete selected reasoning steps." },
  ],
  kit: { name: "math-foundations", includeRoles: ["required", "recommended"] },
  tags: ["quantitative", "starter"],
} as const satisfies CatalogCollection;

export const languageLearningCollection = {
  id: "didact.collection.language-learning",
  version,
  slug: "language-learning",
  title: "Language Learning",
  description: "Vocabulary, sentence completion, constructed responses and recall for language courses.",
  kind: "subject",
  status: "available",
  facets: { subjects: ["language"], representations: ["text"] },
  items: [
    { manifestId: "didact.word-bank", role: "required", reason: "Supports inline gap completion with reusable vocabulary." },
    { manifestId: "didact.quiz", typeId: "didact.quiz.short-answer", role: "recommended", reason: "Captures short constructed language responses." },
    { manifestId: "didact.glossary", role: "recommended", reason: "Provides contextual vocabulary and recall prompts." },
    { manifestId: "didact.self-explanation-prompt", role: "recommended", reason: "Prompts learners to explain meaning and grammar choices." },
    { manifestId: "didact.evidence-annotation", role: "recommended", reason: "Supports close reading by classifying and connecting stable source evidence." },
    { manifestId: "didact.retrieval-practice-session", role: "optional", reason: "Adds scheduled constructed recall when persistence is available." },
    { manifestId: "didact.interactive-media", role: "recommended", reason: "Adds listening practice with timed checkpoints and a navigable transcript." },
  ],
  kit: { name: "language-learning", includeRoles: ["required", "recommended"] },
  tags: ["vocabulary", "writing", "starter"],
} as const satisfies CatalogCollection;

export const visualSpatialCollection = {
  id: "didact.collection.visual-spatial",
  version,
  slug: "visual-spatial",
  title: "Visual & Spatial",
  description: "Interactions where location, regions and visual relationships are part of the learning objective.",
  kind: "subject",
  status: "available",
  facets: { representations: ["spatial", "image"], learnerActions: ["select", "manipulate"] },
  items: [
    { manifestId: "didact.hotspot", role: "required", reason: "Provides region and point responses with textual alternatives." },
    { manifestId: "didact.label-diagram", role: "required", reason: "Assigns labels to meaningful visual targets without requiring drag." },
    { manifestId: "didact.drawing-response", role: "recommended", reason: "Supports drawing and annotation while retaining structured response data." },
    { manifestId: "didact.matching-exercises", typeId: "didact.matching", role: "optional", reason: "Supports explicit relationships when spatial placement is not required." },
  ],
  kit: { name: "visual-spatial", includeRoles: ["required"] },
  tags: ["image", "coordinates", "accessible-alternative"],
} as const satisfies CatalogCollection;

export const corporateTrainingCollection = {
  id: "didact.collection.corporate-training",
  version,
  slug: "corporate-training",
  title: "Corporate Training",
  description: "Practice, assessment and progress patterns for onboarding, procedures, skills and compliance courses.",
  kind: "context",
  status: "available",
  facets: { subjects: ["business"], contexts: ["corporate", "onboarding", "compliance"] },
  items: [
    { manifestId: "didact.practice-set", role: "required", reason: "Provides a bounded activity and review flow." },
    { manifestId: "didact.rubric", role: "recommended", reason: "Supports transparent criteria for performance and self-assessment." },
    { manifestId: "didact.progress", role: "recommended", reason: "Represents completion and skill progress without owning persistence." },
    { manifestId: "didact.retrieval-practice-session", role: "optional", reason: "Supports retention after initial training." },
    { manifestId: "didact.mastery-badge", role: "optional", reason: "Displays a consumer-provided mastery state when appropriate." },
    { manifestId: "didact.interactive-media", role: "recommended", reason: "Coordinates procedure videos, transcripts and embedded decisions without owning the media backend." },
    { manifestId: "didact.data-explorer", role: "recommended", reason: "Supports KPI, trend and operational-data exploration without a business-specific fork." },
    { manifestId: "didact.branching-scenario", role: "required", reason: "Practises consequential decisions and procedures through a serializable state graph." },
    { manifestId: "didact.simulation-lab", role: "recommended", reason: "Models operational systems such as inventory without coupling the library to one business domain." },
    { manifestId: "didact.concept-map", role: "optional", reason: "Supports learner-built process and relationship models." },
    { manifestId: "didact.evidence-annotation", role: "recommended", reason: "Connects policy or incident evidence to explicit claims." },
    { manifestId: "didact.measurement-lab", role: "optional", reason: "Rehearses instrument reading in operational and safety training." },
    { manifestId: "didact.code-exercise", role: "optional", reason: "Supports executable SQL, scripting and technical tasks when a sandbox adapter is available." },
  ],
  kit: { name: "corporate-training", includeRoles: ["required", "recommended"] },
  tags: ["onboarding", "compliance", "skills"],
} as const satisfies CatalogCollection;

export const technicalTrainingCollection = {
  id: "didact.collection.technical-training", version, slug: "technical-training", title: "Technical Training",
  description: "Executable practice, data exploration and systems thinking for programming, analytics and technical operations.",
  kind: "subject", status: "available",
  facets: { subjects: ["technical", "data"], contexts: ["self-paced", "corporate", "technical-training"] },
  items: [
    { manifestId: "didact.code-exercise", role: "required", reason: "Provides multi-file editing with injected execution and evaluation." },
    { manifestId: "didact.data-explorer", role: "recommended", reason: "Adds graphical and tabular analysis over a shared state." },
    { manifestId: "didact.simulation-lab", role: "recommended", reason: "Supports controllable system models and operational experimentation." },
    { manifestId: "didact.label-diagram", role: "recommended", reason: "Practises identification on machinery, interfaces and technical diagrams." },
    { manifestId: "didact.drawing-response", role: "recommended", reason: "Captures procedural annotations and constructed technical responses." },
    { manifestId: "didact.equation-workbench", role: "optional", reason: "Supports engineering and scientific symbolic transformations." },
    { manifestId: "didact.measurement-lab", role: "required", reason: "Provides accessible instrument-reading practice with units and resolution." },
    { manifestId: "didact.worked-example", role: "recommended", reason: "Demonstrates a complete technical process before independent work." },
  ],
  kit: { name: "technical-training", includeRoles: ["required", "recommended"] },
  tags: ["programming", "data", "operations", "sandbox"],
} as const satisfies CatalogCollection;

export const availableCollections = [
  learningEssentialsCollection,
  mathematicsDataCollection,
  languageLearningCollection,
  visualSpatialCollection,
  corporateTrainingCollection,
  technicalTrainingCollection,
] as const satisfies readonly CatalogCollection[];

export function getAvailableCollection(idOrSlug: string): CatalogCollection | undefined {
  return availableCollections.find(({ id, slug }) => id === idOrSlug || slug === idOrSlug);
}
