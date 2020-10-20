import { exec } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { handleError } from './base';
import { ConcurrentTasks } from './concurrent-tasks';
import { writeFile } from './fs';

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
function getDuration(videoPath: string) {
  return new Promise<string | null | undefined>(resolve => {
    exec(`ffprobe ${JSON.stringify(videoPath)}`, (err, _, stderr) => {
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
        const outputPath = `${name}_chunks_${i}${ext}`;
        const cmd = `ffmpeg -y -i ${JSON.stringify(mediaPath)} -ss ${
          i * chunkDuration
        } -t ${chunkDuration} -codec copy ${JSON.stringify(
          path.resolve(dir, outputPath),
        )}`;

        return new Promise(resolve => {
          exec(cmd, err => {
            if (err) {
              handleError(err);
              resolve();
            } else {
              resolve(outputPath);
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
  videoPaths: string | Array<string>,
  outputFormat: string,
  outputDir?: string,
) {
  if (typeof videoPaths === 'string') {
    videoPaths = [videoPaths];
  }
  videoPaths = videoPaths.filter(
    videoPath => parseFormat(videoPath) !== outputFormat,
  );

  return await new ConcurrentTasks<string>(
    videoPaths.map(videoPath => () => {
      const { dir, name } = path.parse(videoPath);
      const outputFile = path.resolve(
        outputDir || dir,
        `${name}.${outputFormat.replace(/^\./, '')}`,
      );
      const cmd = `ffmpeg -y -i ${JSON.stringify(videoPath)} ${JSON.stringify(
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

async function prepareTmpFiles(videos: Array<string>) {
  if (videos.length <= 0) {
    handleError(new Error('videos is empty'));
    return;
  }

  const { dir, name } = path.parse(videos[0]);
  const tmpFilePath = path.resolve(dir, `${name}.txt`);

  // https://superuser.com/questions/718027/ffmpeg-concat-doesnt-work-with-absolute-path
  await writeFile(
    tmpFilePath,
    videos
      .map(
        video =>
          `file ${JSON.stringify(video)
            .replace(/"/g, "'")
            .replace(/\\\\/g, '/')}`,
      )
      .join(os.EOL),
  );

  return tmpFilePath;
}
