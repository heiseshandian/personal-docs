import fse from 'fs-extra';
import path from 'path';
import { readdir, readFile, writeFile } from 'zgq-shared';
import SubtitleParser, {
  CHUNK_FILE_SUFFIX,
  isChunkFile,
  isSubtitleFile,
  sliceSrtFile,
  Veed,
} from '../src';
import {
  copyVideos,
  getTmpDir,
  prepareTmpDir,
  randomSort,
  removeTmpDir,
} from './helpers';

jest.setTimeout(1000 * 60 * 10);
const TMP_DIR = getTmpDir(__filename);

function generateChunkFiles(count: number, prefix: string, suffix = '') {
  return new Array(count)
    .fill(0)
    .map((_, i) => `${prefix}${CHUNK_FILE_SUFFIX}${i}.ogg${suffix}`);
}

const generateSrtFiles = (count: number, prefix: string) =>
  generateChunkFiles(count, prefix, Veed.subtitleExt);

test('subtitleParser, groupChunkSrtFiles', () => {
  // https://stackoverflow.com/questions/35987055/how-to-write-unit-testing-for-angular-typescript-for-private-methods-with-jasm
  // https://github.com/microsoft/TypeScript/issues/19335
  const groups = SubtitleParser['groupChunkSrtFiles'](
    generateSrtFiles(20, 'video with space')
      .concat(generateSrtFiles(20, 'video1'))
      .sort(randomSort),
  );

  expect(groups).toEqual({
    'video with space': generateSrtFiles(20, 'video with space'),
    video1: generateSrtFiles(20, 'video1'),
  });
});

describe('tests that based on temp subtitles', () => {
  let tmpPath: string;
  beforeEach(async () => {
    tmpPath = await prepareTmpDir(
      path.resolve(__dirname, `./data/subtitles_${TMP_DIR}`),
    );
    await fse.copy(path.resolve(__dirname, `./data/subtitles/`), tmpPath);
  });
  afterEach(async () => {
    await removeTmpDir(tmpPath);
  });

  test('subtitleParser, mergeSrtChunks', async () => {
    const subtitleParser = new SubtitleParser(tmpPath, { chunkSeconds: 10 });
    await subtitleParser['prepareTmpDir']();
    const srtFiles = ['a.srt', 'b.srt'];

    const [aChunks, bChunks] = await Promise.all(
      srtFiles.map(file => sliceSrtFile(path.resolve(tmpPath, file), 6 * 60)),
    );
    const writeChunkTasks = (chunks: string[][], prefix: string) =>
      chunks.map((chunk, i) =>
        writeFile(
          path.resolve(
            tmpPath,
            subtitleParser['TMP_DIR'],
            `${prefix}${CHUNK_FILE_SUFFIX}${i}.srt`,
          ),
          chunk.join('\n'),
        ),
      );
    await Promise.all(
      writeChunkTasks(aChunks, 'a').concat(writeChunkTasks(bChunks, 'b')),
    );

    await subtitleParser['mergeSrtChunks']();

    const [originalA, originalB] = await Promise.all(
      srtFiles.map(file =>
        readFile(path.resolve(tmpPath, file), { encoding: 'utf-8' }),
      ),
    );
    const [mergedA, mergedB] = await Promise.all(
      srtFiles.map(file =>
        readFile(path.resolve(tmpPath, subtitleParser['TMP_DIR'], file), {
          encoding: 'utf-8',
        }),
      ),
    );

    expect(mergedA).toEqual(originalA);
    expect(mergedB).toEqual(originalB);
  });
});

describe('tests that based on temp audios', () => {
  let tmpPath: string;
  beforeEach(async () => {
    tmpPath = await prepareTmpDir(
      path.resolve(__dirname, `./data/audios_${TMP_DIR}`),
    );
  });
  afterEach(async () => {
    await removeTmpDir(tmpPath);
  });

  test('fixEndTimeOfChunks', async () => {
    const subtitleParser = new SubtitleParser(tmpPath);
    await subtitleParser['prepareTmpDir']();
    await fse.copy(
      path.resolve(__dirname, `./data/audios/`),
      path.resolve(tmpPath, subtitleParser['TMP_DIR']),
    );
    await subtitleParser['fixEndTimeOfChunks']();

    const fixed = await readFile(
      path.resolve(tmpPath, subtitleParser['TMP_DIR'], 'video_chunks_0.srt'),
      { encoding: 'utf-8' },
    );
    const result = await readFile(
      path.resolve(__dirname, './data/audios/', 'video_chunks_0.srt.result'),
      {
        encoding: 'utf-8',
      },
    );
    expect(fixed).toEqual(result);
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

  test.skip('subtitleParser', async () => {
    await new SubtitleParser(tmpPath).generateSrtFiles();

    const files = await readdir(tmpPath);
    expect(files.filter(isSubtitleFile).sort()).toEqual([
      'video with space.srt',
      'video1.srt',
    ]);
  });
});
