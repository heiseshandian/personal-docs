import { ConcurrentTasks } from '../src/concurrent-tasks';

test('concurrent-tasks', async () => {
  const [result1, result2, result3] = await Promise.all(
    [7, 8, 9].map(val =>
      new ConcurrentTasks(
        new Array(val).fill(0).map(() => () => {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(1);
            }, 0);
          });
        }),
      ).run(8),
    ),
  );

  expect(result1).toEqual(new Array(7).fill(1));
  expect(result2).toEqual(new Array(8).fill(1));
  expect(result3).toEqual(new Array(9).fill(1));
});
