import path from 'path';
import { readdir } from 'zgq-shared';
import {
  concatMedias,
  extractAudio,
  getDuration,
  isChunkFile,
  isSupportedAudio,
  parseTime,
  sliceMediaBySeconds,
} from '../src';
import { copyVideos, getTmpDir, prepareTmpDir, removeTmpDir } from './helpers';

const TMP_DIR = getTmpDir(__filename);

const tmpPath = path.resolve(__dirname, `./data/videos/${TMP_DIR}`);
const getVideoPath = (name: string) => path.resolve(tmpPath, name);

beforeEach(async () => {
  await prepareTmpDir(TMP_DIR);
  await copyVideos(TMP_DIR);
});

afterEach(async () => {
  await removeTmpDir(TMP_DIR);
});

test('sliceMediaBySeconds', async () => {
  const [maxSeconds, video] = [5, 'video1.webm'];

  await sliceMediaBySeconds(getVideoPath(video), maxSeconds);
  const files = await readdir(tmpPath);
  const result = await Promise.all(
    files
      .filter(isChunkFile)
      .map(file => path.resolve(tmpPath, file))
      .map(file => getDuration(file)),
  );

  const duration = await getDuration(getVideoPath(video));
  expect(result.length).toEqual(Math.ceil(parseTime(duration) / maxSeconds));
});

test('concatMedias', async () => {
  const result = await concatMedias(
    ['video1.webm', 'video with space.webm'].map(getVideoPath),
    getVideoPath('video1_out.webm'),
  );

  expect(result).toBe(getVideoPath('video1_out.webm'));
});

test('extractAudio', async () => {
  const result = await extractAudio(
    ['video1.webm', 'video with space.webm'].map(getVideoPath),
  );

  expect(result).toEqual(
    ['video1.ogg', 'video with space.ogg'].map(getVideoPath),
  );
});

test('isSupportedAudio', () => {
  expect(isSupportedAudio('f://c//file.ogg')).toBe(true);
  expect(isSupportedAudio('test.test')).toBe(false);
});
