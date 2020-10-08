import filenamify from 'filenamify';
import fs from 'fs';
import path from 'path';

const pwd = __dirname.split(path.sep);

// 查找最近的node_modules或模块路径
export function getClosestNodeModulesPath(
  moduleName?: string,
  folder = pwd,
): string | null {
  if (folder.length < 1) {
    logError(moduleName, folder);
    return null;
  }
  const nodeModulesPath = folder.concat(['node_modules']).join(path.sep);
  const p = moduleName
    ? path.join(nodeModulesPath, moduleName)
    : nodeModulesPath;
  if (fs.existsSync(p)) {
    return nodeModulesPath;
  }
  // 递归向上查找
  const result = getClosestNodeModulesPath(moduleName, folder.slice(0, -1));
  if (!result) logError(moduleName, folder);
  return result;
}

function logError(moduleName: string = '', folder: Array<string>) {
  console.error(
    `Could not find the node_modules folder ${
      moduleName ? 'which contains ' + moduleName : ''
    } in ${folder.join(path.sep)}`,
  );
}

// 去掉文件名中的非法字符
export function toValidFilePath(filePath: string) {
  const { dir, base } = path.parse(filePath);
  return path.resolve(dir, filenamify(base));
}
