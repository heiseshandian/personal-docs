import { readFile, groupByLen } from 'zgq-shared';

const ONE_SUBTITLE_LENGTH = 4;

function getLastSubtitle(list: string[]) {
  return list.slice(-ONE_SUBTITLE_LENGTH);
}

const sequenceReg = /^([+-]?)(\d+)$/;
const timelineReg = /^\d{2}:\d{2}:\d{2}[,.]\d{3} --> \d{2}:\d{2}:\d{2}[,.]\d{3}$/;
function merge(primaryLines: string[], secondLines: string[]) {
  const [maxTime, maxSequence] = [
    parseMaxSeconds(getLastSubtitle(primaryLines)),
    parseSequence(getLastSubtitle(primaryLines)),
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

export async function fixEndTime(srtFile: string, duration: string) {
  const content = await readFile(srtFile, { encoding: 'utf-8' });
  const lines = content.split(/\n/);

  return lines
    .slice(0, lines.length - ONE_SUBTITLE_LENGTH)
    .concat(
      lines.slice(-ONE_SUBTITLE_LENGTH).map(line => {
        if (timelineReg.test(line)) {
          return `${line.split(' --> ')[0]} --> ${formatDuration(duration)}`;
        }
        return line;
      }),
    )
    .join('\n');
}

const durationReg = /(\d{1,2}):(\d{1,2}):(\d{1,2})[.,](\d{2,3})/;
function formatDuration(duration: string) {
  const [, hours, minutes, seconds, milliseconds] =
    duration.match(durationReg) || [];

  return `${[hours, minutes, seconds]
    .map(val => val.padStart(2, '0'))
    .join(':')},${milliseconds.padEnd(3, '0')}`;
}

export async function sliceSrtFile(srtPath: string, maxSeconds: number) {
  const fileContent = await readFile(srtPath, { encoding: 'utf-8' });
  const subtitleGroup = groupByLen(
    fileContent.split(/\n/),
    ONE_SUBTITLE_LENGTH,
  );
  const groups = groupByNum(subtitleGroup.map(parseMaxSeconds), maxSeconds);

  let groupIndex = 0;
  const chunks = subtitleGroup.reduce((acc, cur, i) => {
    if (!acc[groupIndex]) {
      acc[groupIndex] = [];
    }
    acc[groupIndex].push(...cur);

    if (i === groups[groupIndex]) {
      groupIndex++;
    }
    return acc;
  }, [] as Array<Array<string>>);

  return [
    chunks[0],
    ...chunks
      .slice(1)
      .map((chunk, i) =>
        reset(chunk, parseMaxSeconds(getLastSubtitle(chunks[i]))),
      ),
  ];
}

function reset(list: string[], previousMaxTime: number) {
  const [minSequence] = [parseSequence(list)];

  return list.map(line => {
    if (sequenceReg.test(line)) {
      return String(parseInt(line) - minSequence + 1);
    }
    if (timelineReg.test(line)) {
      return line
        .split(' --> ')
        .map(time => formatTime(parseTime(time) - previousMaxTime))
        .join(' --> ');
    }
    return line;
  });
}

function groupByNum(arr: number[], num: number) {
  const result = [];
  for (let i = 0; i < arr.length - 1; i++) {
    const previous = arr[i];
    const next = arr[i + 1];
    if (Math.ceil(next / num) - Math.ceil(previous / num) === 1) {
      result.push(i);
    }
  }

  return result;
}

function parseSeconds(list: string[], index: number) {
  for (const line of list) {
    if (timelineReg.test(line)) {
      return parseTime(line.split('-->')[index]);
    }
  }
  return 0;
}

function parseMaxSeconds(list: string[]) {
  return parseSeconds(list, 1);
}

function parseSequence(list: string[]) {
  for (const line of list) {
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
