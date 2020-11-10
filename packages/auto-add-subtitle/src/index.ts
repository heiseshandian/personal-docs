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
} from './utils';

export * from './parsers';
export * from './utils';

export function isFile(file: string) {
  return /\.\w+/.test(file);
}

interface AutoAddSubtitleOptions {
  debug: boolean;
  chunkSeconds: number;
  keepTmpFiles: boolean;
  [key: string]: any;
}

export default class AutoAddSubtitle {
  private readonly TMP_DIR = 'parsed_auto_add_subtitle';

  private videoDir;

  private options: AutoAddSubtitleOptions = {
    keepTmpFiles: false,
    debug: false,
    chunkSeconds: 5 * 60,
  };

  constructor(videoDir: string, options: Partial<AutoAddSubtitleOptions> = {}) {
    this.videoDir = videoDir;

    Object.keys(options).forEach(key => {
      this.options[key] = options[key];
    });
  }

  private getTmpPath() {
    const { videoDir, TMP_DIR } = this;
    return path.resolve(videoDir, TMP_DIR);
  }

  private async prepareTmpDir() {
    return ensurePathExists(this.getTmpPath());
  }

  private async removeTmpDir() {
    await clean(this.getTmpPath());
  }

  private async removeRedundantAudios() {
    const tmpPath = this.getTmpPath();
    const audios = await readdir(tmpPath);

    const withChunks = (file: string) =>
      fs.existsSync(
        path.resolve(
          tmpPath,
          file.replace(/^(.+)\.(\w+)$/, `$1${CHUNK_FILE_SUFFIX}0.$2`),
        ),
      );
    await new ConcurrentTasks(
      audios
        .filter(withChunks)
        .map(file => async () => await del(path.resolve(tmpPath, file))),
    ).run();
  }

  private async extractAudioFiles() {
    const {
      videoDir,
      options: { chunkSeconds },
    } = this;
    const videos = await readdir(videoDir);
    const tmpPath = this.getTmpPath();

    await extractAudio(
      (videos || []).filter(isFile).map(file => path.resolve(videoDir, file)),
      tmpPath,
    );

    const audios = await readdir(tmpPath);
    await sliceMediaBySeconds(
      (audios || []).filter(isFile).map(file => path.resolve(tmpPath, file)),
      chunkSeconds,
    );

    await this.removeRedundantAudios();
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
        .map(file =>
          file
            .replace(Veed.subtitlePrefix, '')
            .replace(ext, '')
            .replace(Veed.subtitleExt, ''),
        ),
    );

    const {
      options: { debug },
    } = this;
    await new Veed({ debug }).parseSubtitle(
      audios
        .filter(file => !hasParsed(file.replace(/\.\w+$/, '')))
        .map(file => path.resolve(tmpPath, file)),
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

  private static groupChunkSrtFiles(subtitles: string[]) {
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

  private async mergeSrtChunks() {
    const { videoDir, TMP_DIR } = this;
    const files = await readdir(this.getTmpPath());
    if (!files) {
      return;
    }

    const groups = AutoAddSubtitle.groupChunkSrtFiles(
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

  private async isAllParsed() {
    const files = await readdir(this.getTmpPath());

    return (
      files.filter(isSubtitleFile).length ===
      files.filter(isSupportedAudio).length
    );
  }

  private async preParseSubtitle() {
    await this.prepareTmpDir();
    await this.extractAudioFiles();
  }

  public async generateSrtFiles(isRetry?: boolean) {
    if (!isRetry) {
      await this.preParseSubtitle();
    }

    await this.parseSubtitle();
    await this.postParseSubtitle();
  }

  private async postParseSubtitle() {
    const parsed = await this.isAllParsed();
    if (!parsed) {
      this.generateSrtFiles(true);
      return;
    }

    await this.fixEndTimeOfChunks();
    await this.mergeSrtChunks();
    await this.moveSrtFiles();

    const {
      options: { keepTmpFiles },
    } = this;
    if (keepTmpFiles) {
      return;
    }
    await this.removeTmpDir();
  }
}
