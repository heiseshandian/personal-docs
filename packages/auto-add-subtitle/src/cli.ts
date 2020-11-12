#!/usr/bin/env node
import yargs, { Options } from 'yargs';
import SubtitleParser from './index';
import path from 'path';

const options: Record<string, Options> = {
  debug: {
    alias: 'd',
    default: false,
    type: 'boolean',
    describe: '是否开启调试模式（默认false）',
  },
  keepTmpFiles: {
    alias: ['k', 'keep'],
    default: false,
    type: 'boolean',
    describe: '是否保留临时文件（默认false）',
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
}

// 搞个自执行函数方便使用return提前结束流程
(async () => {
  const { _: videoPath, debug, keepTmpFiles } = argv as Arguments;
  await new SubtitleParser(path.resolve(process.cwd(), videoPath[0] || ''), {
    debug,
    keepTmpFiles,
  }).generateSrtFiles();
})();
