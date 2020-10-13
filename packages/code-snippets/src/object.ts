export const obj2Array = (obj: Record<string, any>) =>
  Object.keys(obj).map(key => [key, obj[key]]);
