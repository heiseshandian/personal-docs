import { spawn } from 'child_process';
import { FfprobeData, FfprobeError } from './global';
import { handleError, fixFfmpegEnvs } from './utils';

// ffprobe 依赖于系统环境变量 FFPROBE_PATH ffprobe的可执行文件
// 而部分电脑上 FFPROBE_PATH 设置的不是exe文件路径，而是exe文件所在的目录，这里手动修复下
fixFfmpegEnvs();

export async function ffprobe(file: string): Promise<FfprobeData | FfprobeError | undefined> {
  return new Promise(resolve => {
    const proc = spawn(process.env.FFPROBE_PATH || 'ffprobe', [
      '-hide_banner',
      '-loglevel',
      'fatal',
      '-show_error',
      '-show_format',
      '-show_streams',
      '-show_programs',
      '-show_chapters',
      '-show_private_data',
      '-print_format',
      'json',
      file,
    ]);

    const probeData: any[] = [];

    proc.stdout.setEncoding('utf8');

    proc.stdout.on('data', function (data) {
      probeData.push(data);
    });

    proc.on('exit', code => {
      if (code || code === 0) {
        process.exitCode = code;
      }
    });
    proc.on('error', err => {
      handleError(err);
      resolve();
    });
    proc.on('close', () => resolve(JSON.parse(probeData.join(''))));
  });
}
