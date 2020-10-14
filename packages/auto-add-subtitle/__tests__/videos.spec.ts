import path from 'path';
import { concatMedias, del, handleError, sliceMedia } from '../src/utils';

async function cleanup(files: string[]) {
  await Promise.all([
    files.map(file =>
      del(
        path.isAbsolute(file)
          ? file
          : path.resolve(__dirname, `./videos/${file}`),
      ).catch(handleError),
    ),
  ]);
}

const getVideoPath = (name: string) =>
  path.resolve(__dirname, `./videos/${name}`);

test('slice video', async () => {
  const [result1, result2] = await Promise.all(
    ['video1.webm', 'video with space.webm'].map(file =>
      sliceMedia(getVideoPath(file), '100k'),
    ),
  );

  await Promise.all(
    [result1, result2].map(result =>
      result ? cleanup(result) : Promise.resolve(),
    ),
  );

  expect(result1 !== undefined).toBe(true);
  expect(result2 !== undefined).toBe(true);
});

test('concat videos', async () => {
  const result = await concatMedias(
    ['video1.webm', 'video with space.webm'].map(getVideoPath),
    getVideoPath('video1_out.webm'),
  );

  if (result !== undefined) {
    await cleanup([result]);
  }

  expect(result !== undefined).toBe(true);
});
