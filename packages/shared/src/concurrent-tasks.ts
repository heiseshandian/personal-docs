import os from 'os';
import { handleError } from './base';
import { MultiProgressBar, withProgress } from './progress';

type Task = () => Promise<any>;

export class ConcurrentTasks<T> {
  private tasks: Array<Task>;
  private doneTasks: number;
  private ranTasks: number;

  private bar: ProgressBar | null = null;
  private withProgress(msg: string) {
    const bar =
      this.bar ||
      (this.bar = MultiProgressBar.getProgressBar(msg, {
        total: this.tasks.length,
      }));

    this.tasks = this.tasks.map(task => withProgress(task, bar));
  }

  constructor(tasks: Array<Task>, msg?: string) {
    this.tasks = tasks.map((task, i) => async () => {
      const result = await task().catch(handleError);
      this.results[i] = result;
      this.doneTasks += 1;

      // 所有任务已执行结束
      if (this.doneTasks >= tasks.length) {
        this.resolve?.call(this, this.results);
      }

      // 还有任务没被执行
      if (this.ranTasks < tasks.length) {
        this.runTask(this.tasks[this.ranTasks]);
      }

      return result;
    });

    if (msg) {
      this.withProgress(msg);
    }

    this.ranTasks = 0;
    this.doneTasks = 0;
    this.results = new Array(tasks.length);

    this.resolve = null;
  }

  private resolve: ((value: Array<T>) => void) | null;
  private results: Array<any>;

  private runTask(task: Task) {
    this.ranTasks++;
    task();
  }

  public run(maxConcurrent: number = os.cpus().length): Promise<Array<T>> {
    if (this.tasks.length === 0) {
      return Promise.resolve([]);
    }

    return new Promise(resolve => {
      this.resolve = resolve;

      this.tasks.slice(0, maxConcurrent).forEach(task => this.runTask(task));
    });
  }
}
