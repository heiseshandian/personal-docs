import { delay, DynamicTasks } from '../src/utils';

test('dynamic tasks,run add end', async () => {
  const dynamicTasks = new DynamicTasks<number>();
  const promise = dynamicTasks.run();

  const [, result] = await Promise.all([
    (async () => {
      await delay(1000);
      new Array(11).fill(0).forEach((_, i) => dynamicTasks.add(async () => i));
      dynamicTasks.end();

      await delay(10);
      dynamicTasks.add(async () => 10);
    })(),
    promise,
  ]);

  expect(result).toEqual(new Array(11).fill(0).map((_, i) => i));
});

test('dynamic tasks,run end add', async () => {
  const dynamicTasks = new DynamicTasks<number>();
  const promise = dynamicTasks.run();
  dynamicTasks.end();
  const result = await promise;

  expect(result).toEqual([]);
});

test('dynamic tasks,add end run', async () => {
  const dynamicTasks = new DynamicTasks<number>();
  new Array(10).fill(0).forEach((_, i) =>
    dynamicTasks.add(async () => {
      await delay(10);
      return i;
    }),
  );

  dynamicTasks.end();
  const result = await dynamicTasks.run();

  expect(result).toEqual(new Array(10).fill(0).map((_, i) => i));
});

test('dynamic tasks,handle error', async () => {
  const dynamicTasks = new DynamicTasks<number>();
  new Array(10).fill(0).forEach(() =>
    dynamicTasks.add(async () => {
      throw new Error();
    }),
  );

  dynamicTasks.end();
  const result = await dynamicTasks.run();

  expect(result).toEqual(new Array(10).fill(0).map(() => undefined));
});
