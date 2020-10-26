#!/usr/bin/env node
import yargs, { Options } from 'yargs';
import { convert2Pdf } from './index';
import path from 'path';

const options: Record<string, Options> = {};

const argv = yargs
  .usage(`Usage: ebook-to-pdf [input_file]`)
  .example('ebook-to-pdf', '将当前目录下的所有电子书转为pdf格式')
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
  const { _: videoPath } = argv as Arguments;
  await convert2Pdf(path.resolve(process.cwd(), videoPath[0] || ''));
})();
