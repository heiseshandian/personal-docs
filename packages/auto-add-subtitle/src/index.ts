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

  private async mergeSrtChunks() {
    const { videoDir, TMP_DIR } = this;
    const files = await readdir(path.resolve(videoDir, TMP_DIR));
    if (!files) {
      return;
    }

    const subtitleReg = new RegExp(
      `(.+)${CHUNK_FILE_SUFFIX}(\\d+)[^.]*\\${Veed.subtitleExt}$`,
    );
    const chunkFilesGroup = files
      .filter(file => isChunkFile(file) && isSubtitleFile(file))
      .map(file => path.resolve(videoDir, `${TMP_DIR}/${file}`))
      .reduce((acc: Record<string, string[]>, cur) => {
        const [, original] = cur.match(subtitleReg) || [cur, 0];
        if (!acc[original]) {
          acc[original] = [cur];
        } else {
          acc[original].push(cur);
        }
        return acc;
      }, {});

    const extractChunkNum = (file: string) => {
      const [, , chunkNum] = file.match(subtitleReg) || [null, null, 0];
      return Number(chunkNum);
    };

    const result = await Promise.all(
      Object.keys(chunkFilesGroup).map(key =>
        mergeSrtFiles(
          chunkFilesGroup[key].sort(
            (a, b) => extractChunkNum(a) - extractChunkNum(b),
          ),
        ),
      ),
    );

    await Promise.all(
      Object.keys(chunkFilesGroup).map((key, i) =>
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
