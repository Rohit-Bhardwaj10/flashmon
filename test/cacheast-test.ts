import { getCachedAst } from "../src/utils/cache";
import path from "path";

describe("getCachedAst", () => {
  const file = path.resolve(__dirname, "fixtures/simple-entry.js");

  it("parses and caches AST", async () => {
    const ast1 = await getCachedAst(file);
    const ast2 = await getCachedAst(file);
    expect(ast1).toBe(ast2); // Should be the same object due to cache
  });

  it("re-parses if file changes", async () => {
    const ast1 = await getCachedAst(file);
    // Simulate file change by touching the file
    const now = new Date();
    require("fs").utimesSync(file, now, now);
    const ast2 = await getCachedAst(file);
    expect(ast1).not.toBe(ast2); // Should be different after file change
  });
});
