#!/usr/bin/env node
import yargs, { Options } from 'yargs';
import { ConcurrentTasks } from 'zgq-shared';
import { BilibiliDl } from '.';

const options: Record<string, Options> = {
  series: {
    type: 'boolean',
    alias: 's',
    describe: '是否下载整个视频系列',
    default: false,
  },
};

const argv = yargs
  .usage(`Usage: bilibili-dl [options] {url}`)
  .example('bilibili-dl', '下载bilibili上的视频')
  .help('help')
  .alias('help', 'h')
  .options(options).argv;

interface Arguments {
  [x: string]: unknown;
  _: string[];
  $0: string;
  series: boolean;
}

// 搞个自执行函数方便使用return提前结束流程
(async () => {
  const { _: urls, series } = argv as Arguments;

  await new ConcurrentTasks(
    urls.map(url => async () =>
      await new BilibiliDl(url, process.cwd(), series).download(),
    ),
  ).run();
})();
