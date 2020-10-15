import fs from 'fs';
import path from 'path';
import {
  changeFormat,
  ConcurrentTasks,
  getClosestNodeModulesPath,
  makeMap,
  readdir,
  sliceMediaByDuration,
} from './utils';
import { Veed } from './veed-auto-add-title';

const videoDir = path.resolve(
  getClosestNodeModulesPath() as string,
  '.cache/videos',
);

async function prepareMp3Files() {
  const files = await readdir(videoDir);

  await changeFormat(
    files.map(file => path.resolve(videoDir, file)),
    'mp3',
  );
}

async function checkMp3Files() {
  const files = await readdir(videoDir);

  await new ConcurrentTasks(
    files
      .filter(file => file.endsWith('mp3'))
      .map(file => async () => {
        await sliceMediaByDuration(path.resolve(videoDir, file), 6 * 60);
      }),
  ).run();
}

async function parseSubtitle() {
  const parsedFiles = await readdir(
    path.resolve(videoDir, 'parsed'),
  ).catch(() => {});
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

async function main() {
  // await prepareMp3Files();
  // await checkMp3Files();
  await parseSubtitle();
}

main();
