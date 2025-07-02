# flashmon

flashmon is a technically advanced, dependency-aware file-watching CLI tool for JavaScript and TypeScript projects. It is engineered as a robust, modern alternative to nodemon, directly addressing the core inefficiencies and limitations of traditional file watchers. By leveraging AST-based dependency tracking, flashmon ensures that only files truly relevant to your application are watched, resulting in more efficient restarts and better scalability for large or modular codebases.

## Technical Overview

flashmon operates by parsing your entry file and recursively analyzing all static `import` and (optionally) `require` statements. It uses SWC for high-performance AST generation, constructing a precise dependency graph in memory. Unlike glob-based watchers, flashmon tracks only the files your application actually imports, including support for `.js`, `.ts`, `.jsx`, `.tsx`, and `.json` modules.

- Dependency Graph Construction:\
  Each import path is resolved relative to its parent file using a custom resolver that mimics Node.js resolution, including support for extensionless imports and directory indexes.

- AST Caching:\
  File ASTs are cached using their modification time (mtime) to minimize redundant parsing, enabling rapid graph rebuilds even in large projects.

- Efficient File Watching:\
  Only the set of files present in the dependency graph are watched. When a change is detected, the graph is rebuilt and the process is restarted, ensuring minimal downtime and maximal responsiveness.

- Process Management:\
   The target script is executed as a child process. On file changes, the previous process is gracefully terminated and a new one is spawned, inheriting stdio for seamless developer experience.
  Running Locally (Development Setup)

---

To run flashmon locally in a development environment, follow these advanced steps:

1.  Clone the repository:

    bash
    `git clone https://github.com/your-org/flashmon.git`
    `cd flashmon`

2.  Install dependencies with strict versioning:

    bash
    `npm i `

3.  Build the TypeScript source (if applicable):

    bash
    `npm run build `

    This compiles the TypeScript codebase to JavaScript, ensuring all type checks and build steps are enforced.

4.  Run the CLI in development mode, watching a test entry file:

    bash
    `node dist/bin/flashmon.js test/fixtures/simple-entry.js `

    Or, if using ts-node for direct TypeScript execution:

    bash
    `npx ts-node src/bin/flashmon.ts test/fixtures/simple-entry.js `

5.  (Optional) Run integration tests to verify watcher behavior:

    bash
    `npm  test  `

    This executes all Jest test suites, including integration tests that simulate file changes and validate watcher accuracy.

6.  Modify or add files in `test/fixtures/` to observe live dependency tracking and process restarts.

## Contributing

1.  Fork this repo and clone it.

2.  Run `npm install` to install dependencies.

3.  Use `npm run dev` to start flashmon in development mode.

4.  Add tests in `test/` and ensure they pass with `npm test`.

We welcome PRs for new features, bug fixes, and documentation improvements!

## License

MIT

## Acknowledgements

- [SWC](https://swc.rs/) for fast and robust JavaScript/TypeScript parsing.

- [chokidar](https://github.com/paulmillr/chokidar) for efficient file watching.

flashmon --- Modern, dependency-aware file watching for serious Node.js developers.
