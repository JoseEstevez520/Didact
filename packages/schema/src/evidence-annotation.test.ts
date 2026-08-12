import { describe, expect, it } from "vitest";
import { EVIDENCE_ANNOTATION_SCHEMA_VERSION, validateEvidenceAnnotationDefinition, validateEvidenceAnnotationResult, validateEvidenceAnnotationState, type EvidenceAnnotationDefinition } from "./evidence-annotation";

const definition: EvidenceAnnotationDefinition = { schemaVersion: EVIDENCE_ANNOTATION_SCHEMA_VERSION, id: "history.source", title: "Evaluate a source", prompt: "Connect evidence to the claim", document: { id: "source", text: "Production doubled between 1900 and 1920.", language: "en" }, sourceSpans: [{ id: "production", start: 0, end: 18 }], labels: [{ id: "quantitative", label: "Quantitative evidence" }], claims: [{ id: "growth", text: "Industry expanded", sourceSpanId: "production" }], allowCustomSpans: true, requireRelations: true };
const state = { status: "submitted" as const, annotations: [{ id: "selection", start: 0, end: 18, labelId: "quantitative" }], relations: [{ id: "connection", claimId: "growth", annotationId: "selection", stance: "supports" as const }] };

describe("evidence annotation schema", () => {
  it("accepts stable text offsets and references", () => expect(validateEvidenceAnnotationDefinition(definition).success).toBe(true));
  it("accepts a partial streaming definition", () => expect(validateEvidenceAnnotationDefinition({ id: "draft" }, { mode: "streaming" }).success).toBe(true));
  it("rejects spans outside the document", () => expect(validateEvidenceAnnotationDefinition({ ...definition, sourceSpans: [{ id: "bad", start: 0, end: 500 }] }).success).toBe(false));
  it("validates claim-evidence relations", () => { expect(validateEvidenceAnnotationState(state, definition).success).toBe(true); expect(validateEvidenceAnnotationState({ ...state, relations: [{ ...state.relations[0], annotationId: "missing" }] }, definition).success).toBe(false); });
  it("accepts host evaluation data and events", () => expect(validateEvidenceAnnotationResult({ status: "partial", state, score: 1, maxScore: 2, feedback: ["Relevant evidence; explain relevance"], events: [{ type: "submitted" }] }, definition).success).toBe(true));
  it("survives JSON round trips", () => expect(validateEvidenceAnnotationDefinition(JSON.parse(JSON.stringify(definition))).success).toBe(true));
});
