import fs from 'fs';
import path from 'path';
import { Veed } from './parsers/veed-auto-add-title';
import {
  changeFormat,
  clean,
  ensurePathExists,
  makeMap,
  move,
  readdir,
  sliceMediaBySeconds,
  writeFile,
} from './utils';
import { mergeSrtFiles } from './utils/subtitles';

function isFile(file: string) {
  return /\.\w+/.test(file);
}

function isSrtFile(file: string) {
  return /\.srt$/.test(file);
}

function isMp3File(file: string) {
  return /\.mp3$/.test(file);
}

function toAbsolutePath(dir: string, file: string) {
  return path.resolve(dir, file);
}

export default class AutoAddSubtitle {
  private TEMP_DIR = 'parsed_auto_add_subtitle';

  private videoDir;

  constructor(videoDir: string, chunkSeconds: number = 6 * 60) {
    this.videoDir = videoDir;
    this.chunkSeconds = chunkSeconds;
  }

  private async prepareTmpDir() {
    const { videoDir, TEMP_DIR } = this;
    return ensurePathExists(path.resolve(videoDir, TEMP_DIR));
  }

  private async rmTmpDir() {
    const { videoDir, TEMP_DIR } = this;
    await clean(path.resolve(videoDir, TEMP_DIR));
  }

  private chunkSeconds;

  private async prepareMp3Files() {
    const { videoDir, TEMP_DIR, chunkSeconds } = this;
    const files = await readdir(videoDir);
    const tmpPath = path.resolve(videoDir, TEMP_DIR);

    await changeFormat(
      (files || [])
        .filter(file => isFile(file) && !isMp3File(file))
        .map(file => toAbsolutePath(videoDir, file)),
      'mp3',
      tmpPath,
    );

    const tmpFiles = await readdir(tmpPath);
    await sliceMediaBySeconds(
      (tmpFiles || [])
        .filter(isMp3File)
        .map(file => toAbsolutePath(tmpPath, file)),
      chunkSeconds,
    );
  }

  private async parseSubtitle() {
    const { videoDir, TEMP_DIR } = this;

    const parsedFiles = await readdir(path.resolve(videoDir, TEMP_DIR));
    const hasParsed = makeMap(
      (parsedFiles || []).filter(isFile).map(file =>
        file
          .replace('default_Project Name_', '')
          .replace('.mp3', '')
          .replace(/\.\w+$/, '.mp3'),
      ),
    );

    const tmpPath = path.resolve(videoDir, TEMP_DIR);
    const files = await readdir(tmpPath);

    await Veed.parseSubtitle(
      files
        .filter(isMp3File)
        .filter(
          file =>
            !fs.existsSync(
              path.resolve(
                tmpPath,
                file.replace(/^(.+)\.(\w+)$/, '$1_chunks_0.$2'),
              ),
            ),
        )
        .filter(file => !hasParsed(file))
        .map(file => path.resolve(tmpPath, file)),
    );
  }

  private async mergeSrtChunks() {
    const { videoDir, TEMP_DIR } = this;
    const files = await readdir(path.resolve(videoDir, TEMP_DIR));
    if (!files) {
      return;
    }

    const groupedFiles = files
      .filter(file => /chunks_\d+/.test(file) && isSrtFile(file))
      .map(file => path.resolve(videoDir, `${TEMP_DIR}/${file}`))
      .reduce((acc: Record<string, string[]>, cur) => {
        const [, original] = cur.match(
          /default_Project Name_(.+)_chunks_\d+\.mp3\.srt/,
        ) || [cur, 0];
        if (!acc[original]) {
          acc[original] = [cur];
        } else {
          acc[original].push(cur);
        }
        return acc;
      }, {});

    const result = await Promise.all(
      Object.keys(groupedFiles).map(key => mergeSrtFiles(groupedFiles[key])),
    );

    await Promise.all(
      Object.keys(groupedFiles).map((key, i) =>
        writeFile(path.resolve(videoDir, `${TEMP_DIR}/${key}.srt`), result[i]),
      ),
    );
  }

  private async renameSrtFiles() {
    const { videoDir, TEMP_DIR } = this;

    const files = await readdir(path.resolve(videoDir, TEMP_DIR));
    if (!files) {
      return;
    }

    await Promise.all(
      files
        .filter(file => !/chunks/.test(file) && isSrtFile(file))
        .filter(file => /default_Project Name_(.+)\.mp3\.srt/.test(file))
        .map(file => path.resolve(videoDir, `${TEMP_DIR}/${file}`))
        .map(file =>
          move(
            file,
            file.replace('default_Project Name_', '').replace('.mp3', ''),
          ),
        ),
    );
  }

  private async moveSrtFiles() {
    const { videoDir, TEMP_DIR } = this;
    const tmpPath = path.resolve(videoDir, TEMP_DIR);

    const files = await readdir(tmpPath);
    await Promise.all(
      files
        .filter(file => !/chunks/.test(file) && isSrtFile(file))
        .map(file => path.resolve(tmpPath, file))
        .map(file => move(file, path.resolve(videoDir, path.parse(file).base))),
    );
  }

  public async generateSrtFiles() {
    await this.prepareTmpDir();
    await this.prepareMp3Files();

    await this.parseSubtitle();
    await this.mergeSrtChunks();
    await this.renameSrtFiles();
    await this.moveSrtFiles();

    await this.rmTmpDir();
  }
}
