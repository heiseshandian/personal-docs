import { clean, ensurePathExists } from 'zgq-shared';
import path from 'path';

function parseTmpDir(tmpDir: string) {
  return path.isAbsolute(tmpDir)
    ? tmpDir
    : path.resolve(__dirname, `${tmpDir}`);
}

export async function prepareTmpDir(tmpDir: string) {
  return ensurePathExists(parseTmpDir(tmpDir));
}

export async function removeTmpDir(tmpDir: string) {
  await clean(parseTmpDir(tmpDir));
}

export function getTmpDir(fileName: string) {
  return `${path.parse(fileName).name}_spec_test`;
}
