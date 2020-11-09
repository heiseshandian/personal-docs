import path from 'path';
import { execAsync, readdir } from 'zgq-shared';
import { isSubtitleFile } from '../src';
import { copyVideos, getTmpDir, prepareTmpDir, removeTmpDir } from './helpers';

jest.setTimeout(1000 * 60 * 10);

const TMP_DIR = getTmpDir(__filename);

beforeEach(async () => {
  await prepareTmpDir(TMP_DIR);
  await copyVideos(TMP_DIR);
});

afterEach(async () => {
  await removeTmpDir(TMP_DIR);
});

test('cli', async () => {
  const videoDir = path.resolve(__dirname, `./data/videos/${TMP_DIR}`);
  await execAsync(
    `npx ts-node ${path.resolve(__dirname, '../src/cli.ts')} ${videoDir}`,
  );

  const files = await readdir(videoDir);
  expect(files.filter(isSubtitleFile).sort()).toEqual([
    'video with space.srt',
    'video1.srt',
  ]);
});
