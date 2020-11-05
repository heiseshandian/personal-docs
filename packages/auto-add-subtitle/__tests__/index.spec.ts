import {
  copyVideos,
  getTmpDir,
  prepareTmpDir,
  randomSort,
  removeTmpDir,
} from './helpers';
import AutoAddSubtitle, {
  CHUNK_FILE_SUFFIX,
  isSubtitleFile,
  Veed,
} from '../src';
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

function generateSubtitles(count: number, prefix: string) {
  return new Array(count)
    .fill(0)
    .map((_, i) => `${prefix}${CHUNK_FILE_SUFFIX}${i}.ogg${Veed.subtitleExt}`);
}

test('AutoAddSubtitle, groupChunkSrtFiles', () => {
  // https://stackoverflow.com/questions/35987055/how-to-write-unit-testing-for-angular-typescript-for-private-methods-with-jasm
  // https://github.com/microsoft/TypeScript/issues/19335
  const groups = AutoAddSubtitle['groupChunkSrtFiles'](
    generateSubtitles(20, 'video with space')
      .concat(generateSubtitles(20, 'video1'))
      .sort(randomSort),
  );

  expect(groups).toEqual({
    'video with space': generateSubtitles(20, 'video with space'),
    video1: generateSubtitles(20, 'video1'),
  });
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
