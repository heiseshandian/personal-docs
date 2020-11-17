import { execAsync, readFile } from 'zgq-shared';
import { getTmpDir, prepareTmpDir, removeTmpDir } from './helpers';
import fse from 'fs-extra';
import path from 'path';
import { lookIp } from '../src';

const TMP_DIR = getTmpDir(__filename);

let tmpPath: string;
beforeEach(async () => {
  tmpPath = await prepareTmpDir(TMP_DIR);
});

afterEach(async () => {
  await removeTmpDir(tmpPath);
});

test('cli', async () => {
  await fse.copy(path.resolve(__dirname, `./data/`), tmpPath);

  const rulePath = path.resolve(tmpPath, 'Skip-all-China-IP.rules');
  const domain = 'iring.diyring.cc';

  await execAsync(
    `ts-node ${path.resolve(
      __dirname,
      '../src/cli.ts',
    )} --rulePath=${rulePath} --domain=${domain}`,
  );

  const ip = await lookIp(domain);
  const [lastIp] = (await readFile(rulePath, { encoding: 'utf-8' }))
    .split('\n')
    .slice(-1);

  expect(ip).toEqual(lastIp);
});
