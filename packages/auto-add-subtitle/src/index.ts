import path from 'path';
import {
  ConcurrentTasks,
  getClosestNodeModulesPath,
  makeMap,
  move,
  readdir,
} from './utils';
import { Veed } from './veed-auto-add-title';

const videoDir = path.resolve(
  getClosestNodeModulesPath() as string,
  '.cache/videos',
);

async function parseSubtitle() {
  const files = await readdir(videoDir);
  const parsedFiles = await readdir(path.resolve(videoDir, 'parsed'));
  const hasParsed = makeMap(
    parsedFiles.map(file =>
      path.parse(file).name.replace('default_Project Name_', ''),
    ),
  );

  await Veed.parseSubtitle(
    files
      .filter(file => file.endsWith('mp3'))
      .filter(file => !hasParsed(file))
      .map(file => path.resolve(videoDir, file)),
  );
}

async function main() {
  const parsedFiles = await readdir(path.resolve(videoDir, 'parsed'));
  await new ConcurrentTasks(
    parsedFiles.map(file => async () => {
      await move(
        path.resolve(videoDir, 'parsed', file),
        path.resolve(
          videoDir,
          file.replace('default_Project Name_', '').replace('.mp3', ''),
        ),
      );
    }),
  ).run();
}

main();
