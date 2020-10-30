import { readFile, withCache } from '../packages/shared/src';
import fs from 'fs';

export async function getPreviousFileContent(
  filePath: string,
): Promise<string | void> {
  if (!fs.existsSync(filePath)) {
    return;
  }

  return await withCache<string>(
    path => readFile(path, { encoding: 'utf-8' }),
    1000 * 60 * 5,
  )(filePath);
}
