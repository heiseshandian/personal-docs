#!/usr/bin/env node
import yargs, { Options } from 'yargs';
import SubtitleParser from './index';
import path from 'path';
import { clean, del } from 'zgq-shared';
import fs from 'fs';

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

  const pass = await testBeforeParse();
  if (!pass) {
    console.log(
      '测试解析失败，请检查网络或尝试升级版本后 (npm i -g auto-add-subtitle) 重试~',
    );
    return;
  }

  await new SubtitleParser(path.resolve(process.cwd(), videoPath[0] || ''), {
    debug,
    keepTmpFiles,
  }).generateSrtFiles();
})();

async function testBeforeParse() {
  const parser = new SubtitleParser(path.resolve(__dirname, './data/'), {
    timeout: 1000 * 60 * 2,
    autoRetry: false,
  });
  await clean(parser['getTmpPath']());

  await parser.generateSrtFiles();

  if (!fs.existsSync(path.resolve(__dirname, './data/video1.srt'))) {
    return false;
  }
  await del(path.resolve(__dirname, './data/video1.srt'));
  return true;
}
