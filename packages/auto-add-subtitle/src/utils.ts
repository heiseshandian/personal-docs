import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

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

export function md5(data: string) {
  return crypto.createHash('md5').update(data).digest('hex');
}

export async function readFile(filePath: string) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export async function writeFile(filePath: string, content: any) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, content, err => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}
