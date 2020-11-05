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
  extractChunkNo,
} from '../src';
import path from 'path';
import { readdir } from 'zgq-shared';

jest.setTimeout(1000 * 60 * 10);
const TMP_DIR = getTmpDir('index');
const videoDir = path.resolve(__dirname, `./videos/${TMP_DIR}`);

function generateChunkFiles(count: number, prefix: string, suffix = '') {
  return new Array(count)
    .fill(0)
    .map((_, i) => `${prefix}${CHUNK_FILE_SUFFIX}${i}.ogg${suffix}`);
}

test('AutoAddSubtitle, groupChunkSrtFiles', () => {
  // https://stackoverflow.com/questions/35987055/how-to-write-unit-testing-for-angular-typescript-for-private-methods-with-jasm
  // https://github.com/microsoft/TypeScript/issues/19335
  const groups = AutoAddSubtitle['groupChunkSrtFiles'](
    generateChunkFiles(20, 'video with space', Veed.subtitleExt)
      .concat(generateChunkFiles(20, 'video1', Veed.subtitleExt))
      .sort(randomSort),
  );

  expect(groups).toEqual({
    'video with space': generateChunkFiles(20, 'video with space'),
    video1: generateChunkFiles(20, 'video1'),
  });
});

describe('tests that needs setup and teardown', () => {
  beforeEach(async () => {
    await prepareTmpDir(TMP_DIR);
    await copyVideos(TMP_DIR);
  });

  afterEach(async () => {
    await removeTmpDir(TMP_DIR);
  });

  test('AutoAddSubtitle, extractAudioFiles', async () => {
    const autoAddSubtitle = new AutoAddSubtitle(videoDir, 1);
    await autoAddSubtitle['prepareTmpDir']();
    await autoAddSubtitle['extractAudioFiles']();

    const audios = await readdir(
      path.resolve(videoDir, autoAddSubtitle['TMP_DIR']),
    );
    const sortByChunkNo = (a: string, b: string) =>
      extractChunkNo(a) - extractChunkNo(b);

    expect(audios.sort(sortByChunkNo)).toEqual(
      generateChunkFiles(13, 'video with space')
        .concat(generateChunkFiles(12, 'video1'))
        .sort(sortByChunkNo),
    );
  });

  test('AutoAddSubtitle', async () => {
    await new AutoAddSubtitle(videoDir).generateSrtFiles();

    const files = await readdir(videoDir);
    expect(files.filter(isSubtitleFile).sort()).toEqual([
      'video with space.srt',
      'video1.srt',
    ]);
  });
});
