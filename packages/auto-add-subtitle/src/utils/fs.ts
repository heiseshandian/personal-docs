import fs, { PathLike } from 'fs';
import { callback2Promise } from './base';

export const readFile: (path: PathLike) => Promise<Buffer> = callback2Promise(
  fs.readFile,
);

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

export const move: (
  oldPath: PathLike,
  newPath: PathLike,
) => Promise<boolean> = callback2Promise(fs.rename);

export async function ensurePathExists(filePath: string) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath, { recursive: true });
  }

  return filePath;
}
