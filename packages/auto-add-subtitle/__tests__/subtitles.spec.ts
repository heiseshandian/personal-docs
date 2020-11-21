import {
  CHUNK_FILE_SUFFIX,
  fixEndTime,
  isChunkFile,
  mergeSrtFiles,
  sliceSrtFile,
} from '../src';
import { getTmpDir, prepareTmpDir, removeTmpDir } from './helpers';
import path from 'path';
import fse from 'fs-extra';
import { readdir, readFile, writeFile } from 'zgq-shared';

const TMP_DIR = getTmpDir(__filename);

describe('tests that based on tmp srt files', () => {
  let tmpPath: string;
  beforeEach(async () => {
    tmpPath = await prepareTmpDir(path.resolve(__dirname, `./data/${TMP_DIR}`));
    await fse.copy(path.resolve(__dirname, `./data/subtitles/`), tmpPath);
  });

  afterEach(async () => {
    await removeTmpDir(tmpPath);
  });

  test('sliceSrtFile, mergeSrtFiles', async () => {
    const srtFile = 'a.srt';
    await prepareChunkSrtFiles(srtFile, tmpPath);

    const files = await readdir(tmpPath);
    const merged = await mergeSrtFiles(
      files.filter(isChunkFile).map(file => path.resolve(tmpPath, file)),
    );

    const original = await readFile(path.resolve(tmpPath, srtFile), {
      encoding: 'utf-8',
    });
    expect(merged).toEqual(original);
  });
});

async function prepareChunkSrtFiles(srtFile: string, destPath: string) {
  const { name } = path.parse(srtFile);

  const aChunks = await sliceSrtFile(path.resolve(destPath, srtFile), 6 * 60);
  await Promise.all(
    aChunks.map((chunk, i) =>
      writeFile(
        path.resolve(destPath, `${name}${CHUNK_FILE_SUFFIX}${i}.srt`),
        chunk.join('\n'),
      ),
    ),
  );
}

test('fixEndTime', async () => {
  const fixed = await fixEndTime(
    path.resolve(__dirname, './data/subtitles/a.srt'),
    '00:13:00.09',
  );

  const preFixed = await getPreFixed();
  expect(fixed).toEqual(preFixed);
});

async function getPreFixed() {
  return await readFile(
    path.resolve(__dirname, './data/subtitles/a-fixed.srt'),
    { encoding: 'utf-8' },
  );
}
