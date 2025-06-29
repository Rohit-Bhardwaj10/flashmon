import { getCachedAst } from "../utils/cache";
import { resolvePath } from "../utils/resolver";
import { logger } from "../utils/logger";

export async function buildDependencyGraph(
  entryPath: string,
  cache = new Map<string, Set<string>>()
): Promise<Set<string>> {
  if (cache.has(entryPath)) return cache.get(entryPath)!;

  const dependencies = new Set<string>();
  cache.set(entryPath, dependencies);

  try {
    const ast = await getCachedAst(entryPath);

    for (const node of ast.body) {
      if (
        node.type === "ImportDeclaration" &&
        node.source?.type === "StringLiteral"
      ) {
        const importPath = node.source.value;
        try {
          const resolvedPath = resolvePath(importPath, entryPath);
          dependencies.add(String(resolvedPath));

          // Recursively build subgraph
          const subDeps = await buildDependencyGraph(
            String(resolvedPath),
            cache
          );
          subDeps.forEach((dep) => dependencies.add(dep));
        } catch (error) {
          logger.warn(
            `Skipping unresolved import: ${importPath} in ${entryPath}`
          );
        }
      }
      // (Optional) Add require() support here
    }
  } catch (error) {
    logger.error(`Error parsing ${entryPath}:`, error);
  }

  return dependencies;
}

// Merge two dependency graphs
export function mergeGraphs(...graphs: Set<string>[]): Set<string> {
  return new Set(graphs.flatMap((graph) => [...graph]));
}

// Check if file is a new dependency
export function isNewDependency(
  file: string,
  currentGraph: Set<string>
): boolean {
  return !currentGraph.has(file);
}
