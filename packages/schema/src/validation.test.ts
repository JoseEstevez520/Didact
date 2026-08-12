import { describe, expect, it } from "vitest";

import {
  validateAuthoringData,
  validateAuthoringSchema,
  validateCatalogCollection,
  validateComponentFacets,
  validateComponentManifest,
  validateResponse,
  validateResult,
} from "./validation";
import type { ComponentManifest } from "./types";

const validManifest: ComponentManifest = {
  id: "practice.self-explanation",
  name: { es: "Autoexplicación", en: "Self explanation" },
  description: "Prompts the learner to explain a worked step.",
  role: "interaction",
  families: ["generative-learning", "retrieval-practice"],
  facets: {
    subjects: ["general"],
    representations: ["text", "procedural"],
    learnerActions: ["write", "explain"],
    purposes: ["practice", "reflect"],
    contexts: ["self-paced", "classroom"],
  },
  lifecycle: { availability: "available", maturity: "stable" },
  version: {
    schema: "1.0.0",
    component: "1.1.0",
    migrations: [
      { from: "1.0.0", to: "1.1.0", description: "Adds optional model answer." },
    ],
  },
  authoring: {
    version: "1.0.0",
    supportsLocalization: true,
    fields: [
      { key: "prompt", kind: "rich-text", label: "Prompt", required: true, i18n: true },
      {
        key: "feedback",
        kind: "object",
        label: "Feedback",
        fields: [
          {
            key: "modes",
            kind: "list",
            label: "Feedback modes",
            minItems: 1,
            item: {
              key: "mode",
              kind: "select",
              label: "Mode",
              options: [
                { value: "criteria", label: "Criteria" },
                { value: "model", label: "Model answer" },
              ],
            },
          },
          {
            key: "modelAnswer",
            kind: "rich-text",
            label: "Model answer",
            required: { path: "feedbackMode", operator: "equals", value: "model" },
            visibleWhen: { path: "feedbackMode", operator: "equals", value: "model" },
          },
        ],
      },
    ],
  },
  evidence: [
    {
      id: "fiorella-mayer-2016",
      strength: "moderate",
      citation: "Fiorella & Mayer (2016)",
      claim: "Self-explanation is a generative learning strategy.",
      limitations: "Effect depends on prompt and domain.",
    },
  ],
  accessibility: {
    keyboard: "full",
    screenReader: "full",
    captions: "not-applicable",
    wcagCriteria: ["2.1.1", "3.3.2"],
  },
  mappings: {
    qti: [
      { interaction: "extendedTextInteraction", fidelity: "approximate", version: "3.0" },
      { interaction: "textEntryInteraction", fidelity: "approximate", version: "3.0" },
    ],
    xapi: [
      { interactionType: "long-fill-in", verbs: ["answered", "completed"] },
      { interactionType: "other", verbs: ["experienced"] },
    ],
  },
  variants: [{ id: "model-answer", name: "With model answer", availability: "available" }],
  optionalDependencies: [
    { package: "example-evaluator", purpose: "AI-assisted feedback", fallback: "Show a model answer." },
  ],
};

describe("validateComponentManifest", () => {
  it("accepts a complete, localized and deeply nested manifest", () => {
    const result = validateComponentManifest(validManifest);
    expect(result.success).toBe(true);
    expect(result.issues).toEqual([]);
    if (result.success) expect(result.data.id).toBe("practice.self-explanation");
  });

  it("accepts explicit not-evaluated evidence as an empty list", () => {
    const result = validateComponentManifest({ ...validManifest, evidence: [] });
    expect(result.success).toBe(true);
  });

  it("preserves warnings without rejecting an otherwise usable manifest", () => {
    const result = validateComponentManifest({
      ...validManifest,
      accessibility: { ...validManifest.accessibility, keyboard: "unsupported" },
    });
    expect(result.success).toBe(true);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "a11y.unsupported", severity: "warning" }));
  });

  it("returns structured issues for invalid identity, taxonomy, schema and versions", () => {
    const result = validateComponentManifest({
      ...validManifest,
      id: "Bad ID",
      role: "widget",
      families: ["misc"],
      version: {
        schema: "latest",
        component: "1",
        migrations: [{ from: "1.0.0", to: "1.0.0", description: "" }],
      },
      authoring: { version: "v1", fields: "not-an-array" },
      accessibility: null,
    });
    expect(result.success).toBe(false);
    expect(result.issues.map(({ code }) => code)).toEqual(expect.arrayContaining([
      "manifest.id",
      "manifest.role",
      "manifest.family",
      "version.semver",
      "version.no-op",
      "version.description",
      "schema.fields",
      "manifest.accessibility",
    ]));
  });
});

describe("component facets and collections", () => {
  it("accepts typed, multi-axis facets and rejects unknown or duplicate values", () => {
    expect(validateComponentFacets(validManifest.facets).success).toBe(true);
    const result = validateComponentFacets({
      subjects: ["mathematics", "mathematics"],
      representations: ["numeric"],
      learnerActions: ["click"],
      purposes: [],
    });
    expect(result.success).toBe(false);
    expect(result.issues.map(({ code }) => code)).toEqual(expect.arrayContaining([
      "facets.duplicate",
      "facets.learner-action",
      "facets.purpose",
    ]));
  });

  it("validates collection references, lifecycle and duplicate items", () => {
    const collection = {
      id: "didact.collection.generative-learning",
      version: "1.0.0",
      slug: "generative-learning",
      title: "Generative learning",
      description: "Prompts and structured examples.",
      kind: "foundation",
      status: "available",
      facets: { purposes: ["practice", "reflect"] },
      items: [{ manifestId: validManifest.id, role: "required", reason: "Core prompt." }],
      kit: { name: "generative-learning", includeRoles: ["required", "recommended"] },
    };
    expect(validateCatalogCollection(collection, [validManifest]).success).toBe(true);

    const invalid = validateCatalogCollection({
      ...collection,
      items: [
        collection.items[0],
        collection.items[0],
        { manifestId: "didact.missing", role: "unknown", reason: "" },
      ],
    }, [validManifest]);
    expect(invalid.success).toBe(false);
    expect(invalid.issues.map(({ code }) => code)).toEqual(expect.arrayContaining([
      "collection.duplicate-item",
      "collection.unknown-manifest",
      "collection.role",
      "collection.reason",
    ]));
  });
});

describe("validateAuthoringSchema", () => {
  it("rejects duplicate sibling keys, recursive keys and malformed conditions", () => {
    const result = validateAuthoringSchema({
      version: "1.0.0",
      fields: [
        { key: "title", kind: "text", label: "Title" },
        { key: "title", kind: "text", label: "Again" },
        {
          key: "section",
          kind: "object",
          label: "Section",
          fields: [{ key: "section", kind: "text", label: "Recursive" }],
        },
        {
          key: "answer",
          kind: "text",
          label: "Answer",
          visibleWhen: { path: "mode", operator: "equals" },
        },
      ],
    });
    expect(result.success).toBe(false);
    expect(result.issues.map(({ code }) => code)).toEqual(expect.arrayContaining([
      "field.duplicate-key",
      "field.recursive-key",
      "condition.value",
    ]));
  });

  it("rejects invalid list ranges and duplicate choice values", () => {
    const result = validateAuthoringSchema({
      version: "1.0.0",
      fields: [{
        key: "items",
        kind: "list",
        label: "Items",
        minItems: 3,
        maxItems: 1,
        item: {
          key: "item",
          kind: "select",
          label: "Item",
          options: [{ value: "a", label: "A" }, { value: "a", label: "Again" }],
        },
      }],
    });
    expect(result.success).toBe(false);
    expect(result.issues.map(({ code }) => code)).toEqual(expect.arrayContaining(["field.item-range", "field.duplicate-option"]));
  });
});

describe("validateAuthoringData", () => {
  const schema = {
    version: "1.0.0",
    fields: [
      {
        key: "mode",
        kind: "select" as const,
        label: "Mode",
        required: true,
        options: [{ value: "guided", label: "Guided" }, { value: "free", label: "Free" }],
      },
      {
        key: "sections",
        kind: "list" as const,
        label: "Sections",
        required: "progressive" as const,
        minItems: 1,
        maxItems: 2,
        item: {
          key: "section",
          kind: "object" as const,
          label: "Section",
          fields: [
            { key: "title", kind: "text" as const, label: "Title", required: true, minLength: 3 },
            { key: "weight", kind: "number" as const, label: "Weight", min: 0, max: 10 },
          ],
        },
      },
      {
        key: "modelAnswer",
        kind: "rich-text" as const,
        label: "Model answer",
        required: {
          level: "progressive" as const,
          when: { path: "mode", operator: "equals" as const, value: "guided" },
        },
        visibleWhen: { path: "mode", operator: "equals" as const, value: "guided" },
      },
    ],
  };

  it("keeps truly required fields as errors during streaming", () => {
    const result = validateAuthoringData(schema, {}, { mode: "streaming" });
    expect(result.success).toBe(false);
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: "$.mode", code: "data.required", severity: "error" }),
      expect.objectContaining({ path: "$.sections", code: "data.progressive", severity: "warning" }),
    ]));
  });

  it("warns for progressive data during streaming and rejects it on completion", () => {
    const data = { mode: "guided", sections: [{ title: "First", weight: 5 }] };
    const streaming = validateAuthoringData(schema, data, { mode: "streaming" });
    expect(streaming.success).toBe(true);
    expect(streaming.issues).toContainEqual(expect.objectContaining({ path: "$.modelAnswer", severity: "warning" }));

    const complete = validateAuthoringData(schema, data, { mode: "complete" });
    expect(complete.success).toBe(false);
    expect(complete.issues).toContainEqual(expect.objectContaining({ path: "$.modelAnswer", severity: "error" }));
  });

  it("walks lists and nested objects and reports exact paths and limits", () => {
    const result = validateAuthoringData(schema, {
      mode: "free",
      sections: [{ title: "x", weight: 12 }, { title: "Good", weight: 3 }, { title: "Extra", weight: 2 }],
    }, { mode: "complete" });
    expect(result.success).toBe(false);
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: "$.sections", code: "data.max-items" }),
      expect.objectContaining({ path: "$.sections[0].title", code: "data.min-length" }),
      expect.objectContaining({ path: "$.sections[0].weight", code: "data.max" }),
    ]));
    expect(result.issues.some(({ path }) => path === "$.modelAnswer")).toBe(false);
  });

  it("validates conditions and scalar option types", () => {
    const result = validateAuthoringData(schema, {
      mode: "unknown",
      sections: [{ title: 42, weight: "heavy" }],
    }, { mode: "complete" });
    expect(result.success).toBe(false);
    expect(result.issues.map(({ code }) => code)).toEqual(expect.arrayContaining(["data.option", "data.text", "data.number"]));
  });
});

describe("validateResponse", () => {
  it("accepts partial and streaming responses", () => {
    expect(validateResponse({
      id: "response-1",
      componentId: "quiz.short-answer",
      status: "streaming",
      kind: "text",
      value: "An unfinished ans",
      durationMs: 1200,
    }).success).toBe(true);
  });

  it("validates nested composite responses", () => {
    const result = validateResponse({
      id: "response-set",
      componentId: "practice.set",
      status: "submitted",
      kind: "composite",
      value: [
        { id: "r1", componentId: "q1", status: "submitted", kind: "choice", value: ["a"] },
        { id: "r2", componentId: "q2", status: "draft", kind: "numeric", value: 42 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("reports the exact path of an invalid nested response", () => {
    const result = validateResponse({
      id: "response-set",
      componentId: "practice.set",
      status: "submitted",
      kind: "composite",
      value: [{ id: "", componentId: "q1", status: "waiting", kind: "numeric", value: "42" }],
    });
    expect(result.success).toBe(false);
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: "$.value[0].id", code: "response.id" }),
      expect.objectContaining({ path: "$.value[0].status", code: "response.status" }),
      expect.objectContaining({ path: "$.value[0].value", code: "response.value" }),
    ]));
  });
});

describe("validateResult", () => {
  it("accepts an ungraded result without a score", () => {
    expect(validateResult({ responseId: "r1", status: "ungraded" }).success).toBe(true);
  });

  it("rejects impossible scores", () => {
    const result = validateResult({ responseId: "r1", status: "partial", score: 12, maxScore: 10, normalizedScore: 1.2 });
    expect(result.success).toBe(false);
    expect(result.issues.map(({ code }) => code)).toEqual(expect.arrayContaining(["result.score-range", "result.normalized-range"]));
  });
});
