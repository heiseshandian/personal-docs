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
import { Veed } from './parsers';
import {
  chunk_file_suffix,
  extractAudio,
  isChunkFile,
  isSupportedAudio,
  mergeSrtFiles,
  sliceMediaBySeconds,
} from './utils';

export * from './utils';
export * from './parsers';

function isFile(file: string) {
  return /\.\w+/.test(file);
}

const subtitleFileReg = new RegExp(`\\${Veed.subtitleExt}$`);
function isSubtitleFile(file: string) {
  return subtitleFileReg.test(file);
}

function toAbsolutePath(dir: string, file: string) {
  return path.resolve(dir, file);
}

export default class AutoAddSubtitle {
  private readonly tmp_dir = 'parsed_auto_add_subtitle';

  private videoDir;

  constructor(videoDir: string, chunkSeconds: number = 6 * 60) {
    this.videoDir = videoDir;
    this.chunkSeconds = chunkSeconds;
  }

  private async prepareTmpDir() {
    const { videoDir, tmp_dir } = this;
    return ensurePathExists(path.resolve(videoDir, tmp_dir));
  }

  private async removeTmpDir() {
    const { videoDir, tmp_dir } = this;
    await clean(path.resolve(videoDir, tmp_dir));
  }

  private chunkSeconds;

  private async extractAudioFiles() {
    const { videoDir, tmp_dir, chunkSeconds } = this;
    const files = await readdir(videoDir);
    const tmpPath = path.resolve(videoDir, tmp_dir);

    await extractAudio(
      (files || []).filter(isFile).map(file => toAbsolutePath(videoDir, file)),
      tmpPath,
    );

    const tmpFiles = await readdir(tmpPath);
    await sliceMediaBySeconds(
      (tmpFiles || [])
        .filter(isFile)
        .map(file => toAbsolutePath(tmpPath, file)),
      chunkSeconds,
    );

    const withChunks = (file: string) =>
      fs.existsSync(
        path.resolve(
          tmpPath,
          file.replace(/^(.+)\.(\w+)$/, `$1${chunk_file_suffix}0.$2`),
        ),
      );
    await new ConcurrentTasks(
      tmpFiles
        .filter(withChunks)
        .map(file => async () => await del(toAbsolutePath(tmpPath, file))),
    ).run();
  }

  private async parseSubtitle() {
    const { videoDir, tmp_dir } = this;

    const tmpPath = path.resolve(videoDir, tmp_dir);
    const files = await readdir(tmpPath);

    const hasParsed = makeMap(
      files.map(file =>
        file.replace(Veed.subtitlePrefix, '').replace(/\.\w+$/, ''),
      ),
    );

    await Veed.parseSubtitle(
      files
        .filter(isSupportedAudio)
        .filter(file => !hasParsed(file))
        .map(file => path.resolve(tmpPath, file)),
    );
  }

  private async mergeSrtChunks() {
    const { videoDir, tmp_dir } = this;
    const files = await readdir(path.resolve(videoDir, tmp_dir));
    if (!files) {
      return;
    }

    const subtitleReg = new RegExp(
      `${Veed.subtitlePrefix}(.+)${chunk_file_suffix}(\\d+)[^.]*\\${Veed.subtitleExt}$`,
    );
    const chunkFilesGroup = files
      .filter(file => isChunkFile(file) && isSubtitleFile(file))
      .map(file => path.resolve(videoDir, `${tmp_dir}/${file}`))
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
          path.resolve(videoDir, `${tmp_dir}/${key}${Veed.subtitleExt}`),
          result[i],
        ),
      ),
    );
  }

  private async renameSrtFiles() {
    const { videoDir, tmp_dir } = this;

    const files = await readdir(path.resolve(videoDir, tmp_dir));
    if (!files) {
      return;
    }

    const unMergedFileReg = new RegExp(
      `${Veed.subtitlePrefix}(.+)\\.\\w+\\${Veed.subtitleExt}$`,
    );
    await Promise.all(
      files
        .filter(file => !isChunkFile(file) && isSubtitleFile(file))
        .filter(file => unMergedFileReg.test(file))
        .map(file => path.resolve(videoDir, `${tmp_dir}/${file}`))
        .map(file =>
          move(
            file,
            file.replace(Veed.subtitlePrefix, '').replace(/\.\w+/, ''),
          ),
        ),
    );
  }

  private async moveSrtFiles() {
    const { videoDir, tmp_dir } = this;
    const tmpPath = path.resolve(videoDir, tmp_dir);

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
    await this.renameSrtFiles();
    await this.moveSrtFiles();

    await this.removeTmpDir();
  }
}
