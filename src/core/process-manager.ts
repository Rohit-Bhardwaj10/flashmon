import { spawn, ChildProcess } from "child_process";
import { logger } from "../utils/logger";

export class ProcessManager {
  private child?: ChildProcess;
  private command: string;

  constructor(command: string) {
    this.command = command;
  }

  start() {
    this.child = spawn(this.command, {
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
}
