import { handleError } from './base';

type Task = () => Promise<any>;

export class DynamicTasks<T> {
  private isEnd;
  private tasksCount: number;
  private doneTasksCount: number;

  constructor() {
    this.tasksCount = 0;
    this.doneTasksCount = 0;

    this.results = [];
    this.resolve = null;
    this.isEnd = false;

    this.tasksCache = [];
    this.hasRan = false;
  }

  private results: any[];

  private handleTaskDone(result?: any) {
    this.results.push(result);
    this.doneTasksCount++;
    this.checkShouldResolve();
  }

  private checkShouldResolve() {
    if (this.isEnd && this.doneTasksCount === this.tasksCount) {
      // 这里之所以使用 this.results.slice() 是因为数组是引用类型，
      // resolve之后若通过add继续添加任务则会导致拿到的result发生变更
      this.resolve?.call(this, this.results.slice());
    }
  }

  private runTask(task: Task) {
    task()
      .then(result => {
        this.handleTaskDone(result);
      })
      .catch(err => {
        handleError(err);
        this.handleTaskDone();
      });
  }

  private tasksCache: Task[];

  private runCacheTasks() {
    if (this.tasksCache.length > 0) {
      this.tasksCache.forEach(task => this.runTask(task));
      this.tasksCache.length = 0;
    }
  }

  add(task: Task) {
    this.tasksCount++;

    if (!this.hasRan) {
      this.tasksCache.push(task);
      return;
    }

    this.runCacheTasks();
    this.runTask(task);
  }

  end() {
    this.isEnd = true;
    this.checkShouldResolve();
  }

  private resolve: ((value: Array<T>) => void) | null;

  private hasRan;

  run(): Promise<T[]> {
    this.hasRan = true;

    return new Promise(resolve => {
      this.resolve = resolve;
      this.runCacheTasks();
    });
  }
}
