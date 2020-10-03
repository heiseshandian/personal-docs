type Task = (...rest: any) => Promise<any>;

export class ConcurrentTasks {
  private tasks: Array<Task>;
  private doneTasks: number;
  private ranTasks: number;

  constructor(tasks: Array<Task>) {
    this.tasks = tasks.map((task, i) => async (...rest: any) => {
      const result = await task(...rest).catch(err =>
        this._reject?.call(this, err),
      );
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

    this.ranTasks = 0;
    this.doneTasks = 0;
    this._results = new Array(tasks.length);

    this._resolve = null;
    this._reject = null;
  }

  private _resolve: ((value?: unknown) => void) | null;
  private _reject: ((reason?: any) => void) | null;
  private _results: Array<any>;

  private runTask(task: Task, ...rest: any) {
    this.ranTasks++;
    task(...rest);
  }

  public run(maxConcurrent: number, ...rest: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;

      this.tasks
        .slice(0, maxConcurrent)
        .forEach(task => this.runTask(task, ...rest));
    });
  }
}
