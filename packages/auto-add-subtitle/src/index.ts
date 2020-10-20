import fs from 'fs';
import path from 'path';
import { Veed } from './parsers/veed-auto-add-title';
import {
  changeFormat,
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
  private TEMP_PATH = 'parsed_auto_add_subtitle';

  private videoDir;

  constructor(videoDir: string) {
    this.videoDir = videoDir;
  }

  private async prepareMp3Files() {
    const { videoDir } = this;
    const files = await readdir(videoDir);
    if (!files) {
      return;
    }

    await changeFormat(
      files
        .filter(isFile)
        .filter(file => !/\.mp3$/.test(file))
        .map(file => path.resolve(videoDir, file)),
      'mp3',
    );

    await sliceMediaBySeconds(
      uniq(
        files
          .filter(isFile)
          .map(file => path.resolve(videoDir, file.replace(/\.\w+$/, '.mp3'))),
      ),
      6 * 60,
    );
  }

  private async parseSubtitle() {
    const { videoDir, TEMP_PATH } = this;

    const parsedFiles = await readdir(path.resolve(videoDir, TEMP_PATH));
    const hasParsed = makeMap(
      (parsedFiles || []).map(file =>
        file
          .replace('default_Project Name_', '')
          .replace('.mp3', '')
          .replace(/\.\w+$/, '.mp3'),
      ),
    );

    const files = await readdir(path.resolve(videoDir));

    await new Veed(TEMP_PATH).parseSubtitle(
      files
        .filter(file => file.endsWith('mp3'))
        .filter(
          file =>
            !fs.existsSync(
              path.resolve(
                videoDir,
                file.replace(/^(.+)\.(\w+)$/, '$1_chunks_0.$2'),
              ),
            ),
        )
        .filter(file => !hasParsed(file))
        .map(file => path.resolve(videoDir, file)),
    );
  }

  private async mergeSrtChunks() {
    const { videoDir, TEMP_PATH } = this;
    const files = await readdir(path.resolve(videoDir, TEMP_PATH));
    if (!files) {
      return;
    }

    const groupedFiles = files
      .filter(file => /chunks_\d+/.test(file))
      .map(file => path.resolve(videoDir, `${TEMP_PATH}/${file}`))
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
        writeFile(path.resolve(videoDir, `${TEMP_PATH}/${key}.srt`), result[i]),
      ),
    );
  }

  private async renameSrtFiles() {
    const { videoDir, TEMP_PATH } = this;

    const files = await readdir(path.resolve(videoDir, TEMP_PATH));
    if (!files) {
      return;
    }

    await Promise.all(
      files
        .filter(file => !/chunks/.test(file))
        .filter(file => /default_Project Name_(.+)\.mp3\.srt/.test(file))
        .map(file => path.resolve(videoDir, `${TEMP_PATH}/${file}`))
        .map(file =>
          move(
            file,
            file.replace('default_Project Name_', '').replace('.mp3', ''),
          ),
        ),
    );
  }

  private async moveSrtFiles() {
    const { videoDir, TEMP_PATH } = this;

    const files = await readdir(videoDir);
    await Promise.all(
      files
        .filter(file => !/chunks/.test(file))
        .map(file => path.resolve(videoDir, `${TEMP_PATH}/${file}`))
        .map(file => move(file, path.resolve(videoDir, path.parse(file).base))),
    );
  }

  public async generateSrtFiles() {
    await this.prepareMp3Files();

    await this.parseSubtitle();

    await this.mergeSrtChunks();
    await this.renameSrtFiles();

    await this.moveSrtFiles();
  }
}
