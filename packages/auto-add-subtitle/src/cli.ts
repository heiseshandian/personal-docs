#!/usr/bin/env node
import path from 'path';
import yargs, { Options } from 'yargs';
import { shutdown } from 'zgq-shared';

import SubtitleParser from '.';

const options: Record<string, Options> = {
  debug: {
    alias: 'd',
    default: false,
    type: 'boolean',
    describe: '是否开启调试模式',
  },
  keepTmpFiles: {
    alias: ['k', 'keep'],
    default: false,
    type: 'boolean',
    describe: '是否保留临时文件',
  },
  autoShutdown: {
    alias: 'as',
    default: false,
    type: 'boolean',
    describe: '解析完自动关机',
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
  keepTmpFiles: boolean;
  test: boolean;
  autoShutdown: boolean;
}

// 搞个自执行函数方便使用return提前结束流程
(async () => {
  const { _: videoPath, debug, keepTmpFiles, autoShutdown } = argv as Arguments;

  await new SubtitleParser(path.resolve(process.cwd(), videoPath[0] || ''), {
    debug,
    keepTmpFiles,
  }).generateSrtFiles();

  if (autoShutdown) {
    shutdown();
  }
})();
