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
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var veed_auto_add_title_1 = require("./parsers/veed-auto-add-title");
var utils_1 = require("./utils");
var subtitles_1 = require("./utils/subtitles");
function isFile(file) {
    return /\.\w+/.test(file);
}
var subtitleFileReg = new RegExp("\\" + veed_auto_add_title_1.Veed.subtitleExt + "$");
function isSubtitleFile(file) {
    return subtitleFileReg.test(file);
}
function toAbsolutePath(dir, file) {
    return path_1.default.resolve(dir, file);
}
var AutoAddSubtitle = /** @class */ (function () {
    function AutoAddSubtitle(videoDir, chunkSeconds) {
        if (chunkSeconds === void 0) { chunkSeconds = 6 * 60; }
        this.tmp_dir = 'parsed_auto_add_subtitle';
        this.videoDir = videoDir;
        this.chunkSeconds = chunkSeconds;
    }
    AutoAddSubtitle.prototype.prepareTmpDir = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, videoDir, tmp_dir;
            return __generator(this, function (_b) {
                _a = this, videoDir = _a.videoDir, tmp_dir = _a.tmp_dir;
                return [2 /*return*/, utils_1.ensurePathExists(path_1.default.resolve(videoDir, tmp_dir))];
            });
        });
    };
    AutoAddSubtitle.prototype.removeTmpDir = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, videoDir, tmp_dir;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, videoDir = _a.videoDir, tmp_dir = _a.tmp_dir;
                        return [4 /*yield*/, utils_1.clean(path_1.default.resolve(videoDir, tmp_dir))];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoAddSubtitle.prototype.extractAudioFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, videoDir, tmp_dir, chunkSeconds, files, tmpPath, tmpFiles;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, videoDir = _a.videoDir, tmp_dir = _a.tmp_dir, chunkSeconds = _a.chunkSeconds;
                        return [4 /*yield*/, utils_1.readdir(videoDir)];
                    case 1:
                        files = _b.sent();
                        tmpPath = path_1.default.resolve(videoDir, tmp_dir);
                        return [4 /*yield*/, utils_1.extractAudio((files || []).filter(isFile).map(function (file) { return toAbsolutePath(videoDir, file); }), tmpPath)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, utils_1.readdir(tmpPath)];
                    case 3:
                        tmpFiles = _b.sent();
                        return [4 /*yield*/, utils_1.sliceMediaBySeconds((tmpFiles || [])
                                .filter(isFile)
                                .map(function (file) { return toAbsolutePath(tmpPath, file); }), chunkSeconds)];
                    case 4:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoAddSubtitle.prototype.parseSubtitle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, videoDir, tmp_dir, tmpPath, files, hasParsed, withoutChunks;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, videoDir = _a.videoDir, tmp_dir = _a.tmp_dir;
                        tmpPath = path_1.default.resolve(videoDir, tmp_dir);
                        return [4 /*yield*/, utils_1.readdir(tmpPath)];
                    case 1:
                        files = _b.sent();
                        hasParsed = utils_1.makeMap(files.map(function (file) {
                            return file.replace(veed_auto_add_title_1.Veed.subtitlePrefix, '').replace(/\.\w+$/, '');
                        }));
                        withoutChunks = function (file) {
                            return !fs_1.default.existsSync(path_1.default.resolve(tmpPath, file.replace(/^(.+)\.(\w+)$/, "$1" + utils_1.chunk_file_suffix + "0.$2")));
                        };
                        return [4 /*yield*/, veed_auto_add_title_1.Veed.parseSubtitle(files
                                .filter(utils_1.isSupportedAudio)
                                .filter(withoutChunks)
                                .filter(function (file) { return !hasParsed(file); })
                                .map(function (file) { return path_1.default.resolve(tmpPath, file); }))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoAddSubtitle.prototype.mergeSrtChunks = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, videoDir, tmp_dir, files, subtitleReg, chunkFilesGroup, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, videoDir = _a.videoDir, tmp_dir = _a.tmp_dir;
                        return [4 /*yield*/, utils_1.readdir(path_1.default.resolve(videoDir, tmp_dir))];
                    case 1:
                        files = _b.sent();
                        if (!files) {
                            return [2 /*return*/];
                        }
                        subtitleReg = new RegExp(veed_auto_add_title_1.Veed.subtitlePrefix + "(.+)" + utils_1.chunk_file_suffix + "[^.]*\\" + veed_auto_add_title_1.Veed.subtitleExt + "$");
                        chunkFilesGroup = files
                            .filter(function (file) { return utils_1.isChunkFile(file) && isSubtitleFile(file); })
                            .map(function (file) { return path_1.default.resolve(videoDir, tmp_dir + "/" + file); })
                            .reduce(function (acc, cur) {
                            var _a = cur.match(subtitleReg) || [cur, 0], original = _a[1];
                            if (!acc[original]) {
                                acc[original] = [cur];
                            }
                            else {
                                acc[original].push(cur);
                            }
                            return acc;
                        }, {});
                        return [4 /*yield*/, Promise.all(Object.keys(chunkFilesGroup).map(function (key) {
                                return subtitles_1.mergeSrtFiles(chunkFilesGroup[key]);
                            }))];
                    case 2:
                        result = _b.sent();
                        return [4 /*yield*/, Promise.all(Object.keys(chunkFilesGroup).map(function (key, i) {
                                return utils_1.writeFile(path_1.default.resolve(videoDir, tmp_dir + "/" + key + veed_auto_add_title_1.Veed.subtitleExt), result[i]);
                            }))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoAddSubtitle.prototype.renameSrtFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, videoDir, tmp_dir, files, unMergedFileReg;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, videoDir = _a.videoDir, tmp_dir = _a.tmp_dir;
                        return [4 /*yield*/, utils_1.readdir(path_1.default.resolve(videoDir, tmp_dir))];
                    case 1:
                        files = _b.sent();
                        if (!files) {
                            return [2 /*return*/];
                        }
                        unMergedFileReg = new RegExp(veed_auto_add_title_1.Veed.subtitlePrefix + "(.+)\\.\\w+\\" + veed_auto_add_title_1.Veed.subtitleExt + "$");
                        return [4 /*yield*/, Promise.all(files
                                .filter(function (file) { return !utils_1.isChunkFile(file) && isSubtitleFile(file); })
                                .filter(function (file) { return unMergedFileReg.test(file); })
                                .map(function (file) { return path_1.default.resolve(videoDir, tmp_dir + "/" + file); })
                                .map(function (file) {
                                return utils_1.move(file, file.replace(veed_auto_add_title_1.Veed.subtitlePrefix, '').replace(/\.\w+/, ''));
                            }))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoAddSubtitle.prototype.moveSrtFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, videoDir, tmp_dir, tmpPath, files;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, videoDir = _a.videoDir, tmp_dir = _a.tmp_dir;
                        tmpPath = path_1.default.resolve(videoDir, tmp_dir);
                        return [4 /*yield*/, utils_1.readdir(tmpPath)];
                    case 1:
                        files = _b.sent();
                        return [4 /*yield*/, Promise.all(files
                                .filter(function (file) { return !utils_1.isChunkFile(file) && isSubtitleFile(file); })
                                .map(function (file) { return path_1.default.resolve(tmpPath, file); })
                                .map(function (file) { return utils_1.move(file, path_1.default.resolve(videoDir, path_1.default.parse(file).base)); }))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoAddSubtitle.prototype.generateSrtFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prepareTmpDir()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.extractAudioFiles()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.parseSubtitle()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.mergeSrtChunks()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.renameSrtFiles()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.moveSrtFiles()];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.removeTmpDir()];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return AutoAddSubtitle;
}());
exports.default = AutoAddSubtitle;
