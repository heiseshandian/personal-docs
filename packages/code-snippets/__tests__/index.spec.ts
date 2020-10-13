import {
  maxElementsOfArray,
  minElementsOfArray,
  number2Array,
  obj2Array,
  reverseString,
  sum,
} from '../src';

test('reverse string', () => {
  const str = '123]';
  expect(reverseString(str)).toBe(']321');
});

test('number to array', () => {
  expect(number2Array(1234)).toEqual([1, 2, 3, 4]);
});

test('obj to array', () => {
  expect(obj2Array({ first: 1, second: 2 })).toEqual([
    ['first', 1],
    ['second', 2],
  ]);
});

test('max n elements of array', () => {
  expect(maxElementsOfArray([1, 2, 3], 2)).toEqual([3, 2]);
});

test('min n elements of array', () => {
  expect(minElementsOfArray([3, 4, 2, 1], 2)).toEqual([1, 2]);
});

test('sum', () => {
  expect(sum(1, 2, 3)).toBe(6);
});
