import { BilibiliParser } from '../src/parsers';

test('BilibiliParser', async () => {
  const result = await BilibiliParser.parseSeries(
    'https://www.bilibili.com/video/BV1Mh411Z7LC?p=1',
  );

  expect(result.map(item => item.href)).toEqual(
    Array(78)
      .fill(0)
      .map((_, i) => `https://www.bilibili.com/video/BV1Mh411Z7LC?p=${i + 1}`),
  );
});
