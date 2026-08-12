import {
  isComponentFamily,
  isComponentRole,
  isLearnerActionFacet,
  isLearningContextFacet,
  isLearningPurposeFacet,
  isRepresentationFacet,
  isSubjectFacet,
} from "./taxonomy";
import type {
  AuthoringCondition,
  AuthoringField,
  AuthoringSchema,
  AuthoringValidationOptions,
  CatalogCollection,
  ComponentFacets,
  ComponentManifest,
  ConditionalRequiredness,
  Response,
  Result,
  ValidationIssue,
  ValidationResult,
} from "./types";

type UnknownRecord = Record<string, unknown>;

const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const IDENTIFIER = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function record(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function issue(
  issues: ValidationIssue[],
  path: string,
  code: string,
  message: string,
  severity: ValidationIssue["severity"] = "error",
): void {
  issues.push({ path, code, message, severity });
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validLocalizedText(value: unknown): boolean {
  if (nonEmptyString(value)) return true;
  return record(value) && Object.keys(value).length > 0 && Object.values(value).every(nonEmptyString);
}

function validateFacetArray(
  value: unknown,
  path: string,
  code: string,
  predicate: (entry: unknown) => boolean,
  issues: ValidationIssue[],
  required: boolean,
): void {
  if (!Array.isArray(value) || (required && value.length === 0)) {
    issue(issues, path, code, required ? "Expected at least one facet value." : "Expected a facet array.");
    return;
  }
  const seen = new Set<string>();
  value.forEach((entry, index) => {
    if (!predicate(entry)) issue(issues, `${path}[${index}]`, code, "Unknown facet value.");
    else if (seen.has(String(entry))) issue(issues, `${path}[${index}]`, "facets.duplicate", "Facet values must be unique.");
    else seen.add(String(entry));
  });
}

function collectFacetIssues(input: unknown, path: string, issues: ValidationIssue[], partial = false): void {
  if (!record(input)) {
    issue(issues, path, "facets.type", "Expected a facets object.");
    return;
  }
  const definitions = [
    ["subjects", "facets.subject", isSubjectFacet],
    ["representations", "facets.representation", isRepresentationFacet],
    ["learnerActions", "facets.learner-action", isLearnerActionFacet],
    ["purposes", "facets.purpose", isLearningPurposeFacet],
  ] as const;
  definitions.forEach(([key, code, predicate]) => {
    if (partial && input[key] === undefined) return;
    validateFacetArray(input[key], `${path}.${key}`, code, predicate, issues, !partial);
  });
  if (input.contexts !== undefined) {
    validateFacetArray(input.contexts, `${path}.contexts`, "facets.context", isLearningContextFacet, issues, false);
  }
}

export function validateComponentFacets(input: unknown): ValidationResult<ComponentFacets> {
  const issues: ValidationIssue[] = [];
  collectFacetIssues(input, "$", issues);
  return issues.length > 0
    ? { success: false, issues }
    : { success: true, data: input as ComponentFacets, issues };
}

export function validateCatalogCollection(
  input: unknown,
  manifests: readonly ComponentManifest[] = [],
): ValidationResult<CatalogCollection> {
  const issues: ValidationIssue[] = [];
  if (!record(input)) {
    return { success: false, issues: [{ path: "$", code: "collection.type", message: "Expected a collection object.", severity: "error" }] };
  }
  if (!nonEmptyString(input.id) || !IDENTIFIER.test(input.id)) issue(issues, "$.id", "collection.id", "Use a stable lowercase dotted or dashed identifier.");
  if (!nonEmptyString(input.version) || !SEMVER.test(input.version)) issue(issues, "$.version", "version.semver", "Collection version must be valid semver.");
  if (!nonEmptyString(input.slug) || !SLUG.test(input.slug)) issue(issues, "$.slug", "collection.slug", "Use a lowercase dashed slug.");
  if (!validLocalizedText(input.title)) issue(issues, "$.title", "collection.title", "Title must contain text.");
  if (!validLocalizedText(input.description)) issue(issues, "$.description", "collection.description", "Description must contain text.");
  if (!["foundation", "subject", "context", "experience"].includes(String(input.kind))) issue(issues, "$.kind", "collection.kind", "Unknown collection kind.");
  if (!["draft", "available", "deprecated"].includes(String(input.status))) issue(issues, "$.status", "collection.status", "Unknown collection status.");
  if (input.facets !== undefined) collectFacetIssues(input.facets, "$.facets", issues, true);
  if (!Array.isArray(input.items) || input.items.length === 0) issue(issues, "$.items", "collection.items", "A collection needs at least one item.");
  else {
    const seen = new Set<string>();
    input.items.forEach((entry, index) => {
      const path = `$.items[${index}]`;
      if (!record(entry)) {
        issue(issues, path, "collection.item", "Expected a collection item.");
        return;
      }
      if (!nonEmptyString(entry.manifestId) || !IDENTIFIER.test(entry.manifestId)) issue(issues, `${path}.manifestId`, "collection.manifest", "A valid manifest id is required.");
      if (entry.typeId !== undefined && (!nonEmptyString(entry.typeId) || !IDENTIFIER.test(entry.typeId))) issue(issues, `${path}.typeId`, "collection.type-id", "typeId must be a stable identifier.");
      if (!["required", "recommended", "optional"].includes(String(entry.role))) issue(issues, `${path}.role`, "collection.role", "Unknown collection item role.");
      if (!nonEmptyString(entry.reason)) issue(issues, `${path}.reason`, "collection.reason", "The inclusion reason is required.");
      const key = `${String(entry.manifestId)}:${String(entry.typeId ?? "")}`;
      if (seen.has(key)) issue(issues, path, "collection.duplicate-item", "A component can appear only once in a collection.");
      seen.add(key);
      if (manifests.length > 0 && nonEmptyString(entry.manifestId)) {
        const manifest = manifests.find(({ id }) => id === entry.manifestId);
        if (!manifest) issue(issues, `${path}.manifestId`, "collection.unknown-manifest", "Referenced manifest does not exist.");
        else if (input.status === "available" && manifest.lifecycle.availability !== "available") {
          issue(issues, `${path}.manifestId`, "collection.unavailable-manifest", "Available collections cannot reference unavailable manifests.");
        }
      }
    });
  }
  if (input.kit !== undefined) {
    if (!record(input.kit)) issue(issues, "$.kit", "collection.kit", "Expected a kit descriptor.");
    else {
      if (!nonEmptyString(input.kit.name) || !SLUG.test(input.kit.name)) issue(issues, "$.kit.name", "collection.kit-name", "Use a lowercase dashed kit name.");
      if (!Array.isArray(input.kit.includeRoles) || input.kit.includeRoles.length === 0) issue(issues, "$.kit.includeRoles", "collection.kit-roles", "A kit must include at least one collection item role.");
      else {
        const roles = new Set<string>();
        input.kit.includeRoles.forEach((role, index) => {
          if (!["required", "recommended", "optional"].includes(String(role))) issue(issues, `$.kit.includeRoles[${index}]`, "collection.kit-role", "Unknown kit item role.");
          else if (roles.has(String(role))) issue(issues, `$.kit.includeRoles[${index}]`, "collection.kit-role-duplicate", "Kit roles must be unique.");
          roles.add(String(role));
        });
      }
    }
  }
  return issues.length > 0
    ? { success: false, issues }
    : { success: true, data: input as unknown as CatalogCollection, issues };
}

function validateCondition(value: unknown, path: string, issues: ValidationIssue[]): value is AuthoringCondition {
  if (!record(value)) {
    issue(issues, path, "condition.type", "Expected a condition object.");
    return false;
  }
  if (!nonEmptyString(value.path)) issue(issues, `${path}.path`, "condition.path", "Condition path is required.");
  const operators = ["equals", "not-equals", "contains", "not-contains", "greater-than", "less-than", "is-set", "is-not-set"];
  if (!operators.includes(String(value.operator))) {
    issue(issues, `${path}.operator`, "condition.operator", "Unknown condition operator.");
  }
  const needsValue = !["is-set", "is-not-set"].includes(String(value.operator));
  if (needsValue && value.value === undefined) {
    issue(issues, `${path}.value`, "condition.value", "This operator requires a comparison value.");
  }
  return true;
}

function validateField(value: unknown, path: string, issues: ValidationIssue[], ancestors: readonly string[]): value is AuthoringField {
  if (!record(value)) {
    issue(issues, path, "field.type", "Expected an authoring field object.");
    return false;
  }
  if (!nonEmptyString(value.key)) issue(issues, `${path}.key`, "field.key", "Field key is required.");
  if (typeof value.key === "string" && ancestors.includes(value.key)) {
    issue(issues, `${path}.key`, "field.recursive-key", "A nested field cannot reuse an ancestor key.");
  }
  if (!validLocalizedText(value.label)) issue(issues, `${path}.label`, "field.label", "Field label must contain text.");
  if (record(value.required)) {
    if ("level" in value.required || "when" in value.required) {
      if (!["required", "progressive", "optional"].includes(String(value.required.level))) {
        issue(issues, `${path}.required.level`, "field.required-level", "Unknown requiredness level.");
      }
      validateCondition(value.required.when, `${path}.required.when`, issues);
    } else validateCondition(value.required, `${path}.required`, issues);
  } else if (
    value.required !== undefined
    && typeof value.required !== "boolean"
    && !["required", "progressive", "optional"].includes(String(value.required))
  ) {
    issue(issues, `${path}.required`, "field.required", "Requiredness must be boolean, a level or a condition.");
  }
  if (value.visibleWhen !== undefined) validateCondition(value.visibleWhen, `${path}.visibleWhen`, issues);

  const scalarKinds = ["text", "rich-text", "number", "boolean", "asset"];
  if (scalarKinds.includes(String(value.kind))) return true;
  if (value.kind === "select" || value.kind === "multi-select") {
    if (!Array.isArray(value.options) || value.options.length === 0) {
      issue(issues, `${path}.options`, "field.options", "Choice fields need at least one option.");
    } else {
      const values = new Set<string>();
      value.options.forEach((option, index) => {
        if (!record(option) || !nonEmptyString(option.value) || !validLocalizedText(option.label)) {
          issue(issues, `${path}.options[${index}]`, "field.option", "Each option needs a value and label.");
        } else if (values.has(option.value)) {
          issue(issues, `${path}.options[${index}].value`, "field.duplicate-option", "Option values must be unique.");
        } else values.add(option.value);
      });
    }
    return true;
  }
  const nextAncestors = typeof value.key === "string" ? [...ancestors, value.key] : ancestors;
  if (value.kind === "object") {
    validateFields(value.fields, `${path}.fields`, issues, nextAncestors);
    return true;
  }
  if (value.kind === "list") {
    validateField(value.item, `${path}.item`, issues, nextAncestors);
    if (typeof value.minItems === "number" && typeof value.maxItems === "number" && value.minItems > value.maxItems) {
      issue(issues, path, "field.item-range", "minItems cannot exceed maxItems.");
    }
    return true;
  }
  issue(issues, `${path}.kind`, "field.kind", "Unknown authoring field kind.");
  return false;
}

function validateFields(value: unknown, path: string, issues: ValidationIssue[], ancestors: readonly string[] = []): boolean {
  if (!Array.isArray(value)) {
    issue(issues, path, "schema.fields", "Expected an array of fields.");
    return false;
  }
  const keys = new Set<string>();
  value.forEach((field, index) => {
    validateField(field, `${path}[${index}]`, issues, ancestors);
    if (record(field) && typeof field.key === "string") {
      if (keys.has(field.key)) issue(issues, `${path}[${index}].key`, "field.duplicate-key", "Sibling field keys must be unique.");
      keys.add(field.key);
    }
  });
  return true;
}

export function validateAuthoringSchema(input: unknown): ValidationResult<AuthoringSchema> {
  const issues: ValidationIssue[] = [];
  if (!record(input)) issue(issues, "$", "schema.type", "Expected an authoring schema object.");
  else {
    if (!nonEmptyString(input.version) || !SEMVER.test(input.version)) {
      issue(issues, "$.version", "version.semver", "Authoring schema version must be valid semver.");
    }
    validateFields(input.fields, "$.fields", issues);
  }
  return issues.some(({ severity }) => severity === "error")
    ? { success: false, issues }
    : { success: true, data: input as unknown as AuthoringSchema, issues };
}

function valueAtPath(data: UnknownRecord, path: string): unknown {
  return path.split(".").filter(Boolean).reduce<unknown>((current, segment) => {
    if (record(current)) return current[segment];
    if (Array.isArray(current) && /^\d+$/.test(segment)) return current[Number(segment)];
    return undefined;
  }, data);
}

function conditionMatches(condition: AuthoringCondition, data: UnknownRecord): boolean {
  const actual = valueAtPath(data, condition.path);
  switch (condition.operator) {
    case "equals": return actual === condition.value;
    case "not-equals": return actual !== condition.value;
    case "contains":
      if (typeof actual === "string") return typeof condition.value === "string" && actual.includes(condition.value);
      if (Array.isArray(actual)) return Array.isArray(condition.value)
        ? condition.value.every((entry) => actual.includes(entry))
        : actual.includes(condition.value);
      return false;
    case "not-contains":
      if (typeof actual === "string") return typeof condition.value !== "string" || !actual.includes(condition.value);
      if (Array.isArray(actual)) return Array.isArray(condition.value)
        ? condition.value.every((entry) => !actual.includes(entry))
        : !actual.includes(condition.value);
      return true;
    case "greater-than": return typeof actual === "number" && typeof condition.value === "number" && actual > condition.value;
    case "less-than": return typeof actual === "number" && typeof condition.value === "number" && actual < condition.value;
    case "is-set": return actual !== undefined && actual !== null && actual !== "";
    case "is-not-set": return actual === undefined || actual === null || actual === "";
  }
}

function missing(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

function isConditionalRequiredness(
  value: AuthoringCondition | ConditionalRequiredness,
): value is ConditionalRequiredness {
  return "level" in value && "when" in value;
}

function requirednessFor(field: AuthoringField, root: UnknownRecord): "required" | "progressive" | "optional" {
  const required = field.required;
  if (required === true || required === "required") return "required";
  if (required === "progressive") return "progressive";
  if (required === false || required === undefined || required === "optional") return "optional";
  if (isConditionalRequiredness(required)) {
    return conditionMatches(required.when, root) ? required.level : "optional";
  }
  return conditionMatches(required, root) ? "required" : "optional";
}

function validateAuthoredValue(
  field: AuthoringField,
  value: unknown,
  path: string,
  root: UnknownRecord,
  options: AuthoringValidationOptions,
  issues: ValidationIssue[],
): void {
  if (field.visibleWhen && !conditionMatches(field.visibleWhen, root)) return;
  if (missing(value)) {
    if (field.defaultValue !== undefined) return;
    const requiredness = requirednessFor(field, root);
    if (requiredness === "required") issue(issues, path, "data.required", "Required field is missing.");
    else if (requiredness === "progressive") {
      issue(
        issues,
        path,
        "data.progressive",
        options.mode === "streaming" ? "Progressive field is not complete yet." : "Progressive field is required before completion.",
        options.mode === "streaming" ? "warning" : "error",
      );
    }
    return;
  }

  if (field.kind === "object") {
    if (!record(value)) {
      issue(issues, path, "data.object", "Expected an object.");
      return;
    }
    field.fields.forEach((child) => validateAuthoredValue(child, value[child.key], `${path}.${child.key}`, root, options, issues));
    return;
  }
  if (field.kind === "list") {
    if (!Array.isArray(value)) {
      issue(issues, path, "data.list", "Expected a list.");
      return;
    }
    if (field.minItems !== undefined && value.length < field.minItems) issue(issues, path, "data.min-items", `Expected at least ${field.minItems} items.`);
    if (field.maxItems !== undefined && value.length > field.maxItems) issue(issues, path, "data.max-items", `Expected at most ${field.maxItems} items.`);
    value.forEach((item, index) => validateAuthoredValue(field.item, item, `${path}[${index}]`, root, options, issues));
    return;
  }
  if (field.kind === "text" || field.kind === "rich-text") {
    if (field.i18n && validLocalizedText(value)) return;
    if (typeof value !== "string") {
      issue(issues, path, "data.text", "Expected text.");
      return;
    }
    if (field.minLength !== undefined && value.length < field.minLength) issue(issues, path, "data.min-length", `Expected at least ${field.minLength} characters.`);
    if (field.maxLength !== undefined && value.length > field.maxLength) issue(issues, path, "data.max-length", `Expected at most ${field.maxLength} characters.`);
    if (field.pattern !== undefined) {
      try {
        if (!new RegExp(field.pattern).test(value)) issue(issues, path, "data.pattern", "Text does not match the required pattern.");
      } catch {
        issue(issues, path, "schema.pattern", "Field pattern is not a valid regular expression.");
      }
    }
    return;
  }
  if (field.kind === "number") {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      issue(issues, path, "data.number", "Expected a finite number.");
      return;
    }
    if (field.min !== undefined && value < field.min) issue(issues, path, "data.min", `Value must be at least ${field.min}.`);
    if (field.max !== undefined && value > field.max) issue(issues, path, "data.max", `Value must be at most ${field.max}.`);
    if (field.step !== undefined && field.step > 0 && field.min !== undefined) {
      const steps = (value - field.min) / field.step;
      if (Math.abs(steps - Math.round(steps)) > Number.EPSILON * 10) issue(issues, path, "data.step", `Value must follow a step of ${field.step}.`);
    }
    return;
  }
  if (field.kind === "boolean") {
    if (typeof value !== "boolean") issue(issues, path, "data.boolean", "Expected a boolean.");
    return;
  }
  if (field.kind === "select") {
    if (typeof value !== "string" || !field.options.some((option) => option.value === value)) issue(issues, path, "data.option", "Expected one of the declared option values.");
    return;
  }
  if (field.kind === "multi-select") {
    if (!Array.isArray(value) || !value.every((entry) => typeof entry === "string" && field.options.some((option) => option.value === entry))) issue(issues, path, "data.options", "Expected a list of declared option values.");
    return;
  }
  if (field.kind === "asset" && typeof value !== "string" && !record(value)) issue(issues, path, "data.asset", "Expected an asset URL, id or descriptor.");
}

export function validateAuthoringData(
  schema: AuthoringSchema,
  data: unknown,
  options: AuthoringValidationOptions,
): ValidationResult<Record<string, unknown>> {
  const issues: ValidationIssue[] = [];
  if (!record(data)) return { success: false, issues: [{ path: "$", code: "data.type", message: "Expected an authoring data object.", severity: "error" }] };
  schema.fields.forEach((field) => validateAuthoredValue(field, data[field.key], `$.${field.key}`, data, options, issues));
  return issues.some(({ severity }) => severity === "error")
    ? { success: false, issues }
    : { success: true, data, issues };
}

export function validateComponentManifest(input: unknown): ValidationResult<ComponentManifest> {
  const issues: ValidationIssue[] = [];
  if (!record(input)) {
    return { success: false, issues: [{ path: "$", code: "manifest.type", message: "Expected a manifest object.", severity: "error" }] };
  }
  if (!nonEmptyString(input.id) || !IDENTIFIER.test(input.id)) issue(issues, "$.id", "manifest.id", "Use a stable lowercase dotted or dashed identifier.");
  if (!validLocalizedText(input.name)) issue(issues, "$.name", "manifest.name", "Name must contain text.");
  if (!validLocalizedText(input.description)) issue(issues, "$.description", "manifest.description", "Description must contain text.");
  if (!isComponentRole(input.role)) issue(issues, "$.role", "manifest.role", "Unknown component role.");
  if (!Array.isArray(input.families) || input.families.length === 0) issue(issues, "$.families", "manifest.families", "At least one family is required.");
  else input.families.forEach((family, index) => {
    if (!isComponentFamily(family)) issue(issues, `$.families[${index}]`, "manifest.family", "Unknown component family.");
  });
  collectFacetIssues(input.facets, "$.facets", issues);
  if (!record(input.lifecycle)) issue(issues, "$.lifecycle", "manifest.lifecycle", "Catalog lifecycle metadata is required.");
  else {
    if (!["available", "planned", "deprecated"].includes(String(input.lifecycle.availability))) issue(issues, "$.lifecycle.availability", "lifecycle.availability", "Unknown availability.");
    if (!["draft", "experimental", "stable"].includes(String(input.lifecycle.maturity))) issue(issues, "$.lifecycle.maturity", "lifecycle.maturity", "Unknown maturity.");
  }

  if (!record(input.version)) issue(issues, "$.version", "version.type", "Version metadata is required.");
  else {
    for (const key of ["schema", "component"] as const) {
      if (!nonEmptyString(input.version[key]) || !SEMVER.test(input.version[key] as string)) issue(issues, `$.version.${key}`, "version.semver", `${key} must be valid semver.`);
    }
    if (input.version.migrations !== undefined) {
      if (!Array.isArray(input.version.migrations)) issue(issues, "$.version.migrations", "version.migrations", "Migrations must be an array.");
      else input.version.migrations.forEach((migration, index) => {
        const path = `$.version.migrations[${index}]`;
        if (!record(migration)) issue(issues, path, "version.migration", "Expected migration metadata.");
        else {
          if (!nonEmptyString(migration.from) || !SEMVER.test(migration.from)) issue(issues, `${path}.from`, "version.semver", "Migration source must be semver.");
          if (!nonEmptyString(migration.to) || !SEMVER.test(migration.to)) issue(issues, `${path}.to`, "version.semver", "Migration target must be semver.");
          if (migration.from === migration.to) issue(issues, path, "version.no-op", "Migration source and target must differ.");
          if (!nonEmptyString(migration.description)) issue(issues, `${path}.description`, "version.description", "Migration description is required.");
        }
      });
    }
  }

  const authoringResult = validateAuthoringSchema(input.authoring);
  authoringResult.issues.forEach((authoringIssue) => issues.push({ ...authoringIssue, path: `$.authoring${authoringIssue.path.slice(1)}` }));
  if (!Array.isArray(input.evidence)) issue(issues, "$.evidence", "manifest.evidence", "Evidence must be an array; use an empty array when not evaluated.");
  else input.evidence.forEach((reference, index) => {
    const path = `$.evidence[${index}]`;
    if (!record(reference)) issue(issues, path, "evidence.type", "Expected an evidence reference.");
    else {
      if (!nonEmptyString(reference.id)) issue(issues, `${path}.id`, "evidence.id", "Evidence id is required.");
      if (!["high", "moderate", "low", "not-evaluated"].includes(String(reference.strength))) issue(issues, `${path}.strength`, "evidence.strength", "Unknown evidence strength.");
      if (!nonEmptyString(reference.citation)) issue(issues, `${path}.citation`, "evidence.citation", "Citation is required.");
      if (!nonEmptyString(reference.claim)) issue(issues, `${path}.claim`, "evidence.claim", "The supported claim is required.");
    }
  });
  if (!record(input.accessibility)) issue(issues, "$.accessibility", "manifest.accessibility", "Accessibility metadata is required.");
  else {
    if (!["full", "alternative", "not-applicable", "unsupported"].includes(String(input.accessibility.keyboard))) issue(issues, "$.accessibility.keyboard", "a11y.keyboard", "Unknown keyboard support level.");
    if (!["full", "partial", "not-applicable", "unsupported"].includes(String(input.accessibility.screenReader))) issue(issues, "$.accessibility.screenReader", "a11y.screen-reader", "Unknown screen-reader support level.");
    if (input.accessibility.keyboard === "unsupported") issue(issues, "$.accessibility.keyboard", "a11y.unsupported", "Catalog admission requires keyboard access or an equivalent alternative.", "warning");
  }
  if (input.variants !== undefined) {
    if (!Array.isArray(input.variants)) issue(issues, "$.variants", "manifest.variants", "Variants must be an array.");
    else {
      const variantIds = new Set<string>();
      input.variants.forEach((variant, index) => {
        const path = `$.variants[${index}]`;
        if (!record(variant) || !nonEmptyString(variant.id) || !validLocalizedText(variant.name)) issue(issues, path, "manifest.variant", "Each variant needs an id and name.");
        else if (variantIds.has(variant.id)) issue(issues, `${path}.id`, "manifest.duplicate-variant", "Variant ids must be unique.");
        else variantIds.add(variant.id);
      });
    }
  }
  if (input.optionalDependencies !== undefined) {
    if (!Array.isArray(input.optionalDependencies)) issue(issues, "$.optionalDependencies", "manifest.dependencies", "Optional dependencies must be an array.");
    else input.optionalDependencies.forEach((dependency, index) => {
      if (!record(dependency) || !nonEmptyString(dependency.package) || !nonEmptyString(dependency.purpose)) issue(issues, `$.optionalDependencies[${index}]`, "manifest.dependency", "Each optional dependency needs a package and purpose.");
    });
  }
  if (input.mappings !== undefined) {
    if (!record(input.mappings)) issue(issues, "$.mappings", "manifest.mappings", "Mappings must be an object.");
    else {
      const qtiMappings = Array.isArray(input.mappings.qti) ? input.mappings.qti : input.mappings.qti === undefined ? [] : [input.mappings.qti];
      qtiMappings.forEach((mapping, index) => {
        if (!record(mapping) || !nonEmptyString(mapping.interaction) || !["exact", "approximate", "none"].includes(String(mapping.fidelity))) issue(issues, `$.mappings.qti[${index}]`, "mapping.qti", "Each QTI mapping needs an interaction and fidelity.");
      });
      const xapiMappings = Array.isArray(input.mappings.xapi) ? input.mappings.xapi : input.mappings.xapi === undefined ? [] : [input.mappings.xapi];
      xapiMappings.forEach((mapping, index) => {
        if (!record(mapping)) issue(issues, `$.mappings.xapi[${index}]`, "mapping.xapi", "Expected an xAPI mapping.");
        else if (mapping.interactionType !== undefined && !["true-false", "choice", "fill-in", "long-fill-in", "matching", "performance", "sequencing", "likert", "numeric", "other"].includes(String(mapping.interactionType))) issue(issues, `$.mappings.xapi[${index}].interactionType`, "mapping.xapi-type", "Unknown xAPI interaction type.");
      });
    }
  }

  return issues.some(({ severity }) => severity === "error")
    ? { success: false, issues }
    : { success: true, data: input as unknown as ComponentManifest, issues };
}

function validateResponseNode(input: unknown, path: string, issues: ValidationIssue[]): void {
  if (!record(input)) {
    issue(issues, path, "response.type", "Expected a response object.");
    return;
  }
  if (!nonEmptyString(input.id)) issue(issues, `${path}.id`, "response.id", "Response id is required.");
  if (!nonEmptyString(input.componentId)) issue(issues, `${path}.componentId`, "response.component", "Component id is required.");
  if (!["draft", "streaming", "submitted"].includes(String(input.status))) issue(issues, `${path}.status`, "response.status", "Unknown response status.");
  if (input.durationMs !== undefined && (typeof input.durationMs !== "number" || input.durationMs < 0)) issue(issues, `${path}.durationMs`, "response.duration", "Duration must be non-negative.");
  const arrayKinds = ["choice", "ordering", "points"];
  if (arrayKinds.includes(String(input.kind)) && !Array.isArray(input.value)) issue(issues, `${path}.value`, "response.value", "This response kind requires an array.");
  else if (input.kind === "composite") {
    if (!Array.isArray(input.value)) issue(issues, `${path}.value`, "response.value", "Composite response requires child responses.");
    else input.value.forEach((child, index) => validateResponseNode(child, `${path}.value[${index}]`, issues));
  } else if (input.kind === "numeric" && typeof input.value !== "number") issue(issues, `${path}.value`, "response.value", "Numeric response requires a number.");
  else if (input.kind === "boolean" && typeof input.value !== "boolean") issue(issues, `${path}.value`, "response.value", "Boolean response requires a boolean.");
  else if (["text", "file", "audio", "drawing"].includes(String(input.kind)) && typeof input.value !== "string") issue(issues, `${path}.value`, "response.value", "This response kind requires a string.");
  else if (input.kind === "matching" && !record(input.value)) issue(issues, `${path}.value`, "response.value", "Matching response requires an object.");
  else if (!["choice", "text", "numeric", "boolean", "ordering", "matching", "points", "file", "audio", "drawing", "composite"].includes(String(input.kind))) issue(issues, `${path}.kind`, "response.kind", "Unknown response kind.");
}

export function validateResponse(input: unknown): ValidationResult<Response> {
  const issues: ValidationIssue[] = [];
  validateResponseNode(input, "$", issues);
  return issues.length > 0 ? { success: false, issues } : { success: true, data: input as Response, issues };
}

export function validateResult(input: unknown): ValidationResult<Result> {
  const issues: ValidationIssue[] = [];
  if (!record(input)) issue(issues, "$", "result.type", "Expected a result object.");
  else {
    if (!nonEmptyString(input.responseId)) issue(issues, "$.responseId", "result.response", "Response id is required.");
    if (!["ungraded", "correct", "incorrect", "partial"].includes(String(input.status))) issue(issues, "$.status", "result.status", "Unknown result status.");
    for (const key of ["score", "maxScore", "normalizedScore"] as const) {
      if (input[key] !== undefined && typeof input[key] !== "number") issue(issues, `$.${key}`, "result.score", `${key} must be a number.`);
    }
    if (typeof input.normalizedScore === "number" && (input.normalizedScore < 0 || input.normalizedScore > 1)) issue(issues, "$.normalizedScore", "result.normalized-range", "Normalized score must be between 0 and 1.");
    if (typeof input.score === "number" && typeof input.maxScore === "number" && input.score > input.maxScore) issue(issues, "$.score", "result.score-range", "Score cannot exceed maxScore.");
  }
  return issues.length > 0 ? { success: false, issues } : { success: true, data: input as unknown as Result, issues };
}
