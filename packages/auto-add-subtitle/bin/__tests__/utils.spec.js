'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var utils_1 = require('../src/utils');
test('getClosestNodeModulesPath', function () {
  var nodeModulesPath = utils_1.getClosestNodeModulesPath();
  expect(
    nodeModulesPath === null || nodeModulesPath === void 0
      ? void 0
      : nodeModulesPath.endsWith('node_modules'),
  ).toBe(true);
});
test('makeMap', function () {
  var isInStr = utils_1.makeMap('1,2,3');
  expect(isInStr('1')).toBe(true);
  expect(isInStr('4')).toBe(undefined);
  var isInStr2 = utils_1.makeMap([1, 2, 3]);
  expect(isInStr2('1')).toBe(true);
  expect(isInStr2('4')).toBe(undefined);
});
