import { ConcurrentTasks, execAsync, makeMap, readdir } from 'zgq-shared';
import path from 'path';

function isEbook(file: string) {
  return /\.e\w+$/.test(file);
}

function isPdf(file: string) {
  return /\.pdf$/.test(file);
}

function parseName(file: string) {
  return path.parse(file).name;
}

export async function convert2Pdf(filePath: string) {
  if (!filePath) {
    return;
  }

  const files = await readdir(filePath);
  const hasConverted = makeMap(files.filter(isPdf).map(parseName));

  await new ConcurrentTasks(
    (files || [])
      .filter(isEbook)
      .filter(file => !hasConverted(parseName(file)))
      .map(file => path.resolve(filePath, file))
      .map(file => async () => {
        await execAsync(
          `ebook-convert ${JSON.stringify(file)} ${JSON.stringify(
            file.replace(/\.\w+$/, '.pdf'),
          )}`,
        );
      }),
    'converting',
  ).run();
}
