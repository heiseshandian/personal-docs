import path from 'path';
import { readdir } from 'zgq-shared';
import { extractAudio, isFile, isSubtitleFile, Veed } from '../src';
import { getTmpDir, prepareTmpDir, removeTmpDir } from './helpers';

jest.setTimeout(1000 * 60 * 10);

const TMP_DIR = getTmpDir('veed');

beforeEach(async () => {
  const tmpPath = await prepareTmpDir(TMP_DIR);
  const videoPath = path.resolve(__dirname, './data/videos/');
  const videos = await readdir(videoPath);

  await extractAudio(
    videos.filter(isFile).map(file => path.resolve(videoPath, file)),
    tmpPath,
  );
});

afterEach(async () => {
  await removeTmpDir(TMP_DIR);
});

test('veed, parseSubtitle', async () => {
  const audiosPath = path.resolve(__dirname, `./data/videos/${TMP_DIR}`);
  const audios = await readdir(audiosPath);

  await Veed.parseSubtitle(audios.map(file => path.resolve(audiosPath, file)));

  const files = await readdir(audiosPath);
  expect(files.filter(isSubtitleFile).sort()).toEqual([
    'video with space.srt',
    'video1.srt',
  ]);
});
