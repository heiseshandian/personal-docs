import { groupByLen } from '../src';

test('groupByLen', () => {
  expect(
    groupByLen(
      new Array(11).fill(0).map((_, i) => i),
      4,
    ),
  ).toEqual([
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10],
  ]);
});
