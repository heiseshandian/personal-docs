import path from 'path';
import { getClosestNodeModulesPath, readdir } from './utils';
import { Veed } from './veed-auto-add-title';

const videoDir = path.resolve(
  getClosestNodeModulesPath() as string,
  '.cache/videos',
);

async function main() {
  const files = await readdir(videoDir);

  await Veed.parseSubtitle(
    files
      .filter(file => file.endsWith('mp3'))
      .map(file => path.resolve(videoDir, file)),
  );
}

main();
