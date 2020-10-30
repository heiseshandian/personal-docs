import path from 'path';
import { ConcurrentTasks, readdir, writeFile } from '../packages/shared/src';
import { getPreviousFileContent } from './helpers';

(async () => {
  const packagesDir = path.resolve(__dirname, '../packages/');
  const packages = await readdir(packagesDir);

  await new ConcurrentTasks(
    packages.map(packagePath => async () => {
      const readmePath = path.resolve(packagesDir, packagePath, 'README.md');
      const md = await getPreviousFileContent(readmePath);
      if (!md) {
        return;
      }

      await writeFile(readmePath, md);
    }),
    '',
  ).run();
})();
