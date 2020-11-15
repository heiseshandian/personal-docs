export * from './medias';
export * from './subtitles';
export * from './contract';
export * from './time';

export function mergeOptions(
  dest: Record<string, any>,
  src: Record<string, any>,
) {
  Object.keys(src).forEach(key => {
    if (src[key] !== undefined) {
      dest[key] = src[key];
    }
  });
}
