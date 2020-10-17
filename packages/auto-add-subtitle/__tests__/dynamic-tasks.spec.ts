import { delay, DynamicTasks } from '../src/utils';

test('dynamic tasks', async () => {
  const dynamicTasks = new DynamicTasks<number>();
  const promise = dynamicTasks.run();

  const [, result] = await Promise.all([
    (async () => {
      await delay(1000);
      new Array(11).fill(0).forEach((_, i) => dynamicTasks.add(async () => i));
      dynamicTasks.end();
    })(),
    promise,
  ]);

  expect(result).toEqual(new Array(11).fill(0).map((_, i) => i));
});
