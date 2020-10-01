import { BilibiliParser } from '../src/bilibili-parser';

beforeAll(() => {
  jest.setTimeout(1000 * 30);
});

test('BilibiliParser', async () => {
  const [url] = await BilibiliParser.parse(
    'https://www.bilibili.com/video/BV1Mh411Z7LC?p=1',
  );
  expect(/\.mp4/i.test(url)).toBe(true);
});
