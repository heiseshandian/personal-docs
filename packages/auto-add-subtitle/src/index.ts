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
  isChunkFile,
  isSupportedAudio,
  mergeSrtFiles,
  sliceMediaBySeconds,
} from './utils';

export * from './utils';
export * from './parsers';

export function isFile(file: string) {
  return /\.\w+/.test(file);
}

function toAbsolutePath(dir: string, file: string) {
  return path.resolve(dir, file);
}

export default class AutoAddSubtitle {
  private readonly TMP_DIR = 'parsed_auto_add_subtitle';

  private videoDir;

  private chunkSeconds;

  constructor(videoDir: string, chunkSeconds: number = 6 * 60) {
    this.videoDir = videoDir;
    this.chunkSeconds = chunkSeconds;
  }

  private async prepareTmpDir() {
    const { videoDir, TMP_DIR } = this;
    return ensurePathExists(path.resolve(videoDir, TMP_DIR));
  }

  private async removeTmpDir() {
    const { videoDir, TMP_DIR } = this;
    await clean(path.resolve(videoDir, TMP_DIR));
  }

  private async removeRedundantAudios() {
    const { videoDir, TMP_DIR } = this;
    const tmpPath = path.resolve(videoDir, TMP_DIR);
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
        .map(file => async () => await del(toAbsolutePath(tmpPath, file))),
    ).run();
  }

  private async extractAudioFiles() {
    const { videoDir, TMP_DIR, chunkSeconds } = this;
    const videos = await readdir(videoDir);
    const tmpPath = path.resolve(videoDir, TMP_DIR);

    await extractAudio(
      (videos || []).filter(isFile).map(file => toAbsolutePath(videoDir, file)),
      tmpPath,
    );

    const audios = await readdir(tmpPath);
    await sliceMediaBySeconds(
      (audios || []).filter(isFile).map(file => toAbsolutePath(tmpPath, file)),
      chunkSeconds,
    );

    await this.removeRedundantAudios();
  }

  private async parseSubtitle() {
    const { videoDir, TMP_DIR } = this;

    const tmpPath = path.resolve(videoDir, TMP_DIR);
    const files = await readdir(tmpPath);

    const audios = files.filter(isSupportedAudio);
    if (audios.length === 0) {
      return;
    }

    const { ext } = path.parse(audios[0]);
    const hasParsed = makeMap(
      files
        .filter(isSubtitleFile)
        .map(file => file.replace(Veed.subtitlePrefix, '').replace(ext, '')),
    );

    await Veed.parseSubtitle(
      audios
        .filter(file => !hasParsed(file))
        .map(file => path.resolve(tmpPath, file)),
    );
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
    const files = await readdir(path.resolve(videoDir, TMP_DIR));
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
    const { videoDir, TMP_DIR } = this;
    const tmpPath = path.resolve(videoDir, TMP_DIR);

    const files = await readdir(tmpPath);
    await Promise.all(
      files
        .filter(file => !isChunkFile(file) && isSubtitleFile(file))
        .map(file => path.resolve(tmpPath, file))
        .map(file => move(file, path.resolve(videoDir, path.parse(file).base))),
    );
  }

  public async generateSrtFiles() {
    await this.prepareTmpDir();
    await this.extractAudioFiles();

    await this.parseSubtitle();
    await this.mergeSrtChunks();
    await this.moveSrtFiles();

    await this.removeTmpDir();
  }
}
