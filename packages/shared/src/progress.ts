/* eslint-disable @typescript-eslint/no-empty-function */
import Progress from 'progress';

const mockBar = {
  tick() {},
  terminate() {},
  update() {},
  render() {},
};

const mockInstance = {
  newBar() {
    return mockBar;
  },
  terminate() {},
  move() {},
  tick() {},
  update() {},
  isTTY: false,
};

type ComposedProgress = Progress & {
  otick?: (value: number, options: Progress.ProgressBarOptions) => void;
  oterminate?: () => void;
  oupdate?: (ratio: number, tokens?: any) => void;
};

class MultiProgress {
  private stream: NodeJS.WriteStream;
  private isTTY: boolean;
  private cursor = 0;
  private bars: Array<ComposedProgress> = [];
  private terminates = 0;

  constructor(stream: NodeJS.WriteStream) {
    this.stream = stream || process.stderr;
    this.isTTY = this.stream.isTTY;

    if (!this.isTTY) {
      // @ts-ignore
      return mockInstance;
    }

    this.cursor = 0;
    this.bars = [];
    this.terminates = 0;

    return this;
  }

  newBar(schema: string, options: Progress.ProgressBarOptions) {
    options.stream = this.stream;
    const bar: ComposedProgress = new Progress(schema, options);
    this.bars.push(bar);
    const index = this.bars.length - 1;

    // alloc line
    this.move(index);
    this.stream.write('\n');
    this.cursor += 1;

    // replace original
    bar.otick = bar.tick;
    bar.oterminate = bar.terminate;
    bar.oupdate = bar.update;
    // @ts-ignore
    bar.tick = (value: number, options: any) => {
      this.tick(index, value, options);
    };
    bar.terminate = () => {
      this.terminates += 1;
      if (this.terminates === this.bars.length) {
        this.terminate();
      }
    };
    bar.update = (value, options) => {
      this.update(index, value, options);
    };

    return bar;
  }

  terminate() {
    this.move(this.bars.length);
    this.stream.clearLine(0);
    this.stream.cursorTo(0);
  }

  move(index: number) {
    this.stream.moveCursor(0, index - this.cursor);
    this.cursor = index;
  }

  tick(index: number, value: number, options: Progress.ProgressBarOptions) {
    const bar = this.bars[index];
    if (bar) {
      this.move(index);
      bar.otick && bar.otick(value, options);
    }
  }

  update(index: number, value: number, options: Progress.ProgressBarOptions) {
    const bar = this.bars[index];
    if (bar) {
      this.move(index);
      bar.oupdate && bar.oupdate(value, options);
    }
  }
}

export class MultiProgressBar {
  private static multi = new MultiProgress(process.stderr);

  public static getProgressBar(
    msg: string,
    options: Progress.ProgressBarOptions,
  ) {
    return this.multi.newBar(`${msg} [:bar] :rate/bps :percent :etas`, {
      complete: '=',
      incomplete: ' ',
      width: 30,
      ...options,
    });
  }
}

export function withProgress(
  fn: (...rest: any) => Promise<any>,
  bar: ProgressBar,
) {
  return async (...rest: any) => {
    const result = await fn(...rest);
    bar.tick();
    return result;
  };
}
