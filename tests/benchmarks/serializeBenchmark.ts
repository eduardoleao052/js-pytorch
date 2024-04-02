import { Task } from "tinybench";

export type Benchmark = {
  name: string;
  date: string;
  totalTime: number;
  min: number;
  max: number;
  samples: number;
  period: number;
  mean: number;
  variance: number;
  sd: number;
  sem: number;
  moe: number;
  rme: number;
};

export function serializeBenchmark(tasks: Task[]): Benchmark[] {
  return tasks.map(({ name, result }) => {
    if (!result) {
      throw new Error(`Task ${name} has no result`);
    }
    if (result.error) {
      throw new Error(`Task ${name} has an error: ${result.error}`);
    }

    const {
      totalTime,
      min,
      max,
      samples,
      period,
      mean,
      variance,
      sd,
      sem,
      moe,
      rme
    } = result;

    return {
      name,
      date: new Date().toISOString(),
      totalTime,
      min,
      max,
      samples: samples.length,
      period,
      mean,
      variance,
      sd,
      sem,
      moe,
      rme
    };
  });
}
