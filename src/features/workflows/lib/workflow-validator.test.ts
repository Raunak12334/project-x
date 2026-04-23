import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NodeType } from "@prisma/client";
import { validateWorkflow } from "./workflow-validator";

const trigger = {
  id: "trigger",
  type: NodeType.MANUAL_TRIGGER,
  position: { x: 0, y: 0 },
  data: {},
};

const httpNode = {
  id: "http",
  type: NodeType.HTTP_REQUEST,
  position: { x: 200, y: 0 },
  data: {
    variableName: "httpResult",
    url: "https://example.com",
    method: "GET",
  },
};

describe("workflow validator", () => {
  it("requires exactly one trigger", () => {
    const result = validateWorkflow({ nodes: [httpNode], edges: [] });

    assert.equal(result.isValid, false);
    assert.equal(result.issues[0]?.code, "NO_TRIGGER");
  });

  it("blocks placeholder nodes", () => {
    const result = validateWorkflow({
      nodes: [
        trigger,
        {
          id: "placeholder",
          type: NodeType.INITIAL,
          position: { x: 100, y: 0 },
          data: {},
        },
      ],
      edges: [],
    });

    assert.equal(result.isValid, false);
    assert.ok(result.issues.some((issue) => issue.code === "PLACEHOLDER_NODE"));
  });

  it("detects unreachable nodes", () => {
    const result = validateWorkflow({
      nodes: [trigger, httpNode],
      edges: [],
    });

    assert.equal(result.isValid, false);
    assert.ok(result.issues.some((issue) => issue.code === "UNREACHABLE_NODE"));
  });

  it("accepts a connected valid workflow", () => {
    const result = validateWorkflow({
      nodes: [trigger, httpNode],
      edges: [
        {
          source: "trigger",
          target: "http",
          sourceHandle: "main",
          targetHandle: "main",
        },
      ],
    });

    assert.equal(result.isValid, true);
  });

  it("blocks invalid Composio JSON and missing integration", () => {
    const result = validateWorkflow({
      nodes: [
        trigger,
        {
          id: "composio",
          type: NodeType.COMPOSIO,
          position: { x: 200, y: 0 },
          data: {
            variableName: "composioResult",
            toolSlug: "GITHUB_STAR_REPO",
            argumentsJson: "{",
          },
        },
      ],
      edges: [
        {
          source: "trigger",
          target: "composio",
          sourceHandle: "main",
          targetHandle: "main",
        },
      ],
    });

    assert.equal(result.isValid, false);
    assert.ok(result.issues.some((issue) => issue.code === "INVALID_JSON"));
    assert.ok(
      result.issues.some((issue) => issue.code === "MISSING_INTEGRATION"),
    );
  });
});
