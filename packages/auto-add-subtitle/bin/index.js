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
var AutoAddSubtitle = /** @class */ (function () {
    function AutoAddSubtitle(videoDir) {
        this.TEMP_PATH = 'parsed_auto_add_subtitle';
        this.videoDir = videoDir;
    }
    AutoAddSubtitle.prototype.prepareMp3Files = function () {
        return __awaiter(this, void 0, void 0, function () {
            var videoDir, files;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        videoDir = this.videoDir;
                        return [4 /*yield*/, utils_1.readdir(videoDir)];
                    case 1:
                        files = _a.sent();
                        if (!files) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, utils_1.changeFormat(files
                                .filter(isFile)
                                .filter(function (file) { return !/\.mp3$/.test(file); })
                                .map(function (file) { return path_1.default.resolve(videoDir, file); }), 'mp3')];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, utils_1.sliceMediaBySeconds(utils_1.uniq(files
                                .filter(isFile)
                                .map(function (file) { return path_1.default.resolve(videoDir, file.replace(/\.\w+$/, '.mp3')); })), 6 * 60)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoAddSubtitle.prototype.parseSubtitle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, videoDir, TEMP_PATH, parsedFiles, hasParsed, files;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, videoDir = _a.videoDir, TEMP_PATH = _a.TEMP_PATH;
                        return [4 /*yield*/, utils_1.readdir(path_1.default.resolve(videoDir, TEMP_PATH))];
                    case 1:
                        parsedFiles = _b.sent();
                        hasParsed = utils_1.makeMap((parsedFiles || []).map(function (file) {
                            return file
                                .replace('default_Project Name_', '')
                                .replace('.mp3', '')
                                .replace(/\.\w+$/, '.mp3');
                        }));
                        return [4 /*yield*/, utils_1.readdir(path_1.default.resolve(videoDir))];
                    case 2:
                        files = _b.sent();
                        return [4 /*yield*/, new veed_auto_add_title_1.Veed(TEMP_PATH).parseSubtitle(files
                                .filter(function (file) { return file.endsWith('mp3'); })
                                .filter(function (file) {
                                return !fs_1.default.existsSync(path_1.default.resolve(videoDir, file.replace(/^(.+)\.(\w+)$/, '$1_chunks_0.$2')));
                            })
                                .filter(function (file) { return !hasParsed(file); })
                                .map(function (file) { return path_1.default.resolve(videoDir, file); }))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoAddSubtitle.prototype.mergeSrtChunks = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, videoDir, TEMP_PATH, files, groupedFiles, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, videoDir = _a.videoDir, TEMP_PATH = _a.TEMP_PATH;
                        return [4 /*yield*/, utils_1.readdir(path_1.default.resolve(videoDir, TEMP_PATH))];
                    case 1:
                        files = _b.sent();
                        if (!files) {
                            return [2 /*return*/];
                        }
                        groupedFiles = files
                            .filter(function (file) { return /chunks_\d+/.test(file); })
                            .map(function (file) { return path_1.default.resolve(videoDir, TEMP_PATH + "/" + file); })
                            .reduce(function (acc, cur) {
                            var _a = cur.match(/default_Project Name_(.+)_chunks_\d+\.mp3\.srt/) || [cur, 0], num = _a[1];
                            if (!acc[num]) {
                                acc[num] = [cur];
                            }
                            else {
                                acc[num].push(cur);
                            }
                            return acc;
                        }, {});
                        return [4 /*yield*/, Promise.all(Object.keys(groupedFiles).map(function (key) { return subtitles_1.mergeSrtFiles(groupedFiles[key]); }))];
                    case 2:
                        result = _b.sent();
                        return [4 /*yield*/, Promise.all(Object.keys(groupedFiles).map(function (key, i) {
                                return utils_1.writeFile(path_1.default.resolve(videoDir, TEMP_PATH + "/" + key + ".srt"), result[i]);
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
            var _a, videoDir, TEMP_PATH, files;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, videoDir = _a.videoDir, TEMP_PATH = _a.TEMP_PATH;
                        return [4 /*yield*/, utils_1.readdir(path_1.default.resolve(videoDir, TEMP_PATH))];
                    case 1:
                        files = _b.sent();
                        if (!files) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, Promise.all(files
                                .filter(function (file) { return !/chunks/.test(file); })
                                .filter(function (file) { return /default_Project Name_(.+)\.mp3\.srt/.test(file); })
                                .map(function (file) { return path_1.default.resolve(videoDir, TEMP_PATH + "/" + file); })
                                .map(function (file) {
                                return utils_1.move(file, file.replace('default_Project Name_', '').replace('.mp3', ''));
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
            var _a, videoDir, TEMP_PATH, files;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, videoDir = _a.videoDir, TEMP_PATH = _a.TEMP_PATH;
                        return [4 /*yield*/, utils_1.readdir(videoDir)];
                    case 1:
                        files = _b.sent();
                        return [4 /*yield*/, Promise.all(files
                                .filter(function (file) { return !/chunks/.test(file); })
                                .map(function (file) { return path_1.default.resolve(videoDir, TEMP_PATH + "/" + file); })
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
                    case 0: return [4 /*yield*/, this.prepareMp3Files()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.parseSubtitle()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.mergeSrtChunks()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.renameSrtFiles()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.moveSrtFiles()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return AutoAddSubtitle;
}());
exports.default = AutoAddSubtitle;
