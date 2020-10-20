"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConcurrentTasks = void 0;
var os_1 = __importDefault(require("os"));
var base_1 = require("./base");
var progress_1 = require("./progress");
var ConcurrentTasks = /** @class */ (function () {
    function ConcurrentTasks(tasks, msg) {
        var _this = this;
        this.bar = null;
        this.tasks = tasks.map(function (task, i) { return function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, task().catch(base_1.handleError)];
                    case 1:
                        result = _b.sent();
                        this.results[i] = result;
                        this.doneTasks += 1;
                        // 所有任务已执行结束
                        if (this.doneTasks >= tasks.length) {
                            (_a = this.resolve) === null || _a === void 0 ? void 0 : _a.call(this, this.results);
                        }
                        // 还有任务没被执行
                        if (this.ranTasks < tasks.length) {
                            this.runTask(this.tasks[this.ranTasks]);
                        }
                        return [2 /*return*/, result];
                }
            });
        }); }; });
        if (msg) {
            this.withProgress(msg);
        }
        this.ranTasks = 0;
        this.doneTasks = 0;
        this.results = new Array(tasks.length);
        this.resolve = null;
    }
    ConcurrentTasks.prototype.withProgress = function (msg) {
        var bar = this.bar ||
            (this.bar = progress_1.MultiProgressBar.getProgressBar(msg, {
                total: this.tasks.length,
            }));
        this.tasks = this.tasks.map(function (task) { return progress_1.withProgress(task, bar); });
    };
    ConcurrentTasks.prototype.runTask = function (task) {
        this.ranTasks++;
        task();
    };
    ConcurrentTasks.prototype.run = function (maxConcurrent) {
        var _this = this;
        if (maxConcurrent === void 0) { maxConcurrent = os_1.default.cpus().length; }
        return new Promise(function (resolve) {
            _this.resolve = resolve;
            _this.tasks.slice(0, maxConcurrent).forEach(function (task) { return _this.runTask(task); });
        });
    };
    return ConcurrentTasks;
}());
exports.ConcurrentTasks = ConcurrentTasks;
