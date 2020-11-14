import path from 'path';
import os from 'os';

// 部分电脑上的环境变量设置不对（比如说我的），这里手动修复下
export function fixFfmpegEnvs() {
  if (!isWindows()) {
    return;
  }

  const { FFMPEG_PATH, FFPROBE_PATH } = process.env;
  if (FFMPEG_PATH && !FFMPEG_PATH.endsWith('exe')) {
    process.env.FFMPEG_PATH = path.resolve(FFMPEG_PATH, 'ffmpeg.exe');
  }
  if (FFPROBE_PATH && !FFPROBE_PATH.endsWith('exe')) {
    process.env.FFPROBE_PATH = path.resolve(FFPROBE_PATH, 'ffprobe.exe');
  }
}

function isWindows() {
  return os.platform() === 'win32';
}
