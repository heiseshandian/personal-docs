export * from './medias';
export * from './subtitles';
export * from './contract';

export function merge<T, K>(dest: T, src: K): T {
  return {
    ...dest,
    ...src,
  };
}
