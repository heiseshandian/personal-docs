import { clean, copy, ensurePathExists } from 'zgq-shared';
import path from 'path';

function parseTmpDir(tmpDir: string) {
  return path.isAbsolute(tmpDir)
    ? tmpDir
    : path.resolve(__dirname, `./data/videos/${tmpDir}`);
}

export async function prepareTmpDir(tmpDir: string) {
  return ensurePathExists(parseTmpDir(tmpDir));
}

export async function removeTmpDir(tmpDir: string) {
  await clean(parseTmpDir(tmpDir));
}

export async function copyVideos(tmpDir: string) {
  await Promise.all(
    ['video1.webm', 'video with space.webm'].map(file =>
      copy(
        path.resolve(__dirname, `./data/videos/${file}`),
        path.resolve(__dirname, `./data/videos/${tmpDir}/${file}`),
      ),
    ),
  );
}

export function getTmpDir(fileName: string) {
  return `${path.parse(fileName).name}_spec_test`;
}

export function randomSort() {
  return 0.5 - Math.random();
}
