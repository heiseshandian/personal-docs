import { handleError } from './base';
import { MultiProgressBar } from './progress';

type Task = () => Promise<any>;

export class DynamicTasks<T> {
  private isEnd;
  private tasks: Task[];
  private doneTasksCount: number;

  constructor(progressMsg?: string) {
    this.tasks = [];
    this.doneTasksCount = 0;

    this.results = [];
    this.resolve = null;
    this.isEnd = false;

    this.tasksCache = [];
    this.hasRan = false;

    this.progressMsg = progressMsg;
    this.bar = null;
  }

  private results: any[];

  private handleTaskDone(result?: any) {
    this.results.push(result);
    this.doneTasksCount++;
    this.checkShouldResolve();

    if (this.bar) {
      this.bar.tick();
    }
  }

  private checkShouldResolve() {
    if (this.isEnd && this.doneTasksCount === this.tasks.length) {
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
    this.tasks.push(task);

    if (!this.hasRan) {
      this.tasksCache.push(task);
      return;
    }

    this.runCacheTasks();
    this.runTask(task);
  }

  private progressMsg;

  private bar: ProgressBar | null = null;

  private withProgress() {
    if (!this.progressMsg) {
      return;
    }

    if (!this.bar) {
      this.bar = MultiProgressBar.getProgressBar(this.progressMsg, {
        total: this.tasks.length,
        curr: this.doneTasksCount,
      });
    }
  }

  end() {
    this.isEnd = true;
    this.checkShouldResolve();
    this.withProgress();
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
