import { buildDependencyGraph } from "../src/core/graph-builder";
import path from "path";

describe("buildDependencyGraph", () => {
  it("should find direct dependencies", async () => {
    const entry = path.resolve(__dirname, "fixtures/simple-entry.js");
    const deps = await buildDependencyGraph(entry);
    expect([...deps]).toContainEqual(expect.stringContaining("dep1.js"));
    expect([...deps]).toContainEqual(expect.stringContaining("dep2.js"));
  });

  it("should handle circular dependencies gracefully", async () => {
    const entry = path.resolve(__dirname, "fixtures/circular-a.js");
    const deps = await buildDependencyGraph(entry);
    expect(deps.size).toBeGreaterThan(0);
  });

  it("should skip unresolved imports", async () => {
    const entry = path.resolve(__dirname, "fixtures/with-unresolved.js");
    const deps = await buildDependencyGraph(entry);
    // Should not throw, should not include the unresolved file
    expect([...deps].some((f) => f.includes("nonexistent.js"))).toBe(false);
  });
});
