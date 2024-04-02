import { Task } from "tinybench";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Benchmark } from "./serializeBenchmark";

export async function compareBenchmarks(
  logFile: string,
  benchName: string,
  tasks: Task[]
) {
  const task = tasks.find((t) => t.name === benchName);

  if (!task) {
    throw new Error(`Task with name ${benchName} not found`);
  }

  const LAST_BENCH: Benchmark = JSON.parse(
    await readFile(join("tests", "benchmarks", logFile), "utf-8")
  )
    .filter((b: Benchmark) => b.name === benchName)
    .pop();

  if (LAST_BENCH && task.result) {
    if (LAST_BENCH.samples !== task.result.samples.length) {
      console.log(
        `WARNING: Number of samples changed from ${LAST_BENCH.samples} to ${task.result.samples.length}`
      );
    }

    const mean = task.result.mean;
    // This is the difference in the mean execution time of each iteration compared to the last benchmark
    // e.g. new 20.68ms - old 19.88ms = 0.8ms
    const diffMean = mean - LAST_BENCH.mean;
    // The difference as a percentage
    // e.g. (0.8ms / 19.88ms) * 100 = 4.024%
    const diffMeanPercent = (Math.abs(diffMean) / LAST_BENCH.mean) * 100;
    // If the new benchmark exceeds the last margin of error we should notify the user
    // e.g. 4.024% > 3.06%
    if (diffMeanPercent > LAST_BENCH.rme) {
      // By how much does the new benchmark exceed the last margin of error?
      // e.g. 4.024% - 3.06% = 0.964%  => "New benchmark exceeded last margin by 0.964%"
      const diffRME = Math.abs(diffMeanPercent - LAST_BENCH.rme);
      if (mean > LAST_BENCH.mean) {
        console.log(
          `New benchmark mean execution time exceeded the last by its margin of error plus ${diffRME.toFixed(2)}%`
        );
      } else {
        console.log(
          `New benchmark mean execution time is ${diffRME.toFixed(2)}% below the last minus its margin of error`
        );
      }
    }

    // Return the difference in the mean execution time as a percentage
    // The above logic to determine if the new benchmark exceeded the last margin of error
    // could be moved to the benchmark runner if we wanted to centralize logging
    return diffMeanPercent;
  }

  return null;
}
