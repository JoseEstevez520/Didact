import type { ComponentManifest } from "@didact/schema";

import {
  accessibility,
  evidence,
  listField,
  numberField,
  objectField,
  qti,
  schemaVersion,
  selectField,
  textField,
  xapi,
} from "../manifest-helpers";

const availableLifecycle = { availability: "available", maturity: "stable" } as const;
const researchSynthesis = "Didact education-component research synthesis";

export const numericQuestionManifest = {
  id: "didact.numeric-question",
  name: "Numeric Question",
  description: "Collects and evaluates a numeric response using explicit tolerance, range, and unit policies.",
  role: "interaction",
  families: ["assessment", "technical-practice"],
  facets: { subjects: ["mathematics", "science", "data", "business"], representations: ["numeric"], learnerActions: ["calculate", "respond"], purposes: ["practice", "assess"], contexts: ["self-paced", "classroom", "corporate", "technical-training"] },
  lifecycle: availableLifecycle,
  version: { schema: schemaVersion, component: "1.0.0" },
  variants: [
    { id: "exact", name: "Exact value" },
    { id: "tolerance", name: "Tolerance" },
    { id: "range", name: "Accepted range" },
    { id: "ungraded", name: "Ungraded numeric response" },
  ],
  authoring: { version: schemaVersion, fields: [
    textField("prompt", "Prompt", "Quantitative question presented to the learner.", true, true),
    objectField("solution", "Solution", "Expected value or accepted range and its comparison policy.", false),
    numberField("absoluteTolerance", "Absolute tolerance", "Maximum absolute distance from the expected value."),
    numberField("relativeTolerance", "Relative tolerance", "Maximum proportional distance from the expected value.", { min: 0 }),
    textField("unit", "Unit", "Optional expected unit."),
    selectField("unitPolicy", "Unit policy", "Whether a unit is hidden, optional, or required.", ["hidden", "optional", "required"]),
    textField("feedback", "Feedback", "Explanatory feedback shown after submission.", false, true),
  ], supportsLocalization: true },
  capabilities: ["response:numeric", "result:scored", "result:ungraded", "feedback:immediate", "feedback:informative"],
  evidence: [evidence(
    "didact-research-numeric-question",
    "not-evaluated",
    researchSynthesis,
    "The reviewed evidence does not establish numeric entry as an independent learning technique.",
    "Its value depends on the task, retrieval demand, checking policy, and feedback.",
  )],
  accessibility: accessibility(
    "The numeric field has an explicit label and input mode; unit requirements, validation, result, and feedback are textual and never color-only.",
    ["1.3.1", "1.4.1", "2.1.1", "3.3.1", "3.3.2", "4.1.3"],
  ),
  mappings: {
    qti: qti("textEntryInteraction", "exact", "Numeric responseDeclaration and responseProcessing carry value, range, and tolerance semantics."),
    xapi: xapi("numeric", "Record the submitted numeric value; unit and checking policy remain extension/context data."),
  },
  optionalDependencies: [],
  tags: ["quantitative", "units", "tolerance", "implemented:@didact/core/NumericQuestion"],
} as const satisfies ComponentManifest;

export const wordBankManifest = {
  id: "didact.word-bank",
  name: "Word Bank / Gap Match",
  description: "Completes stable text gaps by selecting from an explicit bank of reusable or single-use options.",
  role: "interaction",
  families: ["assessment", "knowledge-representation"],
  facets: { subjects: ["language"], representations: ["text"], learnerActions: ["select", "construct"], purposes: ["practice", "assess"], contexts: ["self-paced", "classroom"] },
  lifecycle: availableLifecycle,
  version: { schema: schemaVersion, component: "1.0.0" },
  variants: [
    { id: "single-use", name: "Single-use options" },
    { id: "reusable", name: "Reusable options" },
  ],
  authoring: { version: schemaVersion, fields: [
    textField("prompt", "Prompt", "Instruction for completing the passage.", true, true),
    listField("content", "Content", "Ordered text segments and stable gap identifiers."),
    listField("options", "Word bank", "Options with stable identifiers and labels."),
    objectField("solution", "Solution", "Accepted option identifiers for each gap.", false),
    selectField("reuse", "Option reuse", "Whether one option may fill more than one gap.", ["single-use", "reusable"]),
    textField("feedback", "Feedback", "Explanation of the completed relationships.", false, true),
  ], supportsLocalization: true },
  capabilities: ["response:gap-match", "result:scored", "result:partial-credit", "result:ungraded", "feedback:immediate", "feedback:informative"],
  evidence: [evidence(
    "didact-research-word-bank",
    "not-evaluated",
    researchSynthesis,
    "The reviewed evidence does not establish word-bank completion as an independent learning technique.",
    "Selection from visible options reduces retrieval demand compared with constructed response.",
  )],
  accessibility: accessibility(
    "Every gap can be filled through named buttons and native keyboard focus without dragging; assignments, availability, errors, and results are announced in text.",
    ["1.3.1", "1.4.1", "2.1.1", "2.4.6", "2.5.7", "3.3.1", "4.1.3"],
    { keyboard: "alternative", draggingAlternative: true },
  ),
  mappings: {
    qti: qti("gapMatchInteraction", "exact", "Visible options are assigned to embedded gaps with explicit cardinality."),
    xapi: xapi("fill-in", "Approximate reporting: serialize stable gap-to-option assignments in the response pattern."),
  },
  optionalDependencies: [{
    package: "@dnd-kit/core",
    purpose: "Pointer drag enhancement for placing bank options into inline gaps.",
    fallback: "The same gaps and options remain fully operable through click and keyboard selection.",
  }],
  tags: ["language", "gap-match", "no-drag-required", "implemented:@didact/core/WordBank"],
} as const satisfies ComponentManifest;

export const hotspotManifest = {
  id: "didact.hotspot",
  name: "Hotspot / Select Point",
  description: "Collects a response on visual content using normalized regions or coordinates plus an equivalent textual interaction.",
  role: "interaction",
  families: ["assessment", "media"],
  facets: { subjects: ["general", "science", "humanities"], representations: ["spatial", "image"], learnerActions: ["select", "manipulate"], purposes: ["explore", "practice", "assess"], contexts: ["self-paced", "classroom", "corporate"] },
  lifecycle: availableLifecycle,
  version: { schema: schemaVersion, component: "1.0.0" },
  variants: [
    { id: "hotspot", name: "Predefined regions" },
    { id: "select-point", name: "Free point" },
  ],
  authoring: { version: schemaVersion, fields: [
    textField("prompt", "Prompt", "Spatial task instruction.", true, true),
    objectField("visual", "Visual", "Image, intrinsic dimensions, alternative text, and optional long description."),
    listField("regions", "Regions", "Stable normalized regions and their textual names.", false),
    objectField("solution", "Solution", "Accepted region identifiers or normalized coordinate bounds.", false),
    selectField("selectionMode", "Selection mode", "Single or multiple region selection.", ["single", "multiple"]),
    textField("feedback", "Feedback", "Explanation shown after submission.", false, true),
  ], supportsLocalization: true },
  capabilities: ["response:hotspot", "response:point", "result:scored", "result:partial-credit", "result:ungraded", "feedback:immediate", "feedback:informative"],
  evidence: [evidence(
    "didact-research-hotspot",
    "not-evaluated",
    researchSynthesis,
    "The reviewed evidence does not establish spatial selection as an independent learning technique.",
    "The interaction must match a genuinely spatial objective and provide equivalent non-visual access.",
  )],
  accessibility: accessibility(
    "Every visual region has an equivalent named list control; alternative text and long description carry the visual context; feedback and selection never rely on position or color alone.",
    ["1.1.1", "1.3.1", "1.4.1", "1.4.10", "2.1.1", "2.5.7", "4.1.3"],
    { keyboard: "alternative", draggingAlternative: true, requiresAltText: true },
  ),
  mappings: {
    qti: [
      qti("hotspotInteraction", "exact", "Predefined normalized regions with stable identifiers."),
      qti("selectPointInteraction", "exact", "Free normalized coordinate selection."),
    ],
    xapi: [
      xapi("choice", "Use stable region identifiers for predefined hotspots."),
      xapi("other", "Free coordinates require an explicit response serialization convention."),
    ],
  },
  optionalDependencies: [],
  tags: ["spatial", "image", "textual-alternative", "implemented:@didact/core/Hotspot"],
} as const satisfies ComponentManifest;

export const labelDiagramManifest = {
  id: "didact.label-diagram", name: "Label Diagram",
  description: "Assigns stable labels to normalized visual targets through drag, click or keyboard-equivalent controls.",
  role: "interaction", families: ["assessment", "knowledge-representation"],
  facets: { subjects: ["science", "technical", "general"], representations: ["spatial", "image", "text"], learnerActions: ["relate", "manipulate", "construct"], purposes: ["practice", "assess"], contexts: ["self-paced", "classroom", "corporate", "technical-training"] },
  lifecycle: availableLifecycle, version: { schema: schemaVersion, component: "1.0.0" },
  variants: [{ id: "anatomy", name: "Anatomy diagram" }, { id: "technical", name: "Technical diagram" }],
  authoring: { version: schemaVersion, fields: [objectField("visual", "Visual", "Image or diagram with accessible description."), listField("targets", "Targets", "Named normalized positions and optional accepted label ids."), listField("items", "Labels", "Stable learner-assignable labels."), textField("feedback", "Feedback", "Informative feedback after submission.", false, true)], supportsLocalization: true },
  capabilities: ["response:graphic-gap-match", "response:textual-equivalent", "interaction:drag-optional", "result:partial-credit", "result:ungraded", "feedback:informative"],
  evidence: [evidence("didact-label-diagram-boundary", "not-evaluated", researchSynthesis, "Diagram labelling can elicit spatial relationships when those relationships are part of the objective.", "The UI itself is not evidence of learning and must retain a textual equivalent.")],
  accessibility: accessibility("Every target appears both over the visual and in a named textual list. Dragging is optional; click and keyboard operate the same assignment state.", ["1.1.1", "1.3.1", "1.4.1", "2.1.1", "2.5.7", "4.1.3"], { keyboard: "alternative", draggingAlternative: true, requiresAltText: true }),
  mappings: { qti: qti("graphicGapMatchInteraction", "exact", "Stable labels are assigned to normalized graphic gaps."), xapi: xapi("matching", "Serialize stable target-to-label assignments.") },
  optionalDependencies: [{ package: "@dnd-kit/core", purpose: "Pointer drag enhancement.", fallback: "Click and keyboard assignment over the same targets." }],
  tags: ["diagram", "anatomy", "technical", "no-drag-required", "implemented:@didact/core/LabelDiagram"],
} as const satisfies ComponentManifest;

export const conceptMapManifest = {
  id: "didact.concept-map", name: "Concept Map",
  description: "Lets learners construct labelled relationships between concepts through synchronized graphical and textual representations.",
  role: "interaction", families: ["generative-learning", "knowledge-representation"],
  facets: { subjects: ["general", "science", "business", "humanities"], representations: ["network", "text", "spatial"], learnerActions: ["construct", "relate", "explain"], purposes: ["create", "reflect", "assess"], contexts: ["self-paced", "classroom", "corporate"] },
  lifecycle: availableLifecycle, version: { schema: schemaVersion, component: "1.0.0" },
  variants: [{ id: "scientific", name: "Scientific relationships" }, { id: "process", name: "Process relationships" }],
  authoring: { version: schemaVersion, fields: [listField("nodes", "Concepts", "Initial concepts and normalized positions."), listField("relations", "Relations", "Initial directed or undirected labelled links."), objectField("interaction", "Interaction", "Learner-created node and connection policy."), objectField("evaluation", "Evaluation", "Optional host evaluation policy.")], supportsLocalization: true },
  capabilities: ["artifact:concept-network", "response:relations", "response:textual-equivalent", "authoring:learner-created-nodes", "evaluation:host-port"],
  evidence: [evidence("fiorella-mayer-concept-mapping", "moderate", "Fiorella & Mayer, Eight Ways to Promote Generative Learning", "Constructing a concept map can prompt learners to select, organize and integrate ideas.", "Benefit depends on the prompt, prior knowledge and guidance; a prebuilt map is not equivalent to constructing one.")],
  accessibility: accessibility("A textual From–Relationship–To builder performs every graph operation. Visual position is supplementary and relations do not depend on color.", ["1.3.1", "1.4.1", "2.1.1", "2.4.3", "3.3.2", "4.1.3"], { keyboard: "alternative" }),
  mappings: { qti: qti("customInteraction", "approximate", "QTI has no native concept-network constructor; a PCI may preserve it."), xapi: xapi("performance", "Report the submitted graph as a structured response extension.") },
  optionalDependencies: [], tags: ["generative-learning", "network", "relationships", "implemented:@didact/core/ConceptMap"],
} as const satisfies ComponentManifest;

export const drawingResponseManifest = {
  id: "didact.drawing-response", name: "Drawing Response",
  description: "Captures serializable normalized strokes and annotations without reducing the learner artifact to a bitmap.",
  role: "interaction", families: ["assessment", "technical-practice", "authoring"],
  facets: { subjects: ["mathematics", "science", "creative", "technical"], representations: ["spatial", "image", "artifact"], learnerActions: ["create", "construct", "manipulate"], purposes: ["create", "practice", "assess"], contexts: ["self-paced", "classroom", "corporate", "technical-training"] },
  lifecycle: availableLifecycle, version: { schema: schemaVersion, component: "1.0.0" },
  variants: [{ id: "geometry", name: "Geometry construction" }, { id: "annotation", name: "Visual annotation" }],
  authoring: { version: schemaVersion, fields: [objectField("surface", "Surface", "Dimensions, optional background and accessibility description."), listField("tools", "Tools", "Allowed freehand, line and marker tools."), objectField("evaluation", "Evaluation", "Optional host-provided evaluation.")], supportsLocalization: true },
  capabilities: ["artifact:vector-strokes", "response:drawing", "coordinates:normalized", "interaction:undo", "evaluation:host-port", "result:ungraded"],
  evidence: [evidence("didact-drawing-response-boundary", "not-evaluated", researchSynthesis, "Drawing can externalize spatial reasoning or procedural annotation when the task genuinely requires it.", "The component makes no general claim for drawing and does not auto-grade visual meaning.")],
  accessibility: accessibility("Stroke state has a textual list and coordinate-entry path; keyboard controls can create points and no bitmap is the sole response representation.", ["1.1.1", "1.3.1", "2.1.1", "2.5.1", "2.5.7", "3.3.2", "4.1.3"], { keyboard: "alternative", draggingAlternative: true }),
  mappings: { qti: qti("drawingInteraction", "approximate", "QTI drawingInteraction can carry an image response, while Didact retains structured strokes."), xapi: xapi("performance", "Report submission metadata; raw strokes require an explicit extension and privacy policy.") },
  optionalDependencies: [], tags: ["drawing", "annotation", "geometry", "vector", "implemented:@didact/core/DrawingResponse"],
} as const satisfies ComponentManifest;

export const equationWorkbenchManifest = {
  id: "didact.equation-workbench", name: "Equation Workbench",
  description: "Captures learner-authored symbolic transformation steps and delegates mathematical equivalence to an explicit host evaluator.",
  role: "interaction", families: ["generative-learning", "assessment", "technical-practice"],
  facets: { subjects: ["mathematics", "science", "business"], representations: ["symbolic", "text", "artifact"], learnerActions: ["calculate", "construct", "explain"], purposes: ["practice", "create", "assess"], contexts: ["self-paced", "classroom", "technical-training"] },
  lifecycle: availableLifecycle, version: { schema: schemaVersion, component: "1.0.0" },
  variants: [{ id: "algebra", name: "Algebraic transformation" }, { id: "scientific", name: "Scientific symbolic process" }],
  authoring: { version: schemaVersion, fields: [textField("initialExpression", "Starting expression", "Initial symbolic expression shown unchanged to the learner.", true, true), textField("instructions", "Instructions", "Transformation goal and constraints.", true, true), objectField("evaluation", "Evaluation", "Optional host-owned equivalence and reasoning policy.")], supportsLocalization: true },
  capabilities: ["artifact:symbolic-steps", "response:constructed", "evaluation:host-port", "renderer:host-port", "result:ungraded", "feedback:informative"],
  evidence: [evidence("didact-equation-workbench-boundary", "not-evaluated", researchSynthesis, "Writing intermediate transformations can externalize mathematical reasoning for inspection and feedback.", "The workbench does not claim that symbolic manipulation alone improves learning and never infers equivalence by string comparison.")],
  accessibility: accessibility("Every expression has a textual representation and labelled native input. Reordering and removal are keyboard-operable buttons; custom math rendering must retain the provided accessible expression.", ["1.3.1", "1.4.10", "2.1.1", "2.4.6", "3.3.2", "4.1.3"], { keyboard: "full" }),
  mappings: { qti: qti("extendedTextInteraction", "approximate", "QTI can retain the constructed response, but not Didact's structured transformation chain without an extension."), xapi: xapi("long-fill-in", "Serialize the final answer and retain structured steps as an extension if required.") },
  optionalDependencies: [], tags: ["mathematics", "symbolic", "reasoning", "implemented:@didact/core/EquationWorkbench"],
} as const satisfies ComponentManifest;

export const evidenceAnnotationManifest = {
  id: "didact.evidence-annotation", name: "Evidence Annotation",
  description: "Lets learners classify stable source segments, add notes and connect evidence to explicit claims.",
  role: "interaction", families: ["generative-learning", "assessment", "knowledge-representation"],
  facets: { subjects: ["humanities", "language", "business", "general"], representations: ["text", "network", "artifact"], learnerActions: ["select", "interpret", "relate", "explain"], purposes: ["practice", "create", "assess", "reflect"], contexts: ["self-paced", "classroom", "corporate", "technical-training"] },
  lifecycle: availableLifecycle, version: { schema: schemaVersion, component: "1.0.0" },
  variants: [{ id: "source-analysis", name: "Source analysis" }, { id: "incident-evidence", name: "Incident evidence" }],
  authoring: { version: schemaVersion, fields: [listField("segments", "Source segments", "Stable text segments with optional source offsets."), listField("categories", "Evidence categories", "Labels used to classify selected evidence."), listField("claims", "Claims", "Optional assertions to support or challenge."), objectField("evaluation", "Evaluation", "Optional host evaluation policy.")], supportsLocalization: true },
  capabilities: ["artifact:text-annotations", "response:evidence", "response:relations", "evaluation:host-port", "result:ungraded", "feedback:informative"],
  evidence: [evidence("didact-evidence-annotation-boundary", "not-evaluated", researchSynthesis, "Selecting and explaining evidence can make interpretation and justification inspectable.", "Highlighting without a meaningful prompt, classification or explanation is not treated as an effective learning technique by itself.")],
  accessibility: accessibility("Author-defined segments are available as named list controls, so selection does not depend on pointer text highlighting. Categories, claims, quotes and notes remain textual.", ["1.3.1", "1.4.1", "2.1.1", "2.4.3", "3.3.2", "4.1.3"], { keyboard: "alternative" }),
  mappings: { qti: qti("hottextInteraction", "approximate", "Stable text selection maps approximately; categories, claims and notes require additional response data."), xapi: xapi("choice", "Report stable segment identifiers and retain annotations as a structured extension.") },
  optionalDependencies: [], tags: ["reading", "evidence", "annotation", "humanities", "compliance", "implemented:@didact/core/EvidenceAnnotation"],
} as const satisfies ComponentManifest;

export const measurementLabManifest = {
  id: "didact.measurement-lab", name: "Measurement Lab",
  description: "Presents accessible linear and dial scales for recording measurements with explicit unit and precision.",
  role: "interaction", families: ["technical-practice", "assessment", "scenario-simulation"],
  facets: { subjects: ["science", "mathematics", "technical"], representations: ["numeric", "spatial", "system"], learnerActions: ["manipulate", "interpret"], purposes: ["practice", "explore", "assess"], contexts: ["self-paced", "classroom", "corporate", "technical-training"] },
  lifecycle: availableLifecycle, version: { schema: schemaVersion, component: "1.0.0" },
  variants: [{ id: "linear", name: "Linear instrument" }, { id: "dial", name: "Dial instrument" }],
  authoring: { version: schemaVersion, fields: [selectField("kind", "Instrument geometry", "Shared scale geometry.", ["linear", "dial"]), numberField("min", "Minimum", "Lowest scale value."), numberField("max", "Maximum", "Highest scale value."), numberField("step", "Resolution", "Smallest selectable division.", { min: 0 }), textField("unit", "Unit", "Visible measurement unit.", true)], supportsLocalization: true },
  capabilities: ["response:numeric", "interaction:instrument", "units:explicit", "precision:explicit", "evaluation:host-port", "result:ungraded"],
  evidence: [evidence("didact-measurement-lab-boundary", "not-evaluated", researchSynthesis, "Instrument reading can rehearse measurement when interpreting the scale is itself the objective.", "A decorative gauge is not a separate educational component; concrete instruments remain recipes over this contract.")],
  accessibility: accessibility("The visual scale exposes its current reading as an accessible image name and always has synchronized range and numeric inputs. Units and feedback are textual.", ["1.1.1", "1.3.1", "1.4.1", "2.1.1", "3.3.2", "4.1.3"], { keyboard: "alternative" }),
  mappings: { qti: qti("sliderInteraction", "approximate", "A linear selectable scale maps to sliderInteraction; dial geometry and instrument semantics remain presentation metadata."), xapi: xapi("numeric", "Report the selected reading and retain its unit in context or an extension.") },
  optionalDependencies: [], tags: ["science", "measurement", "instruments", "units", "implemented:@didact/core/MeasurementLab"],
} as const satisfies ComponentManifest;

export const diverseWaveManifests = [
  numericQuestionManifest,
  wordBankManifest,
  hotspotManifest,
  labelDiagramManifest,
  conceptMapManifest,
  drawingResponseManifest,
  equationWorkbenchManifest,
  evidenceAnnotationManifest,
  measurementLabManifest,
] as const satisfies readonly ComponentManifest[];
