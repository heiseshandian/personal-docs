import { getClosestNodeModulesPath, md5, readFile, writeFile } from './utils';
import path from 'path';
import fs from 'fs';

const CACHE_FOLDER = '.cache';

const prefix =
  `${getClosestNodeModulesPath()}`
    .split(path.sep)
    .filter(item => !!item)
    .concat(CACHE_FOLDER)
    .join(path.sep) + path.sep;

ensureCacheDirExists(prefix);

export function withCache(
  fn: (params: string | Array<string>) => Promise<any>,
) {
  return async (params: string | Array<string>) => {
    const filePath = `${prefix}${md5(
      Array.isArray(params) ? params.join() : params,
    )}.json`;

    // hit cache
    if (fs.existsSync(filePath)) {
      return readFile(filePath).then(data => {
        return JSON.parse(data as string);
      });
    }

    return fn(params).then(async result => {
      await writeFile(filePath, JSON.stringify(result));
      return result;
    });
  };
}

function ensureCacheDirExists(cachePath: string) {
  if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath);
  }
}
