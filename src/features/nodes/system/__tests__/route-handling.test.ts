import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractRouteIdFromLegacyResult } from "../engine-adapter";

describe("legacy route handling", () => {
  it("preserves explicit routeId", () => {
    assert.equal(
      extractRouteIdFromLegacyResult({
        nodeId: "condition",
        result: { routeId: "yes" },
      }),
      "yes",
    );
  });

  it("preserves legacy __routes selections", () => {
    assert.equal(
      extractRouteIdFromLegacyResult({
        nodeId: "router",
        result: { __routes: { router: "sales" } },
      }),
      "sales",
    );
  });

  it("can read route selections already present in context", () => {
    assert.equal(
      extractRouteIdFromLegacyResult({
        nodeId: "condition",
        result: {},
        context: { __routes: { condition: "no" } },
      }),
      "no",
    );
  });
});
