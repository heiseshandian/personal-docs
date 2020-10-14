import { getClosestNodeModulesPath, makeMap } from '../src/utils';

test('getClosestNodeModulesPath', () => {
  const nodeModulesPath = getClosestNodeModulesPath();
  expect(nodeModulesPath?.endsWith('node_modules')).toBe(true);
});

test('makeMap', () => {
  const isInStr = makeMap('1,2,3');
  expect(isInStr('1')).toBe(true);
  expect(isInStr('4')).toBe(undefined);

  const isInStr2 = makeMap([1, 2, 3]);
  expect(isInStr2('1')).toBe(true);
  expect(isInStr2('4')).toBe(undefined);
});
