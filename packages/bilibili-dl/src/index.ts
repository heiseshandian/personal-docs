import { ConcurrentTasks, download, toValidFilePath } from 'zgq-shared';
import { BilibiliParser, XbeibeixParser } from './parsers';
import path from 'path';

export async function bilibiliDl(url: string, dest: string) {
  if (!url) {
    return;
  }

  const series = await BilibiliParser.parseSeries(url);
  if (series) {
    await downloadSeries(series, dest);
  } else {
    await downloadUrl(url, dest);
  }
}

async function downloadUrl(url: string, dest: string) {
  if (!url) {
    return;
  }

  const title = await BilibiliParser.parsePageTitle(url);
  const { ext } = path.parse(url);
  await download(url, path.resolve(dest, toValidFilePath(title || url), ext));
}

async function downloadSeries(
  series: Array<{ href: string; title: string }>,
  dest: string,
) {
  if (!series) {
    return;
  }

  const titles = series.map(i => i.title);
  const realVideoUrls = await XbeibeixParser.parse(series.map(i => i.href));

  await new ConcurrentTasks(
    realVideoUrls.map((url, i) => async () => {
      const { ext } = path.parse(url);
      await download(url, path.resolve(dest, toValidFilePath(titles[i]), ext));
    }),
  ).run();
}
