'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                  ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, '__esModule', { value: true });
var utils_1 = require('../src/utils');
test('dynamic tasks,run add end', function () {
  return __awaiter(void 0, void 0, void 0, function () {
    var dynamicTasks, _a, result;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          dynamicTasks = new utils_1.DynamicTasks();
          return [
            4 /*yield*/,
            Promise.all([
              (function () {
                return __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        return [4 /*yield*/, utils_1.delay(1000)];
                      case 1:
                        _a.sent();
                        new Array(11).fill(0).forEach(function (_, i) {
                          dynamicTasks.add(function () {
                            return __awaiter(
                              void 0,
                              void 0,
                              void 0,
                              function () {
                                return __generator(this, function (_a) {
                                  return [2 /*return*/, i];
                                });
                              },
                            );
                          });
                          if (i === 10) {
                            dynamicTasks.end();
                          }
                        });
                        return [2 /*return*/];
                    }
                  });
                });
              })(),
              dynamicTasks.run(),
            ]),
          ];
        case 1:
          (_a = _b.sent()), (result = _a[1]);
          expect(result).toEqual(
            new Array(11).fill(0).map(function (_, i) {
              return i;
            }),
          );
          return [2 /*return*/];
      }
    });
  });
});
test('dynamic tasks,run end add', function () {
  return __awaiter(void 0, void 0, void 0, function () {
    var dynamicTasks, promise, result;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          dynamicTasks = new utils_1.DynamicTasks();
          promise = dynamicTasks.run();
          dynamicTasks.end();
          return [4 /*yield*/, promise];
        case 1:
          result = _a.sent();
          expect(result).toEqual([]);
          return [2 /*return*/];
      }
    });
  });
});
test('dynamic tasks,add end run', function () {
  return __awaiter(void 0, void 0, void 0, function () {
    var dynamicTasks, result;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          dynamicTasks = new utils_1.DynamicTasks();
          new Array(10).fill(0).forEach(function (_, i) {
            return dynamicTasks.add(function () {
              return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                  switch (_a.label) {
                    case 0:
                      return [4 /*yield*/, utils_1.delay(10)];
                    case 1:
                      _a.sent();
                      return [2 /*return*/, i];
                  }
                });
              });
            });
          });
          dynamicTasks.end();
          return [4 /*yield*/, dynamicTasks.run()];
        case 1:
          result = _a.sent();
          expect(result).toEqual(
            new Array(10).fill(0).map(function (_, i) {
              return i;
            }),
          );
          return [2 /*return*/];
      }
    });
  });
});
test('dynamic tasks,handle error', function () {
  return __awaiter(void 0, void 0, void 0, function () {
    var dynamicTasks, result;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          dynamicTasks = new utils_1.DynamicTasks();
          new Array(10).fill(0).forEach(function () {
            return dynamicTasks.add(function () {
              return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                  throw new Error();
                });
              });
            });
          });
          dynamicTasks.end();
          return [4 /*yield*/, dynamicTasks.run()];
        case 1:
          result = _a.sent();
          expect(result).toEqual(
            new Array(10).fill(0).map(function () {
              return undefined;
            }),
          );
          return [2 /*return*/];
      }
    });
  });
});
