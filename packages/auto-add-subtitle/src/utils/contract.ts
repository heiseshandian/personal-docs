export const CHUNK_FILE_SUFFIX = '_chunks_';
export const INDEX_OF_FIRST_CHUNK = 0;

// 小于此时间的文件veed无法正常解析字幕（还不够一句话~）
export const MINIMAL_CHUNK_SECONDS = 6;

const chunkFilePattern = new RegExp(`${CHUNK_FILE_SUFFIX}(\\d+)`);

export function isChunkFile(file: string) {
  return chunkFilePattern.test(file);
}

export function extractChunkNo(file: string) {
  const [, chunkNo] = file.match(chunkFilePattern) || [file];
  return Number(chunkNo);
}
