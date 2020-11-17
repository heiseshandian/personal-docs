import os from 'os';
import { exec } from 'child_process';

export function isWindows() {
  return os.platform() === 'win32';
}

export function shutdown() {
  exec(isWindows() ? 'shutdown -s -t 60' : 'shutdown');
}
