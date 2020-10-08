import path from 'path';

import { concatVideos, sliceVideo } from '../src/videos';

test('slice video', async () => {
  const result = await sliceVideo(
    path.resolve(
      __dirname,
      '../node_modules/.cache/videos/00-Introduction1004.mp4',
    ),
    '50m',
  );

  expect(result).toBe(true);
});

test('slice video, handle space', async () => {
  const result = await sliceVideo(
    path.resolve(
      __dirname,
      '../node_modules/.cache/videos/01-Why Functional Programming1000.mp4',
    ),
    '30m',
  );

  expect(result).toBe(true);
});

test('concat videos', async () => {
  const result = await concatVideos(
    [
      '00-Introduction1004_chunks_0.mp4',
      '00-Introduction1004_chunks_1.mp4',
    ].map(val =>
      path.resolve(__dirname, `../node_modules/.cache/videos/${val}`),
    ),
    path.resolve(
      __dirname,
      `../node_modules/.cache/videos/00-Introduction1004_concat.mp4`,
    ),
  );

  expect(result).toBe(true);
});

test('concat videos, handle space', async () => {
  const result = await concatVideos(
    [
      '01-Why Functional Programming1000.mp4',
      '00-Introduction1004_chunks_1.mp4',
    ].map(val =>
      path.resolve(__dirname, `../node_modules/.cache/videos/${val}`),
    ),
    path.resolve(
      __dirname,
      `../node_modules/.cache/videos/00-Introduction1004_concat.mp4`,
    ),
  );

  expect(result).toBe(true);
});
