'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.DynamicTasks = void 0;
var base_1 = require('./base');
var progress_1 = require('./progress');
var DynamicTasks = /** @class */ (function () {
  function DynamicTasks(progressMsg) {
    this.bar = null;
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
  DynamicTasks.prototype.handleTaskDone = function (result) {
    this.results.push(result);
    this.doneTasksCount++;
    this.checkShouldResolve();
    if (this.bar) {
      this.bar.tick();
    }
  };
  DynamicTasks.prototype.checkShouldResolve = function () {
    var _a;
    if (this.isEnd && this.doneTasksCount === this.tasks.length) {
      // 这里之所以使用 this.results.slice() 是因为数组是引用类型，
      // resolve之后若通过add继续添加任务则会导致拿到的result发生变更
      (_a = this.resolve) === null || _a === void 0
        ? void 0
        : _a.call(this, this.results.slice());
    }
  };
  DynamicTasks.prototype.runTask = function (task) {
    var _this = this;
    task()
      .then(function (result) {
        _this.handleTaskDone(result);
      })
      .catch(function (err) {
        base_1.handleError(err);
        _this.handleTaskDone();
      });
  };
  DynamicTasks.prototype.runCacheTasks = function () {
    var _this = this;
    if (this.tasksCache.length > 0) {
      this.tasksCache.forEach(function (task) {
        return _this.runTask(task);
      });
      this.tasksCache.length = 0;
    }
  };
  DynamicTasks.prototype.add = function (task) {
    this.tasks.push(task);
    if (!this.hasRan) {
      this.tasksCache.push(task);
      return;
    }
    this.runCacheTasks();
    this.runTask(task);
  };
  DynamicTasks.prototype.withProgress = function () {
    if (!this.progressMsg) {
      return;
    }
    if (!this.bar) {
      this.bar = progress_1.MultiProgressBar.getProgressBar(this.progressMsg, {
        total: this.tasks.length,
        curr: this.doneTasksCount,
      });
    }
  };
  DynamicTasks.prototype.end = function () {
    this.isEnd = true;
    this.checkShouldResolve();
    this.withProgress();
  };
  DynamicTasks.prototype.run = function () {
    var _this = this;
    this.hasRan = true;
    return new Promise(function (resolve) {
      _this.resolve = resolve;
      _this.runCacheTasks();
    });
  };
  return DynamicTasks;
})();
exports.DynamicTasks = DynamicTasks;
