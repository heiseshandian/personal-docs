#!/usr/bin/env node
import yargs, { Options } from 'yargs';
import AutoAddSubtitle from './index';
import path from 'path';

const options: Record<string, Options> = {
  debug: {
    alias: 'd',
    default: false,
    type: 'boolean',
  },
};

const argv = yargs
  .usage(`Usage: auto-add-subtitle [options] {video-path}`)
  .example('auto-add-subtitle', '为当前目录下的所有文件生成字幕文件')
  .help('help')
  .alias('help', 'h')
  .options(options).argv;

interface Arguments {
  [x: string]: unknown;
  _: string[];
  $0: string;
  debug: boolean;
}

// 搞个自执行函数方便使用return提前结束流程
(async () => {
  const { _: videoPath, debug } = argv as Arguments;
  await new AutoAddSubtitle(path.resolve(process.cwd(), videoPath[0] || ''), {
    debug,
  }).generateSrtFiles();
})();
