import { getClosestNodeModulesPath } from '../src';

test('getClosestNodeModulesPath', () => {
  const nodeModulesPath = getClosestNodeModulesPath();
  expect(nodeModulesPath?.endsWith('node_modules')).toBe(true);
});
