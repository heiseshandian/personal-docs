import { spawn } from 'child_process';
import { handleError } from './utils';

export async function ffprobe(file: string): Promise<any> {
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
