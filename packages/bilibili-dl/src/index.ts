import {
  ConcurrentTasks,
  download,
  toValidFilePath,
  writeFile,
} from 'zgq-shared';
import { BilibiliParser, XbeibeixParser } from './parsers';
import path from 'path';

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
        await this.downloadSingleUrl();
      }
    } else {
      await this.downloadSingleUrl();
    }
  }

  private async downloadSingleUrl() {
    await Promise.all([this.downloadSingleVideo(), this.downloadSingleSrt()]);
  }

  private async downloadSingleVideo() {
    const { url } = this;

    const title = await BilibiliParser.parsePageTitle(url);
    const [videoUrl] = await XbeibeixParser.parse(url);

    await download(
      videoUrl,
      this.getDestPath(title || url, parseExt(videoUrl)),
    );
  }

  private async downloadSingleSrt() {
    const { url } = this;
    const title = await BilibiliParser.parsePageTitle(url);
    const subtitle = await BilibiliParser.parseSrt(url);
    if (subtitle) {
      await writeFile(this.getDestPath(title || url, '.srt'), subtitle);
    }
  }

  private async downloadSeries(series: Series) {
    await Promise.all([
      this.downloadSeriesVideo(series),
      this.downloadSeriesSrt(series),
    ]);
  }

  private async downloadSeriesVideo(series: Series) {
    const titles = series.map(i => i.title);
    const realVideoUrls = await XbeibeixParser.parse(series.map(i => i.href));

    await new ConcurrentTasks(
      realVideoUrls.map((url, i) => async () => {
        await download(url, this.getDestPath(titles[i], parseExt(url)));
      }),
    ).run();
  }

  private async downloadSeriesSrt(series: Series) {
    await new ConcurrentTasks(
      series.map(({ href, title }) => async () => {
        const subtitle = await BilibiliParser.parseSrt(href);
        if (subtitle) {
          await writeFile(this.getDestPath(title, '.srt'), subtitle);
        }
      }),
    ).run();
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
