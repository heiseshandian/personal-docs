import { isPromise } from './base';

export function log(...args: any) {
  return () => console.log(...args);
}

export function logWrapper(
  before: (...args: any) => void,
  after?: (...args: any) => void,
) {
  return function (_: any, __: any, descriptor: TypedPropertyDescriptor<any>) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...rest: any) {
      before.call(this, ...rest);
      const result = originalMethod.call(this, ...rest);
      if (!after) {
        return result;
      }

      if (isPromise(result)) {
        result.then((data: any) => {
          after?.call(this, ...rest);
          return data;
        });
      } else {
        after?.call(this, ...rest);
      }
      return result;
    };
    return descriptor;
  };
}
