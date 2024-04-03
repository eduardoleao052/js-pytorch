import { Bench, TaskResult } from "tinybench";

/**
 * Reformat the tinybench table to display Average Time in milliseconds and
 * add Average Loss, Total Time and Loss
 */
export function formatTrainingResults(
  bench: Bench,
  lossPerIteration: number[]
) {
  const results: (TaskResult | undefined)[] = bench.results;
  return bench.table().map((row, i) => {
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

      "Average Time (ms)": Number(row["Average Time (ns)"]) / 1e6,
      Margin: row["Margin"],
      Samples: row["Samples"],
      ...additionalColumns
    };
  });
}
