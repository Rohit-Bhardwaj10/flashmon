"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _path = /*#__PURE__*/ _interop_require_default(require("path"));
const _watcher = require("./core/watcher");
const _processmanager = require("./core/process-manager");
const _graphbuilder = require("./core/graph-builder");
const _logger = require("./utils/logger");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function main() {
    // Parse CLI: get script and any additional args
    const [, , script, ...restArgs] = process.argv;
    if (!script) {
        _logger.logger.error("Usage: flashmon <script.js> [args]");
        process.exit(1);
    }
    // Resolve the user's entry file
    const entryFile = _path.default.resolve(process.cwd(), script);
    // Command to run (with any extra args)
    const runCommand = `node ${entryFile} ${restArgs.join(" ")}`.trim();
    // State: current dependency graph
    let dependencyGraph = new Set();
    // Process manager for the child process
    const processManager = new _processmanager.ProcessManager(runCommand);
    // File change handler
    async function handleChange(changedFile) {
        try {
            // If the changed file is a new dependency, update the graph and watcher
            if ((0, _graphbuilder.isNewDependency)(changedFile, dependencyGraph)) {
                _logger.logger.info(`New dependency detected: ${changedFile}`);
                const newGraph = await (0, _graphbuilder.buildDependencyGraph)(changedFile);
                dependencyGraph = (0, _graphbuilder.mergeGraphs)(dependencyGraph, newGraph);
                watcher.updateFiles(dependencyGraph);
            }
            // Always restart the process to reflect changes
            processManager.restart();
        } catch (error) {
            _logger.logger.error("Change handling failed:", error);
        }
    }
    // Watcher setup: watches all files in the dependency graph
    const watcher = new _watcher.SmartWatcher(handleChange);
    try {
        // Build initial dependency graph and start watching
        dependencyGraph = await (0, _graphbuilder.buildDependencyGraph)(entryFile);
        watcher.updateFiles(dependencyGraph);
        // Start the user process (e.g., node dist/index.js)
        processManager.start();
        _logger.logger.success(`Watching ${dependencyGraph.size} files. Press Ctrl+C to exit.`);
    } catch (error) {
        _logger.logger.error("Initialization failed:", error);
        process.exit(1);
    }
}
// Run main() and handle fatal errors
main().catch((error)=>{
    _logger.logger.error("Fatal error:", error);
    process.exit(1);
});
