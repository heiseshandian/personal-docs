import { del, execAsync, readdir } from '../src/utils';
import path from 'path';
import { isSrtFile } from './helpers';

jest.setTimeout(1000 * 60 * 10);

test('cli', async () => {
  const videoDir = path.resolve(__dirname, './videos/');
  await execAsync(
    `npx ts-node ${path.resolve(__dirname, '../src/cli.ts')} ${videoDir}`,
  );

  const files = await readdir(videoDir);
  expect(files.filter(isSrtFile).length).toBe(2);

  await Promise.all(
    files
      .filter(isSrtFile)
      .map(file => path.resolve(videoDir, file))
      .map(file => del(file)),
  );
});
