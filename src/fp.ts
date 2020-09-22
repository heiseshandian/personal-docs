export const pipe = (...args: Array<Function>) => (x: any) => args.reduce((acc, fn) => fn(acc), x);

export const compose = (...args: Array<Function>) => (x: any) =>
  args.reduceRight((acc, fn) => fn(acc), x);

export const curry = (fn: Function) =>
  eval(
    new Array(fn.length).fill(0).reduce((acc, _, i) => acc + `x${i}=>`, "") +
      `fn(${new Array(fn.length).fill(0).reduce((acc, _, i) => acc + `x${i},`, "")})`
  );
