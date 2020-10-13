export const number2Array = (num: number) =>
  String(num)
    .split('')
    .map(n => parseInt(n, 10));
