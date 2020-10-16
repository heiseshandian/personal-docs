import fs from 'fs';
import path from 'path';
import {
  changeFormat,
  ConcurrentTasks,
  getClosestNodeModulesPath,
  handleError,
  makeMap,
  move,
  readdir,
  sliceMediaByDuration,
  writeFile,
} from './utils';
import { mergeSrtFiles } from './utils/subtitles';
import { Veed } from './veed-auto-add-title';

const videoDir = path.resolve(
  getClosestNodeModulesPath() as string,
  '.cache/videos',
);

function isFile(file: string) {
  return /\.\w+/.test(file);
}

async function prepareMp3Files() {
  const files = await readdir(videoDir).catch(handleError);
  if (!files) {
    return;
  }

  await changeFormat(
    files.filter(isFile).map(file => path.resolve(videoDir, file)),
    'mp3',
  );

  await new ConcurrentTasks(
    files.filter(isFile).map(file => async () => {
      await sliceMediaByDuration(
        path.resolve(videoDir, file.replace(/\.\w$/, '.mp3')),
        6 * 60,
      );
    }),
  ).run();
}

async function parseSubtitle() {
  const parsedFiles = await readdir(path.resolve(videoDir, 'parsed')).catch(
    handleError,
  );
  const hasParsed = makeMap(
    (parsedFiles || []).map(file =>
      path.parse(file).name.replace('default_Project Name_', ''),
    ),
  );

  const files = await readdir(videoDir);
  await Veed.parseSubtitle(
    files
      .filter(file => file.endsWith('mp3'))
      .filter(file => !hasParsed(file))
      .map(file => path.resolve(videoDir, file))
      .filter(file => {
        const { dir, name, ext } = path.parse(file);
        const chunkFile = `${name}_chunks_0${ext}`;
        return !fs.existsSync(path.resolve(dir, chunkFile));
      }),
  );
}

async function mergeSrtChunks() {
  const files = await readdir(path.resolve(videoDir, 'parsed')).catch(
    handleError,
  );
  if (!files) {
    return;
  }

  const groupedFiles = files
    .filter(file => /chunks_\d+/.test(file))
    .map(file => path.resolve(videoDir, `parsed/${file}`))
    .reduce((acc: Record<string, string[]>, cur) => {
      const [, num] = cur.match(/_([\d.]+)_chunks/) || [cur, 0];
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
      writeFile(path.resolve(videoDir, `parsed/${key}.srt`), result[i]),
    ),
  );
}

async function renameSrtFiles() {
  const files = await readdir(path.resolve(videoDir, 'parsed')).catch(
    handleError,
  );
  if (!files) {
    return;
  }

  await Promise.all(
    files
      .filter(file => /default_Project Name_(?:[\d.]+)\.mp3\.srt/.test(file))
      .map(file => path.resolve(videoDir, `parsed/${file}`))
      .map(file =>
        move(
          file,
          file.replace('default_Project Name_', '').replace('.mp3', ''),
        ),
      ),
  );
}

async function main() {
  await prepareMp3Files();
  await parseSubtitle();

  await mergeSrtChunks();
  await renameSrtFiles();
}

main();
