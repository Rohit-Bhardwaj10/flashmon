//effficiently caching the parsed ast for each file , re--apesing only if the file changed
import { parse } from "@swc/core";
import fs from "fs";
import path from "path";
interface cachedAst {
  mTime: number;
  ast: any;
}

const astcache = new Map<string, cachedAst>();

//Returns a cached AST for the file if up-to-date, otherwise parses and caches a new AST.

export async function getCachedAst(file: string): Promise<any> {
  const stats = fs.statSync(file);
  const mTime = stats.mtimeMs;
  const cached = astcache.get(file);

  //return cached ast if file hasn't changed
  if (cached && cached.mTime === mTime) {
    return cached.ast;
  }

  const code = fs.readFileSync(file, "utf-8");
  const syntax = path.extname(file).startsWith(".ts")
    ? "typescript"
    : "ecmascript";
  const ast = await parse(code, { syntax });

  astcache.set(file, { mTime, ast });

  return ast;
}
