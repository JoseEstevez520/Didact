import type {
  AccessibilityMetadata,
  AuthoringField,
  EvidenceReference,
  QtiMapping,
  XapiMapping,
} from "@didact/schema";

export const textField = (
  key: string,
  label: string,
  description: string,
  required = true,
  rich = false,
): AuthoringField => ({ key, label, kind: rich ? "rich-text" : "text", description, required });

export const listField = (
  key: string,
  label: string,
  description: string,
  required = true,
): AuthoringField => ({
  key,
  label,
  kind: "list",
  description,
  required,
  reorderable: true,
  item: { key: "item", label: "Item", kind: "text", required: true },
});

export const objectField = (
  key: string,
  label: string,
  description: string,
  required = true,
): AuthoringField => ({
  key,
  label,
  kind: "object",
  description,
  required,
  fields: [{ key: `${key}Value`, label: "Value", kind: "text", required: true }],
});

export const booleanField = (
  key: string,
  label: string,
  description: string,
  required = false,
): AuthoringField => ({ key, label, kind: "boolean", description, required });

export const numberField = (
  key: string,
  label: string,
  description: string,
  options: { required?: boolean; min?: number; max?: number; step?: number } = {},
): AuthoringField => ({
  key,
  label,
  kind: "number",
  description,
  required: options.required ?? false,
  min: options.min,
  max: options.max,
  step: options.step,
});

export const selectField = (
  key: string,
  label: string,
  description: string,
  options: readonly string[],
  required = true,
): AuthoringField => ({
  key,
  label,
  kind: "select",
  description,
  required,
  options: options.map((value) => ({ value, label: value })),
});

export const evidence = (
  id: string,
  strength: EvidenceReference["strength"],
  citation: string,
  claim: string,
  limitations: string,
): EvidenceReference => ({ id, strength, citation, claim, limitations });

export const accessibility = (
  notes: string,
  wcagCriteria: readonly string[],
  extra: Partial<AccessibilityMetadata> = {},
): AccessibilityMetadata => ({
  keyboard: "full",
  screenReader: "full",
  wcagCriteria,
  notes,
  ...extra,
});

export const qti = (
  interaction: string,
  fidelity: QtiMapping["fidelity"],
  notes: string,
): QtiMapping => ({ interaction, fidelity, version: "3.0", notes });

export const xapi = (
  interactionType: XapiMapping["interactionType"],
  notes: string,
): XapiMapping => ({ interactionType, notes });

export const schemaVersion = "1.0.0";
export const informativeFeedbackSource =
  "Wisniewski, Zierer & Hattie (2020), The Power of Feedback Revisited";
export const learningTechniquesSource =
  "Dunlosky et al. (2013), Improving Students' Learning With Effective Learning Techniques";
export const generativeLearningSource =
  "Fiorella & Mayer (2016), Eight Ways to Promote Generative Learning";
