import { ARTIFACT_EXECUTION_SCHEMA_VERSION, type ArtifactWorkspaceDefinition } from "@didact/schema";

export const javascriptArtifactFixture = {
  schemaVersion: ARTIFACT_EXECUTION_SCHEMA_VERSION, id: "fixture.javascript-order-transform", title: "Transform order data",
  instructions: "Implement a function that returns the total value of all orders.",
  files: [{ id: "main", path: "main.js", kind: "code", language: "javascript", content: "export function summarize(orders) {\n  return 0;\n}" }, { id: "tests", path: "tests.js", kind: "code", language: "javascript", content: "summarize([{ value: 12 }, { value: 8 }])", readOnly: true }],
  entryFileId: "main", execution: { mode: "sandboxed", runtime: "javascript", timeoutMs: 2000 }, evaluation: { enabled: true },
} as const satisfies ArtifactWorkspaceDefinition;

export const policyArtifactFixture = {
  schemaVersion: ARTIFACT_EXECUTION_SCHEMA_VERSION, id: "fixture.incident-response-draft", title: "Draft an incident response",
  instructions: "Complete the response artifact using the supplied policy reference.",
  files: [{ id: "response", path: "response.md", kind: "text", content: "## Immediate actions\n" }, { id: "policy", path: "policy.md", kind: "text", content: "Escalate confirmed exposure within 15 minutes.", readOnly: true }],
  entryFileId: "response", execution: { mode: "none" }, evaluation: { enabled: true, allowWithoutExecution: true },
} as const satisfies ArtifactWorkspaceDefinition;

export const artifactWorkspaceFixtures = [javascriptArtifactFixture, policyArtifactFixture] as const satisfies readonly ArtifactWorkspaceDefinition[];
