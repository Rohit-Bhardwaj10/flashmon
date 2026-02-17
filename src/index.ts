import path from "path";
import { SmartWatcher } from "./core/watcher";
import { ProcessManager } from "./core/process-manager";
import {
  buildDependencyGraph,
  isNewDependency,
  mergeGraphs,
} from "./core/graph-builder";
import { logger } from "./utils/logger";

async function main() {
  // Parse CLI: get script and any additional args
  const [, , script, ...restArgs] = process.argv;

  if (!script) {
    logger.error("Usage: flashmon <script.js> [args]");
    process.exit(1);
  }

  // Resolve the user's entry file
  const entryFile = path.resolve(process.cwd(), script);

  // Command to run (with any extra args)
  const runCommand = `node ${entryFile} ${restArgs.join(" ")}`.trim();

  // State: current dependency graph
  let dependencyGraph = new Set<string>();

  // Process manager for the child process
  const processManager = new ProcessManager(runCommand);

  // File change handler
  async function handleChange(changedFile: string) {
    try {
      // If the changed file is a new dependency, update the graph and watcher
      if (isNewDependency(changedFile, dependencyGraph)) {
        logger.info(`New dependency detected: ${changedFile}`);
        const newGraph = await buildDependencyGraph(changedFile);
        dependencyGraph = mergeGraphs(dependencyGraph, newGraph);
        watcher.updateFiles(dependencyGraph);
      }
      // Always restart the process to reflect changes
      processManager.restart();
    } catch (error) {
      logger.error("Change handling failed:", error);
    }
  }

  // Watcher setup: watches all files in the dependency graph
  const watcher = new SmartWatcher(handleChange);

  try {
    // Build initial dependency graph and start watching
    dependencyGraph = await buildDependencyGraph(entryFile);
    watcher.updateFiles(dependencyGraph);

    // Start the user process (e.g., node dist/index.js)
    processManager.start();

    logger.success(
      `Watching ${dependencyGraph.size} files. Press Ctrl+C to exit.`
    );

    // Keep the process alive
    // The watcher and child process should keep it alive, but we add this as a safety measure
    setInterval(() => {}, 1 << 30); // Run every ~12 days (essentially forever)
  } catch (error) {
    logger.error("Initialization failed:", error);
    process.exit(1);
  }
}

// Run main() and handle fatal errors
main().catch((error) => {
  logger.error("Fatal error:", error);
  process.exit(1);
});
