import crypto from 'crypto';

export function md5(data: string) {
  return crypto.createHash('md5').update(data).digest('hex');
}

export function callback2Promise<T>(fn: Function) {
  return (...rest: Array<any>): Promise<T> => {
    return new Promise((resolve, reject) => {
      fn(...rest, (err: NodeJS.ErrnoException, ...args: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(
            args.length === 0 ? true : args.length === 1 ? args[0] : args,
          );
        }
      });
    });
  };
}
