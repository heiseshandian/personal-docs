import { readFile, groupByLen } from 'zgq-shared';

const ONE_SUBTITLE_LENGTH = 4;

const sequenceReg = /^([+-]?)(\d+)$/;
const timelineReg = /^\d{2}:\d{2}:\d{2}[,.]\d{3} --> \d{2}:\d{2}:\d{2}[,.]\d{3}$/;
function merge(primaryLines: string[], secondLines: string[]) {
  const [maxTime, maxSequence] = [
    parseMaxSeconds(primaryLines.slice(-ONE_SUBTITLE_LENGTH).reverse()),
    parseSequence(primaryLines.slice(-ONE_SUBTITLE_LENGTH).reverse()),
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
        reset(
          chunk,
          parseMaxSeconds(chunks[i].slice(-ONE_SUBTITLE_LENGTH).reverse()),
        ),
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
