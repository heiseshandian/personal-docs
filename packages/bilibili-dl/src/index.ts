import {
  ConcurrentTasks,
  download,
  toValidFilePath,
  writeFile,
  isValidMedia,
  del,
} from 'zgq-shared';
import { BilibiliParser, XbeibeixParser } from './parsers';
import path from 'path';
import fs from 'fs';

type Series = Array<{ href: string; title: string }>;

export class BilibiliDl {
  private url: string;

  private dest: string;

  private isDownloadSeries: boolean | undefined;

  constructor(url: string, dest: string, series?: boolean) {
    this.url = url;
    this.dest = dest;
    this.isDownloadSeries = series;
  }

  public async download() {
    const { url, isDownloadSeries } = this;

    if (isDownloadSeries) {
      const series = await BilibiliParser.parseSeries(url);

      if (series) {
        await this.downloadSeries(series);
      } else {
        await this.downloadUrl();
      }
    } else {
      await this.downloadUrl();
    }
  }

  private async downloadUrl() {
    const { url } = this;

    const title = (await BilibiliParser.parsePageTitle(url)) || url;
    const [videoUrl] = await XbeibeixParser.parse(url);

    await Promise.all([
      this.downloadVideo(videoUrl, this.getDestPath(title, parseExt(videoUrl))),
      this.downloadSrt(title, this.url),
    ]);
  }

  private async downloadSeries(series: Series) {
    const videoUrls = await XbeibeixParser.parse(series.map(i => i.href));

    await new ConcurrentTasks(
      videoUrls.map((videoUrl, i) => async () => {
        const { title, href } = series[i];

        await Promise.all([
          this.downloadVideo(videoUrl, this.getDestPath(title, parseExt(videoUrl))),
          this.downloadSrt(title, href),
        ]);
      }),
    ).run();
  }

  private async downloadVideo(url: string, destPath: string) {
    if (fs.existsSync(destPath)) {
      const isValid = await isValidMedia(destPath);
      if (isValid) {
        return;
      } else {
        await del(destPath);
      }
    }

    await download(url, destPath);
  }

  private async downloadSrt(title: string, url: string) {
    const destPath = this.getDestPath(title, '.srt');
    if (fs.existsSync(destPath)) {
      return;
    }

    const subtitle = await BilibiliParser.parseSrt(url);
    if (subtitle) {
      await writeFile(destPath, subtitle);
    }
  }

  private getDestPath(title: string, ext: string) {
    const { dest } = this;
    return path.resolve(dest, toValidFilePath(title.replace(/\//g, '-')) + ext);
  }
}

const URL_REG = /(\.\w+)\?/;
function parseExt(url: string) {
  const match = url.match(URL_REG);
  return (match && match[1]) || '.mp4';
}
