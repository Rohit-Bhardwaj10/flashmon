import { spawn } from "child_process";
import path from "path";
import fs from "fs";

jest.setTimeout(20000);
const entry = path.resolve(__dirname, "fixtures/simple-entry.ts");
it("watches dependencies and restarts on change", (done) => {
  const cli = spawn("node", [
    path.resolve(__dirname, "../bin/flashmon.js"),
    entry,
  ]);

  cli.stdout.on("data", (data) => {
    const out = data.toString();
    console.log("CLI OUT:", out);
    if (out.includes("Watching")) {
      setTimeout(() => {
        fs.utimesSync(entry, new Date(), new Date());
      }, 500); // Give watcher time to start
    }
    if (out.includes("Process started")) {
      cli.kill();
      done();
    }
  });

  cli.stderr.on("data", (data) => {
    console.error("CLI ERR:", data.toString());
  });

  cli.on("error", (err) => {
    cli.kill();
    done(err);
  });
});
