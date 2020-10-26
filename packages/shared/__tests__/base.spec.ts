import { makeMap } from '../src';

test('makeMap', () => {
  const isInStr = makeMap('1,2,3');
  expect(isInStr('1')).toBe(true);
  expect(isInStr('4')).toBe(undefined);

  const isInStr2 = makeMap([1, 2, 3]);
  expect(isInStr2('1')).toBe(true);
  expect(isInStr2('4')).toBe(undefined);
});
