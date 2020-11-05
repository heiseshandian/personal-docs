import { copyVideos, getTmpDir, prepareTmpDir, removeTmpDir } from './helpers';
import AutoAddSubtitle, { isSubtitleFile } from '../src';
import path from 'path';
import { readdir } from 'zgq-shared';

jest.setTimeout(1000 * 60 * 10);

const TMP_DIR = getTmpDir('index');

beforeEach(async () => {
  await prepareTmpDir(TMP_DIR);
  await copyVideos(TMP_DIR);
});

afterEach(async () => {
  await removeTmpDir(TMP_DIR);
});

test('AutoAddSubtitle', async () => {
  const videoDir = path.resolve(__dirname, `./videos/${TMP_DIR}`);
  await new AutoAddSubtitle(videoDir).generateSrtFiles();

  const files = await readdir(videoDir);
  expect(files.filter(isSubtitleFile).sort()).toEqual([
    'video with space.srt',
    'video1.srt',
  ]);
});
