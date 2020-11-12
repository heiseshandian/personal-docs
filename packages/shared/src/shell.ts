import { callback2Promise } from './base';
import { exec } from 'child_process';
import { withCache } from './cache';
import os from 'os';

export const execAsync = callback2Promise<[stdout: string, stderr: string]>(
  exec,
);

export const getExecutableFilePath = withCache(getPath);

async function getPath(cmd: string) {
  const [stdout] = await execAsync(`${isWindows() ? 'where' : 'which'} ${cmd}`);
  return stdout;
}

function isWindows() {
  return os.platform() === 'win32';
}

(async () => {
  const exePath = await getExecutableFilePath('ffmpeg');
  console.log(exePath);
})();
