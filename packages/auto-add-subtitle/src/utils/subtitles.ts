import { handleError } from './base';
import { readFile } from './fs';

const sequenceReg = /^([+-]?)(\d+)$/;
const timelineReg = /^\d{2}:\d{2}:\d{2}[,.]\d{3} --> \d{2}:\d{2}:\d{2}[,.]\d{3}$/;
export async function merge(primarySrt: string, secondSrt: string) {
  const [primary, second] = await Promise.all(
    [primarySrt, secondSrt].map(file =>
      readFile(file)
        .then(buf => buf.toString())
        .catch(handleError),
    ),
  );

  if (!primary || !second) {
    return;
  }

  const [maxTime, maxSequence] = [
    parseMaxTime(primary.split(/\n/).slice(-4)),
    parseMaxSequence(primary.split(/\n/).slice(-4)),
  ];
  const secondLines = second.split(/\n/);
}

function parseMaxTime(list: string[]) {
  for (const line of list.reverse()) {
    if (timelineReg.test(line)) {
      return parseTime(line.split('-->')[1]);
    }
  }
}

function parseMaxSequence(list: string[]) {
  for (const line of list.reverse()) {
    if (sequenceReg.test(line)) {
      return parseInt(line);
    }
  }
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
  const [symbol, hours, minutes, seconds, milliseconds] = match;

  return (
    (symbol === '-' ? -1 : 1) *
    (Number(hours) * 60 * 60 +
      Number(minutes) * 60 +
      Number(seconds) +
      Number(milliseconds) / 1000)
  );
}

function pad2(value: number) {
  return value < 10 ? '0' + String(value) : String(value);
}

function pad3(value: number) {
  if (value < 10) {
    return '00' + String(value);
  } else if (value < 100) {
    return '0' + String(value);
  } else {
    return String(value);
  }
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
    pad2(hours) +
    ':' +
    pad2(minutes) +
    ':' +
    pad2(seconds) +
    ',' +
    pad3(milliseconds)
  );
}
