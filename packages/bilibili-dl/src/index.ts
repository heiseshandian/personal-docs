import { ConcurrentTasks, download, toValidFilePath } from 'zgq-shared';
import { BilibiliParser, XbeibeixParser } from './parsers';
import path from 'path';

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
    const { url, dest } = this;

    const title = await BilibiliParser.parsePageTitle(url);
    const [videoUrl] = await XbeibeixParser.parse(url);

    await download(
      videoUrl,
      path.resolve(
        dest,
        toValidFilePath((title || url).replace(/\//g, '-')) +
          parseExt(videoUrl),
      ),
    );
  }

  private async downloadSeries(series: Array<{ href: string; title: string }>) {
    const { dest } = this;

    const titles = series.map(i => i.title);
    const realVideoUrls = await XbeibeixParser.parse(series.map(i => i.href));

    await new ConcurrentTasks(
      realVideoUrls.map((url, i) => async () => {
        await download(
          url,
          path.resolve(
            dest,
            toValidFilePath(titles[i].replace(/\//g, '-')) + parseExt(url),
          ),
        );
      }),
    ).run();
  }
}

const urlReg = /(\.\w+)\?/;
function parseExt(url: string) {
  const match = url.match(urlReg);
  return (match && match[1]) || '.mp4';
}
