import chokidar, { FSWatcher } from "chokidar";
import { logger } from "../utils/logger";

export class SmartWatcher {
  private watcher: FSWatcher;
  private trackedFiles = new Set<string>();

  constructor(private onChange: (file: string) => void) {
    this.watcher = chokidar
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
      })
      .on("error", (error) => {
        logger.error(`Watcher error: ${error}`);
      })
      .on("ready", () => {
        logger.info("Watcher is ready");
      });
  }

  updateFiles(files: Set<string>) {
    const added = [...files].filter((f) => !this.trackedFiles.has(f));
    const removed = [...this.trackedFiles].filter((f) => !files.has(f));

    if (added.length) {
      logger.info(`Adding ${added.length} files to watcher: ${added.join(", ")}`);
      this.watcher.add(added);
    }
    if (removed.length) {
      logger.info(`Removing ${removed.length} files from watcher`);
      this.watcher.unwatch(removed);
    }

    this.trackedFiles = new Set(files);
    logger.success(`Watching ${files.size} files`);
  }
}
