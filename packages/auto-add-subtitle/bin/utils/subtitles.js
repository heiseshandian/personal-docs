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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeSrtFiles = void 0;
var fs_1 = require("./fs");
var sequenceReg = /^([+-]?)(\d+)$/;
var timelineReg = /^\d{2}:\d{2}:\d{2}[,.]\d{3} --> \d{2}:\d{2}:\d{2}[,.]\d{3}$/;
function merge(primaryLines, secondLines) {
    var _a = [
        parseMaxTime(primaryLines),
        parseMaxSequence(primaryLines),
    ], maxTime = _a[0], maxSequence = _a[1];
    return primaryLines.concat(secondLines.map(function (line) {
        if (sequenceReg.test(line)) {
            return String(parseInt(line) + maxSequence);
        }
        if (timelineReg.test(line)) {
            return line
                .split(' --> ')
                .map(function (time) { return formatTime(parseTime(time) + maxTime); })
                .join(' --> ');
        }
        return line;
    }));
}
function mergeSrtFiles(srtFiles) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(srtFiles.map(function (file) { return fs_1.readFile(file).then(function (buf) { return buf.toString(); }); }))];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result
                            .filter(function (val) { return !!val; })
                            .map(function (val) { return val.split(/\n/); })
                            .reduce(function (acc, cur) { return merge(acc, cur); })
                            .join('\n')];
            }
        });
    });
}
exports.mergeSrtFiles = mergeSrtFiles;
function parseMaxTime(list) {
    for (var _i = 0, _a = list.slice(-4).reverse(); _i < _a.length; _i++) {
        var line = _a[_i];
        if (timelineReg.test(line)) {
            return parseTime(line.split('-->')[1]);
        }
    }
    return 0;
}
function parseMaxSequence(list) {
    for (var _i = 0, _a = list.slice(-4).reverse(); _i < _a.length; _i++) {
        var line = _a[_i];
        if (sequenceReg.test(line)) {
            return parseInt(line);
        }
    }
    return 0;
}
var timeRegex = /^([+-]?)(\d{2}):(\d{2}):(\d{2})[,.](\d{3})$/;
function parseTime(value) {
    if (!value) {
        return 0;
    }
    var match = value.trim().match(timeRegex);
    if (!match) {
        return 0;
    }
    var symbol = match[1], hours = match[2], minutes = match[3], seconds = match[4], milliseconds = match[5];
    return ((symbol === '-' ? -1 : 1) *
        ([hours, minutes, seconds]
            .map(function (val) { return Number(val); })
            .reduce(function (acc, cur, i) { return acc + cur * Math.pow(60, (2 - i)); }, 0) +
            Number(milliseconds) / 1000));
}
function formatTime(value) {
    var hours = Math.floor(value / (60 * 60));
    value -= hours * 60 * 60;
    var minutes = Math.floor(value / 60);
    value -= minutes * 60;
    var seconds = Math.floor(value);
    value -= seconds;
    var milliseconds = Math.round(value * 1000);
    return ((value < 0 ? '-' : '') +
        [hours, minutes, seconds].map(function (val) { return ("" + val).padStart(2, '0'); }).join(':') +
        ',' +
        ("" + milliseconds).padStart(3, '0'));
}
