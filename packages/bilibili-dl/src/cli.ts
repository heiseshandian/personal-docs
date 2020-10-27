#!/usr/bin/env node
import yargs, { Options } from 'yargs';
import { ConcurrentTasks } from 'zgq-shared';
import { bilibiliDl } from '.';

const options: Record<string, Options> = {};

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
}

// 搞个自执行函数方便使用return提前结束流程
(async () => {
  const { _: urls } = argv as Arguments;

  await new ConcurrentTasks(
    urls.map(url => async () => await bilibiliDl(url, process.cwd())),
  ).run();
})();
