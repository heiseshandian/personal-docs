import { del, execAsync, makeMap, readdir } from 'zgq-shared';
import path from 'path';

jest.setTimeout(1000 * 60 * 10);

function isPdf(file: string) {
  return /\.pdf$/.test(file);
}

function getName(file: string) {
  return path.parse(file).name;
}

test('cli', async () => {
  const booksDir = path.resolve(__dirname, './books');
  const beforeBooks = await readdir(booksDir);
  const hasConverted = makeMap(beforeBooks.map(getName));

  await execAsync(
    `npx ts-node ${path.resolve(__dirname, '../src/cli.ts')} ${booksDir}`,
  );

  const afterBooks = await readdir(booksDir);
  const result = afterBooks
    .filter(isPdf)
    .filter(file => !hasConverted(getName(file)));

  expect(result.length).toBe(0);

  // cleanup
  await Promise.all(
    afterBooks
      .filter(isPdf)
      .map(file => path.resolve(booksDir, file))
      .map(file => del(file)),
  );
});
