import fs from 'fs';
import path from 'path';
import { isPromise, md5, parseJson } from './base';
import { del, ensurePathExists, readFile, writeFile } from './fs';
import { getClosestNodeModulesPath } from './path';

const CACHE_FOLDER = '.cache';
const NEVER_EXPIRES = -1;

const cachePath =
  `${getClosestNodeModulesPath()}`
    .split(path.sep)
    .filter(item => !!item)
    .concat(CACHE_FOLDER)
    .join(path.sep) + path.sep;

ensurePathExists(cachePath);

interface CacheData {
  expires: number;
  result: any;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function withCache(fn: Function, maxAge?: number) {
  return async (params: any) => {
    const cache = await getCache(params);
    // hit cache
    if (cache) {
      return cache;
    }

    const result = fn(params);
    if (isPromise(result)) {
      return result.then(async (data: any) => {
        await updateCache(params, {
          expires: maxAge === undefined ? NEVER_EXPIRES : Date.now() + maxAge,
          result: data,
        });

        return data;
      });
    }

    await updateCache(params, {
      expires: maxAge === undefined ? NEVER_EXPIRES : Date.now() + maxAge,
      result,
    });
    return result;
  };
}

async function getCache(params: any) {
  const key = getCacheKey(params);

  if (!fs.existsSync(key)) {
    return;
  }

  const data = await readFile(key);
  const { expires, result } = (parseJson(data) || {}) as CacheData;
  if (expires === NEVER_EXPIRES || expires > Date.now()) {
    return result;
  }
}

async function updateCache(params: any, data: CacheData) {
  const key = getCacheKey(params);
  await writeFile(key, JSON.stringify(data));
}

export async function clearCache(params: any) {
  const key = getCacheKey(params);
  if (fs.existsSync(key)) {
    await del(key);
  }
}

function getCacheKey(params: any) {
  return `${cachePath}${md5(`${params}`)}.json`;
}
