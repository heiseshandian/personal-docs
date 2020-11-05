import { clean, copy, ensurePathExists } from 'zgq-shared';
import path from 'path';

export async function prepareTmpDir(tmpDir: string) {
  return ensurePathExists(path.resolve(__dirname, `./videos/${tmpDir}`));
}

export async function removeTmpDir(tmpDir: string) {
  await clean(path.resolve(__dirname, `./videos/${tmpDir}`));
}

export async function copyVideos(tmpDir: string) {
  await Promise.all(
    ['video1.webm', 'video with space.webm'].map(file =>
      copy(
        path.resolve(__dirname, `./videos/${file}`),
        path.resolve(path.resolve(__dirname, `./videos/${tmpDir}/${file}`)),
      ),
    ),
  );
}

export function getTmpDir(tmpDir: string) {
  return `${tmpDir}_spec_test`;
}
