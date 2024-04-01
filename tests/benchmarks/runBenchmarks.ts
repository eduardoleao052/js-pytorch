import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { autogradBench, LOG_FILE as AUTOGRAD_LOG_FILE } from "./autograd.js";
import { serializeBenchmark } from "./serializeBenchmark.js";

const args = process.argv.slice(2);
const SAVE = args.find((arg) => arg.match(/^(--save|-s)$/));

async function bench() {
  console.log("Running benchmarks...");
  const benchmarks = [
    {
      tasks: autogradBench,
      logFile: AUTOGRAD_LOG_FILE
    }
  ];

  for (const { tasks, logFile } of benchmarks) {
    const results = await tasks();

    if (SAVE) {
      console.log(`Saving benchmark results to ${logFile}...`);
      try {
        const log = JSON.parse(
          await readFile(join("tests", "benchmarks", logFile), "utf-8")
        );
        log.push(...serializeBenchmark(results));
        await writeFile(
          join("tests", "benchmarks", logFile),
          JSON.stringify(log, null, 2)
        );
      } catch (err) {
        console.error(err);
      }
    }
  }
}

bench();
