import { exec } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { ConcurrentTasks, execAsync, handleError, writeFile } from 'zgq-shared';

function getFileSize(filePath: string) {
  const stats = fs.statSync(path.resolve(filePath));
  return stats.size;
}

const sizeMap: Record<string, number> = {
  k: 2 ** 10,
  m: 2 ** 20,
  default: 1,
};

const sizeReg = /^(\d*\.?\d+)([km]?)$/i;
function parseSize(size = '') {
  const match = size.match(sizeReg);
  if (!match) {
    return 0;
  }
  const [, num, unit] = match;
  return parseFloat(num) * (sizeMap[unit] || sizeMap.default);
}

const durationInfoReg = /duration:\s*(\d{1,2}:\d{1,2}:\d{1,2}\.\d{2})/i;
function getDuration(mediaPath: string) {
  return new Promise<string | null | undefined>(resolve => {
    exec(`ffprobe ${JSON.stringify(mediaPath)}`, (err, _, stderr) => {
      if (err) {
        handleError(err);
        resolve();
      } else {
        const match = (stderr || '').match(durationInfoReg);
        resolve(match && match[1]);
      }
    });
  });
}

const durationReg = /(\d{1,2}):(\d{1,2}):(\d{1,2})\.(\d{2})/;
function parseDuration(duration = '') {
  const match = duration.match(durationReg);
  if (!match) {
    return 0;
  }

  const [, hours, minutes, seconds, milliseconds] = match;

  return [hours, minutes, seconds, milliseconds]
    .map(val => parseInt(val, 10))
    .reduce((acc, cur, i) => acc + cur * 60 ** (2 - i), 0);
}

export const CHUNK_FILE_SUFFIX = '_chunks_';

const chunkFileReg = new RegExp(`${CHUNK_FILE_SUFFIX}`);
export function isChunkFile(file: string) {
  return chunkFileReg.test(file);
}

async function sliceMediaByChunks(mediaPath: string, chunks: number) {
  const duration = await getDuration(mediaPath);
  if (!duration) {
    return;
  }

  const chunkDuration = Math.ceil(parseDuration(duration) / chunks);
  const { ext, name, dir } = path.parse(mediaPath);

  return await new ConcurrentTasks<string>(
    Array(chunks)
      .fill(0)
      .map((_, i) => () => {
        const outputFile = path.resolve(
          dir,
          `${name}${CHUNK_FILE_SUFFIX}${i}${ext}`,
        );
        if (fs.existsSync(outputFile)) {
          return Promise.resolve(outputFile);
        }
        const cmd = `ffmpeg -i ${JSON.stringify(mediaPath)} -ss ${
          i * chunkDuration
        } -t ${chunkDuration} -codec copy ${JSON.stringify(outputFile)}`;

        return new Promise(resolve => {
          exec(cmd, err => {
            if (err) {
              handleError(err);
              resolve();
            } else {
              resolve(outputFile);
            }
          });
        });
      }),
  ).run();
}

export async function sliceMediaBySize(
  mediaPaths: string | string[],
  maxSize: string,
) {
  if (typeof mediaPaths === 'string') {
    mediaPaths = [mediaPaths];
  }

  return await new ConcurrentTasks<string[]>(
    mediaPaths.map(mediaPath => async () => {
      const chunks = Math.ceil(getFileSize(mediaPath) / parseSize(maxSize));
      if (chunks <= 1) {
        return;
      }
      return await sliceMediaByChunks(mediaPath, chunks);
    }),
    'slicing',
  ).run();
}

export async function sliceMediaBySeconds(
  mediaPaths: string | string[],
  maxSeconds: number,
) {
  if (typeof mediaPaths === 'string') {
    mediaPaths = [mediaPaths];
  }

  return await new ConcurrentTasks<string[]>(
    mediaPaths.map(mediaPath => async () => {
      const duration = await getDuration(mediaPath);
      if (!duration) {
        return;
      }
      const chunks = Math.ceil(parseDuration(duration) / maxSeconds);
      if (chunks <= 1) {
        return;
      }

      return await sliceMediaByChunks(mediaPath, chunks);
    }),
    'slicing',
  ).run();
}

// https://trac.ffmpeg.org/wiki/Concatenate
export async function concatMedias(medias: Array<string>, output: string) {
  const tmpFilePath = await prepareTmpFiles(medias);
  if (!tmpFilePath) {
    return;
  }

  return await new Promise<string>(resolve => {
    exec(
      `ffmpeg -y -f concat -safe 0 -i ${JSON.stringify(
        tmpFilePath,
      )} -c copy ${output}`,
      err => {
        fs.unlink(tmpFilePath, () => {
          if (err) {
            handleError(err);
            resolve();
          } else {
            resolve(output);
          }
        });
      },
    );
  });
}

const parseFormat = (filePath: string) => path.parse(filePath).ext.slice(1);

export async function changeFormat(
  mediaPaths: string | Array<string>,
  outputFormat: string,
  outputDir?: string,
) {
  if (typeof mediaPaths === 'string') {
    mediaPaths = [mediaPaths];
  }
  mediaPaths = mediaPaths.filter(
    mediaPath => parseFormat(mediaPath) !== outputFormat,
  );

  return await new ConcurrentTasks<string>(
    mediaPaths.map(mediaPath => () => {
      const { dir, name } = path.parse(mediaPath);
      const outputFile = path.resolve(
        outputDir || dir,
        `${name}.${outputFormat.replace(/^\./, '')}`,
      );
      if (fs.existsSync(outputFile)) {
        return Promise.resolve(outputFile);
      }
      const cmd = `ffmpeg -i ${JSON.stringify(mediaPath)} ${JSON.stringify(
        outputFile,
      )}`;

      return new Promise(resolve => {
        exec(cmd, err => {
          if (err) {
            handleError(err);
            resolve();
          } else {
            resolve(outputFile);
          }
        });
      });
    }),
    'changing format',
  ).run();
}

async function prepareTmpFiles(medias: Array<string>) {
  if (medias.length <= 0) {
    handleError(new Error('medias is empty'));
    return;
  }

  const { dir, name } = path.parse(medias[0]);
  const tmpFilePath = path.resolve(dir, `${name}.txt`);

  // https://superuser.com/questions/718027/ffmpeg-concat-doesnt-work-with-absolute-path
  await writeFile(
    tmpFilePath,
    medias
      .map(
        media =>
          `file ${JSON.stringify(media)
            .replace(/"/g, "'")
            .replace(/\\\\/g, '/')}`,
      )
      .join(os.EOL),
  );

  return tmpFilePath;
}

interface Codec2Ext {
  [key: string]: string;
  vorbis: string;
  opus: string;
  default: string;
}

const codec2Ext: Codec2Ext = {
  vorbis: 'ogg',
  opus: 'opus',
  default: 'aac',
};

const audioReg = new RegExp(`(?:${Object.values(codec2Ext).join('|')})$`, 'i');
export function isSupportedAudio(file: string) {
  return audioReg.test(file);
}

const audioExtReg = /Audio: (\w+),/;
async function getAudioExt(mediaPath: string) {
  const [, stderr] = await execAsync(`ffprobe ${JSON.stringify(mediaPath)}`);
  if (!stderr) {
    return codec2Ext.default;
  }
  const match = stderr.match(audioExtReg);
  const [, codec] = match || ['', 'default'];
  return codec2Ext[codec] || codec2Ext.default;
}

export async function extractAudio(
  mediaPaths: string | Array<string>,
  outputDir?: string,
) {
  if (typeof mediaPaths === 'string') {
    mediaPaths = [mediaPaths];
  }

  return await new ConcurrentTasks<string>(
    mediaPaths.map(mediaPath => async () => {
      const { dir, name } = path.parse(mediaPath);
      const outputFile = path.resolve(
        outputDir || dir,
        `${name}.${await getAudioExt(mediaPath)}`,
      );
      if (fs.existsSync(outputFile)) {
        return outputFile;
      }

      // https://gist.github.com/protrolium/e0dbd4bb0f1a396fcb55
      const result = await execAsync(
        `ffmpeg -i ${JSON.stringify(
          mediaPath,
        )} -vn -acodec copy ${JSON.stringify(outputFile)}`,
      );
      return result !== undefined ? outputFile : result;
    }),
    'extracting audio',
  ).run();
}
