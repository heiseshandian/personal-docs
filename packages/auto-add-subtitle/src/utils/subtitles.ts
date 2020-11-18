import { readFile, groupByLen } from 'zgq-shared';
import { formatTime, parseTime } from './time';

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
      getLastSubtitle(lines).map(line => {
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

function lines2Subtitles(lines: string[]) {
  return groupByLen(lines, ONE_SUBTITLE_LENGTH);
}

function subtitles2Chunks(subtitles: string[][], maxSeconds: number) {
  const slicePositions = findSlicePositions(
    subtitles.map(parseMaxSeconds),
    maxSeconds,
  );

  let chunkIndex = 0;
  return subtitles.reduce((chunks, cur, i) => {
    if (!chunks[chunkIndex]) {
      chunks[chunkIndex] = [];
    }
    chunks[chunkIndex].push(...cur);

    if (i === slicePositions[chunkIndex]) {
      chunkIndex++;
    }
    return chunks;
  }, [] as string[][]);
}

export async function sliceSrtFile(srtPath: string, maxSeconds: number) {
  const content = await readFile(srtPath, { encoding: 'utf-8' });
  const subtitles = lines2Subtitles(content.split(/\n/));
  const chunks = subtitles2Chunks(subtitles, maxSeconds);

  const [first, ...rest] = chunks;
  return [
    first,
    ...rest.map((currentChunk, i) => {
      const previousChunk = chunks[i];
      const previousMaxTime = parseMaxSeconds(getLastSubtitle(previousChunk));
      return resetSequenceAndTimeline(currentChunk, previousMaxTime);
    }),
  ];
}

function resetSequenceAndTimeline(list: string[], previousMaxTime: number) {
  const minSequence = parseSequence(list);

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

function findSlicePositions(maxSecondsArr: number[], maxSeconds: number) {
  const result = [];

  for (let i = 0; i < maxSecondsArr.length - 1; i++) {
    const current = maxSecondsArr[i];
    const next = maxSecondsArr[i + 1];
    if (Math.ceil(next / maxSeconds) - Math.ceil(current / maxSeconds) === 1) {
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
