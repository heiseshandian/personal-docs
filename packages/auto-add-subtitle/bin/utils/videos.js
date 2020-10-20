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
exports.changeFormat = exports.concatMedias = exports.sliceMediaBySeconds = exports.sliceMediaBySize = void 0;
var child_process_1 = require("child_process");
var fs_1 = __importDefault(require("fs"));
var os_1 = __importDefault(require("os"));
var path_1 = __importDefault(require("path"));
var base_1 = require("./base");
var concurrent_tasks_1 = require("./concurrent-tasks");
var fs_2 = require("./fs");
function getFileSize(filePath) {
    var stats = fs_1.default.statSync(path_1.default.resolve(filePath));
    return stats.size;
}
var sizeMap = {
    k: Math.pow(2, 10),
    m: Math.pow(2, 20),
    default: 1,
};
var sizeReg = /^(\d*\.?\d+)([km]?)$/i;
function parseSize(size) {
    if (size === void 0) { size = ''; }
    var match = size.match(sizeReg);
    if (!match) {
        return 0;
    }
    var num = match[1], unit = match[2];
    return parseFloat(num) * (sizeMap[unit] || sizeMap.default);
}
var durationInfoReg = /duration:\s*(\d{1,2}:\d{1,2}:\d{1,2}\.\d{2})/i;
function getDuration(videoPath) {
    return new Promise(function (resolve) {
        child_process_1.exec("ffprobe " + JSON.stringify(videoPath), function (err, _, stderr) {
            if (err) {
                base_1.handleError(err);
                resolve();
            }
            else {
                var match = (stderr || '').match(durationInfoReg);
                resolve(match && match[1]);
            }
        });
    });
}
var durationReg = /(\d{1,2}):(\d{1,2}):(\d{1,2})\.(\d{2})/;
function parseDuration(duration) {
    if (duration === void 0) { duration = ''; }
    var match = duration.match(durationReg);
    if (!match) {
        return 0;
    }
    var hours = match[1], minutes = match[2], seconds = match[3], milliseconds = match[4];
    return [hours, minutes, seconds, milliseconds]
        .map(function (val) { return parseInt(val, 10); })
        .reduce(function (acc, cur, i) { return acc + cur * Math.pow(60, (2 - i)); }, 0);
}
function sliceMediaByChunks(mediaPath, chunks) {
    return __awaiter(this, void 0, void 0, function () {
        var duration, chunkDuration, _a, ext, name, dir;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDuration(mediaPath)];
                case 1:
                    duration = _b.sent();
                    if (!duration) {
                        return [2 /*return*/];
                    }
                    chunkDuration = Math.ceil(parseDuration(duration) / chunks);
                    _a = path_1.default.parse(mediaPath), ext = _a.ext, name = _a.name, dir = _a.dir;
                    return [4 /*yield*/, new concurrent_tasks_1.ConcurrentTasks(Array(chunks)
                            .fill(0)
                            .map(function (_, i) { return function () {
                            var outputPath = name + "_chunks_" + i + ext;
                            var cmd = "ffmpeg -y -i " + JSON.stringify(mediaPath) + " -ss " + i * chunkDuration + " -t " + chunkDuration + " -codec copy " + JSON.stringify(path_1.default.resolve(dir, outputPath));
                            return new Promise(function (resolve) {
                                child_process_1.exec(cmd, function (err) {
                                    if (err) {
                                        base_1.handleError(err);
                                        resolve();
                                    }
                                    else {
                                        resolve(outputPath);
                                    }
                                });
                            });
                        }; })).run()];
                case 2: return [2 /*return*/, _b.sent()];
            }
        });
    });
}
function sliceMediaBySize(mediaPaths, maxSize) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof mediaPaths === 'string') {
                        mediaPaths = [mediaPaths];
                    }
                    return [4 /*yield*/, new concurrent_tasks_1.ConcurrentTasks(mediaPaths.map(function (mediaPath) { return function () { return __awaiter(_this, void 0, void 0, function () {
                            var chunks;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        chunks = Math.ceil(getFileSize(mediaPath) / parseSize(maxSize));
                                        if (chunks <= 1) {
                                            return [2 /*return*/];
                                        }
                                        return [4 /*yield*/, sliceMediaByChunks(mediaPath, chunks)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); }; }), 'slicing').run()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.sliceMediaBySize = sliceMediaBySize;
function sliceMediaBySeconds(mediaPaths, maxSeconds) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof mediaPaths === 'string') {
                        mediaPaths = [mediaPaths];
                    }
                    return [4 /*yield*/, new concurrent_tasks_1.ConcurrentTasks(mediaPaths.map(function (mediaPath) { return function () { return __awaiter(_this, void 0, void 0, function () {
                            var duration, chunks;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, getDuration(mediaPath)];
                                    case 1:
                                        duration = _a.sent();
                                        if (!duration) {
                                            return [2 /*return*/];
                                        }
                                        chunks = Math.ceil(parseDuration(duration) / maxSeconds);
                                        if (chunks <= 1) {
                                            return [2 /*return*/];
                                        }
                                        return [4 /*yield*/, sliceMediaByChunks(mediaPath, chunks)];
                                    case 2: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); }; }), 'slicing').run()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.sliceMediaBySeconds = sliceMediaBySeconds;
// https://trac.ffmpeg.org/wiki/Concatenate
function concatMedias(medias, output) {
    return __awaiter(this, void 0, void 0, function () {
        var tmpFilePath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prepareTmpFiles(medias)];
                case 1:
                    tmpFilePath = _a.sent();
                    if (!tmpFilePath) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, new Promise(function (resolve) {
                            child_process_1.exec("ffmpeg -y -f concat -safe 0 -i " + JSON.stringify(tmpFilePath) + " -c copy " + output, function (err) {
                                fs_1.default.unlink(tmpFilePath, function () {
                                    if (err) {
                                        base_1.handleError(err);
                                        resolve();
                                    }
                                    else {
                                        resolve(output);
                                    }
                                });
                            });
                        })];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.concatMedias = concatMedias;
var parseFormat = function (filePath) { return path_1.default.parse(filePath).ext.slice(1); };
function changeFormat(videoPaths, outputFormat, outputDir) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof videoPaths === 'string') {
                        videoPaths = [videoPaths];
                    }
                    videoPaths = videoPaths.filter(function (videoPath) { return parseFormat(videoPath) !== outputFormat; });
                    return [4 /*yield*/, new concurrent_tasks_1.ConcurrentTasks(videoPaths.map(function (videoPath) { return function () {
                            var _a = path_1.default.parse(videoPath), dir = _a.dir, name = _a.name;
                            var outputFile = path_1.default.resolve(outputDir || dir, name + "." + outputFormat.replace(/^\./, ''));
                            var cmd = "ffmpeg -y -i " + JSON.stringify(videoPath) + " " + JSON.stringify(outputFile);
                            return new Promise(function (resolve) {
                                child_process_1.exec(cmd, function (err) {
                                    if (err) {
                                        base_1.handleError(err);
                                        resolve();
                                    }
                                    else {
                                        resolve(outputFile);
                                    }
                                });
                            });
                        }; }), 'changing format').run()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.changeFormat = changeFormat;
function prepareTmpFiles(videos) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, dir, name, tmpFilePath;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (videos.length <= 0) {
                        base_1.handleError(new Error('videos is empty'));
                        return [2 /*return*/];
                    }
                    _a = path_1.default.parse(videos[0]), dir = _a.dir, name = _a.name;
                    tmpFilePath = path_1.default.resolve(dir, name + ".txt");
                    // https://superuser.com/questions/718027/ffmpeg-concat-doesnt-work-with-absolute-path
                    return [4 /*yield*/, fs_2.writeFile(tmpFilePath, videos
                            .map(function (video) {
                            return "file " + JSON.stringify(video)
                                .replace(/"/g, "'")
                                .replace(/\\\\/g, '/');
                        })
                            .join(os_1.default.EOL))];
                case 1:
                    // https://superuser.com/questions/718027/ffmpeg-concat-doesnt-work-with-absolute-path
                    _b.sent();
                    return [2 /*return*/, tmpFilePath];
            }
        });
    });
}
