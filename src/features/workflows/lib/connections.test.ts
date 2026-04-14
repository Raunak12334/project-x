import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dedupeWorkflowConnections,
  hasWorkflowConnection,
  makeConnectionKey,
  normalizeAndDedupeWorkflowConnections,
  normalizeWorkflowConnection,
} from "./connections";

describe("workflow connection utilities", () => {
  it("uses one canonical key for empty, null, and legacy default handles", () => {
    const canonical = makeConnectionKey("a", "b", "main", "main");

    assert.equal(makeConnectionKey("a", "b"), canonical);
    assert.equal(makeConnectionKey("a", "b", null, null), canonical);
    assert.equal(
      makeConnectionKey("a", "b", "source-1", "target-1"),
      canonical,
    );
  });

  it("preserves multi-handle behavior while blocking exact duplicates", () => {
    const edges = [
      { source: "router", target: "sales", sourceHandle: "sales" },
      { source: "router", target: "archive", sourceHandle: "archive" },
      { source: "router", target: "sales", sourceHandle: "sales" },
    ];

    assert.deepEqual(dedupeWorkflowConnections(edges), [
      { source: "router", target: "sales", sourceHandle: "sales" },
      { source: "router", target: "archive", sourceHandle: "archive" },
    ]);
  });

  it("detects duplicates before React Flow adds them to UI state", () => {
    assert.equal(
      hasWorkflowConnection(
        [{ source: "a", target: "b", sourceHandle: "main" }],
        { source: "a", target: "b", sourceHandle: "source-1" },
      ),
      true,
    );
  });

  it("normalizes and dedupes save payloads before persistence", () => {
    assert.deepEqual(
      normalizeAndDedupeWorkflowConnections([
        { source: "a", target: "b" },
        { source: "a", target: "b", sourceHandle: "source-1" },
        { source: "a", target: "b", sourceHandle: "route-a" },
      ]),
      [
        {
          source: "a",
          target: "b",
          sourceHandle: "main",
          targetHandle: "main",
        },
        {
          source: "a",
          target: "b",
          sourceHandle: "route-a",
          targetHandle: "main",
        },
      ],
    );
  });

  it("normalizes one connection without dropping handle-specific routes", () => {
    assert.deepEqual(
      normalizeWorkflowConnection({
        source: "condition",
        target: "true-path",
        sourceHandle: "true",
        targetHandle: "target-1",
      }),
      {
        source: "condition",
        target: "true-path",
        sourceHandle: "true",
        targetHandle: "main",
      },
    );
  });
});
