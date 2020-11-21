import SubtitleParser from '../../src';
import fse from 'fs-extra';
import path from 'path';
import { readFile } from 'zgq-shared';

export class FixEndTimeOfChunksHelper {
  private tmpPath: string;

  private subtitleParser: SubtitleParser;

  constructor(tmpPath: string) {
    this.tmpPath = tmpPath;
    this.subtitleParser = new SubtitleParser(tmpPath);
  }

  public async fixEndTimeOfChunks() {
    await this.preFixEndTimeOfChunks();
    await this.subtitleParser['fixEndTimeOfChunks']();
  }

  private async preFixEndTimeOfChunks() {
    await this.subtitleParser['prepareTmpDir']();
    await this.copyAudios();
  }

  private async copyAudios() {
    const { tmpPath, subtitleParser } = this;

    await fse.copy(
      path.resolve(__dirname, `./data/audios/`),
      path.resolve(tmpPath, subtitleParser['TMP_DIR']),
    );
  }

  public async expectFixedEqualsResult() {
    const fixed = await this.getFixed();
    const result = await this.getPrePrepared();
    expect(fixed).toEqual(result);
  }

  private async getFixed() {
    const { tmpPath, subtitleParser } = this;

    return await readFile(
      path.resolve(tmpPath, subtitleParser['TMP_DIR'], 'video_chunks_0.srt'),
      { encoding: 'utf-8' },
    );
  }

  private async getPrePrepared() {
    return await readFile(
      path.resolve(__dirname, './data/audios/', 'video_chunks_0.srt.result'),
      {
        encoding: 'utf-8',
      },
    );
  }
}
