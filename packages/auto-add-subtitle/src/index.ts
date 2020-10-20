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
  uniq,
  writeFile,
} from './utils';
import { mergeSrtFiles } from './utils/subtitles';

function isFile(file: string) {
  return /\.\w+/.test(file);
}

export default class AutoAddSubtitle {
  private TEMP_DIR = 'parsed_auto_add_subtitle';

  private videoDir;

  constructor(videoDir: string) {
    this.videoDir = videoDir;
  }

  private async prepareTmpDir() {
    const { videoDir, TEMP_DIR } = this;
    return ensurePathExists(path.resolve(videoDir, TEMP_DIR));
  }

  private async rmTmpDir() {
    const { videoDir, TEMP_DIR } = this;
    await clean(path.resolve(videoDir, TEMP_DIR));
  }

  private async prepareMp3Files() {
    const { videoDir, TEMP_DIR } = this;
    const files = await readdir(videoDir);
    if (!files) {
      return;
    }

    const tmpPath = path.resolve(videoDir, TEMP_DIR);

    await changeFormat(
      files
        .filter(isFile)
        .filter(file => !/\.mp3$/.test(file))
        .map(file => path.resolve(videoDir, file)),
      'mp3',
      tmpPath,
    );

    const mp3Files = await readdir(tmpPath);
    if (!mp3Files) {
      return;
    }
    await sliceMediaBySeconds(
      uniq(mp3Files.filter(isFile).map(file => path.resolve(tmpPath, file))),
      6 * 60,
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
        .filter(file => file.endsWith('mp3'))
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
      .filter(file => /chunks_\d+/.test(file))
      .map(file => path.resolve(videoDir, `${TEMP_DIR}/${file}`))
      .reduce((acc: Record<string, string[]>, cur) => {
        const [, num] = cur.match(
          /default_Project Name_(.+)_chunks_\d+\.mp3\.srt/,
        ) || [cur, 0];
        if (!acc[num]) {
          acc[num] = [cur];
        } else {
          acc[num].push(cur);
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
        .filter(file => !/chunks/.test(file))
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
        .filter(file => !/chunks/.test(file) && /\.srt/.test(file))
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
