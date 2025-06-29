"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get buildDependencyGraph () {
        return buildDependencyGraph;
    },
    get isNewDependency () {
        return isNewDependency;
    },
    get mergeGraphs () {
        return mergeGraphs;
    }
});
const _cache = require("../utils/cache");
const _resolver = require("../utils/resolver");
const _logger = require("../utils/logger");
async function buildDependencyGraph(entryPath, cache = new Map()) {
    if (cache.has(entryPath)) return cache.get(entryPath);
    const dependencies = new Set();
    cache.set(entryPath, dependencies);
    try {
        const ast = await (0, _cache.getCachedAst)(entryPath);
        for (const node of ast.body){
            if (node.type === "ImportDeclaration" && node.source?.type === "StringLiteral") {
                const importPath = node.source.value;
                try {
                    const resolvedPath = (0, _resolver.resolvePath)(importPath, entryPath);
                    dependencies.add(String(resolvedPath));
                    // Recursively build subgraph
                    const subDeps = await buildDependencyGraph(String(resolvedPath), cache);
                    subDeps.forEach((dep)=>dependencies.add(dep));
                } catch (error) {
                    _logger.logger.warn(`Skipping unresolved import: ${importPath} in ${entryPath}`);
                }
            }
        // (Optional) Add require() support here
        }
    } catch (error) {
        _logger.logger.error(`Error parsing ${entryPath}:`, error);
    }
    return dependencies;
}
function mergeGraphs(...graphs) {
    return new Set(graphs.flatMap((graph)=>[
            ...graph
        ]));
}
function isNewDependency(file, currentGraph) {
    return !currentGraph.has(file);
}
