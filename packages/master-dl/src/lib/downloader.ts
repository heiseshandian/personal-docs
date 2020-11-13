import fetch from 'node-fetch';
import progress from 'progress';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import os from 'os';
import path from 'path';

import { sanitize } from './utils';
import { handleError } from 'zgq-shared';
import { Progress } from '../global';

let total: number;
let dir: string;

export function setDir(_dir: string) {
  dir = _dir;
}

export function setTotal(_total: number) {
  total = _total;
}

export async function download(
  url: string,
  id: number,
  title: string,
  ext: string,
  programId?: string,
) {
  const filename = sanitize(`${id + 1}. ${title}.${ext}`);
  const destPath = `${dir}/${filename}`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  if (fs.existsSync(destPath)) {
    console.log('File already exists, skips');
    return;
  }

  const progressLine = `[:bar] (${id + 1}/${total}): ${title} (${ext})`;

  if (ext == 'srt') {
    const bar = new progress(progressLine, { width: 30, total: 100 });
    const data = await fetch(url);
    const { body } = data;

    bar.total = Number(data.headers.get('content-length'));

    body.pipe(fs.createWriteStream(destPath));
    body.on('data', chunk => bar.tick(chunk.length));

    return new Promise(resolve => body.on('end', resolve));
  } else if (ext == 'mp4') {
    const bar = new progress(progressLine, { width: 30, total: 100 });

    const update = (prog: Progress) => bar.tick(prog.percent - bar.curr);

    const run = ffmpeg(url)
      .outputOptions([`-map p:${programId}`, '-c copy'])
      .on('progress', update)
      .on('error', handleError)
      .save(destPath);

    return new Promise(resolve => run.on('end', resolve));
  }
}

fixEnvs();

// 部分电脑上的环境变量设置不对，这里手动修复下
function fixEnvs() {
  if (!isWindows()) {
    return;
  }

  const { FFMPEG_PATH, FFPROBE_PATH } = process.env;
  if (FFMPEG_PATH && !FFMPEG_PATH.endsWith('exe')) {
    process.env.FFMPEG_PATH = path.resolve(FFMPEG_PATH, 'ffmpeg.exe');
  }
  if (FFPROBE_PATH && !FFPROBE_PATH.endsWith('exe')) {
    process.env.FFPROBE_PATH = path.resolve(FFPROBE_PATH, 'ffprobe.exe');
  }
}

function isWindows() {
  return os.platform() === 'win32';
}
