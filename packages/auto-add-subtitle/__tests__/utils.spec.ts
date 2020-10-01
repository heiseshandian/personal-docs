import { getClosestNodeModulesPath } from '../src/utils';

test('getClosestNodeModulesPath', () => {
  const nodeModulesPath = getClosestNodeModulesPath();
  expect(nodeModulesPath?.endsWith('node_modules')).toBe(true);
});
