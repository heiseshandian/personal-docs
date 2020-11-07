import {
  CHUNK_FILE_SUFFIX,
  isChunkFile,
  mergeSrtFiles,
  sliceSrtFile,
} from '../src';
import { getTmpDir, prepareTmpDir, removeTmpDir } from './helpers';
import path from 'path';
import fse from 'fs-extra';
import { readdir, readFile, writeFile } from 'zgq-shared';

const TMP_DIR = getTmpDir('subtitles');

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

  const aChunks = await sliceSrtFile(path.resolve(tmpPath, srtFile), 6 * 60);
  await Promise.all(
    aChunks.map((chunk, i) =>
      writeFile(
        path.resolve(tmpPath, `a${CHUNK_FILE_SUFFIX}${i}.srt`),
        chunk.join('\n'),
      ),
    ),
  );

  const files = await readdir(tmpPath);
  const merged = await mergeSrtFiles(
    files.filter(isChunkFile).map(file => path.resolve(tmpPath, file)),
  );

  const original = await readFile(path.resolve(tmpPath, srtFile), {
    encoding: 'utf-8',
  });
  expect(merged).toEqual(original);
});
