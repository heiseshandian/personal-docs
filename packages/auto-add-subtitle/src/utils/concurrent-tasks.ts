import os from 'os';
import { MultiProgressBar, withProgress } from './progress';

type Task = () => Promise<any>;

export class ConcurrentTasks {
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
      const result = await task().catch(err => this._reject?.call(this, err));
      this._results[i] = result;
      this.doneTasks += 1;

      // 所有任务已执行结束
      if (this.doneTasks >= tasks.length) {
        this._resolve?.call(this, this._results);
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
    this._results = new Array(tasks.length);

    this._resolve = null;
    this._reject = null;
  }

  private _resolve: ((value?: unknown) => void) | null;
  private _reject: ((reason?: any) => void) | null;
  private _results: Array<any>;

  private runTask(task: Task) {
    this.ranTasks++;
    task();
  }

  public run(maxConcurrent: number = os.cpus().length): Promise<any> {
    return new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;

      this.tasks.slice(0, maxConcurrent).forEach(task => this.runTask(task));
    });
  }
}
