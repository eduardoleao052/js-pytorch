import { autogradBench } from "./autograd.js";

async function bench() {
  console.log("Running benchmarks...");
  await autogradBench();
}

bench();
