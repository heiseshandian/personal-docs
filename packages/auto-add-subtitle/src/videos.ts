import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { writeFile } from './utils';
import os from 'os';

function getFileSize(filePath: string) {
  const stats = fs.statSync(path.resolve(filePath));
  return stats.size;
}

const sizeMap: Record<string, number> = {
  k: 2 ** 10,
  m: 2 ** 20,
  default: 1,
};

const sizeReg = /^(\d+)([km]?)$/i;
function parseSize(size: string = '') {
  const match = size.match(sizeReg);
  if (!match) {
    return 0;
  }
  const [, num, unit] = match;
  return parseInt(num, 10) * (sizeMap[unit] || sizeMap.default);
}

const durationInfoReg = /duration:\s*(\d{1,2}:\d{1,2}:\d{1,2}\.\d{2})/i;
function getDuration(videoPath: string) {
  return new Promise(resolve => {
    exec(`ffmpeg -i ${JSON.stringify(videoPath)}`, (_, __, stderr) => {
      const match = (stderr || '').match(durationInfoReg);
      resolve(match && match[1]);
    });
  });
}

const durationReg = /(\d{1,2}):(\d{1,2}):(\d{1,2})\.(\d{2})/;
function parseDuration(duration: string = '') {
  const match = duration.match(durationReg);
  if (!match) {
    return 0;
  }

  const [, hours, minutes, seconds, milliseconds] = match;
  return Math.ceil(
    [hours, minutes, seconds, milliseconds]
      .map(val => parseInt(val, 10))
      .reduce((acc, cur, i) => acc + cur * 60 ** (2 - i), 0),
  );
}

export async function sliceVideo(videoPath: string, maxSize: string) {
  const duration = await getDuration(videoPath);
  const chunks = Math.ceil(getFileSize(videoPath) / parseSize(maxSize));

  if (chunks <= 1 || !duration) {
    return Promise.resolve(true);
  }

  const chunkDuration = parseDuration(duration as string) / chunks;

  const { ext, name, dir } = path.parse(videoPath);

  return new Promise((resolve, reject) => {
    const cmd = new Array(chunks)
      .fill(0)
      .map(
        (_, i) =>
          `ffmpeg -y -i ${JSON.stringify(videoPath)} -ss ${
            i * chunkDuration
          } -t ${chunkDuration} ${JSON.stringify(
            path.resolve(dir, `${name}_chunks_${i}${ext}`),
          )}`,
      )
      .join(' & ');

    exec(cmd, err => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

// https://trac.ffmpeg.org/wiki/Concatenate
export async function concatVideos(videos: Array<string>, output: string) {
  const tmpFilePath = await prepareTmpFiles(videos);

  return new Promise((resolve, reject) => {
    exec(
      `ffmpeg -y -f concat -safe 0 -i ${JSON.stringify(
        tmpFilePath,
      )} -c copy ${output}`,
      err => {
        fs.unlink(tmpFilePath, () => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      },
    );
  });
}

async function prepareTmpFiles(videos: Array<string>) {
  if (videos.length <= 0) {
    throw new Error('videos is empty');
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
            .replace(/\"/g, "'")
            .replace(/\\\\/g, '/')}`,
      )
      .join(os.EOL),
  ).catch(err => {
    throw new Error(err);
  });

  return tmpFilePath;
}
