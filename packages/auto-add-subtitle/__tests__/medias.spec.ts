import path from 'path';
import {
  concatMedias,
  extractAudio,
  isSupportedAudio,
  sliceMediaBySize,
} from '../src';
import { copyVideos, getTmpDir, prepareTmpDir, removeTmpDir } from './helpers';

const TMP_DIR = getTmpDir('medias');

const tmpPath = path.resolve(__dirname, `./data/videos/${TMP_DIR}`);
const getVideoPath = (name: string) => path.resolve(tmpPath, name);

beforeEach(async () => {
  await prepareTmpDir(TMP_DIR);
  await copyVideos(TMP_DIR);
});

afterEach(async () => {
  await removeTmpDir(TMP_DIR);
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
