import {
  readFile,
  withCache,
  readdir,
  ConcurrentTasks,
  writeFile,
} from '../packages/shared/src';
import fs from 'fs';
import path from 'path';

export async function getPreviousFileContent(
  filePath: string,
): Promise<string | void> {
  if (!fs.existsSync(filePath)) {
    return;
  }

  return await withCache<string>(
    path => readFile(path, { encoding: 'utf-8' }),
    1000 * 60 * 5,
  )(filePath);
}

export async function updateMarkdownContent(
  transform: (md: string, packageName: string) => string = x => x,
) {
  const packagesDir = path.resolve(__dirname, '../packages/');
  const packages = await readdir(packagesDir);

  await new ConcurrentTasks(
    packages.map(packageName => async () => {
      const files = await readdir(path.resolve(packagesDir, packageName));
      await Promise.all(
        files.filter(isMarkdown).map(async file => {
          const readmePath = path.resolve(packagesDir, packageName, file);
          const md = await getPreviousFileContent(readmePath);
          if (!md) {
            return;
          }

          await writeFile(readmePath, transform(md, packageName));
        }),
      );
    }),
  ).run();
}

function isMarkdown(file: string) {
  return /\.md$/.test(file);
}
