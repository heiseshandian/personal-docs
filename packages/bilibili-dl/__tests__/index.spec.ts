import { BilibiliDl } from '../src';
import { getTmpDir, prepareTmpDir, removeTmpDir } from './helpers';
import path from 'path';

jest.setTimeout(1000 * 60 * 5);

const tmpDir = path.resolve(__dirname, getTmpDir(__filename));

beforeEach(async () => {
  prepareTmpDir(tmpDir);
});
afterEach(async () => {
  removeTmpDir(tmpDir);
});

test('download url', async () => {
  await new BilibiliDl('https://www.bilibili.com/video/BV1SZ4y1x7a9?p=1', tmpDir).download();
});

test('download series', async () => {
  await new BilibiliDl('https://www.bilibili.com/video/BV1SZ4y1x7a9?p=1', tmpDir, true).download();
});
