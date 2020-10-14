import axios, { AxiosError, AxiosResponse } from 'axios';
import filenamify from 'filenamify';
import fs from 'fs';
import { toValidFilePath } from './path';
import { MultiProgressBar } from './progress';

// 下载文件到本地
export async function download(url: string, dest: string) {
  if (!url || !dest || !filenamify(dest)) {
    return false;
  }

  const response = await axios({
    method: 'GET',
    url,
    responseType: 'stream',
  });

  showProgressBar(response);
  writeStreamToFile(response.data, dest);

  return await new Promise<boolean | AxiosError>((resolve, reject) => {
    response.data.on('end', () => {
      resolve(true);
    });
    response.data.on('error', (err: AxiosError) => {
      reject(err);
    });
  });
}

function writeStreamToFile(stream: any, filePath: string) {
  stream.pipe(fs.createWriteStream(toValidFilePath(filePath)));
}

// 展示下载进度条
function showProgressBar(response: AxiosResponse) {
  const total = parseInt(response.headers['content-length'], 10);
  if (isNaN(total)) {
    return;
  }

  const bar = MultiProgressBar.getProgressBar('downloading', { total });

  response.data.on('data', (chunk: any) => {
    bar.tick(chunk.length);
  });
}
