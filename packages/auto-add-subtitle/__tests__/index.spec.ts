import fse from 'fs-extra';
import path from 'path';
import { readdir } from 'zgq-shared';
import SubtitleParser, { isChunkFile, isSubtitleFile } from '../src';
import {
  copyVideos,
  FixEndTimeOfChunksHelper,
  generateRandomSrtFiles,
  getGroupedSrtFiles,
  getTmpDir,
  MergeSrtChunksHelper,
  prepareTmpDir,
  removeTmpDir,
} from './helpers';

jest.setTimeout(1000 * 60 * 10);
const TMP_DIR = getTmpDir(__filename);

test('subtitleParser, groupAndSortChunkSrtFiles', () => {
  // https://stackoverflow.com/questions/35987055/how-to-write-unit-testing-for-angular-typescript-for-private-methods-with-jasm
  // https://github.com/microsoft/TypeScript/issues/19335
  const groups = SubtitleParser['groupAndSortChunkSrtFiles'](
    generateRandomSrtFiles(),
  );

  expect(groups).toEqual(getGroupedSrtFiles());
});

describe('tests that based on temp subtitles', () => {
  const subtitlesPath = path.resolve(__dirname, `./data/subtitles`);

  let tmpPath: string;
  beforeEach(async () => {
    tmpPath = await prepareTmpDir(`${subtitlesPath}_${TMP_DIR}`);
    await fse.copy(subtitlesPath, tmpPath);
  });
  afterEach(async () => {
    await removeTmpDir(tmpPath);
  });

  test.only('subtitleParser, mergeSrtChunks', async () => {
    const mergeSrtChunksHelper = new MergeSrtChunksHelper(tmpPath);
    await mergeSrtChunksHelper.mergeSrtChunks();
    await mergeSrtChunksHelper.expectMergedEqualsOriginal();
  });
});

describe('tests that based on temp audios', () => {
  const tmpPath = path.resolve(__dirname, `./data/audios_${TMP_DIR}`);

  beforeEach(async () => {
    await prepareTmpDir(tmpPath);
  });
  afterEach(async () => {
    await removeTmpDir(tmpPath);
  });

  test('fixEndTimeOfChunks', async () => {
    const fixEndTimeOfChunksHelper = new FixEndTimeOfChunksHelper(tmpPath);
    await fixEndTimeOfChunksHelper.fixEndTimeOfChunks();
    await fixEndTimeOfChunksHelper.expectFixedEqualsResult();
  });
});

describe('tests that based on temp videos', () => {
  let tmpPath: string;
  beforeEach(async () => {
    tmpPath = await prepareTmpDir(TMP_DIR);
    await copyVideos(TMP_DIR);
  });

  afterEach(async () => {
    await removeTmpDir(TMP_DIR);
  });

  test('subtitleParser, prepareTmpAudioFiles', async () => {
    const subtitleParser = new SubtitleParser(tmpPath, { chunkSeconds: 1 });
    await subtitleParser['prepareTmpDir']();
    await subtitleParser['prepareTmpAudioFiles']();

    const audios = await readdir(
      path.resolve(tmpPath, subtitleParser['TMP_DIR']),
    );

    expect(audios.every(isChunkFile)).toBe(true);
  });

  test('subtitleParser', async () => {
    await new SubtitleParser(tmpPath).generateSrtFiles();

    const files = await readdir(tmpPath);
    expect(files.filter(isSubtitleFile).sort()).toEqual([
      'video with space.srt',
      'video1.srt',
    ]);
  });
});
