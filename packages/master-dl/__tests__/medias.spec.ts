import { isValidMedia } from '../src';
import path from 'path';

const videoPath = path.resolve(__dirname, './data/videos/');

test('isValidMedia', async () => {
  const result1 = await isValidMedia(path.resolve(videoPath, 'video1.webm'));
  const result2 = await isValidMedia(path.resolve(videoPath, 'broken.webm'));

  expect(result1).toBe(true);
  expect(result2).toBe(false);
});
