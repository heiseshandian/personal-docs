import {
  bubbleSort,
  insertSort,
  selectSort,
  mergeSort,
  quickSort,
} from '../src';

test('bubbleSort', () => {
  expect(bubbleSort([1, 4, 3, 6, 5, 7])).toEqual([1, 3, 4, 5, 6, 7]);
});

test('insertSort', () => {
  expect(insertSort([1, 4, 3, 6, 5, 7])).toEqual([1, 3, 4, 5, 6, 7]);
});

test('selectSort', () => {
  expect(selectSort([1, 4, 3, 6, 5, 7])).toEqual([1, 3, 4, 5, 6, 7]);
});

test('mergeSort', () => {
  expect(mergeSort([1, 4, 3, 6, 5, 7])).toEqual([1, 3, 4, 5, 6, 7]);
});

test('quickSort', () => {
  expect(quickSort([1, 4, 3, 6, 5, 7])).toEqual([1, 3, 4, 5, 6, 7]);
});
