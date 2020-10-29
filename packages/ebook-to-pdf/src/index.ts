import { ConcurrentTasks, execAsync, log, makeMap, readdir } from 'zgq-shared';
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

  const isInstalled = await isEbookConvertInstalled();
  if (!isInstalled) {
    log(
      `当前环境变量中未检测到 ebook-convert ，
      请检查下是否已经安装 calibre-ebook [https://calibre-ebook.com/download]，
      部分windows下环境变量可能需要重启电脑才能生效`,
    );
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

async function isEbookConvertInstalled() {
  const [stdout] = (await execAsync('ebook-convert --version')) || [];
  return /calibre/.test(stdout);
}
