import path from 'path';
import { clean, ensurePathExists, readdir } from 'zgq-shared';
import { extractAudio, isSubtitleFile, Veed, isFile } from '../src';

jest.setTimeout(1000 * 60 * 10);

const TMP_DIR = 'veed-spec';

beforeEach(async () => {
  const tmpPath = await prepareTmpDir();
  const videoPath = path.resolve(__dirname, './videos/');
  const videos = await readdir(videoPath);

  await extractAudio(
    videos.filter(isFile).map(file => path.resolve(videoPath, file)),
    tmpPath,
  );
});

afterEach(async () => {
  await removeTmpDir();
});

test('veed, parseSubtitle', async () => {
  const audiosPath = path.resolve(__dirname, `./videos/${TMP_DIR}`);
  const audios = await readdir(audiosPath);

  await Veed.parseSubtitle(audios.map(file => path.resolve(audiosPath, file)));

  const files = await readdir(audiosPath);
  expect(files.filter(isSubtitleFile).sort()).toEqual([
    'video with space.srt',
    'video1.srt',
  ]);
});

async function prepareTmpDir() {
  return ensurePathExists(path.resolve(__dirname, `./videos/${TMP_DIR}`));
}

async function removeTmpDir() {
  await clean(path.resolve(__dirname, `./videos/${TMP_DIR}`));
}
