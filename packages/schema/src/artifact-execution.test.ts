import { describe, expect, it } from "vitest";
import {
  ARTIFACT_EXECUTION_SCHEMA_VERSION,
  createArtifactWorkspaceState,
  validateArtifactWorkspaceDefinition,
  validateArtifactWorkspaceState,
  type ArtifactWorkspaceDefinition,
} from "./artifact-execution";

const definition: ArtifactWorkspaceDefinition = {
  schemaVersion: ARTIFACT_EXECUTION_SCHEMA_VERSION,
  id: "code.transform",
  title: "Transform records",
  files: [
    { id: "main", path: "main.js", kind: "code", language: "javascript", content: "export const total = 2;" },
    { id: "readme", path: "README.md", kind: "text", content: "Instructions", readOnly: true },
  ],
  entryFileId: "main",
  execution: { mode: "sandboxed", runtime: "javascript", timeoutMs: 2000 },
  evaluation: { enabled: true },
};

describe("artifact execution schema", () => {
  it("accepts a serializable workspace", () => expect(validateArtifactWorkspaceDefinition(definition)).toEqual({ success: true, data: definition, issues: [] }));
  it("creates deterministic initial state", () => expect(createArtifactWorkspaceState(definition)).toMatchObject({ activeFileId: "main", executionStatus: "idle", revision: 0, files: { main: "export const total = 2;", readme: "Instructions" } }));
  it("rejects duplicate files and broken entry references", () => {
    const invalid = { ...definition, entryFileId: "missing", files: [...definition.files, { ...definition.files[0] }] };
    const result = validateArtifactWorkspaceDefinition(invalid);
    expect(result.success).toBe(false); expect(result.issues.map(({ code }: { code: string }) => code)).toEqual(expect.arrayContaining(["unique", "reference"]));
  });
  it("requires a runtime only for sandboxed execution", () => {
    expect(validateArtifactWorkspaceDefinition({ ...definition, execution: { mode: "sandboxed" } }).success).toBe(false);
    expect(validateArtifactWorkspaceDefinition({ ...definition, execution: { mode: "none" } }).success).toBe(true);
  });
  it("allows partial streaming definitions", () => expect(validateArtifactWorkspaceDefinition({ id: "draft" }, { mode: "streaming" }).success).toBe(true));
  it("validates state references and file contents", () => {
    const state = createArtifactWorkspaceState(definition); expect(validateArtifactWorkspaceState(state, definition).success).toBe(true);
    expect(validateArtifactWorkspaceState({ ...state, activeFileId: "missing", files: {} }, definition).success).toBe(false);
  });
  it("survives JSON round trips", () => expect(validateArtifactWorkspaceDefinition(JSON.parse(JSON.stringify(definition))).success).toBe(true));
});
