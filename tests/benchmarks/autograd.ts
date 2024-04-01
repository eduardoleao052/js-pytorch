import { Bench, Task, TaskResult } from "tinybench";
import { readFileSync } from "fs";
import { matmul, add, Tensor } from "../../src/tensor";
import { ReLU, CrossEntropyLoss } from "../../src/layers";

const INIT_DATA = JSON.parse(
  readFileSync("tests/benchmarks/autograd.json", "utf-8")
);

export async function autogradBench() {
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
      "Autograd training loop iteration",
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

  // Reformat the table to display Average Time in milliseconds and
  // add Average Loss, Total Time and Loss
  const results: (TaskResult | undefined)[] = bench.results;
  const table = bench.table().map((row, i) => {
    if (row === null) return row;

    const result = results[i];
    let additionalColumns = {};
    if (result !== undefined) {
      additionalColumns = {
        "Total Time (ms)": Number.parseFloat(result.totalTime.toFixed(2)),
        Loss: lossPerIteration[lossPerIteration.length - 1]
      };
    }

    let averageLoss;
    try {
      averageLoss =
        lossPerIteration.reduce<{
          prev: number | null;
          total: number;
          error?: string;
        }>(
          (acc, b, i) => {
            // Is this due to a bug in the library?
            if (Number.isNaN(b))
              throw new Error(`Iteration ${i} Loss became NaN`);
            const total = acc.prev === null ? 0 : Math.abs(acc.prev - b);
            return { prev: b, total };
          },
          { prev: null, total: 0 }
        ).total / lossPerIteration.length;
    } catch (e) {
      if (e instanceof Error) {
        averageLoss = e.message;
      }
    }

    return {
      "Task Name": row["Task Name"],
      "ops/sec": Number.parseInt(row["ops/sec"], 10),
      "Average Time (ms)": Number(row["Average Time (ns)"]) / 1e6,
      Margin: row["Margin"],
      Samples: row["Samples"],
      "Average Change in Loss": averageLoss,
      ...additionalColumns
    };
  });

  console.table(table);
}
