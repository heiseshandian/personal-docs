#!/usr/bin/env node
import yargs, { Options } from 'yargs';
import { getCache, lookIp, updateCache } from './lib';

const options: Record<string, Options> = {
  domain: {
    type: 'string',
    alias: 'd',
    describe: '不需要走代理的网站域名',
    required: true,
  },
  rulePath: {
    type: 'string',
    alias: 'r',
    describe: '规则路径',
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
  domain: string;
  rulePath: string;
}

// 搞个自执行函数方便使用return提前结束流程
(async () => {
  const { domain, rulePath } = argv as Arguments;
  const { rulePath: cachedRulePath } = await getCache();
  if (rulePath !== cachedRulePath) {
    await updateCache({ rulePath });
  }

  const finalRulePath = rulePath || cachedRulePath;
  if (!finalRulePath) {
    console.log('规则路径未传入');
    return;
  }
})();
