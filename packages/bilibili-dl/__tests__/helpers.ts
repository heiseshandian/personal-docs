import path from 'path';
import { clean, ensurePathExists } from 'zgq-shared';

export function getTmpDir(fileName: string) {
  return `${path.parse(fileName).name}_spec_test`;
}

export async function prepareTmpDir(tmpDir: string) {
  return ensurePathExists(tmpDir);
}

export async function removeTmpDir(tmpDir: string) {
  await clean(tmpDir);
}
