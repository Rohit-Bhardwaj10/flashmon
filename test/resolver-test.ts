import { resolvePath } from "../src/utils/resolver";
import path from "path";

describe("resolvePath", () => {
  const parentFile = path.resolve(__dirname, "fixtures/entry.js");

  it("resolves relative paths", () => {
    const resolved = resolvePath("./dep.js", parentFile);
    expect(resolved).toMatch(/dep\.js$/);
  });

  it("resolves index.js in directories", () => {
    const resolved = resolvePath("./dir", parentFile);
    expect(resolved).toMatch(/dir\/index\.js$/);
  });

  it("throws on non-existent files", () => {
    expect(() => resolvePath("./nope.js", parentFile)).toThrow();
  });

  it("throws on bare imports", () => {
    expect(() => resolvePath("express", parentFile)).toThrow();
  });
});
