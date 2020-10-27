import { XbeibeixParser } from '../src/parsers';

beforeAll(() => {
  jest.setTimeout(1000 * 30);
});

test('XbeibeixParser', async () => {
  const [url] = await XbeibeixParser.parse(
    'https://www.bilibili.com/video/BV1Mh411Z7LC?p=1',
  );
  expect(/\.mp4/i.test(url)).toBe(true);
});
