import type { LocalizedText, ValidationIssue, ValidationResult } from "./types";

export const EVIDENCE_ANNOTATION_SCHEMA_VERSION = "1.0.0" as const;

export interface EvidenceDocument { readonly id: string; readonly text: string; readonly language?: string }
export interface EvidenceSpan { readonly id: string; readonly start: number; readonly end: number }
export interface EvidenceLabelDefinition { readonly id: string; readonly label: LocalizedText; readonly description?: LocalizedText }
export interface EvidenceClaimDefinition { readonly id: string; readonly text: LocalizedText; readonly sourceSpanId?: string }

export interface EvidenceAnnotationDefinition {
  readonly schemaVersion: typeof EVIDENCE_ANNOTATION_SCHEMA_VERSION;
  readonly id: string;
  readonly title: LocalizedText;
  readonly prompt: LocalizedText;
  readonly document: EvidenceDocument;
  readonly sourceSpans?: readonly EvidenceSpan[];
  readonly labels: readonly EvidenceLabelDefinition[];
  readonly claims: readonly EvidenceClaimDefinition[];
  readonly allowCustomSpans?: boolean;
  readonly requireRelations?: boolean;
}

export interface LearnerEvidenceAnnotation extends EvidenceSpan {
  readonly labelId: string;
  readonly note?: string;
}

export interface ClaimEvidenceRelation {
  readonly id: string;
  readonly claimId: string;
  readonly annotationId: string;
  readonly stance?: "supports" | "challenges" | "contextualizes";
}

export interface EvidenceAnnotationState {
  readonly status: "draft" | "submitted";
  readonly annotations: readonly LearnerEvidenceAnnotation[];
  readonly relations: readonly ClaimEvidenceRelation[];
}

export type EvidenceAnnotationEvent =
  | { readonly type: "annotation-added" | "annotation-updated"; readonly annotation: LearnerEvidenceAnnotation }
  | { readonly type: "annotation-removed"; readonly annotationId: string }
  | { readonly type: "relation-added"; readonly relation: ClaimEvidenceRelation }
  | { readonly type: "relation-removed"; readonly relationId: string }
  | { readonly type: "submitted" };

/** Evaluation is produced by the host and stored as portable data. */
export interface EvidenceAnnotationResult {
  readonly status: "ungraded" | "correct" | "incorrect" | "partial";
  readonly state: EvidenceAnnotationState;
  readonly score?: number;
  readonly maxScore?: number;
  readonly feedback?: readonly LocalizedText[];
  readonly evaluatedAt?: string;
  readonly events?: readonly EvidenceAnnotationEvent[];
}

export interface EvidenceAnnotationValidationOptions { readonly mode?: "complete" | "streaming" }

const ID = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const LANGUAGE = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;
const record = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const localized = (value: unknown): boolean => typeof value === "string" ? value.trim().length > 0 : record(value) && Object.keys(value).length > 0 && Object.values(value).every((entry) => typeof entry === "string" && entry.trim().length > 0);
const id = (value: unknown): value is string => typeof value === "string" && ID.test(value);
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const add = (issues: ValidationIssue[], path: string, code: string, message: string): void => { issues.push({ path, code, message, severity: "error" }); };

function validateSpan(value: unknown, path: string, issues: ValidationIssue[], documentLength?: number): void {
  if (!record(value)) { add(issues, path, "evidence.span", "Span must be an object."); return; }
  if (!id(value.id)) add(issues, `${path}.id`, "evidence.span-id", "Span id must be stable.");
  if (!Number.isInteger(value.start) || Number(value.start) < 0) add(issues, `${path}.start`, "evidence.span-start", "start must be a non-negative integer offset.");
  if (!Number.isInteger(value.end) || Number(value.end) <= Number(value.start)) add(issues, `${path}.end`, "evidence.span-end", "end must be an integer greater than start.");
  if (documentLength !== undefined && Number.isInteger(value.end) && Number(value.end) > documentLength) add(issues, `${path}.end`, "evidence.span-bounds", "Span exceeds document text length.");
}

export function validateEvidenceAnnotationDefinition(input: unknown, options: EvidenceAnnotationValidationOptions = {}): ValidationResult<EvidenceAnnotationDefinition> {
  const issues: ValidationIssue[] = []; const complete = (options.mode ?? "complete") === "complete";
  if (!record(input)) return { success: false, issues: [{ path: "$", code: "evidence.object", message: "Evidence annotation must be an object.", severity: "error" }] };
  if (input.schemaVersion !== undefined ? input.schemaVersion !== EVIDENCE_ANNOTATION_SCHEMA_VERSION : complete) add(issues, "schemaVersion", "evidence.version", `schemaVersion must be ${EVIDENCE_ANNOTATION_SCHEMA_VERSION}.`);
  if (input.id !== undefined ? !id(input.id) : complete) add(issues, "id", "evidence.id", "id must be a stable lowercase identifier.");
  for (const key of ["title", "prompt"] as const) if (input[key] !== undefined ? !localized(input[key]) : complete) add(issues, key, `evidence.${key}`, `${key} is required and must contain text.`);
  let documentLength: number | undefined;
  if (!record(input.document)) { if (complete) add(issues, "document", "evidence.document", "document is required."); }
  else {
    if (!id(input.document.id)) add(issues, "document.id", "evidence.document-id", "Document id must be stable.");
    if (typeof input.document.text !== "string" || (complete && input.document.text.length === 0)) add(issues, "document.text", "evidence.document-text", "Document text is required."); else documentLength = input.document.text.length;
    if (input.document.language !== undefined && (typeof input.document.language !== "string" || !LANGUAGE.test(input.document.language))) add(issues, "document.language", "evidence.language", "language must be a BCP-47-like tag.");
  }
  const spanIds = new Set<string>();
  if (input.sourceSpans !== undefined) {
    if (!Array.isArray(input.sourceSpans)) add(issues, "sourceSpans", "evidence.source-spans", "sourceSpans must be a list.");
    else input.sourceSpans.forEach((span, index) => { validateSpan(span, `sourceSpans[${index}]`, issues, documentLength); if (record(span) && id(span.id)) { if (spanIds.has(span.id)) add(issues, `sourceSpans[${index}].id`, "evidence.span-duplicate", "Span ids must be unique."); spanIds.add(span.id); } });
  }
  const labelIds = new Set<string>();
  if (!Array.isArray(input.labels)) { if (complete) add(issues, "labels", "evidence.labels", "labels must be a list."); }
  else { if (complete && input.labels.length === 0) add(issues, "labels", "evidence.labels-empty", "At least one label is required."); input.labels.forEach((label, index) => { const path = `labels[${index}]`; if (!record(label)) { add(issues, path, "evidence.label", "Label must be an object."); return; } if (!id(label.id)) add(issues, `${path}.id`, "evidence.label-id", "Label id must be stable."); else if (labelIds.has(label.id)) add(issues, `${path}.id`, "evidence.label-duplicate", "Label ids must be unique."); else labelIds.add(label.id); if (!localized(label.label)) add(issues, `${path}.label`, "evidence.label-text", "Label text is required."); if (label.description !== undefined && !localized(label.description)) add(issues, `${path}.description`, "evidence.label-description", "Description must contain text."); }); }
  const claimIds = new Set<string>();
  if (!Array.isArray(input.claims)) { if (complete) add(issues, "claims", "evidence.claims", "claims must be a list."); }
  else { if (complete && input.claims.length === 0) add(issues, "claims", "evidence.claims-empty", "At least one claim is required."); input.claims.forEach((claim, index) => { const path = `claims[${index}]`; if (!record(claim)) { add(issues, path, "evidence.claim", "Claim must be an object."); return; } if (!id(claim.id)) add(issues, `${path}.id`, "evidence.claim-id", "Claim id must be stable."); else if (claimIds.has(claim.id)) add(issues, `${path}.id`, "evidence.claim-duplicate", "Claim ids must be unique."); else claimIds.add(claim.id); if (!localized(claim.text)) add(issues, `${path}.text`, "evidence.claim-text", "Claim text is required."); if (claim.sourceSpanId !== undefined && !spanIds.has(String(claim.sourceSpanId))) add(issues, `${path}.sourceSpanId`, "evidence.claim-span-reference", "sourceSpanId must reference a source span."); }); }
  if (input.allowCustomSpans !== undefined && typeof input.allowCustomSpans !== "boolean") add(issues, "allowCustomSpans", "evidence.custom-spans", "allowCustomSpans must be boolean.");
  if (input.requireRelations !== undefined && typeof input.requireRelations !== "boolean") add(issues, "requireRelations", "evidence.require-relations", "requireRelations must be boolean.");
  return issues.length ? { success: false, issues } : { success: true, data: input as unknown as EvidenceAnnotationDefinition, issues };
}

export function validateEvidenceAnnotationState(input: unknown, definition: EvidenceAnnotationDefinition): ValidationResult<EvidenceAnnotationState> {
  const issues: ValidationIssue[] = [];
  if (!record(input)) return { success: false, issues: [{ path: "$", code: "evidence.state", message: "State must be an object.", severity: "error" }] };
  if (input.status !== "draft" && input.status !== "submitted") add(issues, "status", "evidence.state-status", "status must be draft or submitted.");
  const annotationIds = new Set<string>(); const labelIds = new Set(definition.labels.map(({ id }) => id));
  if (!Array.isArray(input.annotations)) add(issues, "annotations", "evidence.annotations", "annotations must be a list.");
  else input.annotations.forEach((annotation, index) => { const path = `annotations[${index}]`; validateSpan(annotation, path, issues, definition.document.text.length); if (record(annotation)) { if (id(annotation.id)) { if (annotationIds.has(annotation.id)) add(issues, `${path}.id`, "evidence.annotation-duplicate", "Annotation ids must be unique."); annotationIds.add(annotation.id); } if (!labelIds.has(String(annotation.labelId))) add(issues, `${path}.labelId`, "evidence.label-reference", "labelId must reference a label."); if (annotation.note !== undefined && (typeof annotation.note !== "string" || !annotation.note.trim())) add(issues, `${path}.note`, "evidence.note", "note must contain text."); } });
  const relationIds = new Set<string>(); const claimIds = new Set(definition.claims.map(({ id }) => id));
  if (!Array.isArray(input.relations)) add(issues, "relations", "evidence.relations", "relations must be a list.");
  else { if (definition.requireRelations && input.status === "submitted" && input.relations.length === 0) add(issues, "relations", "evidence.relations-required", "Submitted state requires a claim-evidence relation."); input.relations.forEach((relation, index) => { const path = `relations[${index}]`; if (!record(relation)) { add(issues, path, "evidence.relation", "Relation must be an object."); return; } if (!id(relation.id)) add(issues, `${path}.id`, "evidence.relation-id", "Relation id must be stable."); else if (relationIds.has(relation.id)) add(issues, `${path}.id`, "evidence.relation-duplicate", "Relation ids must be unique."); else relationIds.add(relation.id); if (!claimIds.has(String(relation.claimId))) add(issues, `${path}.claimId`, "evidence.claim-reference", "claimId must reference a claim."); if (!annotationIds.has(String(relation.annotationId))) add(issues, `${path}.annotationId`, "evidence.annotation-reference", "annotationId must reference an annotation."); if (relation.stance !== undefined && !["supports", "challenges", "contextualizes"].includes(String(relation.stance))) add(issues, `${path}.stance`, "evidence.stance", "Unknown relation stance."); }); }
  return issues.length ? { success: false, issues } : { success: true, data: input as unknown as EvidenceAnnotationState, issues };
}

export function validateEvidenceAnnotationResult(input: unknown, definition: EvidenceAnnotationDefinition): ValidationResult<EvidenceAnnotationResult> {
  const issues: ValidationIssue[] = [];
  if (!record(input)) return { success: false, issues: [{ path: "$", code: "evidence.result", message: "Result must be an object.", severity: "error" }] };
  if (!["ungraded", "correct", "incorrect", "partial"].includes(String(input.status))) add(issues, "status", "evidence.result-status", "Unknown result status.");
  const state = validateEvidenceAnnotationState(input.state, definition); state.issues.forEach((entry) => issues.push({ ...entry, path: `state.${entry.path}` }));
  if (input.score !== undefined && !finite(input.score)) add(issues, "score", "evidence.score", "score must be finite.");
  if (input.maxScore !== undefined && (!finite(input.maxScore) || input.maxScore <= 0)) add(issues, "maxScore", "evidence.max-score", "maxScore must be positive.");
  if (finite(input.score) && finite(input.maxScore) && (input.score < 0 || input.score > input.maxScore)) add(issues, "score", "evidence.score-range", "score must be between zero and maxScore.");
  if (input.feedback !== undefined && (!Array.isArray(input.feedback) || !input.feedback.every(localized))) add(issues, "feedback", "evidence.feedback", "feedback must be a list of localized text values.");
  if (input.events !== undefined) {
    if (!Array.isArray(input.events)) add(issues, "events", "evidence.events", "events must be a list.");
    else input.events.forEach((event, index) => { const path = `events[${index}]`; if (!record(event)) { add(issues, path, "evidence.event", "Event must be an object."); return; } if (event.type === "annotation-added" || event.type === "annotation-updated") { const annotation = event.annotation; validateSpan(annotation, `${path}.annotation`, issues, definition.document.text.length); if (record(annotation) && !definition.labels.some(({ id }) => id === annotation.labelId)) add(issues, `${path}.annotation.labelId`, "evidence.label-reference", "labelId must reference a label."); } else if (event.type === "annotation-removed") { if (!id(event.annotationId)) add(issues, `${path}.annotationId`, "evidence.event-annotation", "annotationId must be stable."); } else if (event.type === "relation-added") { const relation = event.relation; if (!record(relation) || !id(relation.id) || !id(relation.claimId) || !id(relation.annotationId)) add(issues, `${path}.relation`, "evidence.event-relation", "Relation event requires stable ids."); } else if (event.type === "relation-removed") { if (!id(event.relationId)) add(issues, `${path}.relationId`, "evidence.event-relation", "relationId must be stable."); } else if (event.type !== "submitted") add(issues, `${path}.type`, "evidence.event-type", "Unknown event type."); });
  }
  return issues.length ? { success: false, issues } : { success: true, data: input as unknown as EvidenceAnnotationResult, issues };
}
