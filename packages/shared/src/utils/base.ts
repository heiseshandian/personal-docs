import crypto from 'crypto';

export function md5(data: string) {
  return crypto.createHash('md5').update(data).digest('hex');
}

export function callback2Promise<T>(fn: (...params: Array<any>) => void) {
  return (...rest: Array<any>): Promise<T> => {
    return new Promise(resolve => {
      fn(...rest, (err: NodeJS.ErrnoException, ...args: Array<any>) => {
        if (err) {
          handleError(err);
          resolve();
        } else {
          resolve(
            args.length === 0 ? true : args.length === 1 ? args[0] : args,
          );
        }
      });
    });
  };
}

export function handleError(err: Error) {
  console.error(err);
}

export function makeMap(
  str: string | Array<string | number>,
  expectsLowerCase?: boolean,
): (key: string) => true | void {
  const list: Array<string | number> = Array.isArray(str)
    ? str
    : str.split(',');

  const map = list.reduce((acc, cur) => {
    acc[cur] = true;
    return acc;
  }, Object.create(null));

  return expectsLowerCase ? val => map[val.toLowerCase()] : val => map[val];
}

export function delay(timeout: number) {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), timeout);
  });
}

export const uniq = (arr: Array<any>) => Array.from(new Set(arr));

export function parseJson(obj: any) {
  try {
    return JSON.parse(obj);
  } catch (e) {
    handleError(e);
  }
}

export function isPromise(p: any) {
  return p && typeof p.then === 'function' && typeof p.catch === 'function';
}
