import { handleError } from './base';
import { readFile } from './fs';

const sequenceReg = /^([+-]?)(\d+)$/;
const timelineReg = /^\d{2}:\d{2}:\d{2}[,.]\d{3} --> \d{2}:\d{2}:\d{2}[,.]\d{3}$/;
function merge(primaryLines: string[], secondLines: string[]) {
  const [maxTime, maxSequence] = [
    parseMaxTime(primaryLines),
    parseMaxSequence(primaryLines),
  ];

  return primaryLines.concat(
    secondLines.map(line => {
      if (sequenceReg.test(line)) {
        return String(parseInt(line) + maxSequence);
      }
      if (timelineReg.test(line)) {
        return line
          .split(' --> ')
          .map(time => formatTime(parseTime(time) + maxTime))
          .join(' --> ');
      }
      return line;
    }),
  );
}

export async function mergeSrtFiles(srtFiles: string[]) {
  const result = await Promise.all(
    srtFiles.map(file => readFile(file).then(buf => buf.toString())),
  );

  return result
    .filter(val => !!val)
    .map(val => (val as string).split(/\n/))
    .reduce((acc, cur) => merge(acc, cur))
    .join('\n');
}

function parseMaxTime(list: string[]) {
  for (const line of list.slice(-4).reverse()) {
    if (timelineReg.test(line)) {
      return parseTime(line.split('-->')[1]);
    }
  }
  return 0;
}

function parseMaxSequence(list: string[]) {
  for (const line of list.slice(-4).reverse()) {
    if (sequenceReg.test(line)) {
      return parseInt(line);
    }
  }
  return 0;
}

const timeRegex = /^([+-]?)(\d{2}):(\d{2}):(\d{2})[,.](\d{3})$/;
function parseTime(value: string) {
  if (!value) {
    return 0;
  }
  const match = value.trim().match(timeRegex);
  if (!match) {
    return 0;
  }

  const [, symbol, hours, minutes, seconds, milliseconds] = match;
  return (
    (symbol === '-' ? -1 : 1) *
    ([hours, minutes, seconds]
      .map(val => Number(val))
      .reduce((acc, cur, i) => acc + cur * 60 ** (2 - i), 0) +
      Number(milliseconds) / 1000)
  );
}

function formatTime(value: number) {
  const hours = Math.floor(value / (60 * 60));
  value -= hours * 60 * 60;
  const minutes = Math.floor(value / 60);
  value -= minutes * 60;
  const seconds = Math.floor(value);
  value -= seconds;
  const milliseconds = Math.round(value * 1000);

  return (
    (value < 0 ? '-' : '') +
    [hours, minutes, seconds].map(val => `${val}`.padStart(2, '0')).join(':') +
    ',' +
    `${milliseconds}`.padStart(3, '0')
  );
}
