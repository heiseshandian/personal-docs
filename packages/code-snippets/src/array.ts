export const maxElementsOfArray = (arr: Array<number>, num = 1) =>
  arr.sort((a, b) => b - a).slice(0, num);

export const minElementsOfArray = (arr: Array<number>, num = 1) =>
  arr.sort((a, b) => a - b).slice(0, num);

export const sum = (...nums: Array<number>) =>
  nums.reduce((acc, cur) => acc + cur, 0);

export const uniq = (arr: Array<any>) => Array.from(new Set(arr));
