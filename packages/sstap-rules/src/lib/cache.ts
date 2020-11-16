import os from 'os';
import { readFile, writeFile } from 'zgq-shared';

const cachePath = `${os.homedir()}/.sstap-rules`;

export async function updateCache(content: Record<string, any>) {
  await writeFile(cachePath, JSON.stringify(content));
}

export async function getCache() {
  const content = await readFile(cachePath, { encoding: 'utf-8' });
  return JSON.parse(content);
}
