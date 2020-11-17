import path from 'path';
import fs from 'fs';
import { readFile, ConcurrentTasks, readdir } from '../packages/shared/src';

(async () => {
  const packagesDir = path.resolve(__dirname, '../packages/');
  const packages = await readdir(packagesDir);

  await new ConcurrentTasks(
    packages.map(packageName => async () => {
      const cliPath = path.resolve(packagesDir, packageName, 'src/cli.ts');
      if (!fs.existsSync(cliPath)) {
        return;
      }

      const cli = await readFile(
        path.resolve(packagesDir, packageName, 'src/cli.ts'),
        { encoding: 'utf-8' },
      );

      const [firstLine] = cli.split('\n');
      if (/^\/\/\s*#!\/usr\/bin\/env node/.test(firstLine)) {
        console.error('#!/usr/bin/env node 不能被注释，请去掉注释后再发布');
        process.exit();
      }
    }),
  ).run();
})();
