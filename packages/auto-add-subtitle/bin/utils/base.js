"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniq = exports.delay = exports.makeMap = exports.handleError = exports.callback2Promise = exports.md5 = void 0;
var crypto_1 = __importDefault(require("crypto"));
function md5(data) {
    return crypto_1.default.createHash('md5').update(data).digest('hex');
}
exports.md5 = md5;
function callback2Promise(fn) {
    return function () {
        var rest = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rest[_i] = arguments[_i];
        }
        return new Promise(function (resolve) {
            fn.apply(void 0, __spreadArrays(rest, [function (err) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (err) {
                        handleError(err);
                        resolve();
                    }
                    else {
                        resolve(args.length === 0 ? true : args.length === 1 ? args[0] : args);
                    }
                }]));
        });
    };
}
exports.callback2Promise = callback2Promise;
function handleError(err) {
    console.error(err);
}
exports.handleError = handleError;
function makeMap(str, expectsLowerCase) {
    var list = Array.isArray(str)
        ? str
        : str.split(',');
    var map = list.reduce(function (acc, cur) {
        acc[cur] = true;
        return acc;
    }, Object.create(null));
    return expectsLowerCase ? function (val) { return map[val.toLowerCase()]; } : function (val) { return map[val]; };
}
exports.makeMap = makeMap;
function delay(timeout) {
    return new Promise(function (resolve) {
        setTimeout(function () { return resolve(); }, timeout);
    });
}
exports.delay = delay;
exports.uniq = function (arr) { return Array.from(new Set(arr)); };
