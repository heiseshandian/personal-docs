import path from 'path';
import { clean, copy, ensurePathExists } from 'zgq-shared';
import {
  concatMedias,
  extractAudio,
  isSupportedAudio,
  sliceMediaBySize,
} from '../src';

const TMP_DIR = 'medias-spec';
const tmpPath = path.resolve(__dirname, `./videos/${TMP_DIR}`);

const getVideoPath = (name: string) => path.resolve(tmpPath, name);

beforeEach(async () => {
  await prepareTmpDir();

  await Promise.all(
    ['video1.webm', 'video with space.webm'].map(file =>
      copy(path.resolve(__dirname, `./videos/${file}`), getVideoPath(file)),
    ),
  );
});

afterEach(async () => {
  await removeTmpDir();
});

test('slice video', async () => {
  const [result1, result2] = await Promise.all(
    ['video1.webm', 'video with space.webm'].map(file =>
      sliceMediaBySize(getVideoPath(file), '100k'),
    ),
  );

  expect(result1[0]).toEqual(
    new Array(8).fill(0).map((_, i) => getVideoPath(`video1_chunks_${i}.webm`)),
  );
  expect(result2[0]).toEqual(
    new Array(9)
      .fill(0)
      .map((_, i) => getVideoPath(`video with space_chunks_${i}.webm`)),
  );
});

test('concat videos', async () => {
  const result = await concatMedias(
    ['video1.webm', 'video with space.webm'].map(getVideoPath),
    getVideoPath('video1_out.webm'),
  );

  expect(result).toBe(getVideoPath('video1_out.webm'));
});

test('extract audio', async () => {
  const result = await extractAudio(
    ['video1.webm', 'video with space.webm'].map(getVideoPath),
  );

  expect(result).toEqual(
    ['video1.ogg', 'video with space.ogg'].map(getVideoPath),
  );
});

test('is audio', () => {
  expect(isSupportedAudio('f://c//file.ogg')).toBe(true);
  expect(isSupportedAudio('test.test')).toBe(false);
});

async function prepareTmpDir() {
  return ensurePathExists(tmpPath);
}

async function removeTmpDir() {
  await clean(tmpPath);
}
