#!/usr/bin/env node
import yargs, { Options } from 'yargs';
import { readFile, uniq, writeFile } from 'zgq-shared';
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
  .usage(`Usage: sstap-rules --rulePath={your rule path} --domain={domain}`)
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
  if (rulePath && rulePath !== cachedRulePath) {
    await updateCache({ rulePath });
  }

  const finalRulePath = rulePath || cachedRulePath;
  if (!finalRulePath) {
    console.log('规则路径未传入');
    return;
  }

  const ip = await lookIp(domain);
  if (!ip) {
    console.log(`${domain} 解析失败，请检查拼写或网络后重试`);
    return;
  }

  const content = await readFile(finalRulePath, { encoding: 'utf-8' });
  await writeFile(
    finalRulePath,
    uniq(content.replace(/\n$/, '').split('\n').concat(ip)).join('\n'),
  );
  console.log(`${finalRulePath} 添加ip成功`);
})();
