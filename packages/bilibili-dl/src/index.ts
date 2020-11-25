import filenamify from 'filenamify';
import fs from 'fs';
import path from 'path';
import { ConcurrentTasks, del, download, isValidMedia, writeFile } from 'zgq-shared';
import { BilibiliParser, XbeibeixParser } from './parsers';

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
      this.downloadSrts([{ title, href: url }]),
    ]);
  }

  private async downloadSeries(series: Series) {
    await this.downloadSrts(series);
    await this.downloadVideos(series);
  }

  private async downloadVideos(series: Series) {
    const videoUrls = await XbeibeixParser.parse(series.map(i => i.href));
    await new ConcurrentTasks(
      videoUrls.map((videoUrl, i) => async () => {
        const { title } = series[i];
        this.downloadVideo(videoUrl, this.getDestPath(title, parseExt(videoUrl)));
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

  private async downloadSrts(series: Series) {
    const unDownloadedSrts = this.getUnDownloadedSrts(series);

    await new ConcurrentTasks(
      unDownloadedSrts.map(({ title, href }) => async () => {
        const destPath = this.getDestPath(title, '.srt');
        const subtitle = await BilibiliParser.parseSrt(href);

        if (subtitle) {
          await writeFile(destPath, subtitle);
        }
      }),
    ).run(1);
  }

  private getUnDownloadedSrts(series: Series) {
    return series.filter(({ title }) => {
      const destPath = this.getDestPath(title, '.srt');
      return !fs.existsSync(destPath);
    });
  }

  private getDestPath(title: string, ext: string) {
    const { dest } = this;
    return path.resolve(dest, filenamify(title) + ext);
  }
}

const URL_REG = /(\.\w+)\?/;
function parseExt(url: string) {
  const match = url.match(URL_REG);
  return (match && match[1]) || '.mp4';
}
