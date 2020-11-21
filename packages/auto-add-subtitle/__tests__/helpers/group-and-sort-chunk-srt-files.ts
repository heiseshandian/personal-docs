import { CHUNK_FILE_SUFFIX, Veed } from '../../src';
import { randomSort } from './base';

export function generateRandomSrtFiles() {
  return generateSrtFiles(20, 'video with space')
    .concat(generateSrtFiles(20, 'video1'))
    .sort(randomSort);
}

export function getGroupedSrtFiles() {
  return {
    'video with space': generateSrtFiles(20, 'video with space'),
    video1: generateSrtFiles(20, 'video1'),
  };
}

function generateChunkFiles(count: number, prefix: string, suffix = '') {
  return new Array(count)
    .fill(0)
    .map((_, i) => `${prefix}${CHUNK_FILE_SUFFIX}${i}.ogg${suffix}`);
}

const generateSrtFiles = (count: number, prefix: string) =>
  generateChunkFiles(count, prefix, Veed.subtitleExt);
