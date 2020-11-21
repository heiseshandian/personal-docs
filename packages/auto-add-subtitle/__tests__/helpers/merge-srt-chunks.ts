import SubtitleParser, { CHUNK_FILE_SUFFIX, sliceSrtFile } from '../../src';
import path from 'path';
import { readFile, writeFile } from 'zgq-shared';

export class MergeSrtChunksHelper {
  private static readonly srtFiles = ['a.srt', 'b.srt'];

  private tmpPath: string;

  private subtitleParser: SubtitleParser;

  constructor(tmpPath: string) {
    this.tmpPath = tmpPath;
    this.subtitleParser = new SubtitleParser(tmpPath, { chunkSeconds: 10 });
  }

  public async mergeSrtChunks() {
    await this.preMergeSrtChunks();
    await this.subtitleParser['mergeSrtChunks']();
  }

  private async preMergeSrtChunks() {
    await this.subtitleParser['prepareTmpDir']();
    await this.prepareSrtChunks();
  }

  private async prepareSrtChunks() {
    const { srtFiles } = MergeSrtChunksHelper;
    const { tmpPath } = this;

    const [aChunks, bChunks] = await Promise.all(
      srtFiles.map(file => sliceSrtFile(path.resolve(tmpPath, file), 6 * 60)),
    );

    await Promise.all(
      this.writeChunks(aChunks, 'a').concat(this.writeChunks(bChunks, 'b')),
    );
  }

  private writeChunks(chunks: string[][], prefix: string) {
    const { tmpPath, subtitleParser } = this;

    return chunks.map((chunk, i) =>
      writeFile(
        path.resolve(
          tmpPath,
          subtitleParser['TMP_DIR'],
          `${prefix}${CHUNK_FILE_SUFFIX}${i}.srt`,
        ),
        chunk.join('\n'),
      ),
    );
  }

  public async expectMergedEqualsOriginal() {
    const [originalA, originalB] = await this.getOriginal();
    const [mergedA, mergedB] = await this.getMerged();

    expect(mergedA).toEqual(originalA);
    expect(mergedB).toEqual(originalB);
  }

  private async getOriginal() {
    const { srtFiles } = MergeSrtChunksHelper;
    const { tmpPath } = this;

    return await Promise.all(
      srtFiles.map(file =>
        readFile(path.resolve(tmpPath, file), { encoding: 'utf-8' }),
      ),
    );
  }

  private async getMerged() {
    const { srtFiles } = MergeSrtChunksHelper;
    const { tmpPath, subtitleParser } = this;

    return await Promise.all(
      srtFiles.map(file =>
        readFile(path.resolve(tmpPath, subtitleParser['TMP_DIR'], file), {
          encoding: 'utf-8',
        }),
      ),
    );
  }
}
