import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ARTIFACT_EXECUTION_SCHEMA_VERSION, type ArtifactWorkspaceDefinition } from "@didact/schema";
import { CodeExercise } from "./code-exercise.js";

afterEach(cleanup);
const definition: ArtifactWorkspaceDefinition = { schemaVersion: ARTIFACT_EXECUTION_SCHEMA_VERSION, id: "sql.sales", title: "Sales query", instructions: "Return the total by region.", files: [{ id: "query", path: "query.sql", kind: "code", language: "sql", content: "SELECT * FROM sales;" }, { id: "schema", path: "schema.sql", kind: "code", content: "CREATE TABLE sales (...);", readOnly: true }], entryFileId: "query", execution: { mode: "sandboxed", runtime: "sql" }, evaluation: { enabled: true } };

describe("CodeExercise", () => {
  it("edits files, executes through the injected port and shows output", async () => {
    const user = userEvent.setup(); const execute = vi.fn(async ({ files }) => ({ status: "succeeded" as const, output: [{ channel: "stdout" as const, text: files.query }] }));
    render(<CodeExercise definition={definition} execute={execute} />);
    const editor = screen.getByLabelText("Editor: query.sql"); await user.clear(editor); await user.type(editor, "SELECT region FROM sales;"); await user.click(screen.getByRole("button", { name: "Run" }));
    expect(execute).toHaveBeenCalledWith(expect.objectContaining({ runtime: "sql", files: { query: "SELECT region FROM sales;", schema: "CREATE TABLE sales (...);" } }));
    expect(await screen.findByText("SELECT region FROM sales;", { selector: "[data-channel='stdout']" })).toBeVisible();
  });
  it("keeps evaluation independent from execution", async () => {
    const user = userEvent.setup(); const execute = vi.fn(async () => ({ status: "succeeded" as const, output: [] })); const evaluate = vi.fn(async () => ({ status: "correct" as const, feedback: "Good aggregation." }));
    render(<CodeExercise definition={definition} execute={execute} evaluate={evaluate} />);
    expect(screen.getByRole("button", { name: "Check work" })).toBeDisabled(); await user.click(screen.getByRole("button", { name: "Run" })); await user.click(await screen.findByRole("button", { name: "Check work" }));
    expect(evaluate).toHaveBeenCalled(); expect(await screen.findByText("Good aggregation.")).toBeVisible();
  });
  it("supports file tabs and read-only reference files", async () => { const user = userEvent.setup(); render(<CodeExercise definition={definition} />); await user.click(screen.getByRole("tab", { name: "schema.sql" })); expect(screen.getByLabelText("Editor: schema.sql")).toHaveAttribute("readonly"); });
  it("turns adapter errors into safe output", async () => { const user = userEvent.setup(); render(<CodeExercise definition={definition} execute={() => { throw new Error("Sandbox unavailable"); }} />); await user.click(screen.getByRole("button", { name: "Run" })); expect(await screen.findByText("Sandbox unavailable")).toBeVisible(); });
  it("supports controlled, disabled, streaming and empty states", () => { const state = { files: { query: "SELECT 1", schema: "fixed" }, activeFileId: "query", executionStatus: "idle" as const, revision: 0 }; const { rerender } = render(<CodeExercise definition={definition} state={state} disabled />); expect(screen.getByLabelText("Editor: query.sql")).toBeDisabled(); rerender(<CodeExercise streaming />); expect(screen.getByRole("status")).toHaveTextContent("still loading"); rerender(<CodeExercise />); expect(screen.getByText("There is no exercise to display.")).toBeVisible(); });
  it("has no detectable accessibility violations", async () => { const { container } = render(<CodeExercise definition={definition} />); expect(await axe(container)).toHaveNoViolations(); });
});
