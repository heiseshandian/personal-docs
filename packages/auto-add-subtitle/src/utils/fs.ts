import fs from 'fs';
import { callback2Promise } from './base';

export const readFile = callback2Promise<Buffer>(fs.readFile);

export const writeFile = callback2Promise<boolean>(fs.writeFile);

export const del = callback2Promise<boolean>(fs.unlink);

export async function ensurePathExists(filePath: string) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath, { recursive: true });
  }

  return filePath;
}
