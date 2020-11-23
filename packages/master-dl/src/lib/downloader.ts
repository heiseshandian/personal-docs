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
  isValidMedia,
} from 'zgq-shared';
import { DownloadOptions, Progress } from '../global';
import { sanitize } from './utils';

// fluent-ffmpeg 依赖于系统环境变量来寻找ffmpeg和ffprobe路径，
// 部分电脑的环境变量设置的与 fluent-ffmpeg 预期的不一致，这里在程序运行期间手动修复下
fixFfmpegEnvs();

interface InnerDownloadOptions {
  destPath: string;
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
    const { destDir, total } = this;

    const filename = sanitize(`${id + 1}. ${title}.${ext}`);
    const destPath = `${destDir}/${filename}`;

    const progressFormat = `[:bar] (${id + 1}/${total}): ${title} (${ext})`;

    const strategies = {
      srt: () => {
        return this.downloadSrt({ url, destPath, progressFormat });
      },
      mp4: () => {
        return this.downloadVideo({ url, destPath, progressFormat, programId });
      },
    };

    return strategies[ext]();
  }

  private async downloadSrt({
    destPath,
    url,
    progressFormat,
  }: InnerDownloadOptions) {
    if (fs.existsSync(destPath)) {
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
    destPath,
    url,
    programId,
    progressFormat,
  }: InnerDownloadOptions) {
    if (fs.existsSync(destPath)) {
      const isValid = await isValidMedia(destPath);
      if (isValid) {
        return;
      } else {
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
}

async function fixSrtFile(filePath: string) {
  const content = await readFile(filePath, { encoding: 'utf-8' });
  await writeFile(filePath, content.replace(/^WEBVTT[\r\n]{2}/, ''));
}
