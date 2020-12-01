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

  // 耗时2分钟，跳过
  test.skip('cli', async () => {
    const videoDir = path.resolve(__dirname, `./data/videos/${TMP_DIR}`);
    await runCli(videoDir);

    const files = await readdir(videoDir);
    expect(files.filter(isSubtitleFile).sort()).toEqual(['video with space.srt', 'video1.srt']);
  });
});

async function runCli(params: string) {
  return await execAsync(`npx ts-node ${path.resolve(__dirname, '../src/cli.ts')} ${params}`);
}
