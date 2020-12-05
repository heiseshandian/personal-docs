import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import fetch from 'node-fetch';
import progress from 'progress';
import {
  del,
  ensurePathExists,
  fixFfmpegEnvs,
  handleError,
  readFile,
  writeFile,
  ffprobe,
  FfprobeError,
  FfprobeData,
} from 'zgq-shared';
import { DownloadOptions, Progress } from '../global';
import { sanitize } from './utils';

// fluent-ffmpeg 依赖于系统环境变量来寻找ffmpeg和ffprobe路径，
// 部分电脑的环境变量设置的与 fluent-ffmpeg 预期的不一致，这里在程序运行期间手动修复下
fixFfmpegEnvs();

interface InnerDownloadOptions {
  filename: string;
  url: string;
  progressFormat: string;
  programId?: string;
}

export class Downloader {
  private destDir: string;

  private total: number;

  constructor(destDir: string, total: number) {
    ensurePathExists(destDir);
    this.destDir = destDir;
    this.total = total;
  }

  public async download({ url, id, title, ext, programId }: DownloadOptions) {
    if (!url) {
      return;
    }
    const { total } = this;

    const filename = sanitize(`${id + 1}. ${title}.${ext}`);

    const progressFormat = `[:bar] (${id + 1}/${total}): ${title} (${ext})`;

    const strategies = {
      srt: () => {
        return this.downloadSrt({ url, filename, progressFormat });
      },
      mp4: () => {
        return this.downloadVideo({ url, filename, progressFormat, programId });
      },
    };

    return strategies[ext]();
  }

  private async downloadSrt({
    filename,
    url,
    progressFormat,
  }: InnerDownloadOptions) {
    const destPath = this.getDestPath(filename);

    if (fs.existsSync(destPath)) {
      console.log(`${filename} 已存在，跳过~`);
      return;
    }

    const data = await fetch(url);
    const { body } = data;
    body.pipe(fs.createWriteStream(destPath));

    const bar = new progress(progressFormat, {
      width: 30,
      total: Number(data.headers.get('content-length')),
    });
    body.on('data', chunk => bar.tick(chunk.length));

    return new Promise(resolve =>
      body.on('end', () => fixSrtFile(destPath).then(resolve)),
    );
  }

  private async downloadVideo({
    filename,
    url,
    programId,
    progressFormat,
  }: InnerDownloadOptions) {
    const destPath = this.getDestPath(filename);

    if (fs.existsSync(destPath)) {
      console.log(`${filename} 已存在，检测完整性中。。。`);
      const integrity = await checkIntegrity(destPath, url);
      if (integrity) {
        console.log(`${filename} 存在且完整，跳过~`);
        return;
      } else {
        console.log(`${filename} 不完整，删除重新下载~`);
        await del(destPath);
      }
    }

    const run = ffmpeg(url)
      .outputOptions([`-map p:${programId}`, '-c copy'])
      .on('error', handleError)
      .save(destPath);

    const bar = new progress(progressFormat, { width: 30, total: 100 });
    run.on('progress', (prog: Progress) => bar.tick(prog.percent - bar.curr));

    return new Promise(resolve => run.on('end', resolve));
  }

  private getDestPath(filename: string) {
    const { destDir } = this;
    return `${destDir}/${filename}`;
  }
}

async function fixSrtFile(filePath: string) {
  const content = await readFile(filePath, { encoding: 'utf-8' });
  await writeFile(filePath, content.replace(/^WEBVTT[\r\n]{2}/, ''));
}

async function checkIntegrity(filePath: string, url: string) {
  const [fileFfprobeData, urlFfprobeData] = await Promise.all([
    ffprobe(filePath),
    ffprobe(url),
  ]);
  if (!fileFfprobeData || !urlFfprobeData) {
    return;
  }
  if (
    (fileFfprobeData as FfprobeError).error ||
    (urlFfprobeData as FfprobeError).error
  ) {
    return;
  }

  const fileDuration = getDuration(fileFfprobeData as FfprobeData);
  const urlDuration = getDuration(urlFfprobeData as FfprobeData);

  return duration2Seconds(fileDuration) >= duration2Seconds(urlDuration);
}

function getDuration(ffprobeData: FfprobeData) {
  const {
    format: { duration },
  } = ffprobeData;

  return duration;
}

function duration2Seconds(duration: string) {
  return Math.floor(Number(duration));
}
