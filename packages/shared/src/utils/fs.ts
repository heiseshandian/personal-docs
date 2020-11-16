import fs, { PathLike } from 'fs';
import { callback2Promise } from './base';
import { execAsync } from './shell';

// https://www.typescriptlang.org/docs/handbook/functions.html#overloads
export function readFile(path: PathLike): Promise<Buffer>;
export function readFile(
  path: PathLike,
  options: { encoding: BufferEncoding },
): Promise<string>;
export function readFile(
  path: PathLike,
  options?: { encoding: BufferEncoding },
): Promise<string | Buffer> {
  return callback2Promise<any>(fs.readFile)(path, options);
}

export const writeFile: (
  path: PathLike,
  content: string | Buffer,
) => Promise<boolean> = callback2Promise(fs.writeFile);

export const readdir: (path: string) => Promise<string[]> = callback2Promise(
  fs.readdir,
);

export const del: (path: PathLike) => Promise<boolean> = callback2Promise(
  fs.unlink,
);

export const clean = (path: string) => execAsync(`npx rimraf ${path}`);

export const move: (
  oldPath: PathLike,
  newPath: PathLike,
) => Promise<boolean> = callback2Promise(fs.rename);

export const copy: (
  oldPath: PathLike,
  newPath: PathLike,
) => Promise<boolean> = callback2Promise(fs.copyFile);

export function ensurePathExists(filePath: string) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath, { recursive: true });
  }

  return filePath;
}
