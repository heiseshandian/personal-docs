import fs from 'fs';
import path from 'path';
import {
  clean,
  ConcurrentTasks,
  del,
  ensurePathExists,
  makeMap,
  move,
  readdir,
  writeFile,
} from 'zgq-shared';
import { isSubtitleFile, Veed } from './parsers';
import {
  CHUNK_FILE_SUFFIX,
  extractAudio,
  extractChunkNo,
  fixEndTime,
  isChunkFile,
  isSupportedAudio,
  mergeSrtFiles,
  sliceMediaBySeconds,
  getDuration,
  INDEX_OF_FIRST_CHUNK,
  merge,
} from './utils';

export * from './parsers';
export * from './utils';

export function isFile(file: string) {
  return /\.\w+/.test(file);
}

interface SubtitleParserOptions {
  debug: boolean;
  timeout?: number;
  chunkSeconds: number;
  keepTmpFiles: boolean;
  autoRetry: boolean;
  [key: string]: any;
}

export default class SubtitleParser {
  private readonly TMP_DIR = 'parsed_auto_add_subtitle';

  private videoDir;

  private options: SubtitleParserOptions = {
    keepTmpFiles: false,
    debug: false,
    chunkSeconds: 5 * 60,
    autoRetry: true,
  };

  constructor(videoDir: string, options: Partial<SubtitleParserOptions> = {}) {
    this.videoDir = videoDir;
    this.options = merge(this.options, options);
  }

  public async generateSrtFiles(isRetry?: boolean) {
    if (!isRetry) {
      await this.preParseSubtitle();
    }

    await this.parseSubtitle();
    await this.postParseSubtitle();
  }

  private async preParseSubtitle() {
    await this.prepareTmpDir();
    await this.prepareTmpAudioFiles();
  }

  private async prepareTmpDir() {
    return ensurePathExists(this.getTmpPath());
  }

  private async prepareTmpAudioFiles() {
    await this.extractAudios();
    await this.sliceBigAudios();
    await this.removeRedundantAudios();
  }

  private async extractAudios() {
    const { videoDir } = this;
    const videos = await readdir(videoDir);
    const tmpPath = this.getTmpPath();

    await extractAudio(
      (videos || []).filter(isFile).map(file => path.resolve(videoDir, file)),
      tmpPath,
    );
  }

  private async sliceBigAudios() {
    const {
      options: { chunkSeconds },
    } = this;
    const tmpPath = this.getTmpPath();

    const audios = await readdir(tmpPath);
    await sliceMediaBySeconds(
      (audios || [])
        .filter(isFile)
        .filter(file => !isChunkFile(file))
        .map(file => path.resolve(tmpPath, file)),
      chunkSeconds,
    );
  }

  private async removeRedundantAudios() {
    const redundantAudios = await this.getRedundantAudios();

    await new ConcurrentTasks(
      redundantAudios.map(file => async () =>
        await del(path.resolve(this.getTmpPath(), file)),
      ),
    ).run();
  }

  private async getRedundantAudios() {
    const tmpPath = this.getTmpPath();
    const audios = await readdir(tmpPath);

    const isRedundantAudio = (file: string) =>
      fs.existsSync(path.resolve(tmpPath, this.getFirstChunkFileName(file)));

    return audios.filter(isRedundantAudio);
  }

  private getFirstChunkFileName(file: string) {
    const originalFileReg = /^(.+)\.(\w+)$/;
    const firstChunkFileReplacement = `$1${CHUNK_FILE_SUFFIX}${INDEX_OF_FIRST_CHUNK}.$2`;

    return file.replace(originalFileReg, firstChunkFileReplacement);
  }

  private async parseSubtitle() {
    const tmpPath = this.getTmpPath();
    const files = await readdir(tmpPath);

    const audios = files.filter(isSupportedAudio);
    if (audios.length === 0) {
      return;
    }

    const { ext } = path.parse(audios[0]);
    const hasParsed = makeMap(
      files
        .filter(isSubtitleFile)
        .map(file => file.replace(ext, '').replace(Veed.subtitleExt, '')),
    );

    const {
      options: { debug, timeout },
    } = this;
    await new Veed({ debug, timeout }).parseSubtitle(
      audios
        .filter(file => !hasParsed(file.replace(/\.\w+$/, '')))
        .map(file => path.resolve(tmpPath, file)),
    );
  }

  private async postParseSubtitle() {
    if (await this.shouldRetry()) {
      this.generateSrtFiles(true);
    }

    await this.fixEndTimeOfChunks();
    await this.mergeSrtChunks();
    await this.moveSrtFiles();

    if (!this.options.keepTmpFiles) {
      await this.removeTmpDir();
    }
  }

  private async shouldRetry() {
    const parsed = await this.isAllParsed();
    return !parsed && this.options.autoRetry;
  }

  private async isAllParsed() {
    const files = await readdir(this.getTmpPath());

    return (
      files.filter(isSubtitleFile).length ===
      files.filter(isSupportedAudio).length
    );
  }

  // 音频切割过程中若结尾处存在音频空白则直接拼接字幕会导致后面的字幕提前出现（末尾的空白时间被跳过了）
  // 此处手动修复下字幕文件的结束时间，使得字幕的结束时间与音频的结束时间保持同步
  private async fixEndTimeOfChunks() {
    const tmpPath = this.getTmpPath();
    const files = await readdir(tmpPath);
    if (!files) {
      return;
    }
    const chunks = files.filter(isChunkFile);
    if (chunks.length === 0) {
      return;
    }

    const audios = chunks.filter(isSupportedAudio);
    // 临时文件中的所有音频都是我们抽取出来的，我们可以认为所有音频文件都拥有相同的扩展名
    const { ext } = path.parse(audios[0]);

    await new ConcurrentTasks(
      files
        .filter(isSubtitleFile)
        .map(file => path.resolve(tmpPath, file))
        .map(file => async () => {
          const duration = await getDuration(file.replace(/\.\w+$/, ext));
          if (!duration) {
            return;
          }

          const fixed = await fixEndTime(file, duration);
          await writeFile(file, fixed);
        }),
    ).run();
  }

  private async mergeSrtChunks() {
    const { videoDir, TMP_DIR } = this;
    const files = await readdir(this.getTmpPath());
    if (!files) {
      return;
    }

    const groups = SubtitleParser.groupAndSortChunkSrtFiles(
      files
        .filter(file => isChunkFile(file) && isSubtitleFile(file))
        .map(file => path.resolve(videoDir, `${TMP_DIR}/${file}`)),
    );

    const result = await Promise.all(
      Object.keys(groups).map(key => mergeSrtFiles(groups[key])),
    );

    await Promise.all(
      Object.keys(groups).map((key, i) =>
        writeFile(
          path.resolve(videoDir, `${TMP_DIR}/${key}${Veed.subtitleExt}`),
          result[i],
        ),
      ),
    );
  }

  private static groupAndSortChunkSrtFiles(subtitles: string[]) {
    const subtitleReg = new RegExp(
      `([^\\${path.sep}]+)${CHUNK_FILE_SUFFIX}(\\d+).*\\${Veed.subtitleExt}$`,
    );

    const groups = subtitles.reduce((acc, cur) => {
      const [, originalFileName] = cur.match(subtitleReg) || [cur];
      if (!acc[originalFileName]) {
        acc[originalFileName] = [cur];
      } else {
        acc[originalFileName].push(cur);
      }
      return acc;
    }, {} as Record<string, string[]>);

    Object.keys(groups).forEach(key =>
      groups[key].sort((a, b) => extractChunkNo(a) - extractChunkNo(b)),
    );

    return groups;
  }

  private async moveSrtFiles() {
    const { videoDir } = this;
    const tmpPath = this.getTmpPath();

    const files = await readdir(tmpPath);
    await Promise.all(
      files
        .filter(file => !isChunkFile(file) && isSubtitleFile(file))
        .map(file => path.resolve(tmpPath, file))
        .map(file => move(file, path.resolve(videoDir, path.parse(file).base))),
    );
  }

  private async removeTmpDir() {
    await clean(this.getTmpPath());
  }

  private getTmpPath() {
    const { videoDir, TMP_DIR } = this;
    return path.resolve(videoDir, TMP_DIR);
  }
}
