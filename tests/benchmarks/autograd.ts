import { Bench, Task } from "tinybench";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { matmul, add, Tensor } from "../../src/tensor";
import { ReLU, CrossEntropyLoss } from "../../src/layers";
import { formatTrainingResults } from "./formatTrainingResults";
import { compareBenchmarks } from "./compareBenchmarks";

export const BENCH_NAME = "Autograd training loop iteration";
export const DATA_FILE = "autograd-data.json";
export const LOG_FILE = "autograd-log.json";

export async function autogradBench() {
  const INIT_DATA = JSON.parse(
    await readFile(join("tests", "benchmarks", DATA_FILE), "utf-8")
  );

  const bench = new Bench({ iterations: 128, warmupIterations: 0 });

  const lossPerIteration: number[] = [];
  let loss;
  // Define loss function as Cross Entropy Loss and learning rate:
  const loss_func = new CrossEntropyLoss();
  const learning_rate = 3e-3;

  //  Instantiate input and output:
  const x = new Tensor(INIT_DATA.x._data, INIT_DATA.x.requires_grad);
  const y = new Tensor(INIT_DATA.y._data, INIT_DATA.y.requires_grad);

  // Instantiate Neural Network's Layers:
  const w1 = new Tensor(INIT_DATA.w1._data, INIT_DATA.w1.requires_grad);
  const relu1 = new ReLU();
  const w2 = new Tensor(INIT_DATA.w2._data, INIT_DATA.w2.requires_grad);
  const relu2 = new ReLU();
  const w3 = new Tensor(INIT_DATA.w3._data, INIT_DATA.w3.requires_grad);

  const trainingLoop = () => {
    // Training Loop:
    let z = matmul(x, w1);
    z = relu1.forward(z);
    z = add(z, matmul(z, w2));
    z = relu2.forward(z);
    z = matmul(z, w3);

    // Get loss:
    loss = loss_func.forward(z, y);
    // Backpropagate the loss using neuralforge.tensor:
    loss.backward();

    // Update the weights:
    w1._data = w1.add(w1._grad?.mul(learning_rate).neg()).data;
    w2._data = w2.add(w2._grad?.mul(learning_rate).neg()).data;
    w3._data = w3.add(w3._grad?.mul(learning_rate).neg()).data;

    // Reset the gradients to zero after each training step:
    loss.zero_grad_graph();
  };

  bench
    .add(
      BENCH_NAME,
      () => {
        trainingLoop();
      },
      {
        afterEach: async function (this: Task): Promise<void> {
          lossPerIteration.push(loss.data[0]);
        }
      }
    )
    .todo("Only add more epochs to the benchmark.");

  await bench.run();

  const table = formatTrainingResults(bench, lossPerIteration);

  console.table(table);

  compareBenchmarks(LOG_FILE, BENCH_NAME, bench.tasks);

  return bench.tasks;
}
