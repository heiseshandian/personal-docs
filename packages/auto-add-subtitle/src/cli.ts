#!/usr/bin/env node
import minimist from 'minimist';
import AutoAddSubtitle from './index';
import path from 'path';

function parseArgs() {
  return minimist(process.argv.slice(2), {
    string: ['vp', 'h'],
    alias: {
      vp: 'video-path',
      h: 'help',
    },
    default: {
      vp: './',
    },
  });
}

function shouldPrintHelp() {
  const { h } = parseArgs();
  return h !== undefined;
}

function printHelp() {
  console.log(
    `auto-add-subtitle [-vp={your video path,default is current working directory}]`,
  );
}

// 搞个自执行函数方便使用return提前结束流程
(async () => {
  if (shouldPrintHelp()) {
    printHelp();
    return;
  }

  const { vp: videoPath } = parseArgs();

  await new AutoAddSubtitle(
    path.resolve(process.cwd(), videoPath),
  ).generateSrtFiles();
})();
