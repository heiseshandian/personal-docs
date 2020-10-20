import path from 'path';
import AutoAddSubtitle from '../src';
import { del, readdir } from '../src/utils';

jest.setTimeout(1000 * 60 * 10);

function isSrtFile(srt: string) {
  return /\.srt$/.test(srt);
}

test('generate srt files', async () => {
  const videoDir = path.resolve(__dirname, './videos/');

  await new AutoAddSubtitle(videoDir, 10).generateSrtFiles();

  const files = await readdir(videoDir);
  expect(files.filter(isSrtFile).length).toBe(2);

  await Promise.all(
    files
      .filter(isSrtFile)
      .map(file => path.resolve(videoDir, file))
      .map(file => del(file)),
  );
});
