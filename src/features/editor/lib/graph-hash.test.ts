import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createWorkflowGraphHash } from "./graph-hash";

describe("workflow graph hash", () => {
  it("is stable when node and edge arrays are reordered", () => {
    const nodes = [
      {
        id: "a",
        type: "MANUAL_TRIGGER",
        position: { x: 0, y: 0 },
        data: {},
      },
      {
        id: "b",
        type: "HTTP_REQUEST",
        position: { x: 100, y: 0 },
        data: { url: "https://example.com" },
      },
    ];
    const edges = [{ id: "a-b", source: "a", target: "b" }];

    assert.equal(
      createWorkflowGraphHash(nodes, edges),
      createWorkflowGraphHash([...nodes].reverse(), [...edges].reverse()),
    );
  });

  it("changes when persisted config changes", () => {
    const baseNode = {
      id: "b",
      type: "HTTP_REQUEST",
      position: { x: 100, y: 0 },
      data: { url: "https://example.com" },
    };

    assert.notEqual(
      createWorkflowGraphHash([baseNode], []),
      createWorkflowGraphHash(
        [{ ...baseNode, data: { url: "https://otogent.com" } }],
        [],
      ),
    );
  });
});
