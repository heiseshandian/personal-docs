import { ConcurrentTasks, readdir } from 'zgq-shared';
import { Course } from '../global';
import { Downloader } from './downloader';

type SubDownloadList = Pick<
  Course,
  'pos' | 'title' | 'streamingURL' | 'transcriptURL'
>[];

export class DownloadRunner {
  private dir: string;

  private downloadList: SubDownloadList;

  private quality: string;

  constructor(dir: string, downloadList: SubDownloadList, quality: string) {
    this.dir = dir;
    this.downloadList = downloadList;
    this.quality = quality;

    this.downloader = new Downloader(dir, downloadList.length);
  }

  private downloader: Downloader;

  public async run() {
    const { downloader, downloadList, quality } = this;

    await new ConcurrentTasks(
      downloadList.map(
        ({ streamingURL, transcriptURL, pos: id, title }) => async () => {
          await Promise.all([
            downloader.download({
              url: transcriptURL,
              id,
              title,
              ext: 'srt',
            }),
            downloader.download({
              url: streamingURL,
              id,
              title,
              ext: 'mp4',
              programId: quality,
            }),
          ]);
        },
      ),
    ).run();

    await this.postDownload();
  }

  private async postDownload() {
    const isAllDownloaded = await this.isAllDownloaded();
    if (!isAllDownloaded) {
      await this.run();
    }
  }

  private async isAllDownloaded() {
    const { dir, downloadList } = this;

    const files = await readdir(dir);
    const count = downloadList.reduce((acc, { transcriptURL }) => {
      acc += transcriptURL ? 2 : 1;
      return acc;
    }, 0);

    return files.length === count;
  }
}
