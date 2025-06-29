#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  )
);

// src/index.ts
var import_path2 = __toESM(require("path"));

// src/core/watcher.ts
var import_chokidar = __toESM(require("chokidar"));

// src/utils/logger.ts
var import_chalk = __toESM(require("chalk"));
var logger = {
  info: (...args) =>
    console.log(import_chalk.default.blue("[\u2139]"), ...args),
  success: (...args) =>
    console.log(import_chalk.default.green("[\u2713]"), ...args),
  warn: (...args) =>
    console.warn(import_chalk.default.yellow("[\u26A0]"), ...args),
  error: (...args) =>
    console.error(import_chalk.default.red("[\u2717]"), ...args),
  debug: (...args) => {
    if (process.env.DEBUG) {
      console.log(import_chalk.default.gray("[DEBUG]"), ...args);
    }
  },
};

// src/core/watcher.ts
var SmartWatcher = class {
  constructor(onChange) {
    this.onChange = onChange;
    this.trackedFiles = /* @__PURE__ */ new Set();
    this.watcher = import_chokidar.default
      .watch([], {
        ignored: /node_modules/,
        ignoreInitial: true,
        atomic: 300,
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 50,
        },
      })
      .on("change", (file) => {
        logger.info(`File changed: ${file}`);
        this.onChange(file);
      });
  }
  updateFiles(files) {
    const added = [...files].filter((f) => !this.trackedFiles.has(f));
    const removed = [...this.trackedFiles].filter((f) => !files.has(f));
    if (added.length) this.watcher.add(added);
    if (removed.length) this.watcher.unwatch(removed);
    this.trackedFiles = new Set(files);
    logger.success(`Watching ${files.size} files`);
  }
};

// src/core/process-manager.ts
var import_child_process = require("child_process");
var ProcessManager = class {
  constructor(command) {
    this.command = command;
  }
  start() {
    this.child = (0, import_child_process.spawn)(this.command, {
      shell: true,
      stdio: "inherit",
    });
    this.child.on("error", (err) => {
      logger.error(`Process error: ${err.message}`);
    });
    this.child.on("exit", (code) => {
      if (code !== 0) {
        logger.warn(`Process exited with code ${code}`);
      }
    });
  }
  restart() {
    this.child?.kill("SIGTERM");
    this.start();
  }
};

// src/utils/cache.ts
var import_core = require("@swc/core");
var import_fs = __toESM(require("fs"));
var astcache = /* @__PURE__ */ new Map();
async function getCachedAst(file) {
  const stats = import_fs.default.statSync(file);
  const mTime = stats.mtimeMs;
  const cached = astcache.get(file);
  if (cached && cached.mTime === mTime) {
    return cached.ast;
  }
  const code = import_fs.default.readFileSync(file, "utf-8");
  const ast = await (0, import_core.parse)(code, { syntax: "typescript" });
  astcache.set(file, { mTime, ast });
  return ast;
}

// src/utils/resolver.ts
var import_path = __toESM(require("path"));
var import_fs2 = __toESM(require("fs"));
function resolvePath(currentFile, parentFile) {
  if (currentFile.startsWith(".") || currentFile.startsWith("/")) {
    const parentDir = import_path.default.dirname(currentFile);
    let resolved = import_path.default.resolve(parentDir, currentFile);
    if (
      import_fs2.default.existsSync(resolved) &&
      import_fs2.default.statSync(resolved).isFile()
    ) {
      return resolved;
    }
    const exts = [".js", ".ts", ".jsx", ".tsx", ".json"];
    for (const ext of exts) {
      if (import_fs2.default.existsSync(resolved + ext)) {
        return resolved + ext;
      }
    }
    for (const ext of exts) {
      const indexPath = import_path.default.join(resolved, `index.${ext}`);
      if (import_fs2.default.existsSync(indexPath)) {
        return indexPath;
      }
    }
    throw new Error(
      `Cannot resolve import path: ${currentFile} from ${parentFile}`
    );
  } else {
    throw new Error(
      `Non-relative imports (e.g., packages) are not supported: ${currentFile}`
    );
  }
}

// src/core/graph-builder.ts
async function buildDependencyGraph(
  entryPath,
  cache = /* @__PURE__ */ new Map()
) {
  if (cache.has(entryPath)) return cache.get(entryPath);
  const dependencies = /* @__PURE__ */ new Set();
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
    }
  } catch (error) {
    logger.error(`Error parsing ${entryPath}:`, error);
  }
  return dependencies;
}
function mergeGraphs(...graphs) {
  return new Set(graphs.flatMap((graph) => [...graph]));
}
function isNewDependency(file, currentGraph) {
  return !currentGraph.has(file);
}

// src/index.ts
async function main() {
  const [, , script, ...restArgs] = process.argv;
  if (!script) {
    logger.error("Usage: flashmon <script.js> [args]");
    process.exit(1);
  }
  const entryFile = import_path2.default.resolve(process.cwd(), script);
  const runCommand = `node ${entryFile} ${restArgs.join(" ")}`.trim();
  let dependencyGraph = /* @__PURE__ */ new Set();
  const processManager = new ProcessManager(runCommand);
  async function handleChange(changedFile) {
    try {
      if (isNewDependency(changedFile, dependencyGraph)) {
        logger.info(`New dependency detected: ${changedFile}`);
        const newGraph = await buildDependencyGraph(changedFile);
        dependencyGraph = mergeGraphs(dependencyGraph, newGraph);
        watcher.updateFiles(dependencyGraph);
      }
      processManager.restart();
    } catch (error) {
      logger.error("Change handling failed:", error);
    }
  }
  const watcher = new SmartWatcher(handleChange);
  try {
    dependencyGraph = await buildDependencyGraph(entryFile);
    watcher.updateFiles(dependencyGraph);
    processManager.start();
    logger.success(
      `Watching ${dependencyGraph.size} files. Press Ctrl+C to exit.`
    );
  } catch (error) {
    logger.error("Initialization failed:", error);
    process.exit(1);
  }
}
main().catch((error) => {
  logger.error("Fatal error:", error);
  process.exit(1);
});
