'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.toValidFilePath = exports.getClosestNodeModulesPath = void 0;
var filenamify_1 = __importDefault(require('filenamify'));
var fs_1 = __importDefault(require('fs'));
var path_1 = __importDefault(require('path'));
var pwd = __dirname.split(path_1.default.sep);
// 查找最近的node_modules或模块路径
function getClosestNodeModulesPath(moduleName, folder) {
  if (folder === void 0) {
    folder = pwd;
  }
  if (folder.length < 1) {
    logError(moduleName, folder);
    return null;
  }
  var nodeModulesPath = folder
    .concat(['node_modules'])
    .join(path_1.default.sep);
  var p = moduleName
    ? path_1.default.join(nodeModulesPath, moduleName)
    : nodeModulesPath;
  if (fs_1.default.existsSync(p)) {
    return nodeModulesPath;
  }
  // 递归向上查找
  var result = getClosestNodeModulesPath(moduleName, folder.slice(0, -1));
  if (!result) logError(moduleName, folder);
  return result;
}
exports.getClosestNodeModulesPath = getClosestNodeModulesPath;
function logError(moduleName, folder) {
  if (moduleName === void 0) {
    moduleName = '';
  }
  console.error(
    'Could not find the node_modules folder ' +
      (moduleName ? 'which contains ' + moduleName : '') +
      ' in ' +
      folder.join(path_1.default.sep),
  );
}
// 去掉文件名中的非法字符
function toValidFilePath(filePath) {
  var _a = path_1.default.parse(filePath),
    dir = _a.dir,
    base = _a.base;
  return path_1.default.resolve(dir, filenamify_1.default(base));
}
exports.toValidFilePath = toValidFilePath;
