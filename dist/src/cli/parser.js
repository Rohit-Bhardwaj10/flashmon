"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "parseArgs", {
    enumerable: true,
    get: function() {
        return parseArgs;
    }
});
const _commander = require("commander");
function parseArgs() {
    const program = new _commander.Command().name("flashmon").description("Dependency-aware file watcher for lightning-fast development").version("1.0.0").argument("[script]", "Script to execute (e.g., dist/index.js)").option("-e, --entry <path>", "Entry file path (default: src/index.ts)").option("-x, --exec <command>", "Command to execute on changes").option("-i, --ignore <patterns...>", "Ignore patterns (glob format)").option("-d, --debug", "Enable debug mode");
    program.parse(process.argv);
    const options = program.opts();
    const [script] = program.args;
    // Handle nodemon-style usage: flashmon dist/index.js
    if (script && !options.exec) {
        return {
            entry: options.entry || "src/index.ts",
            exec: `node ${script}`,
            ignore: options.ignore,
            debug: options.debug
        };
    }
    // Handle explicit command style: flashmon -x "node dist/index.js"
    return {
        entry: options.entry || "src/index.ts",
        exec: options.exec || "node dist/index.js",
        ignore: options.ignore,
        debug: options.debug
    };
}
