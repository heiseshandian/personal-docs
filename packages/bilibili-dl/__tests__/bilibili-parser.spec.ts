import { BilibiliParser } from '../src/parsers';

test('BilibiliParser, parseSeries', async () => {
  const result = await BilibiliParser.parseSeries(
    'https://www.bilibili.com/video/BV1Mh411Z7LC?p=1',
  );

  expect(result.map(item => item.href)).toEqual(
    Array(78)
      .fill(0)
      .map((_, i) => `https://www.bilibili.com/video/BV1Mh411Z7LC?p=${i + 1}`),
  );
});

test('BilibiliParser, parse srt', async () => {
  const result = await BilibiliParser.parseSrt(
    'https://m.bilibili.com/video/BV1Mh411Z7LC?p=1',
  );

  expect(result).toBeTruthy();
  expect((result as string).split('\n')[0]).toBe('1');
});
