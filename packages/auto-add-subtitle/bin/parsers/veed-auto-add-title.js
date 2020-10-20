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
exports.Veed = void 0;
var path_1 = __importDefault(require("path"));
var puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
var puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
var utils_1 = require("../utils");
puppeteer_extra_1.default.use(puppeteer_extra_plugin_stealth_1.default());
var Veed = /** @class */ (function () {
    function Veed() {
    }
    Veed.safeClick = function (page, selector) {
        return __awaiter(this, void 0, void 0, function () {
            var timeout;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        timeout = this.config.timeout;
                        return [4 /*yield*/, page.waitForSelector(selector, { timeout: timeout })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, page.click(selector)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Veed.safeClickXPath = function (page, xpath) {
        return __awaiter(this, void 0, void 0, function () {
            var timeout, elements;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        timeout = this.config.timeout;
                        return [4 /*yield*/, page.waitForXPath(xpath, { timeout: timeout })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, page.$x(xpath)];
                    case 2:
                        elements = _a.sent();
                        return [4 /*yield*/, elements[0].click()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // 上传文件
    Veed.upload = function (page, audio) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, inputFileSelector, timeout, uploadBtn;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.config, inputFileSelector = _a.inputFileSelector, timeout = _a.timeout;
                        return [4 /*yield*/, page.$(inputFileSelector)];
                    case 1:
                        uploadBtn = _b.sent();
                        return [4 /*yield*/, (uploadBtn === null || uploadBtn === void 0 ? void 0 : uploadBtn.uploadFile(audio))];
                    case 2:
                        _b.sent();
                        // 跳转编辑页面
                        // https://stackoverflow.com/questions/58451066/puppeteer-wait-for-url
                        return [4 /*yield*/, page.waitForNavigation({
                                timeout: timeout,
                                waitUntil: 'networkidle0',
                            })];
                    case 3:
                        // 跳转编辑页面
                        // https://stackoverflow.com/questions/58451066/puppeteer-wait-for-url
                        _b.sent();
                        // 坐等上传完成
                        return [4 /*yield*/, page.waitForFunction(function () {
                                var match = location.pathname.match(/\w+\/(.*)/);
                                if (!match) {
                                    return false;
                                }
                                var hash = match[1];
                                return hash.replace(/-/g, '').length === 32;
                            }, { timeout: timeout })];
                    case 4:
                        // 坐等上传完成
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // 解析字幕
    Veed._parseSubtitle = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, subtitleSelector, autoSubtitleSelector, startXPath, subtitlesSelector, closeSelector, timeout;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.config, subtitleSelector = _a.subtitleSelector, autoSubtitleSelector = _a.autoSubtitleSelector, startXPath = _a.startXPath, subtitlesSelector = _a.subtitlesSelector, closeSelector = _a.closeSelector, timeout = _a.timeout;
                        return [4 /*yield*/, Promise.all([
                                page.waitForSelector(closeSelector, { timeout: timeout }),
                                page.waitForSelector(subtitleSelector, { timeout: timeout }),
                            ])];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.safeClick(page, closeSelector)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.safeClick(page, subtitleSelector)];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, page.waitForSelector(autoSubtitleSelector, { timeout: timeout })];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, this.safeClick(page, autoSubtitleSelector)];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, this.safeClickXPath(page, startXPath)];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, page.waitForSelector(subtitlesSelector, { timeout: timeout })];
                    case 7:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Veed.download = function (page, audio) {
        return __awaiter(this, void 0, void 0, function () {
            var dir, _a, translateXpath, downloadXpath;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        dir = path_1.default.parse(audio).dir;
                        // https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-setDownloadBehavior
                        // @ts-ignore
                        return [4 /*yield*/, page._client.send('Browser.setDownloadBehavior', {
                                behavior: 'allow',
                                downloadPath: path_1.default.resolve(dir),
                            })];
                    case 1:
                        // https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-setDownloadBehavior
                        // @ts-ignore
                        _b.sent();
                        _a = this.config, translateXpath = _a.translateXpath, downloadXpath = _a.downloadXpath;
                        return [4 /*yield*/, this.safeClickXPath(page, translateXpath)];
                    case 2:
                        _b.sent();
                        // 某些版本的浏览器以此方式点击元素不会触发下载（换成下面的执行js脚本写法）~
                        // await this.safeClickXPath(page, downloadXpath);
                        return [4 /*yield*/, page.evaluate(function (xpath) {
                                var _a;
                                var downloadBtn = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                                (_a = downloadBtn) === null || _a === void 0 ? void 0 : _a.click();
                            }, downloadXpath)];
                    case 3:
                        // 某些版本的浏览器以此方式点击元素不会触发下载（换成下面的执行js脚本写法）~
                        // await this.safeClickXPath(page, downloadXpath);
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Veed.parseSubtitle = function (audios) {
        return __awaiter(this, void 0, void 0, function () {
            var url, dynamicTasks, browser;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (audios.length <= 0) {
                            return [2 /*return*/];
                        }
                        url = this.config.url;
                        dynamicTasks = new utils_1.DynamicTasks('parsing subtitles');
                        return [4 /*yield*/, Promise.all([
                                puppeteer_extra_1.default
                                    .launch({
                                    headless: true,
                                    defaultViewport: {
                                        width: 1920,
                                        height: 1024,
                                    },
                                    args: ['--start-maximized'],
                                })
                                    .then(function (browser) { return __awaiter(_this, void 0, void 0, function () {
                                    var _this = this;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, new utils_1.ConcurrentTasks(audios.map(function (audio, i) { return function () { return __awaiter(_this, void 0, void 0, function () {
                                                    var timeout, page;
                                                    var _this = this;
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0:
                                                                timeout = this.config.timeout;
                                                                return [4 /*yield*/, browser.newPage()];
                                                            case 1:
                                                                page = _a.sent();
                                                                return [4 /*yield*/, utils_1.clearCookies(page)];
                                                            case 2:
                                                                _a.sent();
                                                                return [4 /*yield*/, page.goto(url, { timeout: timeout })];
                                                            case 3:
                                                                _a.sent();
                                                                return [4 /*yield*/, utils_1.setWebLifecycleState(page)];
                                                            case 4:
                                                                _a.sent();
                                                                return [4 /*yield*/, this.upload(page, audio)];
                                                            case 5:
                                                                _a.sent();
                                                                dynamicTasks.add(function () { return __awaiter(_this, void 0, void 0, function () {
                                                                    return __generator(this, function (_a) {
                                                                        switch (_a.label) {
                                                                            case 0: return [4 /*yield*/, this._parseSubtitle(page)];
                                                                            case 1:
                                                                                _a.sent();
                                                                                return [4 /*yield*/, this.download(page, audio)];
                                                                            case 2:
                                                                                _a.sent();
                                                                                // 下载完再关闭页面
                                                                                return [4 /*yield*/, utils_1.delay(1000 * 10)];
                                                                            case 3:
                                                                                // 下载完再关闭页面
                                                                                _a.sent();
                                                                                return [4 /*yield*/, page.close()];
                                                                            case 4:
                                                                                _a.sent();
                                                                                return [2 /*return*/];
                                                                        }
                                                                    });
                                                                }); });
                                                                if (i === audios.length - 1) {
                                                                    dynamicTasks.end();
                                                                }
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                }); }; }), 'uploading files').run(1)];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/, browser];
                                        }
                                    });
                                }); })
                                    .catch(utils_1.handleError),
                                dynamicTasks.run(),
                            ])];
                    case 1:
                        browser = (_a.sent())[0];
                        if (!browser) return [3 /*break*/, 3];
                        return [4 /*yield*/, browser.close()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Veed.config = {
        url: 'https://www.veed.io/',
        inputFileSelector: '[data-testid="file-input-dropzone"]',
        subtitleSelector: '[href$="subtitles"]',
        autoSubtitleSelector: '[data-testid="@editor/subtitles-option/automatic"]',
        startXPath: '//*[@id="root"]/main/div[1]/div[1]/div[1]/div/div/div/button',
        subtitlesSelector: '[data-testid="@editor/subtitle-row-0/textarea"]',
        closeSelector: '[alt^="close"]',
        translateXpath: '//*[@id="root"]/main/div[1]/div[1]/div[1]/div/div/div/nav/div[2]',
        downloadXpath: '//*[@id="root"]/main/div[1]/div[1]/div[1]/div/div/div/div/div[2]/div/div/div[2]/button[1]',
        timeout: 1000 * 60 * 15,
    };
    return Veed;
}());
exports.Veed = Veed;
