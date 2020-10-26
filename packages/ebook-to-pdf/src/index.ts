import { ConcurrentTasks, execAsync, readdir } from 'zgq-shared';
import path from 'path';

function isEbook(file: string) {
  return /\.e\w+$/.test(file);
}

export async function convert2Pdf(filePath: string) {
  if (!filePath) {
    return;
  }

  const files = await readdir(filePath);

  await new ConcurrentTasks(
    (files || [])
      .filter(isEbook)
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
