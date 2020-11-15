import path from 'path';
import { execAsync, readdir } from 'zgq-shared';
import { isSubtitleFile } from '../src';
import { copyVideos, getTmpDir, prepareTmpDir, removeTmpDir } from './helpers';

jest.setTimeout(1000 * 60 * 10);

const TMP_DIR = getTmpDir(__filename);

describe('cli normal parse', () => {
  beforeEach(async () => {
    await prepareTmpDir(TMP_DIR);
    await copyVideos(TMP_DIR);
  });

  afterEach(async () => {
    await removeTmpDir(TMP_DIR);
  });

  test.skip('cli', async () => {
    const videoDir = path.resolve(__dirname, `./data/videos/${TMP_DIR}`);
    await execAsync(
      `npx ts-node ${path.resolve(__dirname, '../src/cli.ts')} ${videoDir}`,
    );

    const files = await readdir(videoDir);
    expect(files.filter(isSubtitleFile).sort()).toEqual([
      'video with space.srt',
      'video1.srt',
    ]);
  });
});

test('test parse', async () => {
  const [stdout] = await execAsync(
    `npx ts-node ${path.resolve(__dirname, '../src/cli.ts')} -t=true`,
  );

  expect(stdout.replace('\n', '')).toEqual('测试解析成功!');
});
