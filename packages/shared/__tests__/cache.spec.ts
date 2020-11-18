import { clearCache, delay, withCache } from '../src';

const mockFn = jest.fn(async x => {
  await delay(1000);
  return x;
});
const params = 3;

beforeEach(async () => {
  mockFn.mockClear();
  await clearCache(params);
});

test('cache', async () => {
  const cachedFn = withCache(mockFn);
  const result = await cachedFn(params);
  await cachedFn(params);

  expect(result).toBe(params);
  expect(mockFn.mock.calls.length).toBe(1);
});

test('cache expires', async () => {
  const cachedFn = withCache(mockFn, 100);
  const result = await cachedFn(params);
  await cachedFn(params);

  expect(result).toBe(params);
  expect(mockFn.mock.calls.length).toBe(1);
});
