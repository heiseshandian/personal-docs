import path from 'path';
import {
  ConcurrentTasks,
  getClosestNodeModulesPath,
  makeMap,
  readdir,
  sliceMediaByDuration,
} from './utils';
import { Veed } from './veed-auto-add-title';
import fs from 'fs';

const videoDir = path.resolve(
  getClosestNodeModulesPath() as string,
  '.cache/videos',
);

async function parseSubtitle() {
  const files = await readdir(videoDir);
  const parsedFiles = await readdir(
    path.resolve(videoDir, 'parsed'),
  ).catch(() => {});

  const hasParsed = makeMap(
    (parsedFiles || []).map(file =>
      path.parse(file).name.replace('default_Project Name_', ''),
    ),
  );

  // await new ConcurrentTasks(
  //   files
  //     .map(file => path.resolve(videoDir, file))
  //     .filter(file => file.endsWith('mp3'))
  //     .map(file => async () => {
  //       await sliceMediaByDuration(file, 6 * 60);
  //     }),
  //   'slicing',
  // ).run();

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

parseSubtitle();

// async function main() {
//   const parsedFiles = await readdir(path.resolve(videoDir, 'parsed'));
//   await new ConcurrentTasks(
//     parsedFiles.map(file => async () => {
//       await move(
//         path.resolve(videoDir, 'parsed', file),
//         path.resolve(
//           videoDir,
//           file.replace('default_Project Name_', '').replace('.mp3', ''),
//         ),
//       );
//     }),
//   ).run();
// }

// main();
