import { withCache } from './cache';
import os from 'os';
import { execAsync } from './shell';

export const getExecutableFilePath = withCache(getPath);

async function getPath(cmd: string) {
  const [stdout] = await execAsync(`${isWindows() ? 'where' : 'which'} ${cmd}`);
  return stdout;
}

function isWindows() {
  return os.platform() === 'win32';
}
