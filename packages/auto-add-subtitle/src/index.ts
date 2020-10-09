import fs from 'fs';
import path from 'path';

import { BilibiliParser } from './bilibili-parser';
import {
  ConcurrentTasks,
  download,
  getClosestNodeModulesPath,
  toValidFilePath,
} from './utils';
import { sliceVideo } from './videos';

const config = {
  videoUrlsToParse: new Array(52)
    .fill(0)
    .map((_, i) => `https://www.bilibili.com/video/BV1Mh411Z7LC?p=${i + 1}`),
  videoTitles: [
    'Introduction10:04',
    'Why Functional Programming10:00',
    'Functional Programming Journey09:43',
    'Code is Provable08:50',
    'Course Overview03:51',
    'Functions vs Procedures10:53',
    'Function Naming Semantics06:45',
    'Side Effects11:05',
    'Pure Functions & Constants11:41',
    'Reducing Surface Area03:20',
    'Same Input, Same Output03:43',
    'Level of Confidence01:35',
    'Extracting Impurity04:38',
    'Containing Impurity11:08',
    'Impurity Exercise - Wrappers & Adapters03:41',
    'Impurity Solution - Wrappers02:25',
    'Impurity Solution - Adapters03:23',
    'Function Arguments05:17',
    'Arguments Shape Adapters05:46',
    'Flip & Reverse Adapter05:46',
    'Spread Adapter03:01',
    'Equational Reasoning08:56',
    'Point Free Refactor07:12',
    'Point Free Exercise01:06',
    'Point Free Solution07:19',
    'Advanced Point Free09:53',
    'Closure05:31',
    'Closure Exercise01:48',
    'Closure Solution08:32',
    'Lazy vs Eager Execution06:09',
    'Memoization11:24',
    'Referential Transparency05:11',
    'Generalized to Specialized08:52',
    'Partial Application & Currying09:18',
    'Partial Application & Currying Comparison06:02',
    'Changing Function Shape with Curry03:46',
    'Composition Illustration11:41',
    'Declarative Data Flow07:07',
    'Piping vs Composition06:59',
    'Piping & Composition Exercise01:20',
    'Piping & Composition Solution02:41',
    'Associativity02:47',
    'Composition with Currying03:54',
    'Immutability07:39',
    'Rethinking const Immutability09:34',
    'Value Immutability05:29',
    'Object.freeze04:51',
    'Dont Mutate, Copy04:48',
    'Immutable Data Structures07:49',
    'Immutable.js Overview04:56',
    'Immutability Exercise02:18',
    'Immutability Solution07:40',
  ].map((title, i) => `0${i}-${title.replace(':', '')}.mp4`),
};

async function main() {
  // parse url
  const mp4Urls = await BilibiliParser.parse(config.videoUrlsToParse);

  const getFilePath = (i: number) =>
    toValidFilePath(path.resolve(getVideoPath(), config.videoTitles[i]));

  // download
  new ConcurrentTasks(
    mp4Urls
      .filter((_, i) => !fs.existsSync(getFilePath(i)))
      .map((url, i) => async () => {
        await download(url, getFilePath(i));
      }),
  ).run(config.videoTitles.length);

  // slice video
  fs.readdir(getVideoPath(), (_, files) => {
    new ConcurrentTasks(
      files.map(file => async () => {
        await sliceVideo(path.resolve(getVideoPath(), file), '50m').catch(err =>
          console.log('err', file),
        );
      }),
    ).run(files.length);
  });
}

function getVideoPath() {
  const nodeModulesPath = getClosestNodeModulesPath();
  const videoPath = path.resolve(nodeModulesPath || __dirname, '.cache/videos');
  if (!fs.existsSync(videoPath)) {
    fs.mkdirSync(videoPath);
  }
  return videoPath;
}

main();
