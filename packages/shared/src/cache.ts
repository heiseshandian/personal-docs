import fs from 'fs';
import path from 'path';
import { md5 } from './base';
import { readFile, writeFile } from './fs';
import { getClosestNodeModulesPath } from './path';

const cache_folder = '.cache';

const prefix =
  `${getClosestNodeModulesPath()}`
    .split(path.sep)
    .filter(item => !!item)
    .concat(cache_folder)
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
        return JSON.parse(data as any);
      });
    }

    const result = await fn(params);
    await writeFile(filePath, JSON.stringify(result));
    return result;
  };
}

function ensureCacheDirExists(cachePath: string) {
  if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, { recursive: true });
  }
}
