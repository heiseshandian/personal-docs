import { ConcurrentTasks, delay } from '../src';

test('concurrent-tasks, handle empty tasks', async () => {
  const result = await new ConcurrentTasks([]).run();
  expect(result).toEqual([]);
});

test('concurrent-tasks, keep order', async () => {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const result = await new ConcurrentTasks(
    numbers.map(v => async () => {
      await delay(v * Math.random() * 100);
      return v;
    }),
  ).run();

  expect(result).toEqual(numbers);
});
