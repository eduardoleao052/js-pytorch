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
    const diffMean = mean - LAST_BENCH.mean;
    const diffMeanPercent = (Math.abs(diffMean) / LAST_BENCH.mean) * 100;
    const diffRME = Math.abs(diffMeanPercent - LAST_BENCH.rme);
    if (diffMeanPercent > LAST_BENCH.rme) {
      if (mean > LAST_BENCH.mean) {
        console.log(
          `New benchmark exceeded last margin by ${diffRME.toFixed(2)}%`
        );
      } else {
        console.log(
          `New benchmark is ${diffRME.toFixed(2)}% below last margin`
        );
      }
    }

    return diffRME;
  }

  return null;
}
