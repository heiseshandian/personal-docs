import { download, toValidFilePath } from '../src/downloader';
import path from 'path';
import fs from 'fs';

beforeAll(() => {
  jest.setTimeout(1000 * 50);
});

test('download file', async () => {
  await Promise.all(
    [
      path.resolve(__dirname, 'baidu.html'),
      'baidu.html',
      'baidu>*',
      '',
      '>*',
    ].map(async filePath => {
      const isSuccess = await download('http://www.baidu.com', filePath);
      if (isSuccess) {
        filePath = toValidFilePath(filePath);
        expect(fs.existsSync(filePath)).toBe(true);
        if (fs.statSync(filePath).isFile()) {
          fs.unlink(filePath, () => {});
        }
      }
    }),
  );
});
